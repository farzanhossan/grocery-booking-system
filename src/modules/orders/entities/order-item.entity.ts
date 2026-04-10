import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { GroceryItem } from '../../grocery/entities/grocery-item.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => GroceryItem, { eager: true })
  @JoinColumn({ name: 'groceryItemId' })
  groceryItem: GroceryItem;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtOrder: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;
}
