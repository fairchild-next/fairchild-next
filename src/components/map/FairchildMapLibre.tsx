"use client";

// MapLibre GL CSS — safe here because this component is always loaded via
// dynamic(() => import(...), { ssr: false }) so it never runs on the server.
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

// ---------------------------------------------------------------------------
// Types — identical to GardenMapLeaflet so the same /api/map endpoint works
// ---------------------------------------------------------------------------
type Poi = {
  id: string;
  name: string;
  description: string | null;
  details: string | null;
  image_url: string | null;
  lat: number;
  lng: number;
  category: string | null;
};

type Zone = {
  id: string;
  geometry_geojson: GeoJSON.Polygon;
};

type MapData = {
  config: { name: string; center: [number, number]; zoom: number };
  pois: Poi[];
  zones: Zone[];
};

// Lazy maplibre types — imported only for TypeScript, bundle stays clean
type MapLibreMap = import("maplibre-gl").Map;
type MapLibreMarker = import("maplibre-gl").Marker;

// ---------------------------------------------------------------------------
// Constants — centre in MapLibre order [lng, lat]
// ---------------------------------------------------------------------------
const FAIRCHILD_LNGLAT: [number, number] = [-80.273, 25.677];
const DEFAULT_ZOOM = 16;
const DEFAULT_IMAGE = "/stock/garden-1.png";

// Same category list as GardenMapLeaflet
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "exhibit", label: "Exhibits" },
  { id: "artwork", label: "Artwork" },
  { id: "restroom", label: "Restrooms" },
  { id: "cafe", label: "Cafés" },
  { id: "entrance", label: "Entrances" },
  { id: "shop", label: "Shops" },
  { id: "info", label: "Info" },
  { id: "tram", label: "Tram" },
] as const;

// Mirrors the colour + emoji config from lib/map-icons.ts
const CATEGORY_COLORS: Record<string, string> = {
  restroom: "#2563eb",
  tram: "#dc2626",
  cafe: "#ea580c",
  exhibit: "#166534",
  artwork: "#7c3aed",
  entrance: "#16a34a",
  shop: "#0d9488",
  info: "#dc2626",
};

const CATEGORY_ICONS: Record<string, string> = {
  restroom: "🚻",
  tram: "🚃",
  cafe: "☕",
  exhibit: "🌿",
  artwork: "🗿",
  entrance: "🚪",
  shop: "🛍️",
  info: "ℹ️",
};

const CATEGORY_LABELS: Record<string, string> = {
  restroom: "Restroom",
  tram: "Tram",
  cafe: "Café",
  exhibit: "Exhibit",
  artwork: "Artwork",
  entrance: "Entrance",
  shop: "Shop",
  info: "Info",
};

// ---------------------------------------------------------------------------
// Helper — create a styled HTMLElement for a MapLibre Marker
// Mirrors getPinIcon() from lib/map-icons.ts without the Leaflet dependency
// ---------------------------------------------------------------------------
function createPinElement(category: string | null): HTMLElement {
  const cat = category ?? "exhibit";
  const color = CATEGORY_COLORS[cat] ?? "#166534";
  const icon = CATEGORY_ICONS[cat] ?? "📍";

  const el = document.createElement("div");
  el.style.cssText = [
    "width:34px",
    "height:34px",
    `background:${color}`,
    "border:2.5px solid white",
    "border-radius:50%",
    "box-shadow:0 2px 8px rgba(0,0,0,0.30)",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "cursor:pointer",
    "transition:transform 0.15s",
  ].join(";");

  const span = document.createElement("span");
  span.style.cssText = "font-size:15px;line-height:1;pointer-events:none";
  span.textContent = icon;
  el.appendChild(span);
  return el;
}

// ---------------------------------------------------------------------------
// Helper — build the MapLibre style
// Priority: NEXT_PUBLIC_MAPTILER_KEY → CartoCDN raster fallback
//
// Once you have a MapTiler / Mapbox key set as NEXT_PUBLIC_MAPTILER_KEY,
// swap the fallback for a vector style and the map will immediately look
// like a premium illustrated garden map.
// ---------------------------------------------------------------------------
type RasterStyle = {
  version: 8;
  sources: Record<string, { type: "raster"; tiles: string[]; tileSize: number; attribution: string; maxzoom: number }>;
  layers: Array<{ id: string; type: "raster"; source: string }>;
  glyphs: string;
};

function buildMapStyle(): string | RasterStyle {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (maptilerKey) {
    return `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${maptilerKey}`;
  }

  // Fallback: CartoCDN Voyager raster (same tile provider as current Leaflet map)
  // Replace this with a vector style URL once a MapTiler/Mapbox key is available.
  return {
    version: 8,
    sources: {
      "carto-voyager": {
        type: "raster",
        tiles: [
          "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
          "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
          "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        ],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors © CARTO",
        maxzoom: 19,
      },
    },
    layers: [{ id: "carto-raster", type: "raster", source: "carto-voyager" }],
    // Glyphs are required for label layers even when using raster tiles
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  };
}

// ---------------------------------------------------------------------------
// Helper — add Fairchild boundary zone layers to a loaded MapLibre map
// Source data shape mirrors the GeoJSON already stored in Supabase
// ---------------------------------------------------------------------------
function addZoneLayers(map: MapLibreMap, zones: Zone[]) {
  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: zones.map((z) => ({
      type: "Feature" as const,
      properties: {},
      geometry: z.geometry_geojson,
    })),
  };

  // Upsert source (avoids "source already exists" error on hot-reload)
  if (!map.getSource("fairchild-zones")) {
    map.addSource("fairchild-zones", { type: "geojson", data: geojson });
  } else {
    (map.getSource("fairchild-zones") as import("maplibre-gl").GeoJSONSource).setData(geojson);
  }

  if (!map.getLayer("fairchild-zones-fill")) {
    map.addLayer({
      id: "fairchild-zones-fill",
      type: "fill",
      source: "fairchild-zones",
      paint: { "fill-color": "#22c55e", "fill-opacity": 0.18 },
    });
  }

  if (!map.getLayer("fairchild-zones-outline")) {
    map.addLayer({
      id: "fairchild-zones-outline",
      type: "line",
      source: "fairchild-zones",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#15803d", "line-width": 2.5, "line-opacity": 0.85 },
    });
  }
}

// ---------------------------------------------------------------------------
// TODO: Illustrated overlay — enable once /public/maps/fairchild-map.png exists
//
// Call addIllustratedOverlay(map) after map.on('load', ...).
// Update the four corner coordinates to exactly match the garden boundary.
//
// function addIllustratedOverlay(map: MapLibreMap) {
//   if (!map.getSource("fairchild-illustrated-overlay")) {
//     map.addSource("fairchild-illustrated-overlay", {
//       type: "image",
//       url: "/maps/fairchild-illustrated-map.png",
//       coordinates: [
//         // NW corner         NE corner
//         [-80.2775, 25.6805], [-80.2685, 25.6805],
//         // SE corner         SW corner
//         [-80.2685, 25.6735], [-80.2775, 25.6735],
//       ],
//     });
//   }
//   if (!map.getLayer("fairchild-illustrated-overlay")) {
//     map.addLayer({
//       id: "fairchild-illustrated-overlay",
//       type: "raster",
//       source: "fairchild-illustrated-overlay",
//       paint: { "raster-opacity": 1.0 },
//     });
//   }
// }
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helper — derive "/map/:id" href, same logic as the existing component
// ---------------------------------------------------------------------------
function poiDetailHref(poiId: string, listReturnPath: string): string {
  if (listReturnPath === "/map") return `/map/${poiId}`;
  return `/map/${poiId}?returnTo=${encodeURIComponent(listReturnPath)}`;
}

// ---------------------------------------------------------------------------
// POI Bottom Sheet — slides up when a pin is tapped
// ---------------------------------------------------------------------------
type BottomSheetProps = {
  poi: Poi;
  onClose: () => void;
  onDirections: () => void;
  poiListReturnPath: string;
};

function PoiBottomSheet({ poi, onClose, onDirections, poiListReturnPath }: BottomSheetProps) {
  const imgSrc = resolveImageUrl(poi.image_url, DEFAULT_IMAGE);
  const cat = poi.category ?? "exhibit";
  const catLabel = CATEGORY_LABELS[cat] ?? cat;
  const catColor = CATEGORY_COLORS[cat] ?? "#166534";
  const description = poi.description ?? poi.details ?? "";
  const previewDesc = description.length > 180
    ? description.slice(0, 180).trim() + "…"
    : description;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[500] rounded-t-3xl shadow-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
    >
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-[var(--surface-border)]" />
      </div>

      <div className="px-5 pb-2">
        {/* Image + meta */}
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            {/* Category badge */}
            <span
              className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2"
              style={{ background: `${catColor}20`, color: catColor }}
            >
              {catLabel}
            </span>
            <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{poi.name}</h3>
            {previewDesc && (
              <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed line-clamp-3">
                {previewDesc}
              </p>
            )}
          </div>
          <div className="w-[90px] h-[90px] shrink-0 rounded-2xl overflow-hidden bg-[var(--background)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
              }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4 pb-safe">
          <button
            type="button"
            onClick={onDirections}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition active:opacity-80"
            style={{ background: "var(--primary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Directions
          </button>

          <Link
            href={poiDetailHref(poi.id, poiListReturnPath)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition active:opacity-80"
            style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
          >
            More Info
          </Link>
        </div>

        {/* Save + Audio Tour — placeholder for future features */}
        <div className="flex gap-3 mt-2 mb-2">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] transition active:opacity-70"
            style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Save
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] transition active:opacity-70"
            style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            Audio Tour
          </button>
        </div>
      </div>

      {/* Close button — top-right corner */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition active:opacity-70"
        style={{ background: "var(--background)", color: "var(--text-muted)" }}
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Directions panel — in-app; no Google Maps link
// Currently shows a "coming soon" state. Once Valhalla / pre-computed GeoJSON
// paths are available, replace the placeholder with actual route rendering.
// ---------------------------------------------------------------------------
function DirectionsPanel({ poi, onClose }: { poi: Poi; onClose: () => void }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[600] rounded-t-3xl shadow-2xl px-5 pt-4 pb-safe"
      style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
    >
      <div className="flex justify-center mb-3">
        <div className="w-10 h-1 rounded-full bg-[var(--surface-border)]" />
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">Directions</h3>
          <p className="text-sm text-[var(--text-muted)]">To: {poi.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "var(--background)", color: "var(--text-muted)" }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Route options row */}
      <div className="flex gap-2 mb-4">
        {[
          { label: "Walk", icon: "🚶", active: true },
          { label: "Drive", icon: "🚗", active: false },
          { label: "Accessible", icon: "♿", active: false },
        ].map(({ label, icon, active }) => (
          <button
            key={label}
            type="button"
            className="flex-1 flex flex-col items-center py-2.5 rounded-xl text-xs font-medium transition"
            style={
              active
                ? { background: "var(--primary)", color: "white" }
                : { background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-muted)" }
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Coming-soon state */}
      <div
        className="rounded-2xl p-4 mb-4 text-center"
        style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
      >
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
          In-app navigation coming soon
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Step-by-step walking directions within the garden will be available in a future update.
        </p>
      </div>

      {/* Fallback — open Apple/Google Maps */}
      <a
        href={`https://maps.apple.com/?daddr=${poi.lat},${poi.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full py-3 rounded-2xl text-sm font-semibold mb-4 transition active:opacity-80"
        style={{ background: "var(--primary)", color: "white" }}
      >
        Open in Maps App
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props — same interface as GardenMapLeaflet so it can be a drop-in later
// ---------------------------------------------------------------------------
type FairchildMapLibreProps = {
  configSlug?: string;
  poiListReturnPath?: string;
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function FairchildMapLibre({
  configSlug = "default",
  poiListReturnPath = "/map",
}: FairchildMapLibreProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  // Track whether the map style has fully loaded so we can add layers safely
  const styleLoadedRef = useRef(false);

  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  // -----------------------------------------------------------------------
  // Fetch map data — same endpoint as GardenMapLeaflet
  // -----------------------------------------------------------------------
  const load = useCallback(async () => {
    const res = await fetch(`/api/map?config=${encodeURIComponent(configSlug)}`);
    const json = (await res.json()) as {
      error?: string;
      config?: MapData["config"];
      pois?: Poi[];
      zones?: Zone[];
    };
    if (json.error) {
      setData({ config: { name: "Fairchild", center: [25.677, -80.273], zoom: DEFAULT_ZOOM }, pois: [], zones: [] });
    } else {
      setData({ config: json.config!, pois: json.pois ?? [], zones: json.zones ?? [] });
    }
  }, [configSlug]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  // -----------------------------------------------------------------------
  // Fuse.js fuzzy search — identical config to GardenMapLeaflet
  // -----------------------------------------------------------------------
  const fuse = useMemo(() => {
    if (!data?.pois) return null;
    return new Fuse(data.pois, {
      keys: [
        { name: "name", weight: 3 },
        { name: "description", weight: 1 },
        { name: "details", weight: 1 },
      ],
      threshold: 0.4,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  }, [data?.pois]);

  const filteredPois = useMemo(() => {
    if (!data?.pois) return [];
    const q = search.trim();
    let list: Poi[] = q && fuse ? fuse.search(q).map((r) => r.item) : data.pois;
    if (filter !== "all") list = list.filter((p) => (p.category ?? "exhibit") === filter);
    return list;
  }, [data?.pois, filter, search, fuse]);

  const searchResults = useMemo(() => {
    if (!search.trim() || !fuse) return [];
    return fuse.search(search.trim(), { limit: 6 }).map((r) => r.item);
  }, [fuse, search]);

  // -----------------------------------------------------------------------
  // Initialize MapLibre once
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let map: MapLibreMap;
    let cancelled = false;

    const init = async () => {
      // Dynamic import keeps maplibre-gl out of the server bundle entirely
      const maplibregl = (await import("maplibre-gl")).default;

      if (cancelled || !mapContainerRef.current) return;

      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: buildMapStyle(),
        center: FAIRCHILD_LNGLAT,
        zoom: DEFAULT_ZOOM,
        attributionControl: {}, // show default attribution (required by tile providers)
      });

      // Navigation control (zoom + compass) — top-right
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

      // User location control — top-right, below navigation
      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        fitBoundsOptions: { maxZoom: 18 },
      });
      map.addControl(geolocate, "top-right");

      geolocate.on("error", () => {
        // Graceful no-op if user denies location permission
      });

      map.on("load", () => {
        styleLoadedRef.current = true;
        // Zones will be added by the zones effect once data arrives
      });

      // Close bottom sheet when tapping the empty map
      map.on("click", () => {
        setSelectedPoi(null);
        setShowDirections(false);
      });

      mapRef.current = map;
    };

    void init();

    return () => {
      cancelled = true;
      styleLoadedRef.current = false;
      // Clean up all markers before removing the map instance
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally only runs once — map is imperative

  // -----------------------------------------------------------------------
  // Sync boundary zones to the map when data arrives or style reloads
  // -----------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data?.zones?.length) return;

    const apply = () => addZoneLayers(map, data.zones);

    if (styleLoadedRef.current) {
      apply();
    } else {
      map.once("load", apply);
    }
  }, [data?.zones]);

  // -----------------------------------------------------------------------
  // Sync POI markers whenever filtered list changes
  // -----------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove stale markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const addMarkers = async () => {
      const maplibregl = (await import("maplibre-gl")).default;

      filteredPois.forEach((poi) => {
        const el = createPinElement(poi.category);

        // Clicking the DOM element selects this POI — prevents map's generic
        // click handler from immediately closing the sheet
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedPoi(poi);
          setShowDirections(false);
          map.flyTo({ center: [poi.lng, poi.lat], zoom: 17, duration: 400 });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([poi.lng, poi.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    };

    void addMarkers();
  }, [filteredPois]);

  // -----------------------------------------------------------------------
  // Loading skeleton
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-xl bg-[var(--surface)]">
        <span className="text-[var(--text-muted)] text-sm">Loading map…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ----------------------------------------------------------------- */}
      {/* Map / List toggle */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex px-6 sm:px-0 pt-4 pb-3">
        <div className="flex p-1 rounded-full bg-[var(--surface)] border border-[var(--surface-border)]">
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition ${
              viewMode === "map"
                ? "bg-[var(--text-primary)] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition ${
              viewMode === "list"
                ? "bg-[var(--text-primary)] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            List
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Search bar */}
      {/* ----------------------------------------------------------------- */}
      <div className="px-6 sm:px-0 relative">
        <div className="relative">
          <input
            type="search"
            placeholder="Find exhibits, cafés, restrooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 pr-10 text-sm placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden>🔍</span>

          {search.trim() && searchResults.length > 0 && (
            <ul className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] py-1 shadow-lg">
              {searchResults.map((poi) => (
                <li key={poi.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPoi(poi);
                      setShowDirections(false);
                      setSearch("");
                      mapRef.current?.flyTo({ center: [poi.lng, poi.lat], zoom: 17, duration: 400 });
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--surface-border)]"
                  >
                    {poi.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Filter pills */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex gap-2 overflow-x-auto px-6 sm:px-0 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              filter === c.id
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Map or List view */}
      {/* ----------------------------------------------------------------- */}
      {viewMode === "list" ? (
        <div className="mx-6 sm:mx-0 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] overflow-hidden">
          {filteredPois.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <p className="text-[var(--text-muted)]">No locations match your search.</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Try a different filter or search term.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--surface-border)]">
              {filteredPois.map((poi) => {
                const imgSrc = resolveImageUrl(poi.image_url, DEFAULT_IMAGE);
                const previewDesc = (poi.description ?? poi.details ?? "");
                return (
                  <li key={poi.id}>
                    <Link
                      href={poiDetailHref(poi.id, poiListReturnPath)}
                      className="flex gap-3 p-4 hover:bg-[var(--surface-border)]/30 transition"
                    >
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--background)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-[var(--text-primary)]">{poi.name}</h3>
                        {previewDesc && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{previewDesc}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-[var(--primary)] text-sm">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="px-3 sm:px-0">
          {/* Map container — position:relative so the bottom sheet is scoped to it */}
          <div className="relative h-[420px] w-full rounded-xl overflow-hidden sm:rounded-2xl">
            {filteredPois.length === 0 && search.trim() && (
              <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--surface)]/90 rounded-xl">
                <p className="text-[var(--text-muted)] text-center px-4">No locations match your search.</p>
                <p className="text-sm text-[var(--text-muted)] mt-1 text-center px-4">Try a different filter or search term.</p>
              </div>
            )}

            {/* MapLibre canvas — filled by the init useEffect */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* POI bottom sheet — overlaid on the map */}
            {selectedPoi && !showDirections && (
              <PoiBottomSheet
                poi={selectedPoi}
                onClose={() => setSelectedPoi(null)}
                onDirections={() => setShowDirections(true)}
                poiListReturnPath={poiListReturnPath}
              />
            )}

            {selectedPoi && showDirections && (
              <DirectionsPanel
                poi={selectedPoi}
                onClose={() => setShowDirections(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
