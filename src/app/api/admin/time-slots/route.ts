import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type TimeSlotRow = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity_remaining: number;
  is_active: boolean;
  created_at: string;
};

/**
 * GET /api/admin/time-slots?date=YYYY-MM-DD
 * List time slots, optionally filtered by date.
 */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("time_slots")
    .select("id, date, start_time, end_time, capacity_remaining, is_active, created_at")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (date) query = query.eq("date", date);

  const { data, error } = await query;
  if (error) {
    console.error("time-slots list error:", error);
    return NextResponse.json({ error: "Failed to load time slots" }, { status: 500 });
  }

  return NextResponse.json({ slots: data as TimeSlotRow[] });
}

/**
 * POST /api/admin/time-slots
 * Body: { date, start_time, end_time, capacity_remaining?, is_active? }
 */
export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as {
    date?: string;
    start_time?: string;
    end_time?: string;
    capacity_remaining?: number;
    is_active?: boolean;
  };

  if (!body.date || !body.start_time || !body.end_time) {
    return NextResponse.json({ error: "date, start_time, and end_time are required" }, { status: 400 });
  }

  const capacity = body.capacity_remaining ?? 100;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("time_slots")
    .insert({
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      capacity_remaining: capacity,
      is_active: body.is_active ?? true,
    })
    .select("id, date, start_time, end_time, capacity_remaining, is_active, created_at")
    .single();

  if (error) {
    console.error("time-slots insert error:", error);
    return NextResponse.json({ error: "Failed to create time slot" }, { status: 500 });
  }

  return NextResponse.json({ slot: data }, { status: 201 });
}
