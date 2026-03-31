/**
 * Resolve image URL for display.
 * - Paths starting with / (e.g. /events/xxx.png, /stock/xxx.png) are used as-is (same origin, cacheable).
 * - Full http(s) URLs are used as-is (external).
 * - Other paths get NEXT_PUBLIC_BASE_URL prepended (legacy).
 */
export function resolveImageUrl(
  url: string | null,
  defaultUrl: string = "/stock/garden-1.png"
): string {
  if (!url) return defaultUrl;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  return base + url;
}
