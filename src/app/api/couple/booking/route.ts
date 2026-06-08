import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { serverError } from "@/lib/api-error";
import { isCoordinator } from "@/lib/couple/auth";

/**
 * GET /api/couple/booking
 * Returns the current user's wedding booking (couple) or all bookings (coordinator).
 * coordinator_notes is stripped from couple responses.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coordinator = await isCoordinator(supabase, user.id);

  if (coordinator) {
    // Coordinator: return all bookings with full details
    const { data, error } = await supabase
      .from("wedding_bookings")
      .select("*")
      .order("wedding_date", { ascending: true });
    if (error) return serverError("couple/booking GET coordinator", error);
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

  const coordinator = await isCoordinator(supabase, user.id);

  if (coordinator) {
    // Coordinator update — full access
    const { bookingId, ...fields } = body;
    if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });
    const { data, error } = await supabase
      .from("wedding_bookings")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", bookingId)
      .select()
      .single();
    if (error) return serverError("couple/booking PATCH coordinator", error);
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

  if (error) return serverError("couple/booking PATCH couple", error);
  return NextResponse.json({ booking: data });
}

/**
 * POST /api/couple/booking
 * Coordinator only: create a new wedding booking inquiry.
 * Body: { couple_name, partner_name, wedding_date?, venue?, package?, status? }
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coordinator = await isCoordinator(supabase, user.id);
  if (!coordinator) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as {
    couple_name?: string;
    partner_name?: string;
    wedding_date?: string | null;
    venue?: string | null;
    package?: string | null;
    status?: string;
  };

  const couple_name = body.couple_name?.trim();
  const partner_name = body.partner_name?.trim();
  if (!couple_name || !partner_name) {
    return NextResponse.json({ error: "couple_name and partner_name are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("wedding_bookings")
    .insert({
      couple_name,
      partner_name,
      wedding_date: body.wedding_date || null,
      venue: body.venue || null,
      package: body.package || null,
      status: body.status || "inquiry",
      coordinator_id: user.id,
    })
    .select()
    .single();

  if (error) return serverError("couple/booking POST", error);
  return NextResponse.json({ booking: data }, { status: 201 });
}
