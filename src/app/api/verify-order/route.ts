import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

let stripeClient: Stripe | undefined;
function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return stripeClient;
}

/**
 * Read-only payment status check after Stripe redirect.
 * Does not mutate orders — webhook is the source of truth for fulfillment.
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ status: "failed" }, { status: 401 });
  }

  const { sessionId } = await req.json();

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ status: "failed" }, { status: 400 });
  }

  const session = await getStripe().checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.json({ status: "failed" });
  }

  const orderId = session.metadata?.order_id;
  if (!orderId) {
    return NextResponse.json({ status: "failed" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, user_id")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ status: "failed" }, { status: 404 });
  }

  if (order.user_id !== user.id) {
    return NextResponse.json({ status: "failed" }, { status: 403 });
  }

  return NextResponse.json({ status: "paid" });
}
