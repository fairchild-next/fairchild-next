import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/couple/messages?bookingId=...
 * Returns messages for a booking, ordered oldest-first.
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let bookingId = searchParams.get("bookingId");

  const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();

  if (!staffRow) {
    // Couple: look up their booking
    const { data: wb } = await supabase
      .from("wedding_bookings")
      .select("id")
      .eq("couple_user_id", user.id)
      .single();
    bookingId = wb?.id ?? null;
  }

  if (!bookingId) return NextResponse.json({ messages: [] });

  const { data, error } = await supabase
    .from("wedding_messages")
    .select("id, booking_id, sender_id, sender_role, message, created_at")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

/**
 * POST /api/couple/messages
 * Send a message. Role is derived from staff table membership.
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, bookingId: bodyBookingId } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

  const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();
  const senderRole = staffRow ? "coordinator" : "couple";

  let bookingId = bodyBookingId;
  if (!staffRow) {
    const { data: wb } = await supabase
      .from("wedding_bookings")
      .select("id")
      .eq("couple_user_id", user.id)
      .single();
    bookingId = wb?.id ?? null;
  }

  if (!bookingId) return NextResponse.json({ error: "No booking found" }, { status: 404 });

  const { data, error } = await supabase
    .from("wedding_messages")
    .insert({ booking_id: bookingId, sender_id: user.id, sender_role: senderRole, message: message.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}
