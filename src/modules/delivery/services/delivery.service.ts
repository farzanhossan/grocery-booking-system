import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryZone } from '../entities/delivery-zone.entity';
import { CreateDeliveryZoneDto } from '../dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from '../dto/update-delivery-zone.dto';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryZone)
    private readonly zoneRepository: Repository<DeliveryZone>,
  ) {}

  async create(dto: CreateDeliveryZoneDto): Promise<DeliveryZone> {
    const zone = this.zoneRepository.create(dto);
    return this.zoneRepository.save(zone);
  }

  async findAll(): Promise<DeliveryZone[]> {
    return this.zoneRepository.find({ order: { createdAt: 'ASC' } });
  }

  async findActive(): Promise<DeliveryZone[]> {
    return this.zoneRepository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<DeliveryZone> {
    const zone = await this.zoneRepository.findOne({ where: { id } });
    if (!zone) {
      throw new NotFoundException(`Delivery zone with ID "${id}" not found`);
    }
    return zone;
  }

  async findOneActive(id: string): Promise<DeliveryZone> {
    const zone = await this.zoneRepository.findOne({
      where: { id, isActive: true },
    });
    if (!zone) {
      throw new NotFoundException(
        `Active delivery zone with ID "${id}" not found`,
      );
    }
    return zone;
  }

  async update(
    id: string,
    dto: UpdateDeliveryZoneDto,
  ): Promise<DeliveryZone> {
    const zone = await this.findOne(id);
    Object.assign(zone, dto);
    return this.zoneRepository.save(zone);
  }

  async remove(id: string): Promise<void> {
    const zone = await this.findOne(id);
    await this.zoneRepository.remove(zone);
  }
}
