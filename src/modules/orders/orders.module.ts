import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { WebOrdersController } from './controllers/web/orders.controller';
import { OrdersService } from './services/orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [WebOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
