import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/admin/coordinators/[id]
 * Update a coordinator's name or is_active status.
 * Requires staff auth.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await requireStaff(req);
  if (!caller.ok) return NextResponse.json({ error: caller.error }, { status: caller.status });

  const { id } = await params;
  const body = await req.json() as { name?: string; is_active?: boolean };
  const updates: Record<string, unknown> = {};
  if (typeof body.name !== "undefined") updates.name = body.name;
  if (typeof body.is_active !== "undefined") updates.is_active = body.is_active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("wedding_coordinators")
    .update(updates)
    .eq("id", id)
    .select("id, user_id, name, is_active, created_at")
    .single();

  if (error) {
    console.error("coordinator update error:", error);
    return NextResponse.json({ error: "Failed to update coordinator" }, { status: 500 });
  }

  return NextResponse.json({ coordinator: data });
}

/**
 * DELETE /api/admin/coordinators/[id]
 * Permanently removes a coordinator row (revokes all portal access).
 * Requires staff auth.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await requireStaff(req);
  if (!caller.ok) return NextResponse.json({ error: caller.error }, { status: caller.status });

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("wedding_coordinators")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("coordinator delete error:", error);
    return NextResponse.json({ error: "Failed to remove coordinator" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
