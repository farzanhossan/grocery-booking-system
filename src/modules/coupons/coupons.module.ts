import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { CouponsService } from './services/coupons.service';
import { InternalCouponsController } from './controllers/internal/coupons.controller';
import { WebCouponsController } from './controllers/web/coupons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, CouponUsage])],
  controllers: [InternalCouponsController, WebCouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
