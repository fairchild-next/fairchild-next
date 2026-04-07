import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/couple/coordinator
 * Links a couple's email address to a wedding booking.
 * Coordinator only.
 *
 * Body: { bookingId: string, email: string }
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();
  if (!staffRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { bookingId, email } = await req.json();
  if (!bookingId || !email) return NextResponse.json({ error: "bookingId and email required" }, { status: 400 });

  // Use admin client to look up user by email
  const admin = createSupabaseAdminClient();
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
  if (listError) return NextResponse.json({ error: "Could not search users" }, { status: 500 });

  const targetUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!targetUser) {
    return NextResponse.json({ error: "No account found with that email. The couple must sign up first." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("wedding_bookings")
    .update({ couple_user_id: targetUser.id, updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select("id, couple_name, couple_user_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ booking: data });
}

/**
 * DELETE /api/couple/coordinator?bookingId=...
 * Unlinks the couple's user account from a booking.
 * Coordinator only.
 */
export async function DELETE(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();
  if (!staffRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

  const { error } = await supabase
    .from("wedding_bookings")
    .update({ couple_user_id: null, updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
