import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from './prisma/prisma.service';
import { StripeProvider } from './providers/stripe.provider';
import { VnpayProvider } from './providers/vnpay.provider';
import {
  CreatePaymentDto,
  EVENT_PATTERNS,
  PaymentMethod,
  PaymentStatus,
} from '@ecommerce/shared-dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeProvider: StripeProvider,
    private readonly vnpayProvider: VnpayProvider,
    @Inject('PAYMENT_RMQ_CLIENT') private readonly rmqClient: ClientProxy,
  ) {}

  async createPayment(userId: string, dto: CreatePaymentDto) {
    // Check for idempotency - prevent duplicate payments
    const existing = await this.prisma.payment.findFirst({
      where: {
        orderId: dto.orderId,
        status: { in: ['PENDING', 'COMPLETED'] },
      },
    });

    if (existing) {
      if (existing.status === 'COMPLETED') {
        throw new BadRequestException('Payment already completed for this order');
      }
      return this.toResponse(existing);
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        userId,
        amount: dto.amount,
        currency: dto.currency || 'VND',
        method: dto.method,
        status: 'PENDING',
      },
    });

    let providerData: any = {};

    if (dto.method === PaymentMethod.STRIPE) {
      const result = await this.stripeProvider.createPaymentIntent(
        dto.amount,
        dto.currency || 'VND',
        { orderId: dto.orderId, paymentId: payment.id },
      );
      providerData = result;

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { providerTransactionId: result.transactionId },
      });
    } else if (dto.method === PaymentMethod.VNPAY) {
      const paymentUrl = this.vnpayProvider.createPaymentUrl(
        payment.id,
        dto.amount,
        `Payment for order ${dto.orderId}`,
        '127.0.0.1',
      );
      providerData = { paymentUrl };
    }

    return {
      ...this.toResponse(payment),
      ...providerData,
    };
  }

  async findByOrder(orderId: string, userId?: string) {
    const where: any = { orderId };
    if (userId) {
      where.userId = userId;
    }

    const payment = await this.prisma.payment.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    return this.toResponse(payment);
  }

  async handleStripeWebhook(signature: string, rawBody: string) {
    const event = await this.stripeProvider.verifyWebhook(rawBody, signature);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      const paymentId = paymentIntent.metadata?.paymentId;

      if (paymentId) {
        await this.completePayment(paymentId, paymentIntent.id);
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as any;
      const paymentId = paymentIntent.metadata?.paymentId;

      if (paymentId) {
        await this.failPayment(paymentId, 'Stripe payment failed');
      }
    }

    return { received: true };
  }

  async handleVnpayCallback(query: Record<string, string>) {
    const result = this.vnpayProvider.verifyCallback(query);

    if (!result.isValid) {
      throw new BadRequestException('Invalid VNPay signature');
    }

    if (result.responseCode === '00') {
      await this.completePayment(result.orderId, result.transactionId);
    } else {
      await this.failPayment(result.orderId, `VNPay error: ${result.responseCode}`);
    }

    return { success: result.responseCode === '00' };
  }

  private async completePayment(paymentId: string, transactionId: string) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        providerTransactionId: transactionId,
      },
    });

    // Emit payment.completed event
    this.rmqClient.emit(EVENT_PATTERNS.PAYMENT_COMPLETED, {
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: Number(payment.amount),
    });

    this.logger.log(`Payment completed: ${payment.id} for order: ${payment.orderId}`);
  }

  private async failPayment(paymentId: string, reason: string) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'FAILED',
        metadata: { failureReason: reason },
      },
    });

    // Emit payment.failed event
    this.rmqClient.emit(EVENT_PATTERNS.PAYMENT_FAILED, {
      paymentId: payment.id,
      orderId: payment.orderId,
      reason,
    });

    this.logger.warn(`Payment failed: ${payment.id} - ${reason}`);
  }

  private toResponse(payment: any) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      providerTransactionId: payment.providerTransactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
