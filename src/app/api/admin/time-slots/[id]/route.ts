import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/admin/time-slots/[id]
 * Body: { start_time?, end_time?, capacity_remaining?, is_active? }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { id } = await params;
  const body = await req.json() as {
    start_time?: string;
    end_time?: string;
    capacity_remaining?: number;
    is_active?: boolean;
  };

  const updates: Record<string, unknown> = {};
  if (body.start_time !== undefined) updates.start_time = body.start_time;
  if (body.end_time !== undefined) updates.end_time = body.end_time;
  if (body.capacity_remaining !== undefined) updates.capacity_remaining = body.capacity_remaining;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("time_slots")
    .update(updates)
    .eq("id", id)
    .select("id, date, start_time, end_time, capacity_remaining, is_active, created_at")
    .single();

  if (error) {
    console.error("time-slots update error:", error);
    return NextResponse.json({ error: "Failed to update time slot" }, { status: 500 });
  }

  return NextResponse.json({ slot: data });
}

/**
 * DELETE /api/admin/time-slots/[id]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("time_slots").delete().eq("id", id);
  if (error) {
    console.error("time-slots delete error:", error);
    return NextResponse.json({ error: "Failed to delete time slot" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
