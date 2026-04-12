import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GroceryModule } from './modules/grocery/grocery.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { PaymentModule } from './modules/payment/payment.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { OrderTimelineModule } from './modules/order-timeline/order-timeline.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { User } from './modules/users/entities/user.entity';
import { GroceryItem } from './modules/grocery/entities/grocery-item.entity';
import { Order } from './modules/orders/entities/order.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';
import { Cart } from './modules/cart/entities/cart.entity';
import { CartItem } from './modules/cart/entities/cart-item.entity';
import { DeliveryZone } from './modules/delivery/entities/delivery-zone.entity';
import { UserAddress } from './modules/addresses/entities/user-address.entity';
import { Payment } from './modules/payment/entities/payment.entity';
import { Refund } from './modules/payment/entities/refund.entity';
import { Invoice } from './modules/invoice/entities/invoice.entity';
import { OrderTimeline } from './modules/order-timeline/entities/order-timeline.entity';
import { Coupon } from './modules/coupons/entities/coupon.entity';
import { CouponUsage } from './modules/coupons/entities/coupon-usage.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'grocery_user'),
        password: configService.get<string>('DB_PASS', 'grocery_pass'),
        database: configService.get<string>('DB_NAME', 'grocery_db'),
        entities: [User, GroceryItem, Order, OrderItem, Cart, CartItem, DeliveryZone, UserAddress, Payment, Refund, Invoice, OrderTimeline, Coupon, CouponUsage],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    GroceryModule,
    OrdersModule,
    CartModule,
    DeliveryModule,
    AddressesModule,
    PaymentModule,
    InvoiceModule,
    OrderTimelineModule,
    CouponsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
