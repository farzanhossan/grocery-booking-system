import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { GroceryItem } from '../../grocery/entities/grocery-item.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
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

      for (const item of dto.items) {
        const groceryItem = await queryRunner.manager.findOne(GroceryItem, {
          where: { id: item.groceryItemId },
        });

        if (!groceryItem) {
          throw new NotFoundException(
            `Grocery item with ID "${item.groceryItemId}" not found`,
          );
        }

        if (groceryItem.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${groceryItem.name}". Available: ${groceryItem.quantity}, Requested: ${item.quantity}`,
          );
        }

        groceryItem.quantity -= item.quantity;
        groceryItem.isAvailable = groceryItem.quantity > 0;
        await queryRunner.manager.save(GroceryItem, groceryItem);

        const subtotal = Number(groceryItem.price) * item.quantity;
        totalAmount += subtotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          groceryItem,
          quantity: item.quantity,
          priceAtOrder: groceryItem.price,
          subtotal,
        });
        orderItems.push(await queryRunner.manager.save(OrderItem, orderItem));
      }

      savedOrder.totalAmount = totalAmount;
      savedOrder.orderItems = orderItems;
      await queryRunner.manager.save(Order, savedOrder);

      await queryRunner.commitTransaction();

      return this.ordersRepository.findOne({
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

  async findUserOrders(
    userId: string,
    query: OrderQueryDto,
  ): Promise<PaginatedResult<Order>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.ordersRepository.createQueryBuilder('order');
    qb.leftJoinAndSelect('order.orderItems', 'orderItem');
    qb.leftJoinAndSelect('orderItem.groceryItem', 'groceryItem');
    qb.where('order.userId = :userId', { userId });

    // Filter by status
    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    // Filter by date range
    if (query.fromDate) {
      qb.andWhere('order.createdAt >= :fromDate', { fromDate: query.fromDate });
    }
    if (query.toDate) {
      qb.andWhere('order.createdAt <= :toDate', { toDate: query.toDate });
    }

    // Search by order ID
    if (query.search) {
      qb.andWhere('CAST(order.id AS TEXT) LIKE :search', {
        search: `%${query.search}%`,
      });
    }

    // Sorting
    const allowedSortFields = ['createdAt', 'totalAmount', 'status'];
    const sortBy = allowedSortFields.includes(query.sortBy)
      ? `order.${query.sortBy}`
      : 'order.createdAt';
    qb.orderBy(sortBy, query.sortOrder ?? 'DESC');

    // Pagination
    const totalItems = await qb.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    qb.skip((page - 1) * limit).take(limit);
    const items = await qb.getMany();

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
