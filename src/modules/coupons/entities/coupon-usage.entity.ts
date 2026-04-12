import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Coupon } from './coupon.entity';

@Entity('coupon_usages')
export class CouponUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coupon, { eager: true })
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;

  @Column()
  userId: string;

  @Column()
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountApplied: number;

  @CreateDateColumn()
  createdAt: Date;
}
