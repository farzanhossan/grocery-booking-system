import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { WebOrdersController } from './controllers/web/orders.controller';
import { InternalOrdersController } from './controllers/internal/orders.controller';
import { OrdersService } from './services/orders.service';
import { DeliveryModule } from '../delivery/delivery.module';
import { AddressesModule } from '../addresses/addresses.module';
import { PaymentModule } from '../payment/payment.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { OrderTimelineModule } from '../order-timeline/order-timeline.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    DeliveryModule,
    AddressesModule,
    PaymentModule,
    InvoiceModule,
    OrderTimelineModule,
    CouponsModule,
  ],
  controllers: [WebOrdersController, InternalOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
