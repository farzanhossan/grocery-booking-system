import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { UserRole } from '../../../users/entities/user.entity';
import { OrderTimelineService } from '../../services/order-timeline.service';

@ApiTags('Web - Order Timeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('orders')
export class WebOrderTimelineController {
  constructor(
    private readonly orderTimelineService: OrderTimelineService,
  ) {}

  @Get(':orderId/timeline')
  @ApiOperation({ summary: 'Get order tracking timeline' })
  @ResponseMessage('Order timeline retrieved successfully')
  findByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.orderTimelineService.findByOrder(orderId);
  }
}
