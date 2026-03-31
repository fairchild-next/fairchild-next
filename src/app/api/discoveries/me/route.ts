import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/discoveries/me
 * Returns current user's Garden Quest discoveries.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ discoveries: [], foundIds: [] });
  }

  const { data } = await supabase
    .from("kids_discoveries")
    .select("id, quest_item, photo_url, note, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const discoveries = data ?? [];
  const foundIds = [...new Set(discoveries.map((d) => d.quest_item))];

  return NextResponse.json({
    discoveries: discoveries.map((d) => ({
      questId: d.quest_item,
      type: d.photo_url ? "photo" : "description",
      content: d.photo_url ?? d.note ?? "",
      createdAt: d.created_at,
      questImage: null,
    })),
    foundIds,
  });
}

/**
 * DELETE /api/discoveries/me
 * Reset all discoveries and badges for the current user (for testing).
 */
export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await supabase.from("kids_user_badges").delete().eq("user_id", user.id);
  const { error } = await supabase.from("kids_discoveries").delete().eq("user_id", user.id);

  if (error) {
    console.error("Discovery reset error:", error);
    return NextResponse.json({ error: "Failed to reset" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
