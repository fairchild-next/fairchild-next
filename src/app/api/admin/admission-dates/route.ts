import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AdmissionDateRow = {
  id: string;
  date: string;
  capacity: number;
  capacity_remaining: number;
  is_active: boolean;
  created_at: string;
};

/**
 * GET /api/admin/admission-dates
 * List all admission dates (date-only scheduled mode).
 */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("admission_dates")
    .select("id, date, capacity, capacity_remaining, is_active, created_at")
    .order("date", { ascending: true });

  if (error) {
    console.error("admission-dates list error:", error);
    return NextResponse.json({ error: "Failed to load admission dates" }, { status: 500 });
  }

  return NextResponse.json({ dates: data as AdmissionDateRow[] });
}

/**
 * POST /api/admin/admission-dates
 * Body: { date, capacity?, is_active? }
 */
export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as { date?: string; capacity?: number; is_active?: boolean };
  if (!body.date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const capacity = body.capacity ?? 500;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("admission_dates")
    .upsert(
      {
        date: body.date,
        capacity,
        capacity_remaining: capacity,
        is_active: body.is_active ?? true,
      },
      { onConflict: "date" }
    )
    .select("id, date, capacity, capacity_remaining, is_active, created_at")
    .single();

  if (error) {
    console.error("admission-dates insert error:", error);
    return NextResponse.json({ error: "Failed to create admission date" }, { status: 500 });
  }

  return NextResponse.json({ admissionDate: data }, { status: 201 });
}
