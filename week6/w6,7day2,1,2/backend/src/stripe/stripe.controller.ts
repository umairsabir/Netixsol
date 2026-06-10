import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  type RawBodyRequest,
  Req,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Request() req: any,
    @Body() body: { orderId: string },
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const order = await this.ordersService.findById(body.orderId);
    
    // Only process items that actually cost money (ignore purely point-purchased items)
    const stripeItems = order.items
      .filter((item: any) => item.priceAtPurchase > 0)
      .map((item: any) => ({
        name: item.productId?.name || 'Product',
        price: item.priceAtPurchase,
        quantity: item.quantity,
        image: item.productId?.images?.[0] || undefined,
      }));

    if (stripeItems.length === 0) {
      throw new BadRequestException('No payable items in order');
    }

    const session = await this.stripeService.createCheckoutSession({
      orderId: body.orderId,
      userId: req.user.id,
      items: stripeItems,
      successUrl: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/payment/cancelled?order_id=${body.orderId}`,
    });

    return { url: session.url, sessionId: session.id };
  }

  // Stripe sends raw body — do NOT add JwtAuthGuard here
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: any;
    try {
      event = this.stripeService.constructWebhookEvent(
        req.rawBody as Buffer,
        signature,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          await this.ordersService.confirmStripePayment(
            session.id,
            session.payment_intent,
          );
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        await this.ordersService.failStripePayment(session.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        // The intent will belong to a session, we need to fail the order using the intent if we don't have session.
        // Actually, failStripePayment uses session ID, so we might need a distinct method or lookup.
        // Stripe usually sends checkout.session.expired if the payment intent completely fails without recovery.
        // For now, let's log the failed intent to be thorough as requested.
        this.logger.warn(`Payment intent failed: ${intent.id}`);
        break;
      }
    }

    return { received: true };
  }
}
