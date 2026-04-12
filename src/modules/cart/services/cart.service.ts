import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { GroceryItem } from '../../grocery/entities/grocery-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CheckoutDto } from '../dto/checkout.dto';
import { DeliveryService } from '../../delivery/services/delivery.service';
import { AddressesService } from '../../addresses/services/addresses.service';
import { PaymentService } from '../../payment/services/payment.service';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { PaymentMethod } from '../../payment/enums/payment-method.enum';
import { OrderTimelineService } from '../../order-timeline/services/order-timeline.service';
import { OrderStatus } from '../../orders/entities/order.entity';
import { CouponsService } from '../../coupons/services/coupons.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly dataSource: DataSource,
    private readonly deliveryService: DeliveryService,
    private readonly addressesService: AddressesService,
    private readonly paymentService: PaymentService,
    private readonly invoiceService: InvoiceService,
    private readonly orderTimelineService: OrderTimelineService,
    private readonly couponsService: CouponsService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['cartItems', 'cartItems.groceryItem'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId } as any,
        cartItems: [],
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(userId);

    const groceryItem = await this.dataSource
      .getRepository(GroceryItem)
      .findOne({ where: { id: dto.groceryItemId } });

    if (!groceryItem) {
      throw new NotFoundException(
        `Grocery item with ID "${dto.groceryItemId}" not found`,
      );
    }

    if (!groceryItem.isAvailable) {
      throw new BadRequestException(
        `"${groceryItem.name}" is currently unavailable`,
      );
    }

    const existingItem = cart.cartItems?.find(
      (item) => item.groceryItem.id === dto.groceryItemId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;
      if (newQuantity > groceryItem.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${groceryItem.name}". Available: ${groceryItem.quantity}, In cart: ${existingItem.quantity}, Requested: ${dto.quantity}`,
        );
      }
      existingItem.quantity = newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      if (dto.quantity > groceryItem.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${groceryItem.name}". Available: ${groceryItem.quantity}, Requested: ${dto.quantity}`,
        );
      }
      const cartItem = this.cartItemRepository.create({
        cart,
        groceryItem,
        quantity: dto.quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(userId);
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    const cartItem = cart.cartItems?.find((item) => item.id === cartItemId);
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID "${cartItemId}" not found`);
    }

    if (dto.quantity > cartItem.groceryItem.quantity) {
      throw new BadRequestException(
        `Insufficient stock for "${cartItem.groceryItem.name}". Available: ${cartItem.groceryItem.quantity}, Requested: ${dto.quantity}`,
      );
    }

    cartItem.quantity = dto.quantity;
    await this.cartItemRepository.save(cartItem);

    return this.getCart(userId);
  }

  async removeCartItem(userId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);

    const cartItem = cart.cartItems?.find((item) => item.id === cartItemId);
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID "${cartItemId}" not found`);
    }

    await this.cartItemRepository.remove(cartItem);

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    if (cart.cartItems?.length) {
      await this.cartItemRepository.remove(cart.cartItems);
    }
  }

  async checkout(userId: string, dto: CheckoutDto): Promise<Order> {
    const cart = await this.getCart(userId);

    if (!cart.cartItems?.length) {
      throw new BadRequestException('Cart is empty');
    }

    const zone = await this.deliveryService.findOneActive(dto.deliveryZoneId);
    const address = await this.resolveAddress(userId, dto);
    const paymentMethod = dto.paymentMethod || PaymentMethod.CASH_ON_DELIVERY;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = queryRunner.manager.create(Order, {
        user: { id: userId } as any,
        subtotalAmount: 0,
        deliveryCharge: zone.charge,
        totalAmount: 0,
        deliveryZoneName: zone.name,
        deliveryStreet: address.street,
        deliveryCity: address.city,
        deliveryState: address.state,
        deliveryPostalCode: address.postalCode,
        deliveryCountry: address.country,
        notes: dto.notes || null,
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      let subtotalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const cartItem of cart.cartItems) {
        const groceryItem = await queryRunner.manager.findOne(GroceryItem, {
          where: { id: cartItem.groceryItem.id },
        });

        if (!groceryItem) {
          throw new NotFoundException(
            `Grocery item "${cartItem.groceryItem.name}" is no longer available`,
          );
        }

        if (groceryItem.quantity < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${groceryItem.name}". Available: ${groceryItem.quantity}, In cart: ${cartItem.quantity}`,
          );
        }

        groceryItem.quantity -= cartItem.quantity;
        groceryItem.isAvailable = groceryItem.quantity > 0;
        await queryRunner.manager.save(GroceryItem, groceryItem);

        const subtotal = Number(groceryItem.price) * cartItem.quantity;
        subtotalAmount += subtotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          groceryItem,
          quantity: cartItem.quantity,
          priceAtOrder: groceryItem.price,
          subtotal,
        });
        orderItems.push(
          await queryRunner.manager.save(OrderItem, orderItem),
        );
      }

      savedOrder.subtotalAmount = subtotalAmount;

      // Apply coupon if provided
      let discountAmount = 0;
      if (dto.couponCode) {
        const couponResult = await this.couponsService.validateCoupon(
          dto.couponCode,
          userId,
          subtotalAmount,
        );
        discountAmount = couponResult.discountAmount;
        savedOrder.couponCode = dto.couponCode.toUpperCase();
        savedOrder.discountAmount = discountAmount;

        await this.couponsService.applyCoupon(
          couponResult.coupon.id,
          userId,
          savedOrder.id,
          discountAmount,
          queryRunner,
        );
      }

      savedOrder.totalAmount =
        subtotalAmount + Number(zone.charge) - discountAmount;
      savedOrder.orderItems = orderItems;
      await queryRunner.manager.save(Order, savedOrder);

      // Create payment
      await this.paymentService.createPayment(
        userId,
        savedOrder.id,
        paymentMethod,
        savedOrder.totalAmount,
        queryRunner,
      );

      // Create invoice
      await this.invoiceService.createInvoice(
        userId,
        savedOrder,
        paymentMethod,
        queryRunner,
      );

      // Add timeline entry
      await this.orderTimelineService.addEntry(
        savedOrder.id,
        OrderStatus.PENDING,
        'Order placed via cart checkout',
        userId,
        queryRunner,
      );

      // Clear cart items within the transaction
      await queryRunner.manager.remove(CartItem, cart.cartItems);

      await queryRunner.commitTransaction();

      // Save address if requested (outside transaction)
      if (dto.saveAddress && dto.deliveryAddress) {
        await this.addressesService.create(userId, {
          ...dto.deliveryAddress,
          label: dto.addressLabel,
          isDefault: false,
        });
      }

      return this.dataSource.getRepository(Order).findOne({
        where: { id: savedOrder.id },
        relations: ['user', 'orderItems', 'orderItems.groceryItem'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async resolveAddress(
    userId: string,
    dto: {
      deliveryAddressId?: string;
      deliveryAddress?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
    },
  ): Promise<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }> {
    if (dto.deliveryAddressId) {
      const saved = await this.addressesService.findOne(
        userId,
        dto.deliveryAddressId,
      );
      return {
        street: saved.street,
        city: saved.city,
        state: saved.state,
        postalCode: saved.postalCode,
        country: saved.country,
      };
    }

    if (dto.deliveryAddress) {
      return dto.deliveryAddress;
    }

    throw new BadRequestException(
      'Either deliveryAddressId or deliveryAddress must be provided',
    );
  }
}
