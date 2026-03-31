import L from "leaflet";

/** Icon config: emoji or SVG path for custom icons. */
const ICON_CONFIG: Record<string, { content: string; color: string; svgPath?: string }> = {
  restroom: {
    color: "#2563eb",
    content: "🚻",
  },
  tram: { content: "🚃", color: "#dc2626" },
  cafe: { content: "☕", color: "#ea580c" },
  exhibit: {
    color: "#166534",
    content: "🌿",
  },
  artwork: { content: "🗿", color: "#7c3aed" },
  entrance: { content: "🚪", color: "#16a34a" },
  shop: { content: "🛍️", color: "#0d9488" },
  info: {
    color: "#dc2626",
    content: "",
    svgPath: "M11 5h2v2h-2V5zm0 4h2v10h-2V9z",
  },
};

const DEFAULT = { content: "📍", color: "#2563eb" };

function renderSvg(path: string, size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="white"><path d="${path}"/></svg>`;
}

export function getPinIcon(category: string | null, size = 18): L.DivIcon {
  const cfg = ICON_CONFIG[category ?? "exhibit"] ?? DEFAULT;
  const innerSize = Math.max(10, size - 6);
  const emojiSize = Math.max(10, Math.floor(innerSize * 0.9));
  const inner = cfg.svgPath
    ? renderSvg(cfg.svgPath, innerSize)
    : `<span style="font-size:${emojiSize}px;line-height:1;display:flex;align-items:center;justify-content:center">${cfg.content}</span>`;
  return L.divIcon({
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${cfg.color};
        border:1.5px solid white;
        border-radius:50%;
        box-shadow:0 1px 3px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        overflow:hidden;
      ">${inner}</div>
    `,
    className: "!border-0 !bg-transparent",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export const CATEGORY_OPTIONS = [
  { id: "exhibit", label: "Exhibit (whole area)" },
  { id: "artwork", label: "Artwork (single piece)" },
  { id: "entrance", label: "Entrance" },
  { id: "restroom", label: "Restroom" },
  { id: "cafe", label: "Café" },
  { id: "shop", label: "Shop" },
  { id: "info", label: "Info" },
  { id: "tram", label: "Tram" },
] as const;
