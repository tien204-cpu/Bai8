import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EmailModule } from './email/email.module';
import { SmsModule } from './sms/sms.module';
import { RmqService } from '@ecommerce/shared-rmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EmailModule,
    SmsModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, RmqService],
})
export class NotificationModule {}
