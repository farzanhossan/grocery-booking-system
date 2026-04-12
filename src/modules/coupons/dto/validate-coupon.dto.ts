import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'SAVE20', description: 'Coupon code to validate' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
