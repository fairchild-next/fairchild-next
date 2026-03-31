import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/siteConfig";
import crypto from "crypto";

/**
 * POST /api/members/reserve
 * For members with $0 cart total. Creates order + tickets without Stripe.
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify member status
  const { data: member } = await supabase
    .from("members")
    .select("id, member_id, expires_at")
    .eq("user_id", user.id)
    .gte("expires_at", new Date().toISOString().split("T")[0])
    .single();

  if (!member) {
    return NextResponse.json({ error: "Active membership required" }, { status: 403 });
  }

  const body = await req.json();
  type ReserveItem = {
    productId: string;
    productType: string;
    name: string;
    price: number;
    quantity: number;
    slotId?: string;
    eventId?: string;
    isPeak?: boolean;
  };
  const items = body.items as ReserveItem[];

  if (!items?.length) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const maxAllowed = siteConfig.memberTicketMaxPerReservation;
  if (maxAllowed != null && totalQuantity > maxAllowed) {
    return NextResponse.json(
      { error: `Maximum ${maxAllowed} tickets per reservation.` },
      { status: 400 }
    );
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (total > 0) {
    return NextResponse.json(
      { error: "Member reserve is for $0 orders only. Use checkout for paid orders." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  // Create order
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      status: "paid",
      currency: "usd",
      payment_provider: "member_reserve",
      customer_email: user.email,
      user_id: user.id,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Member reserve order failed:", orderError);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }

  // Create order_items
  const orderItemsPayload = items.map((item) => ({
    order_id: order.id,
    ticket_type_id: item.productId,
    slot_id: item.slotId ?? null,
    event_id: item.eventId ?? null,
    quantity: item.quantity,
    unit_price: 0,
    is_peak: item.isPeak ?? null,
  }));

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(orderItemsPayload);

  if (itemsError) {
    console.error("Member reserve order_items failed:", itemsError);
    return NextResponse.json({ error: "Failed to create reservation items" }, { status: 500 });
  }

  // Fetch order_items to get IDs
  const { data: orderItems } = await admin
    .from("order_items")
    .select("id, ticket_type_id, quantity, slot_id, event_id")
    .eq("order_id", order.id);

  if (!orderItems?.length) {
    return NextResponse.json({ error: "Failed to fetch order items" }, { status: 500 });
  }

  // Generate tickets
  const ticketsToInsert: Array<{
    order_id: string;
    order_item_id: string;
    ticket_type_id: string;
    slot_id: string | null;
    event_id: string | null;
    qr_code: string;
    status: string;
    user_id: string;
  }> = [];

  for (const oi of orderItems) {
    for (let i = 0; i < oi.quantity; i++) {
      const qr = `MEMBER-${crypto.randomBytes(16).toString("hex").toUpperCase()}`;
      ticketsToInsert.push({
        order_id: order.id,
        order_item_id: oi.id,
        ticket_type_id: oi.ticket_type_id,
        slot_id: oi.slot_id,
        event_id: oi.event_id,
        qr_code: qr,
        status: "unused",
        user_id: user.id,
      });
    }
  }

  const { error: ticketsError } = await admin
    .from("tickets")
    .insert(ticketsToInsert);

  if (ticketsError) {
    console.error("Member reserve tickets failed:", ticketsError);
    return NextResponse.json({ error: "Failed to generate tickets" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    orderId: order.id,
    ticketCount: ticketsToInsert.length,
  });
}
