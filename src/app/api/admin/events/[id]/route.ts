import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/events/[id]
 * Update event fields. Partial update — only provided fields are changed.
 */
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as Record<string, unknown>;

  // Whitelist updatable fields
  const allowed = ["name", "slug", "description", "start_date", "end_date", "start_time", "end_time", "image_url", "is_festival", "is_active", "sort_order"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("admin event update error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}

/**
 * DELETE /api/admin/events/[id]
 * Soft-delete by setting is_active = false rather than hard-deleting
 * (preserves order history).
 */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const staff = await requireStaff(_req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("events")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("admin event delete error:", error);
    return NextResponse.json({ error: "Failed to deactivate event" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
