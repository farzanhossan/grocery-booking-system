import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    if (dto.parentId) {
      await this.findOne(dto.parentId);
    }

    const existing = await this.categoryRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException(
        `Category with slug "${dto.slug}" already exists`,
      );
    }

    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findActive(): Promise<Category[]> {
    const roots = await this.categoryRepository.find({
      where: { isActive: true, parentId: IsNull() },
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return this.filterActiveChildren(roots);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }
      await this.findOne(dto.parentId);
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new BadRequestException(
          `Category with slug "${dto.slug}" already exists`,
        );
      }
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    if (category.children?.length) {
      throw new BadRequestException(
        'Cannot delete a category that has subcategories. Remove or reassign them first.',
      );
    }

    await this.categoryRepository.remove(category);
  }

  private filterActiveChildren(categories: Category[]): Category[] {
    return categories.map((cat) => {
      if (cat.children) {
        cat.children = this.filterActiveChildren(
          cat.children.filter((child) => child.isActive),
        );
      }
      return cat;
    });
  }
}
