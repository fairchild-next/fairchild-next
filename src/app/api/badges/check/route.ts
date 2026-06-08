import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkForBadges } from "@/lib/kids/badgeLogic";

/**
 * POST /api/badges/check
 * Runs badge logic for the current user (or a child profile).
 * Body: { child_profile_id?: string }
 * Returns newly earned badges.
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as { child_profile_id?: string };
  const admin = createSupabaseAdminClient();

  // If a child_profile_id is provided, verify ownership before using it.
  let resolvedChildId: string | null = null;
  if (body.child_profile_id) {
    const { data: childProfile } = await admin
      .from("kids_child_profiles")
      .select("id")
      .eq("id", body.child_profile_id)
      .eq("parent_user_id", user.id)
      .maybeSingle();
    if (childProfile) resolvedChildId = childProfile.id;
  }

  const discoveriesQuery = admin
    .from("kids_discoveries")
    .select("quest_item, photo_url, note")
    .eq("user_id", user.id);
  if (resolvedChildId) {
    discoveriesQuery.eq("child_profile_id", resolvedChildId);
  } else {
    discoveriesQuery.is("child_profile_id", null);
  }
  const { data: discoveries } = await discoveriesQuery;

  const badgesQuery = admin
    .from("kids_user_badges")
    .select("badge_id")
    .eq("user_id", user.id);
  if (resolvedChildId) {
    badgesQuery.eq("child_profile_id", resolvedChildId);
  } else {
    badgesQuery.is("child_profile_id", null);
  }
  const { data: existingUserBadges } = await badgesQuery;

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
    ...(resolvedChildId ? { child_profile_id: resolvedChildId } : {}),
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
