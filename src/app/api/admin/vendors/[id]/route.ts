import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;
  const allowed = [
    "category_slug", "category_label", "category_emoji", "name", "description",
    "website", "phone", "email", "note", "sort_order", "is_active",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("wedding_vendors")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  return NextResponse.json({ vendor: data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("wedding_vendors").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
