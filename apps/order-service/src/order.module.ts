import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartController } from './cart/cart.controller';
import { CartService } from './cart/cart.service';
import { RmqService } from '@ecommerce/shared-rmq';
import { PRODUCT_SERVICE, QUEUES } from '@ecommerce/shared-dto';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,

    // TCP client to product-service (for inventory reservation)
    ClientsModule.registerAsync([
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
    ]),

    // RabbitMQ client for publishing events
    ClientsModule.registerAsync([
      {
        name: 'ORDER_RMQ_CLIENT',
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
            queue: QUEUES.ORDER_QUEUE,
            queueOptions: { durable: true },
            noAck: false,
          },
        }),
      },
    ]),
  ],
  controllers: [OrderController, CartController],
  providers: [OrderService, CartService, RmqService],
})
export class OrderModule {}
