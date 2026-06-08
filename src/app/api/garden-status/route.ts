import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/garden-status
 * Returns today's garden_status row (staff use only).
 */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const today = new Date().toISOString().slice(0, 10);
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("garden_status")
    .select("date, is_closed, closure_reason, special_hours, updated_at")
    .eq("date", today)
    .maybeSingle();

  return NextResponse.json({ status: data ?? { date: today, is_closed: false, closure_reason: null, special_hours: null } });
}

/**
 * POST /api/garden-status
 * Upsert today's garden_status. Body: { is_closed, closure_reason?, special_hours? }
 */
export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as {
    is_closed: boolean;
    closure_reason?: string | null;
    special_hours?: string | null;
  };

  const today = new Date().toISOString().slice(0, 10);
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("garden_status")
    .upsert(
      {
        date: today,
        is_closed: body.is_closed,
        closure_reason: body.closure_reason?.trim() || null,
        special_hours: body.special_hours?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "date" }
    )
    .select()
    .single();

  if (error) {
    console.error("garden_status upsert error:", error);
    return NextResponse.json({ error: "Failed to update garden status" }, { status: 500 });
  }

  return NextResponse.json({ status: data });
}
