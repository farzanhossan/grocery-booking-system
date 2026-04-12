import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { UserRole } from '../../../users/entities/user.entity';
import { CategoriesService } from '../../services/categories.service';

@ApiTags('Web - Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('categories')
export class WebCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List active categories (nested tree)' })
  @ResponseMessage('Categories retrieved successfully')
  findActive() {
    return this.categoriesService.findActive();
  }
}
