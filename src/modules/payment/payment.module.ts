import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Refund } from './entities/refund.entity';
import { PaymentService } from './services/payment.service';
import { CashOnDeliveryProvider } from './providers/cash-on-delivery.provider';
import { WebPaymentController } from './controllers/web/payment.controller';
import { InternalPaymentController } from './controllers/internal/payment.controller';
import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentProviderInterface } from './interfaces/payment-provider.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Refund])],
  controllers: [WebPaymentController, InternalPaymentController],
  providers: [
    PaymentService,
    CashOnDeliveryProvider,
    {
      provide: 'PAYMENT_PROVIDERS',
      useFactory: (
        cod: CashOnDeliveryProvider,
      ): Map<PaymentMethod, PaymentProviderInterface> => {
        const map = new Map<PaymentMethod, PaymentProviderInterface>();
        map.set(PaymentMethod.CASH_ON_DELIVERY, cod);
        return map;
      },
      inject: [CashOnDeliveryProvider],
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
