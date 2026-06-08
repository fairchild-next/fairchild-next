import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/upload-home-image
 * Uploads a homepage image (e.g. What's Blooming card) to the events-images bucket.
 * Returns the public URL.
 */
export async function POST(req: Request) {
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
  if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WebP allowed" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const fileName = `home/blooming-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await admin.storage
    .from("events-images")
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (error) {
    console.error("home image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from("events-images").getPublicUrl(data.path);
  return NextResponse.json({ image_url: urlData.publicUrl });
}
