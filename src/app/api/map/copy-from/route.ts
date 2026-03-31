import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireStaff } from "@/lib/staff";
import { isMapConfigSlug, type MapConfigSlug } from "@/lib/mapConfigs";

type Body = {
  /** Source `map_config.slug`; defaults to `default` (main map). */
  fromSlug?: string;
  /** Target `map_config.slug` (e.g. kids, wedding, events). */
  toSlug: string;
};

const SLUG_RANK: MapConfigSlug[] = ["default", "kids", "wedding", "events"];

function slugRank(slug: string): number {
  const i = SLUG_RANK.indexOf(slug as MapConfigSlug);
  return i === -1 ? 999 : i;
}

async function countPoisForConfig(db: SupabaseClient, mapConfigId: string): Promise<number> {
  const { count, error } = await db
    .from("map_pois")
    .select("id", { count: "exact", head: true })
    .eq("map_config_id", mapConfigId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

type ConfigRow = { id: string; slug: string };

type ResolveResult =
  | { ok: true; source: ConfigRow; usedFallback: boolean }
  | { ok: false; message: string; status: number };

/**
 * Prefer `preferredSlug` when it has POIs. If that slug is `default` and is empty, use the
 * non-target config with the most POIs (some DBs had pins only under another slug).
 */
async function resolveCopySource(
  db: SupabaseClient,
  preferredSlug: string,
  toConfigId: string
): Promise<ResolveResult> {
  const { data: preferred, error: prefErr } = await db
    .from("map_config")
    .select("id, slug")
    .eq("slug", preferredSlug)
    .single();

  if (prefErr || !preferred) {
    return {
      ok: false,
      message: `Map config “${preferredSlug}” was not found in the database.`,
      status: 404,
    };
  }

  const preferredCount = await countPoisForConfig(db, preferred.id);
  if (preferredCount > 0) {
    return { ok: true, source: preferred as ConfigRow, usedFallback: false };
  }

  if (preferredSlug !== "default") {
    return {
      ok: false,
      message: `The map “${preferredSlug}” has no pins to copy. Add pins there first or use the main map.`,
      status: 400,
    };
  }

  const { data: allConfigs, error: allErr } = await db.from("map_config").select("id, slug");
  if (allErr || !allConfigs?.length) {
    return { ok: false, message: "Could not list map configs.", status: 500 };
  }

  let best: ConfigRow | null = null;
  let bestCount = -1;

  for (const row of allConfigs as ConfigRow[]) {
    if (row.id === toConfigId) continue;
    const n = await countPoisForConfig(db, row.id);
    if (n === 0) continue;
    if (n > bestCount || (n === bestCount && best && slugRank(row.slug) < slugRank(best.slug))) {
      best = row;
      bestCount = n;
    }
  }

  if (!best) {
    return {
      ok: false,
      message:
        'No pins exist on the main map (slug “default”) and no other map has pins. Open “Main map (guest & member)” in the editor, confirm pins are listed, Save, then try “Copy from main” again.',
      status: 400,
    };
  }

  return { ok: true, source: best, usedFallback: true };
}

/**
 * POST /api/map/copy-from
 * Replaces all POIs on the target config with a copy of the source config’s POIs.
 */
export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fromSlug = body.fromSlug ?? "default";
  const toSlug = body.toSlug;

  if (!isMapConfigSlug(fromSlug) || !isMapConfigSlug(toSlug)) {
    return NextResponse.json({ error: "Invalid map config slug" }, { status: 400 });
  }
  if (fromSlug === toSlug) {
    return NextResponse.json({ error: "Source and target must differ" }, { status: 400 });
  }

  const db = staff.supabase;

  const { data: toConfig, error: toErr } = await db
    .from("map_config")
    .select("id, slug")
    .eq("slug", toSlug)
    .single();

  if (toErr || !toConfig) {
    return NextResponse.json(
      { error: "Target map config not found. Run migrations so kids / wedding / events configs exist." },
      { status: 404 }
    );
  }

  const resolved = await resolveCopySource(db, fromSlug, toConfig.id);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.message, copied: 0 }, { status: resolved.status });
  }

  const { source: fromConfig, usedFallback } = resolved;

  const { data: sourcePois, error: poisErr } = await db
    .from("map_pois")
    .select("name, description, details, image_url, lat, lng, sort_order, category")
    .eq("map_config_id", fromConfig.id)
    .order("sort_order", { ascending: true });

  if (poisErr) {
    return NextResponse.json({ error: poisErr.message }, { status: 400 });
  }

  const { error: delErr } = await db.from("map_pois").delete().eq("map_config_id", toConfig.id);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 400 });
  }

  const list = sourcePois ?? [];
  const chunkSize = 80;

  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize);
    const toInsert = chunk.map((p, j) => ({
      map_config_id: toConfig.id,
      name: p.name,
      description: p.description ?? null,
      details: p.details ?? null,
      image_url: p.image_url ?? null,
      lat: Number(p.lat),
      lng: Number(p.lng),
      sort_order: p.sort_order ?? i + j,
      category: p.category ?? "exhibit",
    }));

    const { error: insErr } = await db.from("map_pois").insert(toInsert);
    if (insErr) {
      return NextResponse.json(
        {
          error: insErr.message,
          copied: 0,
          hint: "If this mentions a missing column, run migrations so map_pois has details, image_url, and category.",
        },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    copied: list.length,
    sourceSlug: fromConfig.slug,
    usedFallbackFromRichestMap: usedFallback,
  });
}
