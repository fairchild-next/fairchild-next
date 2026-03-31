import Stripe from "stripe";
import { CartLineItem, CheckoutSession, CommerceProvider } from "../types";

export class StripeProvider implements CommerceProvider {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });

  async createCheckoutSession(
    items: CartLineItem[],
    donation?: number,
    orderId?: string,
    customerEmail?: string | null
  ): Promise<CheckoutSession> {
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (donation && donation > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Conservation Support Donation",
          },
          unit_amount: Math.round(donation * 100),
        },
        quantity: 1,
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${baseUrl}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/tickets/cart`,
      metadata: orderId ? { order_id: orderId } : undefined,
      ...(customerEmail && { customer_email: customerEmail }),
    });

    return {
      checkoutUrl: session.url!,
      orderId: session.id,
    };
  }

  async verifyOrder(orderId: string): Promise<{
    status: "paid" | "unpaid";
  }> {
    const session = await this.stripe.checkout.sessions.retrieve(orderId);

    const status: "paid" | "unpaid" =
      session.payment_status === "paid"
        ? "paid"
        : "unpaid";

    return { status };
  }
}