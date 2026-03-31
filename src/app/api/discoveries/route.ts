import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkForBadges } from "@/lib/kids/badgeLogic";

/**
 * POST /api/discoveries
 * Save a Garden Quest discovery. Body: { quest_item, type: "photo"|"description", content }
 * For photo: content is base64 data URL. We upload to storage and store URL.
 * For description: content is text, stored in note.
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { quest_item, type, content } = body as {
    quest_item: string;
    type: "photo" | "description";
    content: string;
  };

  if (!quest_item || !type || content == null) {
    return NextResponse.json({ error: "Missing quest_item, type, or content" }, { status: 400 });
  }

  let photo_url: string | null = null;
  let note: string | null = null;

  if (type === "photo") {
    // Upload base64 to storage
    const base64Data = content.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const ext = content.match(/image\/(\w+)/)?.[1] ?? "png";
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("kids-discovery-photos")
      .upload(fileName, buffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Discovery photo upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload photo" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("kids-discovery-photos")
      .getPublicUrl(uploadData.path);
    photo_url = urlData.publicUrl;
  } else {
    note = content;
  }

  const { data: discovery, error } = await supabase
    .from("kids_discoveries")
    .insert({
      user_id: user.id,
      quest_item,
      photo_url,
      note,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Discovery insert error:", error);
    return NextResponse.json({ error: "Failed to save discovery" }, { status: 500 });
  }

  // Run badge check immediately after save (same request = no race)
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

  let badges: { badge_key: string; badge_name: string; description: string; icon_url: string | null }[] = [];
  if (newlyEarned.length > 0) {
    const { data: fullBadgeRows, error: badgeFetchError } = await supabase
      .from("kids_badges")
      .select("id, badge_key, badge_name, description, icon_url")
      .in("badge_key", newlyEarned);

    if (badgeFetchError) {
      console.error("Badge fetch error:", badgeFetchError);
    } else if (!fullBadgeRows?.length) {
      console.error("Badge check: earned keys", newlyEarned, "but kids_badges returned no rows. Run the badge migration.");
    }
    if (fullBadgeRows?.length) {
      const insertPayload = fullBadgeRows.map((b) => ({
        user_id: user.id,
        badge_id: b.id,
      }));
      await supabase.from("kids_user_badges").insert(insertPayload);
      badges = fullBadgeRows.map((b) => ({
        badge_key: b.badge_key,
        badge_name: b.badge_name,
        description: b.description,
        icon_url: b.icon_url,
      }));
    }
  }

  return NextResponse.json({
    discovery: { id: discovery.id, quest_item, photo_url, note },
    badges,
  });
}
