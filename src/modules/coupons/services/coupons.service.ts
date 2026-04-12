import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Coupon, DiscountType } from '../entities/coupon.entity';
import { CouponUsage } from '../entities/coupon-usage.entity';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly usageRepository: Repository<CouponUsage>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.couponRepository.findOne({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException(
        `Coupon with code "${dto.code}" already exists`,
      );
    }

    const coupon = this.couponRepository.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });
    return this.couponRepository.save(coupon);
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);
    if (dto.code) {
      dto.code = dto.code.toUpperCase();
    }
    Object.assign(coupon, dto);
    return this.couponRepository.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
  }

  async validateCoupon(
    code: string,
    userId: string,
    orderSubtotal: number,
  ): Promise<{ coupon: Coupon; discountAmount: number }> {
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!coupon) {
      throw new BadRequestException(`Invalid or inactive coupon code "${code}"`);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const validFrom = new Date(coupon.validFrom);
    const validTo = new Date(coupon.validTo);

    if (today < validFrom || today > validTo) {
      throw new BadRequestException('This coupon has expired or is not yet valid');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    // Check per-user usage
    const userUsageCount = await this.usageRepository.count({
      where: { coupon: { id: coupon.id }, userId },
    });
    if (userUsageCount > 0) {
      throw new BadRequestException('You have already used this coupon');
    }

    if (
      coupon.minOrderAmount &&
      orderSubtotal < Number(coupon.minOrderAmount)
    ) {
      throw new BadRequestException(
        `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`,
      );
    }

    const discountAmount = this.calculateDiscount(coupon, orderSubtotal);

    return { coupon, discountAmount };
  }

  async applyCoupon(
    couponId: string,
    userId: string,
    orderId: string,
    discountApplied: number,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.couponRepository.manager;

    // Increment usage count
    await manager.increment(Coupon, { id: couponId }, 'usedCount', 1);

    // Create usage record
    const usage = manager.create(CouponUsage, {
      coupon: { id: couponId } as any,
      userId,
      orderId,
      discountApplied,
    });
    await manager.save(CouponUsage, usage);
  }

  private calculateDiscount(coupon: Coupon, orderSubtotal: number): number {
    let discount: number;

    if (coupon.discountType === DiscountType.FLAT) {
      discount = Number(coupon.discountValue);
    } else {
      discount = (orderSubtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, Number(coupon.maxDiscountAmount));
      }
    }

    // Discount cannot exceed subtotal
    return Math.min(discount, orderSubtotal);
  }
}
