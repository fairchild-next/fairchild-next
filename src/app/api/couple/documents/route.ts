import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { serverError } from "@/lib/api-error";
import { isCoordinator } from "@/lib/couple/auth";

/** Only accept file_url values that point to this project's Supabase storage. */
function isValidStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;
    return parsed.hostname === supabaseHost;
  } catch {
    return false;
  }
}

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

  const coordinator = await isCoordinator(supabase, user.id);

  if (!coordinator) {
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

  if (error) return serverError("couple/documents GET", error);
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
  if (!isValidStorageUrl(file_url)) {
    return NextResponse.json({ error: "Invalid file_url: must be a Supabase storage URL" }, { status: 400 });
  }

  const coordinator = await isCoordinator(supabase, user.id);

  let bookingId = bodyBookingId;
  if (!coordinator) {
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

  if (error) return serverError("couple/documents POST", error);
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

  const coordinator = await isCoordinator(supabase, user.id);

  if (coordinator) {
    const { error } = await supabase.from("wedding_documents").delete().eq("id", docId);
    if (error) return serverError("couple/documents DELETE coordinator", error);
    return NextResponse.json({ ok: true });
  }

  // Couple can only delete their own uploads
  const { error } = await supabase
    .from("wedding_documents").delete().eq("id", docId).eq("uploaded_by", user.id);
  if (error) return serverError("couple/documents DELETE couple", error);
  return NextResponse.json({ ok: true });
}
