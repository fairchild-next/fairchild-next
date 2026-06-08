import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** GET /api/admin/badges — full badge catalog for staff editor */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("kids_badges")
    .select("id, badge_key, badge_name, description, icon_url, badge_type, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("admin badges list error:", error);
    return NextResponse.json({ error: "Failed to load badges" }, { status: 500 });
  }

  return NextResponse.json({ badges: data ?? [] });
}
