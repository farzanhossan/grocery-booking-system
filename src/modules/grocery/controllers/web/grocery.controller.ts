import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { UserRole } from '../../../users/entities/user.entity';
import { GroceryService } from '../../services/grocery.service';
import { GroceryQueryDto } from '../../dto/grocery-query.dto';

@ApiTags('Web - Grocery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('grocery')
export class WebGroceryController {
  constructor(private readonly groceryService: GroceryService) {}

  @Get()
  @ApiOperation({ summary: 'List available grocery items with pagination, filters, and search' })
  @ResponseMessage('Available grocery items retrieved successfully')
  findAvailable(@Query() query: GroceryQueryDto) {
    return this.groceryService.findAvailable(query);
  }
}
