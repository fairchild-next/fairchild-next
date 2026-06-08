import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/ticket-types/[id] — update name, price, price_peak, is_active */
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as Record<string, unknown>;
  const allowed = ["name", "price", "price_peak", "is_active"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("ticket_types")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("ticket type update error:", error);
    return NextResponse.json({ error: "Failed to update ticket type" }, { status: 500 });
  }

  return NextResponse.json({ ticket_type: data });
}

/** DELETE /api/admin/ticket-types/[id] — deactivate (soft delete) */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const staff = await requireStaff(_req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("ticket_types").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to remove ticket type" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
