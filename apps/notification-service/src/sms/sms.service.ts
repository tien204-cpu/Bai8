import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendSms(phone: string, message: string): Promise<void> {
    // Placeholder: integrate with Twilio, AWS SNS, or a local SMS gateway
    this.logger.log(`SMS to ${phone}: ${message}`);
    // In production, implement actual SMS sending here:
    // await twilioClient.messages.create({ body: message, to: phone, from: '+1...' });
  }

  async sendOrderNotification(phone: string, orderId: string): Promise<void> {
    await this.sendSms(
      phone,
      `Your order #${orderId.slice(0, 8)} has been placed successfully. Thank you for shopping with us!`,
    );
  }
}
