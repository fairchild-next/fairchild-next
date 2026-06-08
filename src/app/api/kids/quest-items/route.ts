import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/kids/quest-items
 * Public — returns active quest items ordered by sort_order.
 * Used by the Garden Quest page to drive the scavenger hunt list from DB.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("garden_quest_items")
    .select("id, name, hint, image_url, quest_type, zone, name_color, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("quest items fetch error:", error);
    return NextResponse.json({ items: [] });
  }

  return NextResponse.json({ items: data ?? [] });
}
