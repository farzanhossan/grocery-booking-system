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
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceQueryDto } from '../../dto/invoice-query.dto';

@ApiTags('Web - Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('invoices')
export class WebInvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get invoice for a specific order' })
  @ResponseMessage('Invoice retrieved successfully')
  findByOrder(
    @Request() req,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.invoiceService.findByOrder(orderId, req.user.id);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my invoices' })
  @ResponseMessage('Invoices retrieved successfully')
  findMyInvoices(@Request() req, @Query() query: InvoiceQueryDto) {
    return this.invoiceService.findUserInvoices(req.user.id, query);
  }
}
