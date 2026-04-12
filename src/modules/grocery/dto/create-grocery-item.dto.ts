import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateGroceryItemDto {
  @ApiProperty({ example: 'Organic Bananas' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Fresh organic bananas, sold per bunch' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 2.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 'https://example.com/bananas.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
