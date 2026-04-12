import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../../payment/enums/payment-method.enum';

export class CheckoutDeliveryAddressDto {
  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Dhaka Division' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '1205' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ example: 'Bangladesh' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CheckoutDto {
  @ApiProperty({ example: 'uuid-of-delivery-zone', description: 'Selected delivery zone ID' })
  @IsUUID()
  deliveryZoneId: string;

  @ApiPropertyOptional({ example: 'uuid-of-saved-address', description: 'ID of a previously saved address' })
  @IsOptional()
  @IsUUID()
  deliveryAddressId?: string;

  @ApiPropertyOptional({ type: CheckoutDeliveryAddressDto, description: 'Inline delivery address (if not using saved address)' })
  @ValidateIf((o) => !o.deliveryAddressId)
  @ValidateNested()
  @Type(() => CheckoutDeliveryAddressDto)
  deliveryAddress?: CheckoutDeliveryAddressDto;

  @ApiPropertyOptional({ example: true, description: 'Save the inline address for future use' })
  @IsOptional()
  @IsBoolean()
  saveAddress?: boolean;

  @ApiPropertyOptional({ example: 'Home', description: 'Label for the saved address' })
  @IsOptional()
  @IsString()
  addressLabel?: string;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    default: PaymentMethod.CASH_ON_DELIVERY,
    description: 'Payment method',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    example: 'Please leave at the door',
    description: 'Special instructions or notes for the order',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'SAVE20', description: 'Coupon code to apply' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
