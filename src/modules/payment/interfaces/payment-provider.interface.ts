import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface PaymentInitiationResult {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  status: PaymentStatus;
}

export interface PaymentVerificationResult {
  verified: boolean;
  status: PaymentStatus;
}

export interface PaymentRefundResult {
  success: boolean;
  refundTransactionId?: string;
}

export interface PaymentProviderInterface {
  readonly methodName: PaymentMethod;
  initiatePayment(
    orderId: string,
    amount: number,
    metadata?: Record<string, any>,
  ): Promise<PaymentInitiationResult>;
  verifyPayment(transactionId: string): Promise<PaymentVerificationResult>;
  refundPayment(
    transactionId: string,
    amount: number,
  ): Promise<PaymentRefundResult>;
}
