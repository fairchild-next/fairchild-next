import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns featured/recommended events for the homepage.
 * Structured for future extensibility:
 * - Popular: order by ticket sales
 * - For you: when signed in, recommend based on past purchases (e.g. yoga if they've bought yoga)
 * For now: returns active events ordered by sort_order. Default limit=1 for "Don't Miss This" preview.
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "1", 10), 10);

  // Optional: pass user context for personalized recs later
  const { data: { user } } = await supabase.auth.getUser();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, name, slug, description, start_date, end_date, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Featured events error:", error);
    return NextResponse.json({ events: [] });
  }

  // TODO: When ready for personalization, merge with user-based recommendations:
  // - Query past orders/visits for this user
  // - Score events by category match (e.g. "yoga" if they bought yoga before)
  // - Interleave or replace with personalized list

  return NextResponse.json({ events: events ?? [] });
}
