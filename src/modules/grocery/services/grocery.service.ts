import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { GroceryItem } from '../entities/grocery-item.entity';
import { CreateGroceryItemDto } from '../dto/create-grocery-item.dto';
import { UpdateGroceryItemDto } from '../dto/update-grocery-item.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { GroceryQueryDto } from '../dto/grocery-query.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GroceryService {
  constructor(
    @InjectRepository(GroceryItem)
    private readonly groceryRepository: Repository<GroceryItem>,
  ) {}

  async create(dto: CreateGroceryItemDto): Promise<GroceryItem> {
    const item = this.groceryRepository.create({
      ...dto,
      isAvailable: dto.quantity > 0,
    });
    return this.groceryRepository.save(item);
  }

  async findAll(query: GroceryQueryDto): Promise<PaginatedResult<GroceryItem>> {
    const qb = this.groceryRepository.createQueryBuilder('item');
    this.applyFilters(qb, query);
    return this.paginate(qb, query);
  }

  async findAvailable(query: GroceryQueryDto): Promise<PaginatedResult<GroceryItem>> {
    const qb = this.groceryRepository.createQueryBuilder('item');
    qb.where('item.isAvailable = :isAvailable', { isAvailable: true });
    this.applyFilters(qb, query);
    return this.paginate(qb, query);
  }

  async findOne(id: string): Promise<GroceryItem> {
    const item = await this.groceryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Grocery item with ID "${id}" not found`);
    }
    return item;
  }

  async update(id: string, dto: UpdateGroceryItemDto): Promise<GroceryItem> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.groceryRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.groceryRepository.remove(item);
  }

  async updateInventory(id: string, dto: UpdateInventoryDto): Promise<GroceryItem> {
    const item = await this.findOne(id);
    item.quantity = dto.quantity;
    item.isAvailable = dto.quantity > 0;
    return this.groceryRepository.save(item);
  }

  private applyFilters(
    qb: SelectQueryBuilder<GroceryItem>,
    query: GroceryQueryDto,
  ): void {
    // Search by name or description
    if (query.search) {
      qb.andWhere(
        '(LOWER(item.name) LIKE :search OR LOWER(item.description) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    // Price range filters
    if (query.minPrice !== undefined) {
      qb.andWhere('item.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('item.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    // Availability filter (for internal/admin view)
    if (query.isAvailable !== undefined) {
      qb.andWhere('item.isAvailable = :isAvailable', {
        isAvailable: query.isAvailable,
      });
    }
  }

  private async paginate(
    qb: SelectQueryBuilder<GroceryItem>,
    query: GroceryQueryDto,
  ): Promise<PaginatedResult<GroceryItem>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    // Sorting
    const allowedSortFields = ['name', 'price', 'quantity', 'createdAt'];
    const sortBy = allowedSortFields.includes(query.sortBy)
      ? `item.${query.sortBy}`
      : 'item.createdAt';
    qb.orderBy(sortBy, query.sortOrder ?? 'DESC');

    // Pagination
    const totalItems = await qb.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    qb.skip((page - 1) * limit).take(limit);
    const items = await qb.getMany();

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
