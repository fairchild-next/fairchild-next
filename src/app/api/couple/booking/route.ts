import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/couple/booking
 * Returns the current user's wedding booking (couple) or all bookings (coordinator).
 * coordinator_notes is stripped from couple responses.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if staff/coordinator
  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (staffRow) {
    // Coordinator: return all bookings with full details
    const { data, error } = await supabase
      .from("wedding_bookings")
      .select("*")
      .order("wedding_date", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ bookings: data, role: "coordinator" });
  }

  // Couple: return their own booking, strip coordinator_notes
  const { data, error } = await supabase
    .from("wedding_bookings")
    .select("id, couple_user_id, coordinator_id, couple_name, partner_name, wedding_date, venue, package, status, ceremony_time, cocktail_time, reception_time, guest_count, catering_notes, created_at, updated_at")
    .eq("couple_user_id", user.id)
    .single();

  if (error || !data) return NextResponse.json({ booking: null, role: "couple" });
  return NextResponse.json({ booking: data, role: "couple" });
}

/**
 * PATCH /api/couple/booking
 * Couple: update guest_count and catering_notes only.
 * Coordinator: update any field on any booking (pass bookingId in body).
 */
export async function PATCH(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (staffRow) {
    // Coordinator update — full access
    const { bookingId, ...fields } = body;
    if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });
    const { data, error } = await supabase
      .from("wedding_bookings")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", bookingId)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ booking: data });
  }

  // Couple — restricted fields only
  const { guest_count, catering_notes } = body;
  const { data, error } = await supabase
    .from("wedding_bookings")
    .update({ guest_count, catering_notes, updated_at: new Date().toISOString() })
    .eq("couple_user_id", user.id)
    .select("id, guest_count, catering_notes, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ booking: data });
}
