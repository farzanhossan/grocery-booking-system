import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { WebCartController } from './controllers/web/cart.controller';
import { CartService } from './services/cart.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem])],
  controllers: [WebCartController],
  providers: [CartService],
})
export class CartModule {}
