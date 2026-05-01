import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { SmsService } from './sms/sms.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async handleUserRegistered(data: {
    userId: string;
    email: string;
    firstName: string;
  }) {
    this.logger.log(`User registered: ${data.email}`);
    await this.emailService.sendWelcomeEmail(data.email, data.firstName);
  }

  async handleOrderCreated(data: {
    orderId: string;
    userId: string;
    totalAmount: number;
    email?: string;
  }) {
    this.logger.log(`Order created: ${data.orderId}`);
    if (data.email) {
      await this.emailService.sendOrderConfirmation(
        data.email,
        data.orderId,
        data.totalAmount,
      );
    }
  }

  async handlePaymentCompleted(data: {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    email?: string;
  }) {
    this.logger.log(`Payment completed: ${data.paymentId}`);
    if (data.email) {
      await this.emailService.sendPaymentConfirmation(
        data.email,
        data.orderId,
        data.amount,
      );
    }
  }

  async handlePaymentFailed(data: {
    paymentId: string;
    orderId: string;
    reason: string;
  }) {
    this.logger.warn(`Payment failed: ${data.paymentId} - ${data.reason}`);
  }

  async handleOrderStatusUpdated(data: {
    orderId: string;
    userId: string;
    oldStatus: string;
    newStatus: string;
    email?: string;
  }) {
    this.logger.log(`Order ${data.orderId} status: ${data.oldStatus} -> ${data.newStatus}`);
    if (data.email) {
      await this.emailService.sendOrderStatusUpdate(
        data.email,
        data.orderId,
        data.newStatus,
      );
    }
  }

  async handleOrderCancelled(data: { orderId: string }) {
    this.logger.log(`Order cancelled: ${data.orderId}`);
  }
}
