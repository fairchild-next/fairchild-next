import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/map/poi/[id]
 * Returns a single POI by id for the detail page.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("map_pois")
    .select("id, name, description, details, image_url, lat, lng, category")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "POI not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
