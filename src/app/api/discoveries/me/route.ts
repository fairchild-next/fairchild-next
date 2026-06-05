import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

  // Use admin client — user session lacks DELETE policy on kids_user_badges
  const admin = createSupabaseAdminClient();

  // Fetch photo URLs before deleting rows so we can clean up storage too
  const { data: photoRows } = await admin
    .from("kids_discoveries")
    .select("photo_url")
    .eq("user_id", user.id)
    .not("photo_url", "is", null);

  // Delete DB records and badges
  await admin.from("kids_user_badges").delete().eq("user_id", user.id);
  const { error } = await admin.from("kids_discoveries").delete().eq("user_id", user.id);

  if (error) {
    console.error("Discovery reset error:", error);
    return NextResponse.json({ error: "Failed to reset" }, { status: 500 });
  }

  // Delete orphaned photos from storage (best-effort — don't fail the reset if this errors)
  if (photoRows?.length) {
    const BUCKET = "kids-discovery-photos";
    const paths = photoRows
      .map((r) => {
        try {
          // URL format: https://<host>/storage/v1/object/public/<bucket>/<path>
          const url = new URL(r.photo_url!);
          const marker = `/object/public/${BUCKET}/`;
          const idx = url.pathname.indexOf(marker);
          return idx !== -1 ? url.pathname.slice(idx + marker.length) : null;
        } catch {
          return null;
        }
      })
      .filter((p): p is string => p !== null);

    if (paths.length > 0) {
      const { error: storageError } = await admin.storage.from(BUCKET).remove(paths);
      if (storageError) {
        console.error("Storage cleanup error (non-fatal):", storageError);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
