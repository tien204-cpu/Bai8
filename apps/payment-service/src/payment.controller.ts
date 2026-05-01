import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import {
  PAYMENT_PATTERNS,
  EVENT_PATTERNS,
  CreatePaymentDto,
} from '@ecommerce/shared-dto';
import { RmqService } from '@ecommerce/shared-rmq';

@Controller()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern(PAYMENT_PATTERNS.CREATE)
  async createPayment(@Payload() data: { userId: string } & CreatePaymentDto) {
    const { userId, ...dto } = data;
    return this.paymentService.createPayment(userId, dto as CreatePaymentDto);
  }

  @MessagePattern(PAYMENT_PATTERNS.FIND_BY_ORDER)
  async findByOrder(@Payload() data: { orderId: string; userId?: string }) {
    return this.paymentService.findByOrder(data.orderId, data.userId);
  }

  @MessagePattern(PAYMENT_PATTERNS.STRIPE_WEBHOOK)
  async stripeWebhook(@Payload() data: { signature: string; rawBody: string }) {
    return this.paymentService.handleStripeWebhook(data.signature, data.rawBody);
  }

  @MessagePattern(PAYMENT_PATTERNS.VNPAY_CALLBACK)
  async vnpayCallback(@Payload() data: { query: Record<string, string> }) {
    return this.paymentService.handleVnpayCallback(data.query);
  }

  // Listen for order.created -> auto-create pending payment (optional)
  @EventPattern(EVENT_PATTERNS.ORDER_CREATED)
  async handleOrderCreated(
    @Payload() data: { orderId: string; userId: string; totalAmount: number },
    @Ctx() context: RmqContext,
  ) {
    // Just acknowledge - payment will be created when user initiates checkout
    this.rmqService.ack(context);
  }
}
