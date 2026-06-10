import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

type CheckoutItem = {
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type StripeClient = InstanceType<typeof Stripe>;
type CheckoutSession = Awaited<
  ReturnType<StripeClient['checkout']['sessions']['create']>
>;

@Injectable()
export class StripeService {
  private stripe: StripeClient;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2026-03-25.dahlia',
      },
    );
  }

  async createCheckoutSession(params: {
    orderId: string;
    userId: string;
    items: CheckoutItem[];
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession> {
    const lineItems = params.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        orderId: params.orderId,
        userId: params.userId,
      },
    });

    return session;
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
