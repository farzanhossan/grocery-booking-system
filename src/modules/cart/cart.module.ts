import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { WebCartController } from './controllers/web/cart.controller';
import { CartService } from './services/cart.service';
import { DeliveryModule } from '../delivery/delivery.module';
import { AddressesModule } from '../addresses/addresses.module';
import { PaymentModule } from '../payment/payment.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    DeliveryModule,
    AddressesModule,
    PaymentModule,
    InvoiceModule,
  ],
  controllers: [WebCartController],
  providers: [CartService],
})
export class CartModule {}
