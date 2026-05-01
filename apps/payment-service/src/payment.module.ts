import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeProvider } from './providers/stripe.provider';
import { VnpayProvider } from './providers/vnpay.provider';
import { RmqService } from '@ecommerce/shared-rmq';
import { QUEUES } from '@ecommerce/shared-dto';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,

    // RabbitMQ client for publishing events
    ClientsModule.registerAsync([
      {
        name: 'PAYMENT_RMQ_CLIENT',
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
            queue: QUEUES.PAYMENT_QUEUE,
            queueOptions: { durable: true },
            noAck: false,
          },
        }),
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeProvider, VnpayProvider, RmqService],
})
export class PaymentModule {}
