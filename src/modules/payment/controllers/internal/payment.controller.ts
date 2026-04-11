import {
  Body,
  Controller,
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
import { PaymentService } from '../../services/payment.service';
import { PaymentQueryDto } from '../../dto/payment-query.dto';
import { UpdatePaymentStatusDto } from '../../dto/update-payment-status.dto';
import { InitiateRefundDto } from '../../dto/initiate-refund.dto';

@ApiTags('Internal - Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('internal/payments')
export class InternalPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOperation({ summary: 'List all payments' })
  @ResponseMessage('Payments retrieved successfully')
  findAll(@Query() query: PaymentQueryDto) {
    return this.paymentService.findAllPayments(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  @ResponseMessage('Payment retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ResponseMessage('Payment status updated successfully')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentService.updatePaymentStatus(id, dto);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Initiate a refund' })
  @ResponseMessage('Refund initiated successfully')
  initiateRefund(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: InitiateRefundDto,
  ) {
    return this.paymentService.initiateRefund(id, dto);
  }
}
