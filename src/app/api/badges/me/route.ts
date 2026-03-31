import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/badges/me
 * Returns all badges (earned + locked) for the current user.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: allBadges } = await supabase
    .from("kids_badges")
    .select("id, badge_key, badge_name, description, icon_url, badge_type")
    .order("sort_order", { ascending: true });

  const { data: userBadges } = await supabase
    .from("kids_user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", user.id);

  const earnedBadgeIds = new Set((userBadges ?? []).map((b) => b.badge_id));
  const earnedAtMap = new Map((userBadges ?? []).map((b) => [b.badge_id, b.earned_at]));

  const badges = (allBadges ?? []).map((b) => ({
    ...b,
    earned: earnedBadgeIds.has(b.id),
    earned_at: earnedAtMap.get(b.id) ?? null,
  }));

  return NextResponse.json({ badges });
}
