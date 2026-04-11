import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { WebOrdersController } from './controllers/web/orders.controller';
import { OrdersService } from './services/orders.service';
import { DeliveryModule } from '../delivery/delivery.module';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    DeliveryModule,
    AddressesModule,
  ],
  controllers: [WebOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
