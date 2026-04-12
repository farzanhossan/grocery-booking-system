import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { Order } from '../../orders/entities/order.entity';
import { PaymentMethod } from '../../payment/enums/payment-method.enum';
import { InvoiceQueryDto } from '../dto/invoice-query.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async createInvoice(
    userId: string,
    order: Order,
    paymentMethod: PaymentMethod,
    queryRunner?: QueryRunner,
  ): Promise<Invoice> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.invoiceRepository.manager;

    const invoiceNumber = await this.generateInvoiceNumber(manager);

    const invoice = manager.create(Invoice, {
      invoiceNumber,
      order: { id: order.id } as any,
      user: { id: userId } as any,
      subtotalAmount: order.subtotalAmount,
      deliveryCharge: order.deliveryCharge,
      discountAmount: order.discountAmount || 0,
      totalAmount: order.totalAmount,
      paidAmount: 0,
      paymentMethod,
      issuedDate: new Date(),
    });

    return manager.save(Invoice, invoice);
  }

  async findByOrder(orderId: string, userId?: string): Promise<Invoice> {
    const where: any = { order: { id: orderId } };
    if (userId) {
      where.user = { id: userId };
    }

    const invoice = await this.invoiceRepository.findOne({ where });
    if (!invoice) {
      throw new NotFoundException(
        `Invoice for order "${orderId}" not found`,
      );
    }
    return invoice;
  }

  async findUserInvoices(
    userId: string,
    query: InvoiceQueryDto,
  ): Promise<PaginatedResult<Invoice>> {
    return this.findInvoices(query, userId);
  }

  async findAllInvoices(
    query: InvoiceQueryDto,
  ): Promise<PaginatedResult<Invoice>> {
    return this.findInvoices(query);
  }

  async findOne(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException(
        `Invoice with ID "${invoiceId}" not found`,
      );
    }
    return invoice;
  }

  async updatePaidAmount(
    orderId: string,
    paidAmount: number,
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { order: { id: orderId } },
    });
    if (invoice) {
      invoice.paidAmount = paidAmount;
      return this.invoiceRepository.save(invoice);
    }
    return null;
  }

  private async generateInvoiceNumber(manager: any): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `INV-${dateStr}-`;

    const lastInvoice = await manager
      .createQueryBuilder(Invoice, 'invoice')
      .where('invoice.invoiceNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('invoice.invoiceNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(
        lastInvoice.invoiceNumber.replace(prefix, ''),
        10,
      );
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  private async findInvoices(
    query: InvoiceQueryDto,
    userId?: string,
  ): Promise<PaginatedResult<Invoice>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.invoiceRepository.createQueryBuilder('invoice');
    qb.leftJoinAndSelect('invoice.order', 'order');
    qb.leftJoinAndSelect('invoice.user', 'user');

    if (userId) {
      qb.where('invoice.userId = :userId', { userId });
    }

    if (query.paymentMethod) {
      qb.andWhere('invoice.paymentMethod = :method', {
        method: query.paymentMethod,
      });
    }
    if (query.fromDate) {
      qb.andWhere('invoice.issuedDate >= :fromDate', {
        fromDate: query.fromDate,
      });
    }
    if (query.toDate) {
      qb.andWhere('invoice.issuedDate <= :toDate', { toDate: query.toDate });
    }

    const allowedSortFields = ['issuedDate', 'totalAmount', 'invoiceNumber'];
    const sortBy = allowedSortFields.includes(query.sortBy)
      ? `invoice.${query.sortBy}`
      : 'invoice.issuedDate';
    qb.orderBy(sortBy, query.sortOrder ?? 'DESC');

    const totalItems = await qb.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    qb.skip((page - 1) * limit).take(limit);
    const items = await qb.getMany();

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
