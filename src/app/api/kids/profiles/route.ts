import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ALLOWED_EMOJIS = ["🌿", "🦋", "🌸", "🌺", "🐝", "🐢", "🦎", "🌱", "🍃", "🌻"];
const MAX_CHILDREN = 8;

/**
 * GET /api/kids/profiles
 * Returns all child profiles for the authenticated parent.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("kids_child_profiles")
    .select("id, name, avatar_emoji, created_at")
    .eq("parent_user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("kids profiles fetch error:", error);
    return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 });
  }

  return NextResponse.json({ profiles: data ?? [] });
}

/**
 * POST /api/kids/profiles
 * Create a new child profile. Body: { name, avatar_emoji }
 */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { name?: string; avatar_emoji?: string };
  const name = (body.name ?? "").trim().slice(0, 40);
  const avatar_emoji = ALLOWED_EMOJIS.includes(body.avatar_emoji ?? "")
    ? body.avatar_emoji
    : "🌿";

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const admin = createSupabaseAdminClient();

  // Enforce per-family cap
  const { count } = await admin
    .from("kids_child_profiles")
    .select("id", { count: "exact", head: true })
    .eq("parent_user_id", user.id);

  if ((count ?? 0) >= MAX_CHILDREN) {
    return NextResponse.json({ error: `Maximum of ${MAX_CHILDREN} profiles allowed` }, { status: 422 });
  }

  const { data, error } = await admin
    .from("kids_child_profiles")
    .insert({ parent_user_id: user.id, name, avatar_emoji })
    .select("id, name, avatar_emoji, created_at")
    .single();

  if (error) {
    console.error("kids profile create error:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }

  return NextResponse.json({ profile: data }, { status: 201 });
}
