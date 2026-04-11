import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress } from '../entities/user-address.entity';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly addressRepository: Repository<UserAddress>,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<UserAddress> {
    if (dto.isDefault) {
      await this.clearDefaults(userId);
    }

    const address = this.addressRepository.create({
      ...dto,
      user: { id: userId } as any,
    });
    return this.addressRepository.save(address);
  }

  async findAll(userId: string): Promise<UserAddress[]> {
    return this.addressRepository.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, addressId: string): Promise<UserAddress> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) {
      throw new NotFoundException(
        `Address with ID "${addressId}" not found`,
      );
    }
    return address;
  }

  async update(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<UserAddress> {
    const address = await this.findOne(userId, addressId);

    if (dto.isDefault) {
      await this.clearDefaults(userId);
    }

    Object.assign(address, dto);
    return this.addressRepository.save(address);
  }

  async remove(userId: string, addressId: string): Promise<void> {
    const address = await this.findOne(userId, addressId);
    await this.addressRepository.remove(address);
  }

  private async clearDefaults(userId: string): Promise<void> {
    await this.addressRepository.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false },
    );
  }
}
