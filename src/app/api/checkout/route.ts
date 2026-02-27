import { NextResponse } from "next/server";
import { getCommerceProvider } from "@/lib/commerce";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient(); // ✅ now async

  try {
    const body = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    // 🔐 Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const customerEmail =
      body.customerEmail ?? user?.email ?? null;

    // 1️⃣ Create draft order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        currency: "usd",
        payment_provider: "stripe",
        customer_email: customerEmail,
        user_id: user?.id ?? null,
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

    // 2️⃣ Insert order_items
    const orderItemsPayload = body.items.map((item: any) => ({
      order_id: order.id,
      ticket_type_id: item.id,
      slot_id: item.slotId,
      quantity: item.quantity,
      unit_price: Math.round(item.price * 100),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error("Order items insert failed:", itemsError);
      return NextResponse.json(
        { error: "Order items failed" },
        { status: 500 }
      );
    }

    // 3️⃣ Create Stripe session
    const provider = getCommerceProvider();

    const session = await provider.createCheckoutSession(
      body.items,
      body.donation,
      order.id
    );

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("CHECKOUT API ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    );
  }
}