import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({ example: 50, description: 'New inventory quantity' })
  @IsInt()
  @Min(0)
  quantity: number;
}
