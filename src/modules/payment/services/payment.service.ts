import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { Refund, RefundStatus } from '../entities/refund.entity';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentProviderInterface } from '../interfaces/payment-provider.interface';
import { PaymentQueryDto } from '../dto/payment-query.dto';
import { UpdatePaymentStatusDto } from '../dto/update-payment-status.dto';
import { InitiateRefundDto } from '../dto/initiate-refund.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    @Inject('PAYMENT_PROVIDERS')
    private readonly providers: Map<PaymentMethod, PaymentProviderInterface>,
  ) {}

  async createPayment(
    userId: string,
    orderId: string,
    method: PaymentMethod,
    amount: number,
    queryRunner?: QueryRunner,
  ): Promise<Payment> {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new BadRequestException(
        `Payment method "${method}" is not supported`,
      );
    }

    const result = await provider.initiatePayment(orderId, amount);

    const manager = queryRunner ? queryRunner.manager : this.paymentRepository.manager;

    const payment = manager.create(Payment, {
      order: { id: orderId } as any,
      user: { id: userId } as any,
      paymentMethod: method,
      status: result.status,
      amount,
      transactionId: result.transactionId || null,
      paidAt: result.status === PaymentStatus.COMPLETED ? new Date() : null,
    });

    return manager.save(Payment, payment);
  }

  async findByOrder(orderId: string, userId?: string): Promise<Payment> {
    const where: any = { order: { id: orderId } };
    if (userId) {
      where.user = { id: userId };
    }

    const payment = await this.paymentRepository.findOne({ where });
    if (!payment) {
      throw new NotFoundException(
        `Payment for order "${orderId}" not found`,
      );
    }
    return payment;
  }

  async findUserPayments(
    userId: string,
    query: PaymentQueryDto,
  ): Promise<PaginatedResult<Payment>> {
    return this.findPayments(query, userId);
  }

  async findAllPayments(
    query: PaymentQueryDto,
  ): Promise<PaginatedResult<Payment>> {
    return this.findPayments(query);
  }

  async findOne(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment with ID "${paymentId}" not found`,
      );
    }
    return payment;
  }

  async updatePaymentStatus(
    paymentId: string,
    dto: UpdatePaymentStatusDto,
  ): Promise<Payment> {
    const payment = await this.findOne(paymentId);

    payment.status = dto.status;
    if (dto.transactionId) {
      payment.transactionId = dto.transactionId;
    }
    if (dto.status === PaymentStatus.COMPLETED) {
      payment.paidAt = new Date();
    }
    if (dto.status === PaymentStatus.FAILED) {
      payment.failedAt = new Date();
    }

    return this.paymentRepository.save(payment);
  }

  async initiateRefund(
    paymentId: string,
    dto: InitiateRefundDto,
  ): Promise<Refund> {
    const payment = await this.findOne(paymentId);

    const totalRefundable =
      Number(payment.amount) - Number(payment.refundedAmount);
    if (dto.amount > totalRefundable) {
      throw new BadRequestException(
        `Refund amount ${dto.amount} exceeds refundable amount ${totalRefundable}`,
      );
    }

    const provider = this.providers.get(payment.paymentMethod);
    const result = await provider.refundPayment(
      payment.transactionId,
      dto.amount,
    );

    const refund = this.refundRepository.create({
      payment,
      amount: dto.amount,
      reason: dto.reason,
      status: result.success ? RefundStatus.COMPLETED : RefundStatus.FAILED,
      refundTransactionId: result.refundTransactionId || null,
    });
    const savedRefund = await this.refundRepository.save(refund);

    if (result.success) {
      payment.refundedAmount =
        Number(payment.refundedAmount) + dto.amount;
      payment.status =
        payment.refundedAmount >= Number(payment.amount)
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIALLY_REFUNDED;
      await this.paymentRepository.save(payment);
    }

    return savedRefund;
  }

  async markPaymentCompleted(
    orderId: string,
    queryRunner?: QueryRunner,
  ): Promise<Payment> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.paymentRepository.manager;

    const payment = await manager.findOne(Payment, {
      where: { order: { id: orderId } },
    });
    if (payment && payment.status === PaymentStatus.PENDING) {
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
      return manager.save(Payment, payment);
    }
    return payment;
  }

  private async findPayments(
    query: PaymentQueryDto,
    userId?: string,
  ): Promise<PaginatedResult<Payment>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.paymentRepository.createQueryBuilder('payment');
    qb.leftJoinAndSelect('payment.order', 'order');
    qb.leftJoinAndSelect('payment.user', 'user');

    if (userId) {
      qb.where('payment.userId = :userId', { userId });
    }

    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }
    if (query.paymentMethod) {
      qb.andWhere('payment.paymentMethod = :method', {
        method: query.paymentMethod,
      });
    }
    if (query.fromDate) {
      qb.andWhere('payment.createdAt >= :fromDate', {
        fromDate: query.fromDate,
      });
    }
    if (query.toDate) {
      qb.andWhere('payment.createdAt <= :toDate', { toDate: query.toDate });
    }

    const allowedSortFields = ['createdAt', 'amount', 'status'];
    const sortBy = allowedSortFields.includes(query.sortBy)
      ? `payment.${query.sortBy}`
      : 'payment.createdAt';
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
