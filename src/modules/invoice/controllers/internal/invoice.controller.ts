import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
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

@ApiTags('Internal - Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('internal/invoices')
export class InternalInvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @ApiOperation({ summary: 'List all invoices' })
  @ResponseMessage('Invoices retrieved successfully')
  findAll(@Query() query: InvoiceQueryDto) {
    return this.invoiceService.findAllInvoices(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details' })
  @ResponseMessage('Invoice retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoiceService.findOne(id);
  }
}
