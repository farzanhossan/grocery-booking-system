import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesService } from './services/categories.service';
import { InternalCategoriesController } from './controllers/internal/categories.controller';
import { WebCategoriesController } from './controllers/web/categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [InternalCategoriesController, WebCategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
