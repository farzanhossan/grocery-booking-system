import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { UserRole } from '../../../users/entities/user.entity';
import { OrdersService } from '../../services/orders.service';
import { CreateOrderDto } from '../../dto/create-order.dto';
import { OrderQueryDto } from '../../dto/order-query.dto';

@ApiTags('Web - Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('orders')
export class WebOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order with multiple grocery items' })
  @ResponseMessage('Order placed successfully')
  create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user orders with pagination and filters' })
  @ResponseMessage('Orders retrieved successfully')
  findMyOrders(@Request() req, @Query() query: OrderQueryDto) {
    return this.ordersService.findUserOrders(req.user.id, query);
  }
}
