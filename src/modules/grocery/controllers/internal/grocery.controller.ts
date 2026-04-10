import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { UserRole } from '../../../users/entities/user.entity';
import { GroceryService } from '../../services/grocery.service';
import { CreateGroceryItemDto } from '../../dto/create-grocery-item.dto';
import { UpdateGroceryItemDto } from '../../dto/update-grocery-item.dto';
import { UpdateInventoryDto } from '../../dto/update-inventory.dto';
import { GroceryQueryDto } from '../../dto/grocery-query.dto';

@ApiTags('Internal - Grocery Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('internal/grocery')
export class InternalGroceryController {
  constructor(private readonly groceryService: GroceryService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new grocery item' })
  @ResponseMessage('Grocery item created successfully')
  create(@Body() dto: CreateGroceryItemDto) {
    return this.groceryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all grocery items with pagination, filters, and search' })
  @ResponseMessage('Grocery items retrieved successfully')
  findAll(@Query() query: GroceryQueryDto) {
    return this.groceryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single grocery item by ID' })
  @ResponseMessage('Grocery item retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.groceryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update grocery item details' })
  @ResponseMessage('Grocery item updated successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGroceryItemDto,
  ) {
    return this.groceryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a grocery item' })
  @ResponseMessage('Grocery item removed successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.groceryService.remove(id);
  }

  @Patch(':id/inventory')
  @ApiOperation({ summary: 'Update inventory quantity' })
  @ResponseMessage('Inventory updated successfully')
  updateInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.groceryService.updateInventory(id, dto);
  }
}
