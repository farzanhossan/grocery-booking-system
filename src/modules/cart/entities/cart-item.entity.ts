import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { GroceryItem } from '../../grocery/entities/grocery-item.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ManyToOne(() => GroceryItem, { eager: true })
  @JoinColumn({ name: 'groceryItemId' })
  groceryItem: GroceryItem;

  @Column({ type: 'int' })
  quantity: number;
}
