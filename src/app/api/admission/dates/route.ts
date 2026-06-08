import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getScheduledAdmissionConfig } from "@/lib/admission/config";

/**
 * GET /api/admission/dates
 * Returns bookable dates for scheduled daily admission.
 * When time slots are enabled, dates come from active time_slots.
 * When disabled, dates come from admission_dates.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const config = await getScheduledAdmissionConfig(supabase);

  if (config.time_slots_enabled) {
    const { data, error } = await supabase
      .from("time_slots")
      .select("date")
      .eq("is_active", true)
      .gt("capacity_remaining", 0)
      .gte("date", new Date().toISOString().split("T")[0]);

    if (error) {
      console.error("admission dates (slots) error:", error);
      return NextResponse.json({ error: "Failed to load dates" }, { status: 500 });
    }

    const dates = [...new Set((data ?? []).map((r: { date: string }) => r.date))].sort();
    return NextResponse.json({ dates, time_slots_enabled: true });
  }

  const { data, error } = await supabase
    .from("admission_dates")
    .select("date")
    .eq("is_active", true)
    .gt("capacity_remaining", 0)
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("admission dates error:", error);
    return NextResponse.json({ error: "Failed to load dates" }, { status: 500 });
  }

  const dates = (data ?? []).map((r: { date: string }) => r.date);
  return NextResponse.json({ dates, time_slots_enabled: false });
}
