import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/map?config=default&layer=default
 * Returns map config, active layers, POIs, overlays, and routes.
 * For future: ?event=mango-festival to include festival layer.
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const configSlug = searchParams.get("config") ?? "default";
  const layerSlug = searchParams.get("layer") ?? "default";

  const { data: config, error: configErr } = await supabase
    .from("map_config")
    .select("id, name, center_lat, center_lng, default_zoom")
    .eq("slug", configSlug)
    .single();

  if (configErr || !config) {
    return NextResponse.json({ error: "Map config not found" }, { status: 404 });
  }

  const { data: layers } = await supabase
    .from("map_layers")
    .select("id, slug, name, sort_order, is_default, layer_type, event_id")
    .eq("map_config_id", config.id)
    .order("sort_order", { ascending: true });

  const { data: pois } = await supabase
    .from("map_pois")
    .select("id, name, description, lat, lng, sort_order, layer_id, category, image_url, details")
    .eq("map_config_id", config.id)
    .order("sort_order", { ascending: true });

  const { data: zones } = await supabase
    .from("map_zones")
    .select("id, name, geometry_geojson")
    .eq("map_config_id", config.id);

  const layerIds = (layers ?? []).map((l: { id: string }) => l.id);
  let routes: unknown[] = [];
  if (layerIds.length > 0) {
    const { data: rt } = await supabase
      .from("map_routes")
      .select("id, layer_id, name, path_geojson, color, weight")
      .in("layer_id", layerIds);
    routes = rt ?? [];
  }

  return NextResponse.json(
    {
      config: {
        name: config.name,
        center: [Number(config.center_lat), Number(config.center_lng)],
        zoom: config.default_zoom,
      },
      layers: layers ?? [],
      pois: pois ?? [],
      zones: zones ?? [],
      routes: routes,
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
