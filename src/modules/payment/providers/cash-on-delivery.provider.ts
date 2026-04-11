import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import {
  PaymentProviderInterface,
  PaymentInitiationResult,
  PaymentVerificationResult,
  PaymentRefundResult,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class CashOnDeliveryProvider implements PaymentProviderInterface {
  readonly methodName = PaymentMethod.CASH_ON_DELIVERY;

  async initiatePayment(
    orderId: string,
    amount: number,
  ): Promise<PaymentInitiationResult> {
    return {
      success: true,
      transactionId: null,
      status: PaymentStatus.PENDING,
    };
  }

  async verifyPayment(
    transactionId: string,
  ): Promise<PaymentVerificationResult> {
    return {
      verified: true,
      status: PaymentStatus.COMPLETED,
    };
  }

  async refundPayment(
    transactionId: string,
    amount: number,
  ): Promise<PaymentRefundResult> {
    return {
      success: true,
      refundTransactionId: null,
    };
  }
}
