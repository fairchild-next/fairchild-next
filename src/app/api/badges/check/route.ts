import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkForBadges } from "@/lib/kids/badgeLogic";

/**
 * POST /api/badges/check
 * Runs badge logic for the current user. Returns newly earned badges.
 * Call after saving a discovery, or on badges tab load for retroactive awards.
 * Uses admin client for DB ops to avoid session/RLS edge cases.
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const { data: discoveries } = await admin
    .from("kids_discoveries")
    .select("quest_item, photo_url, note")
    .eq("user_id", user.id);

  const { data: existingUserBadges } = await admin
    .from("kids_user_badges")
    .select("badge_id")
    .eq("user_id", user.id);

  const badgeIds = (existingUserBadges ?? []).map((b: { badge_id: string }) => b.badge_id);
  const { data: existingBadgeRows } =
    badgeIds.length > 0
      ? await admin.from("kids_badges").select("badge_key").in("id", badgeIds)
      : { data: [] };

  const earnedKeys = checkForBadges(discoveries ?? []);
  const existingKeys = new Set((existingBadgeRows ?? []).map((b: { badge_key: string }) => b.badge_key));

  const newlyEarned: string[] = [];
  for (const key of earnedKeys) {
    if (!existingKeys.has(key)) {
      newlyEarned.push(key);
    }
  }

  if (newlyEarned.length === 0) {
    return NextResponse.json({ newlyEarned: [], badges: [] });
  }

  const { data: badgeRows } = await admin
    .from("kids_badges")
    .select("id, badge_key, badge_name, description, icon_url")
    .in("badge_key", newlyEarned);

  const toInsert = (badgeRows ?? []).map((b: { id: string }) => ({
    user_id: user.id,
    badge_id: b.id,
  }));

  const { error } = await admin.from("kids_user_badges").insert(toInsert);

  if (error) {
    console.error("Badge insert error:", error);
    return NextResponse.json({ error: "Failed to award badges" }, { status: 500 });
  }

  return NextResponse.json({
    newlyEarned,
    badges: badgeRows ?? [],
  });
}
