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
import { DeliveryService } from '../../services/delivery.service';
import { CreateDeliveryZoneDto } from '../../dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from '../../dto/update-delivery-zone.dto';

@ApiTags('Internal - Delivery Zones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('internal/delivery-zones')
export class InternalDeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new delivery zone' })
  @ResponseMessage('Delivery zone created successfully')
  create(@Body() dto: CreateDeliveryZoneDto) {
    return this.deliveryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all delivery zones' })
  @ResponseMessage('Delivery zones retrieved successfully')
  findAll() {
    return this.deliveryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a delivery zone by ID' })
  @ResponseMessage('Delivery zone retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a delivery zone' })
  @ResponseMessage('Delivery zone updated successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeliveryZoneDto,
  ) {
    return this.deliveryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a delivery zone' })
  @ResponseMessage('Delivery zone deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryService.remove(id);
  }
}
