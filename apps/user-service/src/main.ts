import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { QUEUES } from '@ecommerce/shared-dto';

async function bootstrap() {
  const logger = new Logger('UserService');

  const app = await NestFactory.create(UserModule);

  // TCP Transport for synchronous communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.TCP_HOST || '0.0.0.0',
      port: parseInt(process.env.TCP_PORT || '3001', 10),
    },
  });

  // RabbitMQ Transport for async events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: QUEUES.USER_QUEUE,
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

  // Seed admin user
  const userService = app.get(UserService);
  await userService.seedAdmin();

  logger.log('User Service is running on TCP port ' + (process.env.TCP_PORT || '3001'));
}

bootstrap();
