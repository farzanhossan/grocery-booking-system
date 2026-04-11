import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { OrderTimeline } from '../entities/order-timeline.entity';
import { OrderStatus } from '../../orders/entities/order.entity';

@Injectable()
export class OrderTimelineService {
  constructor(
    @InjectRepository(OrderTimeline)
    private readonly timelineRepository: Repository<OrderTimeline>,
  ) {}

  async addEntry(
    orderId: string,
    status: OrderStatus,
    note?: string,
    changedBy?: string,
    queryRunner?: QueryRunner,
  ): Promise<OrderTimeline> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.timelineRepository.manager;

    const entry = manager.create(OrderTimeline, {
      order: { id: orderId } as any,
      status,
      note,
      changedBy,
    });

    return manager.save(OrderTimeline, entry);
  }

  async findByOrder(orderId: string): Promise<OrderTimeline[]> {
    return this.timelineRepository.find({
      where: { order: { id: orderId } },
      order: { createdAt: 'ASC' },
    });
  }
}
