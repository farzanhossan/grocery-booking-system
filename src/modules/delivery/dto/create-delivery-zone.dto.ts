import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateDeliveryZoneDto {
  @ApiProperty({ example: 'Inside Dhaka' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 60, description: 'Delivery charge for this zone' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  charge: number;
}
