import Stripe from "stripe";
import {
  CartLineItem,
  CheckoutSession,
  CommerceProvider,
} from "../types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export class StripeProvider implements CommerceProvider {
  async createCheckoutSession(
    items: CartLineItem[],
    donation?: number,
    orderId?: string
  ): Promise<CheckoutSession> {
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

    // Optional donation line item
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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      metadata: {
        order_id: orderId ?? "",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tickets/success?orderId=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tickets/cart`,
    });

    return {
      checkoutUrl: session.url!,
      orderId: session.id,
    };
  }

  async verifyOrder(orderId: string) {
    const session = await stripe.checkout.sessions.retrieve(orderId);

    return {
      status: session.payment_status === "paid" ? "paid" : "unpaid",
    };
  }
}