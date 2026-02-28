export interface CartLineItem {
  id: string;
  productType: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  slotId?: string;
}

export interface CheckoutSession {
  checkoutUrl?: string;
  orderId?: string;
}

export interface CommerceProvider {
  createCheckoutSession(
    items: CartLineItem[],
    donation?: number,
    orderId?: string
  ): Promise<CheckoutSession>;

  verifyOrder(orderId: string): Promise<{
    status: "paid" | "unpaid";
  }>;
}