import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  USER_SERVICE,
  PRODUCT_SERVICE,
  ORDER_SERVICE,
  PAYMENT_SERVICE,
} from '@ecommerce/shared-dto';
import { JwtStrategy } from '@ecommerce/shared-auth';
import { UserGatewayController } from './controllers/user.controller';
import { ProductGatewayController } from './controllers/product.controller';
import { OrderGatewayController } from './controllers/order.controller';
import { PaymentGatewayController } from './controllers/payment.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'default-secret'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Register microservice clients
    ClientsModule.registerAsync([
      {
        name: USER_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('USER_SERVICE_HOST', 'localhost'),
            port: configService.get('USER_SERVICE_PORT', 3001),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: PRODUCT_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('PRODUCT_SERVICE_HOST', 'localhost'),
            port: configService.get('PRODUCT_SERVICE_PORT', 3002),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: ORDER_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('ORDER_SERVICE_HOST', 'localhost'),
            port: configService.get('ORDER_SERVICE_PORT', 3003),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: PAYMENT_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('PAYMENT_SERVICE_HOST', 'localhost'),
            port: configService.get('PAYMENT_SERVICE_PORT', 3004),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    UserGatewayController,
    ProductGatewayController,
    OrderGatewayController,
    PaymentGatewayController,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
