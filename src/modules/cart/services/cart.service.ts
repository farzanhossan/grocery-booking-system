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

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly dataSource: DataSource,
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

  async checkout(userId: string): Promise<Order> {
    const cart = await this.getCart(userId);

    if (!cart.cartItems?.length) {
      throw new BadRequestException('Cart is empty');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = queryRunner.manager.create(Order, {
        user: { id: userId } as any,
        totalAmount: 0,
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      let totalAmount = 0;
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
        totalAmount += subtotal;

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

      savedOrder.totalAmount = totalAmount;
      savedOrder.orderItems = orderItems;
      await queryRunner.manager.save(Order, savedOrder);

      // Clear cart items within the transaction
      await queryRunner.manager.remove(CartItem, cart.cartItems);

      await queryRunner.commitTransaction();

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
}
