import { NextResponse } from "next/server";
import { getCommerceProvider } from "@/lib/commerce";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  CartValidationError,
  validateCheckoutCart,
  validateDonationAmount,
  type CartItemInput,
} from "@/lib/commerce/validateCart";
import type { CartLineItem } from "@/lib/commerce/types";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const customerEmail = body.customerEmail ?? user.email ?? null;
    const admin = createSupabaseAdminClient();

    const validatedItems = await validateCheckoutCart(
      admin,
      body.items as CartItemInput[]
    );
    const donation = validateDonationAmount(body.donation);

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        status: "pending",
        currency: "usd",
        payment_provider: "stripe",
        customer_email: customerEmail,
        user_id: user.id,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation failed:", orderError);
      return NextResponse.json(
        { error: "Order creation failed" },
        { status: 500 }
      );
    }

    const orderItemsPayload = validatedItems.map((item) => ({
      order_id: order.id,
      ticket_type_id: item.productId,
      slot_id: item.slotId,
      event_id: item.eventId,
      quantity: item.quantity,
      unit_price: item.unitPriceCents,
      is_peak: item.isPeak,
    }));

    const { error: itemsError } = await admin
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error("Order items insert failed:", itemsError);
      await admin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Order items failed" },
        { status: 500 }
      );
    }

    const stripeItems: CartLineItem[] = validatedItems.map((item) => ({
      id: item.productId,
      productType: item.productType,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      slotId: item.slotId ?? undefined,
      eventId: item.eventId ?? undefined,
      isPeak: item.isPeak ?? undefined,
    }));

    const provider = getCommerceProvider();
    const session = await provider.createCheckoutSession(
      stripeItems,
      donation,
      order.id,
      customerEmail
    );

    return NextResponse.json(session);
  } catch (error: unknown) {
    if (error instanceof CartValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("CHECKOUT API ERROR:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
