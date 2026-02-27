import { CartLineItem, CheckoutSession, CommerceProvider } from "../types";

export class AltruXtrulinkProvider implements CommerceProvider {
  async createCheckoutSession(
    items: CartLineItem[],
    donation?: number
  ): Promise<CheckoutSession> {
    const query = new URLSearchParams();

    items.forEach((item, index) => {
      query.append(`item${index}_id`, item.productId);
      query.append(`item${index}_qty`, item.quantity.toString());
    });

    if (donation) {
      query.append("donation", donation.toString());
    }

    const checkoutUrl = `https://commerce.blackbaud.com/xtrulink?${query.toString()}`;

    return {
      checkoutUrl,
      orderId: undefined,
    };
  }

  async verifyOrder(orderId: string) {
    return { status: "paid" as const };
  }
}