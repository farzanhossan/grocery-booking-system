import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTimeline } from './entities/order-timeline.entity';
import { OrderTimelineService } from './services/order-timeline.service';
import { WebOrderTimelineController } from './controllers/web/order-timeline.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderTimeline])],
  controllers: [WebOrderTimelineController],
  providers: [OrderTimelineService],
  exports: [OrderTimelineService],
})
export class OrderTimelineModule {}
