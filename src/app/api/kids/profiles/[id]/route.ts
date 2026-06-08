import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * DELETE /api/kids/profiles/[id]
 * Removes a child profile. Cascades to their discoveries and earned badges.
 * Verifies the profile belongs to the authenticated parent before deleting.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();

  // Verify ownership before deleting
  const { data: profile } = await admin
    .from("kids_child_profiles")
    .select("id")
    .eq("id", id)
    .eq("parent_user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await admin
    .from("kids_child_profiles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("kids profile delete error:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
