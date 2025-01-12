import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  // Create a Stripe Checkout Session
  async createCheckoutSession(userId: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Membership',
              description: 'Access premium features for 30 days',
            },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: { userId },
    });

    return { url: session.url };
  }

  // Handle Stripe Webhook Events
  async handleWebhook(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
      const userId = session.metadata?.userId;

      if (userId) {
        // Grant premium access to the user
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Premium for 30 days

        await this.prisma.premiumAccess.upsert({
          where: { userId },
          update: { expiresAt },
          create: { userId, expiresAt },
        });

        console.log(`✅ Premium access granted to user ${userId}`);
      } else {
        console.error(`❌ Missing userId in session metadata.`);
      }
    }
  }
}
