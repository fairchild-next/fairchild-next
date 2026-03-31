import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  let stripeClient: Stripe | undefined;
  function getStripe(): Stripe {
    if (!stripeClient) {
      stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2026-02-25.clover",
      });
    }
    return stripeClient;
  }

  let supabaseClient: SupabaseClient | undefined;
  function getSupabase(): SupabaseClient {
    if (!supabaseClient) {
      supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
    }
    return supabaseClient;
  }

  function generateQRCode() {
    return crypto.randomUUID();
  }

  const supabase = getSupabase();

  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const internalOrderId = session.metadata?.order_id;
    // 🔒 Prevent duplicate ticket generation
    const { count: existingTicketCount } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("order_id", internalOrderId);

    if (existingTicketCount && existingTicketCount > 0) {
      console.log("⚠️ Tickets already generated. Skipping.");
      return NextResponse.json({ received: true });
    }

    if (!internalOrderId) {
      console.error("Missing order_id in Stripe metadata");
      return NextResponse.json({ received: true });
    }

    console.log("💰 Payment verified for order:", internalOrderId);

    // 1️⃣ Update order status
    await supabase
      .from("orders")
      .update({
        status: "paid",
        external_payment_id: session.id,
      })
      .eq("id", internalOrderId);

    // 2️⃣ Fetch order + order items
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", internalOrderId)
      .single();

    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", internalOrderId);

    if (orderItemsError || !orderItems) {
      console.error("Failed to fetch order items:", orderItemsError);
      return NextResponse.json({ received: true });
    }

    // 3️⃣ Generate tickets
    const ticketsToInsert: {
      order_id: string;
      order_item_id: string;
      ticket_type_id: string;
      slot_id: string | null;
      event_id: string | null;
      qr_code: string;
      status: string;
      user_id: string | null;
    }[] = [];

    for (const item of orderItems) {
      for (let i = 0; i < item.quantity; i++) {
        ticketsToInsert.push({
          order_id: internalOrderId,
          order_item_id: item.id,
          ticket_type_id: item.ticket_type_id,
          slot_id: item.slot_id ?? null,
          event_id: item.event_id ?? null,
          qr_code: generateQRCode(),
          status: "unused",
          user_id: order?.user_id ?? null,
        });
      }
    }

    if (ticketsToInsert.length > 0) {
      const { error: ticketInsertError } = await supabase
        .from("tickets")
        .insert(ticketsToInsert);

      if (ticketInsertError) {
        console.error("Ticket generation failed:", ticketInsertError);
      } else {
        console.log(`🎟 Generated ${ticketsToInsert.length} tickets`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
