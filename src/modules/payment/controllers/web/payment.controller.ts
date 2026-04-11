import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../../../common/decorators/response-message.decorator';
import { UserRole } from '../../../users/entities/user.entity';
import { PaymentService } from '../../services/payment.service';
import { PaymentQueryDto } from '../../dto/payment-query.dto';

@ApiTags('Web - Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('payments')
export class WebPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment for a specific order' })
  @ResponseMessage('Payment retrieved successfully')
  findByOrder(
    @Request() req,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.paymentService.findByOrder(orderId, req.user.id);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get payment history' })
  @ResponseMessage('Payment history retrieved successfully')
  findMyPayments(@Request() req, @Query() query: PaymentQueryDto) {
    return this.paymentService.findUserPayments(req.user.id, query);
  }
}
