export interface CartLineItem {
  id: string;
  productType: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  slotId?: string;
  /** For flex tickets: true = weekend/peak, false = weekday/off-peak */
  isPeak?: boolean;
  /** For special-event: event uuid */
  eventId?: string;
}

export interface CheckoutSession {
  checkoutUrl?: string;
  orderId?: string;
}

export interface CommerceProvider {
  createCheckoutSession(
    items: CartLineItem[],
    donation?: number,
    orderId?: string,
    customerEmail?: string | null
  ): Promise<CheckoutSession>;

  verifyOrder(orderId: string): Promise<{
    status: "paid" | "unpaid";
  }>;
}