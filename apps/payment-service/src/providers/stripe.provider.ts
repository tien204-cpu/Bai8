import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeProvider {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get('STRIPE_SECRET_KEY', 'sk_test_placeholder'),
      { apiVersion: '2023-10-16' as any },
    );
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      metadata,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      transactionId: paymentIntent.id,
    };
  }

  async verifyWebhook(rawBody: string, signature: string): Promise<Stripe.Event> {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET', '');
    return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }
}
