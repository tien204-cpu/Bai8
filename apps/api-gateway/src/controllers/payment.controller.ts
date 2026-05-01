import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Inject,
  UseGuards,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { Request } from 'express';
import {
  PAYMENT_SERVICE,
  PAYMENT_PATTERNS,
  CreatePaymentDto,
  JwtPayload,
} from '@ecommerce/shared-dto';
import { JwtAuthGuard, CurrentUser } from '@ecommerce/shared-auth';

@Controller()
export class PaymentGatewayController {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,
  ) {}

  @Post('payments')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePaymentDto,
  ) {
    return firstValueFrom(
      this.paymentClient
        .send(PAYMENT_PATTERNS.CREATE, { userId: user.sub, ...dto })
        .pipe(timeout(10000)),
    );
  }

  @Get('payments/order/:orderId')
  @UseGuards(JwtAuthGuard)
  async findPaymentByOrder(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ) {
    return firstValueFrom(
      this.paymentClient
        .send(PAYMENT_PATTERNS.FIND_BY_ORDER, {
          orderId,
          userId: user.sub,
        })
        .pipe(timeout(5000)),
    );
  }

  // Stripe Webhook - no auth (uses signature verification)
  @Post('payments/webhook/stripe')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    return firstValueFrom(
      this.paymentClient
        .send(PAYMENT_PATTERNS.STRIPE_WEBHOOK, {
          signature,
          rawBody: req.rawBody?.toString() || '',
        })
        .pipe(timeout(10000)),
    );
  }

  // VNPay Callback - no auth (uses checksum verification)
  @Get('payments/webhook/vnpay')
  async vnpayCallback(@Req() req: Request) {
    return firstValueFrom(
      this.paymentClient
        .send(PAYMENT_PATTERNS.VNPAY_CALLBACK, { query: req.query })
        .pipe(timeout(10000)),
    );
  }
}
