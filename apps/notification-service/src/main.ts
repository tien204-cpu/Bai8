import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { NotificationModule } from './notification.module';
import { QUEUES } from '@ecommerce/shared-dto';

async function bootstrap() {
  const logger = new Logger('NotificationService');

  const app = await NestFactory.create(NotificationModule);

  // RabbitMQ Transport ONLY (no TCP - this is a pure event consumer)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: QUEUES.NOTIFICATION_QUEUE,
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  logger.log('Notification Service is running (RabbitMQ consumer)');
}

bootstrap();
