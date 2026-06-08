import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** PATCH /api/admin/badges/[id] — update badge description or icon_url */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as Record<string, unknown>;
  const allowed = ["badge_name", "description", "icon_url", "sort_order"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("kids_badges")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("badge update error:", error);
    return NextResponse.json({ error: "Failed to update badge" }, { status: 500 });
  }

  return NextResponse.json({ badge: data });
}

/** POST /api/admin/badges/[id]/upload-icon — upload badge image */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  // First look up the badge_key for a clean filename
  const admin = createSupabaseAdminClient();
  const { data: badge } = await admin.from("kids_badges").select("badge_key").eq("id", id).single();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WebP allowed" }, { status: 400 });
  }

  const fileName = `${badge?.badge_key ?? id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data: uploadData, error: uploadError } = await admin.storage
    .from("badge-images")
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("badge icon upload error:", uploadError);
    return NextResponse.json({ error: "Failed to upload icon" }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from("badge-images").getPublicUrl(uploadData.path);
  const publicUrl = urlData.publicUrl;

  await admin.from("kids_badges").update({ icon_url: publicUrl }).eq("id", id);

  return NextResponse.json({ icon_url: publicUrl });
}
