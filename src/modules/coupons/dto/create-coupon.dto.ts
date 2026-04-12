import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE20', description: 'Unique coupon code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 20, description: 'Discount value (amount or percentage)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  discountValue: number;

  @ApiPropertyOptional({ example: 500, description: 'Minimum order amount to use this coupon' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum discount amount (for percentage coupons)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ example: 100, description: 'Total usage limit' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiProperty({ example: '2026-04-01', description: 'Valid from date' })
  @Type(() => Date)
  validFrom: Date;

  @ApiProperty({ example: '2026-04-30', description: 'Valid to date' })
  @Type(() => Date)
  validTo: Date;
}
