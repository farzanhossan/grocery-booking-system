import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroceryItem } from './entities/grocery-item.entity';
import { GroceryService } from './services/grocery.service';
import { InternalGroceryController } from './controllers/internal/grocery.controller';
import { WebGroceryController } from './controllers/web/grocery.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([GroceryItem]), CategoriesModule],
  controllers: [InternalGroceryController, WebGroceryController],
  providers: [GroceryService],
  exports: [GroceryService],
})
export class GroceryModule {}
