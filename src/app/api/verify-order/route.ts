import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ status: "failed" }, { status: 400 });
  }

  // 1️⃣ Verify with Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.json({ status: "failed" });
  }

  // 2️⃣ Mark order paid in DB (optional safety)
  const orderId = session.metadata?.order_id;

  if (orderId) {
    const supabase = await createSupabaseServerClient();

    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);
  }

  return NextResponse.json({ status: "paid" });
}