import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/couple/documents?bookingId=...
 * Returns documents for a booking. Couple's bookingId is looked up automatically.
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let bookingId = searchParams.get("bookingId");

  const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();

  if (!staffRow) {
    const { data: wb } = await supabase
      .from("wedding_bookings").select("id").eq("couple_user_id", user.id).single();
    bookingId = wb?.id ?? null;
  }

  if (!bookingId) return NextResponse.json({ documents: [] });

  const { data, error } = await supabase
    .from("wedding_documents")
    .select("id, booking_id, uploaded_by, file_name, file_url, category, created_at")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents: data });
}

/**
 * POST /api/couple/documents
 * Record a document upload. The file_url should be a Supabase Storage URL
 * obtained from the client after uploading to the wedding-docs bucket.
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { file_name, file_url, category, bookingId: bodyBookingId } = await req.json();
  if (!file_name || !file_url) return NextResponse.json({ error: "file_name and file_url required" }, { status: 400 });

  const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();

  let bookingId = bodyBookingId;
  if (!staffRow) {
    const { data: wb } = await supabase
      .from("wedding_bookings").select("id").eq("couple_user_id", user.id).single();
    bookingId = wb?.id ?? null;
  }

  if (!bookingId) return NextResponse.json({ error: "No booking found" }, { status: 404 });

  const { data, error } = await supabase
    .from("wedding_documents")
    .insert({ booking_id: bookingId, uploaded_by: user.id, file_name, file_url, category: category ?? "other" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ document: data });
}

/**
 * DELETE /api/couple/documents?docId=...
 * Coordinator only or the user who uploaded.
 */
export async function DELETE(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("docId");
  if (!docId) return NextResponse.json({ error: "docId required" }, { status: 400 });

  const { data: staffRow } = await supabase.from("staff").select("id").eq("user_id", user.id).single();

  if (staffRow) {
    const { error } = await supabase.from("wedding_documents").delete().eq("id", docId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Couple can only delete their own uploads
  const { error } = await supabase
    .from("wedding_documents").delete().eq("id", docId).eq("uploaded_by", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
