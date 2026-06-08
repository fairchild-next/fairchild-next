import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/admin/admission-dates/[id]
 * Body: { capacity?, capacity_remaining?, is_active? }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { id } = await params;
  const body = await req.json() as {
    capacity?: number;
    capacity_remaining?: number;
    is_active?: boolean;
  };

  const updates: Record<string, unknown> = {};
  if (body.capacity !== undefined) updates.capacity = body.capacity;
  if (body.capacity_remaining !== undefined) updates.capacity_remaining = body.capacity_remaining;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("admission_dates")
    .update(updates)
    .eq("id", id)
    .select("id, date, capacity, capacity_remaining, is_active, created_at")
    .single();

  if (error) {
    console.error("admission-dates update error:", error);
    return NextResponse.json({ error: "Failed to update admission date" }, { status: 500 });
  }

  return NextResponse.json({ admissionDate: data });
}

/**
 * DELETE /api/admin/admission-dates/[id]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("admission_dates").delete().eq("id", id);
  if (error) {
    console.error("admission-dates delete error:", error);
    return NextResponse.json({ error: "Failed to delete admission date" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
