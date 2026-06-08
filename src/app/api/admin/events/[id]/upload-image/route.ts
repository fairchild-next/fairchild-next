import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/events/[id]/upload-image
 * Accepts a multipart/form-data with a `file` field.
 * Uploads to the events-images bucket and patches image_url on the event.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const maxMb = 5;
  if (file.size > maxMb * 1024 * 1024) {
    return NextResponse.json({ error: `File too large (max ${maxMb} MB)` }, { status: 413 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowedExts = ["jpg", "jpeg", "png", "webp"];
  if (!allowedExts.includes(ext)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WebP images allowed" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const fileName = `${id}-${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { data: uploadData, error: uploadError } = await admin.storage
    .from("events-images")
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("event image upload error:", uploadError);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from("events-images").getPublicUrl(uploadData.path);
  const publicUrl = urlData.publicUrl;

  // Patch the event's image_url
  await admin.from("events").update({ image_url: publicUrl }).eq("id", id);

  return NextResponse.json({ image_url: publicUrl });
}
