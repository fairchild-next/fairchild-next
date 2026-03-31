/**
 * Map configs in Supabase `map_config.slug`. Staff editor and public map UIs stay in sync via these slugs.
 */
export const MAP_CONFIG_OPTIONS = [
  { slug: "default", label: "Main map (guest & member)" },
  { slug: "kids", label: "Kids mode" },
  { slug: "wedding", label: "Wedding mode" },
  { slug: "events", label: "Events mode" },
] as const;

export type MapConfigSlug = (typeof MAP_CONFIG_OPTIONS)[number]["slug"];

export function isMapConfigSlug(value: string): value is MapConfigSlug {
  return MAP_CONFIG_OPTIONS.some((o) => o.slug === value);
}

/** Allowed "back to map" paths from POI detail (open-redirect safe). */
const MAP_RETURN_PATHS = new Set<string>(["/map", "/events/map", "/wedding/map"]);

export function sanitizeMapReturnPath(raw: string | undefined | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const path = raw.split("?")[0]?.trim() ?? "";
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (!MAP_RETURN_PATHS.has(path)) return null;
  return path;
}

/** Public route to preview a config from the staff editor (opens in new tab). */
export function mapConfigPreviewPath(slug: MapConfigSlug): string {
  switch (slug) {
    case "default":
      return "/map";
    case "kids":
      return "/map?config=kids";
    case "wedding":
      return "/wedding/map";
    case "events":
      return "/events/map";
  }
}
