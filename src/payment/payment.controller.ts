import { Controller, Post, Body, Headers, Req, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import Stripe from 'stripe';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Create a Stripe Checkout Session' })
  @Post('checkout')
  async createCheckout(@Body('userId') userId: string) {
    return this.paymentService.createCheckoutSession(userId);
  }

  @ApiOperation({ summary: 'Handle Stripe Webhook Events' })
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(request.rawBody, signature, endpointSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    await this.paymentService.handleWebhook(event);

    return { received: true };
  }
}
