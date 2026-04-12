import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { UserRole } from '../../../users/entities/user.entity';
import { CouponsService } from '../../services/coupons.service';
import { CreateCouponDto } from '../../dto/create-coupon.dto';
import { UpdateCouponDto } from '../../dto/update-coupon.dto';

@ApiTags('Internal - Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('internal/coupons')
export class InternalCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new coupon' })
  @ResponseMessage('Coupon created successfully')
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all coupons' })
  @ResponseMessage('Coupons retrieved successfully')
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID' })
  @ResponseMessage('Coupon retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a coupon' })
  @ResponseMessage('Coupon updated successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon' })
  @ResponseMessage('Coupon deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.remove(id);
  }
}
