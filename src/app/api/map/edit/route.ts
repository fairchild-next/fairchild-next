import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";

export type MapEditBody = {
  configSlug?: string;
  boundary?: {
    /** When set, must belong to the same `configSlug` map config. When omitted, first zone for that config is updated or a new row is inserted. */
    zoneId?: string;
    geometry_geojson: GeoJSON.Polygon;
  };
  overlay?: {
    id: string;
    bounds_sw_lat: number;
    bounds_sw_lng: number;
    bounds_ne_lat: number;
    bounds_ne_lng: number;
    opacity?: number;
  };
  pois?: Array<{
    id?: string;
    name: string;
    description?: string | null;
    details?: string | null;
    image_url?: string | null;
    lat: number;
    lng: number;
    sort_order: number;
    category?: string | null;
  }>;
};

export async function PATCH(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  try {
    const body = (await req.json()) as MapEditBody;
    const db = staff.supabase;

    if (body.boundary) {
      const boundaryConfigSlug = body.configSlug ?? "default";
      const geom = body.boundary.geometry_geojson;
      if (
        !geom ||
        typeof geom !== "object" ||
        geom.type !== "Polygon" ||
        !Array.isArray(geom.coordinates)
      ) {
        return NextResponse.json({ error: "Invalid boundary geometry" }, { status: 400 });
      }

      const { data: boundaryCfg, error: boundaryCfgErr } = await db
        .from("map_config")
        .select("id")
        .eq("slug", boundaryConfigSlug)
        .single();
      if (boundaryCfgErr || !boundaryCfg) {
        return NextResponse.json({ error: "Map config not found for boundary" }, { status: 404 });
      }

      if (body.boundary.zoneId) {
        const { data: zoneRow, error: zoneLookupErr } = await db
          .from("map_zones")
          .select("id, map_config_id")
          .eq("id", body.boundary.zoneId)
          .single();
        if (zoneLookupErr || !zoneRow || zoneRow.map_config_id !== boundaryCfg.id) {
          return NextResponse.json(
            { error: "Boundary zone does not belong to this map config; reload the editor." },
            { status: 400 }
          );
        }
        const { error } = await db
          .from("map_zones")
          .update({ geometry_geojson: geom })
          .eq("id", body.boundary.zoneId);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      } else {
        const { data: existingZones, error: listErr } = await db
          .from("map_zones")
          .select("id")
          .eq("map_config_id", boundaryCfg.id)
          .limit(1);
        if (listErr) {
          return NextResponse.json({ error: listErr.message }, { status: 400 });
        }
        const firstId = existingZones?.[0]?.id;
        if (firstId) {
          const { error } = await db
            .from("map_zones")
            .update({ geometry_geojson: geom })
            .eq("id", firstId);
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }
        } else {
          const { error } = await db.from("map_zones").insert({
            map_config_id: boundaryCfg.id,
            name: "Garden boundary",
            geometry_geojson: geom,
          });
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }
        }
      }
    }

    if (body.overlay) {
      const { error } = await db
        .from("map_overlays")
        .update({
          bounds_sw_lat: body.overlay.bounds_sw_lat,
          bounds_sw_lng: body.overlay.bounds_sw_lng,
          bounds_ne_lat: body.overlay.bounds_ne_lat,
          bounds_ne_lng: body.overlay.bounds_ne_lng,
          ...(body.overlay.opacity != null && { opacity: body.overlay.opacity }),
        })
        .eq("id", body.overlay.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    if (body.pois != null) {
      const configSlug = body.configSlug ?? "default";
      const { data: config } = await db.from("map_config").select("id").eq("slug", configSlug).single();
      if (!config) {
        return NextResponse.json({ error: "Map config not found" }, { status: 404 });
      }

      await db.from("map_pois").delete().eq("map_config_id", config.id);

      if (body.pois.length > 0) {
        const toInsert = body.pois.map((p, i) => ({
          map_config_id: config.id,
          name: p.name,
          description: p.description ?? null,
          details: p.details ?? null,
          image_url: p.image_url ?? null,
          lat: p.lat,
          lng: p.lng,
          sort_order: p.sort_order ?? i,
          category: p.category ?? "exhibit",
        }));
        const { error } = await db.from("map_pois").insert(toInsert);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
