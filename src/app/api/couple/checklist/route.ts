import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getBookingIdForCouple(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("wedding_bookings")
    .select("id")
    .eq("couple_user_id", userId)
    .single();
  return data?.id ?? null;
}

/**
 * GET /api/couple/checklist?bookingId=...
 * Returns checklist items for a booking.
 * Coordinator must pass bookingId. Couple's bookingId is looked up automatically.
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let bookingId = searchParams.get("bookingId");

  const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();

  if (!staffRow) {
    bookingId = await getBookingIdForCouple(supabase, user.id);
  }
  if (!bookingId) return NextResponse.json({ items: [] });

  const { data, error } = await supabase
    .from("wedding_checklist_items")
    .select("*")
    .eq("booking_id", bookingId)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

/**
 * POST /api/couple/checklist
 * Coordinator only: add a checklist item.
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();
  if (!staffRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { booking_id, title, description, due_date, sort_order } = await req.json();
  if (!booking_id || !title) return NextResponse.json({ error: "booking_id and title required" }, { status: 400 });

  const { data, error } = await supabase
    .from("wedding_checklist_items")
    .insert({ booking_id, title, description, due_date, sort_order: sort_order ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

/**
 * PATCH /api/couple/checklist
 * Mark item complete/incomplete. Both couple and coordinator can do this.
 */
export async function PATCH(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId, completed, ...rest } = await req.json();
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  const updates: Record<string, unknown> = { completed, ...rest };
  if (completed) {
    updates.completed_at = new Date().toISOString();
    updates.completed_by = user.id;
  } else {
    updates.completed_at = null;
    updates.completed_by = null;
  }

  const { data, error } = await supabase
    .from("wedding_checklist_items")
    .update(updates)
    .eq("id", itemId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

/**
 * DELETE /api/couple/checklist?itemId=...
 * Coordinator only.
 */
export async function DELETE(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();
  if (!staffRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  const { error } = await supabase.from("wedding_checklist_items").delete().eq("id", itemId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
