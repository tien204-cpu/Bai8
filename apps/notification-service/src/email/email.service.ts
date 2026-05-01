import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER', ''),
        pass: this.configService.get('SMTP_PASSWORD', ''),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM', 'noreply@ecommerce.com'),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const html = `
      <h1>Welcome to E-Commerce!</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for creating an account. We're excited to have you on board!</p>
      <p>Start exploring our products and enjoy your shopping experience.</p>
    `;
    await this.sendMail(email, 'Welcome to E-Commerce!', html);
  }

  async sendOrderConfirmation(
    email: string,
    orderId: string,
    totalAmount: number,
  ): Promise<void> {
    const html = `
      <h1>Order Confirmation</h1>
      <p>Your order <strong>#${orderId.slice(0, 8)}</strong> has been placed successfully.</p>
      <p>Total: <strong>${totalAmount.toLocaleString()} VND</strong></p>
      <p>We'll notify you when your order status updates.</p>
    `;
    await this.sendMail(email, `Order Confirmation #${orderId.slice(0, 8)}`, html);
  }

  async sendPaymentConfirmation(
    email: string,
    orderId: string,
    amount: number,
  ): Promise<void> {
    const html = `
      <h1>Payment Received</h1>
      <p>We've received your payment of <strong>${amount.toLocaleString()} VND</strong> for order <strong>#${orderId.slice(0, 8)}</strong>.</p>
      <p>Your order has been confirmed and is being processed.</p>
    `;
    await this.sendMail(email, `Payment Confirmed #${orderId.slice(0, 8)}`, html);
  }

  async sendOrderStatusUpdate(
    email: string,
    orderId: string,
    newStatus: string,
  ): Promise<void> {
    const html = `
      <h1>Order Status Update</h1>
      <p>Your order <strong>#${orderId.slice(0, 8)}</strong> status has been updated to: <strong>${newStatus}</strong></p>
    `;
    await this.sendMail(email, `Order Update #${orderId.slice(0, 8)} - ${newStatus}`, html);
  }
}
