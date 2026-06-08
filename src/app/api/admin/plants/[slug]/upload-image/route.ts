import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** POST /api/admin/plants/[slug]/upload-image — upload plant photo to plant-images bucket */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WebP allowed" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const fileName = `${slug}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await admin.storage
    .from("plant-images")
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (error) {
    console.error("plant image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from("plant-images").getPublicUrl(data.path);
  const publicUrl = urlData.publicUrl;

  await admin.from("plants").update({ image_url: publicUrl, updated_at: new Date().toISOString() }).eq("slug", slug);

  return NextResponse.json({ image_url: publicUrl });
}
