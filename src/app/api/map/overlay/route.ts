import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";

/**
 * PATCH /api/map/overlay
 * Save the illustrated map overlay settings (image URL + bounding box).
 * Staff only.
 */
export async function PATCH(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const body = await req.json();
  const { config_slug = "default", image_url, sw_lat, sw_lng, ne_lat, ne_lng } = body;

  if (!image_url || sw_lat == null || sw_lng == null || ne_lat == null || ne_lng == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("map_config")
    .update({
      overlay_image_url: image_url,
      overlay_sw_lat: Number(sw_lat),
      overlay_sw_lng: Number(sw_lng),
      overlay_ne_lat: Number(ne_lat),
      overlay_ne_lng: Number(ne_lng),
    })
    .eq("slug", config_slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
