import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ProductModule } from './product.module';
import { QUEUES } from '@ecommerce/shared-dto';

async function bootstrap() {
  const logger = new Logger('ProductService');

  const app = await NestFactory.create(ProductModule);

  // TCP Transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.TCP_HOST || '0.0.0.0',
      port: parseInt(process.env.TCP_PORT || '3002', 10),
    },
  });

  // RabbitMQ Transport for async events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: QUEUES.PRODUCT_QUEUE,
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.startAllMicroservices();
  logger.log('Product Service is running on TCP port ' + (process.env.TCP_PORT || '3002'));
}

bootstrap();
