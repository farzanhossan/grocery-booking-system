import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { DeliveryService } from './services/delivery.service';
import { InternalDeliveryController } from './controllers/internal/delivery.controller';
import { WebDeliveryController } from './controllers/web/delivery.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryZone])],
  controllers: [InternalDeliveryController, WebDeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
