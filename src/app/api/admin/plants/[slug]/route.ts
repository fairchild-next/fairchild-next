import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ slug: string }> };

/** PATCH /api/admin/plants/[slug] — update any plant fields */
export async function PATCH(req: Request, { params }: Params) {
  const { slug } = await params;
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as Record<string, unknown>;
  const allowed = ["common_name", "scientific_name", "description", "did_you_know", "image_url", "plant_type", "location", "characteristics", "sort_order"];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("plants")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    console.error("admin plant update error:", error);
    return NextResponse.json({ error: "Failed to update plant" }, { status: 500 });
  }

  return NextResponse.json({ plant: data });
}

/** DELETE /api/admin/plants/[slug] — hard delete (no purchase history linked to plants) */
export async function DELETE(_req: Request, { params }: Params) {
  const { slug } = await params;
  const staff = await requireStaff(_req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("plants").delete().eq("slug", slug);
  if (error) {
    console.error("admin plant delete error:", error);
    return NextResponse.json({ error: "Failed to delete plant" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
