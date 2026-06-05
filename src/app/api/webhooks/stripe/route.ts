import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decrementSlotCapacity } from "@/lib/commerce/validateCart";

let stripeClient: Stripe | undefined;
function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return stripeClient;
}

function generateQRCode() {
  return crypto.randomUUID();
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseAdminClient();

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

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
    // Idempotency guard: insert the Stripe event ID atomically.
    // If it already exists (error 23505 unique_violation) the webhook was
    // already processed — return 200 so Stripe stops retrying.
    const { error: idempotencyError } = await supabase
      .from("stripe_webhook_events")
      .insert({ id: event.id });

    if (idempotencyError) {
      if (idempotencyError.code === "23505") {
        // Already processed — safe to acknowledge
        return NextResponse.json({ received: true });
      }
      console.error("Idempotency check failed:", idempotencyError);
      return NextResponse.json({ error: "Idempotency error" }, { status: 500 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const internalOrderId = session.metadata?.order_id;

    if (!internalOrderId) {
      console.error("Missing order_id in Stripe metadata");
      return NextResponse.json(
        { error: "Missing order_id" },
        { status: 400 }
      );
    }

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        external_payment_id: session.id,
      })
      .eq("id", internalOrderId);

    if (orderUpdateError) {
      console.error("Order update failed:", orderUpdateError);
      return NextResponse.json(
        { error: "Order update failed" },
        { status: 500 }
      );
    }

    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", internalOrderId)
      .single();

    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", internalOrderId);

    if (orderItemsError || !orderItems?.length) {
      console.error("Failed to fetch order items:", orderItemsError);
      return NextResponse.json(
        { error: "Failed to fetch order items" },
        { status: 500 }
      );
    }

    try {
      await decrementSlotCapacity(supabase, orderItems);
    } catch (capacityErr) {
      console.error("Capacity decrement failed:", capacityErr);
      return NextResponse.json(
        { error: "Capacity decrement failed" },
        { status: 500 }
      );
    }

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
        return NextResponse.json(
          { error: "Ticket generation failed" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
