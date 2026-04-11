import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './services/invoice.service';
import { WebInvoiceController } from './controllers/web/invoice.controller';
import { InternalInvoiceController } from './controllers/internal/invoice.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  controllers: [WebInvoiceController, InternalInvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
