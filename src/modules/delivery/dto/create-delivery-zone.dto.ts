import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDeliveryZoneDto {
  @ApiProperty({ example: 'Inside Dhaka' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 60, description: 'Delivery charge for this zone' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  charge: number;

  @ApiPropertyOptional({ example: 45, description: 'Estimated delivery time in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;
}
