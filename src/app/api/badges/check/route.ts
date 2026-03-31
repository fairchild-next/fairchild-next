import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkForBadges } from "@/lib/kids/badgeLogic";

/**
 * POST /api/badges/check
 * Runs badge logic for the current user. Returns newly earned badges.
 * Call after saving a discovery.
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: discoveries } = await supabase
    .from("kids_discoveries")
    .select("quest_item, photo_url, note")
    .eq("user_id", user.id);

  const { data: existingUserBadges } = await supabase
    .from("kids_user_badges")
    .select("badge_id")
    .eq("user_id", user.id);

  const badgeIds = (existingUserBadges ?? []).map((b) => b.badge_id);
  const { data: existingBadgeRows } =
    badgeIds.length > 0
      ? await supabase.from("kids_badges").select("badge_key").in("id", badgeIds)
      : { data: [] };

  const earnedKeys = checkForBadges(discoveries ?? []);
  const existingKeys = new Set((existingBadgeRows ?? []).map((b) => b.badge_key));

  const newlyEarned: string[] = [];
  for (const key of earnedKeys) {
    if (!existingKeys.has(key)) {
      newlyEarned.push(key);
    }
  }

  if (newlyEarned.length === 0) {
    return NextResponse.json({ newlyEarned: [], badges: [] });
  }

  const { data: badgeRows } = await supabase
    .from("kids_badges")
    .select("id, badge_key, badge_name, description, icon_url")
    .in("badge_key", newlyEarned);

  const toInsert = (badgeRows ?? []).map((b) => ({
    user_id: user.id,
    badge_id: b.id,
  }));

  const { error } = await supabase.from("kids_user_badges").insert(toInsert);

  if (error) {
    console.error("Badge insert error:", error);
    return NextResponse.json({ error: "Failed to award badges" }, { status: 500 });
  }

  return NextResponse.json({
    newlyEarned,
    badges: badgeRows ?? [],
  });
}
