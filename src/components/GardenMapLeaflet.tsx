"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, GeoJSON, ImageOverlay, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import Fuse from "fuse.js";
import { getPinIcon } from "@/lib/map-icons";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { MapTrifold, List } from "@phosphor-icons/react";

const CENTER: [number, number] = [25.677, -80.273];
const DEFAULT_IMAGE = "/stock/garden-1.png";

// Bounding box for the illustrated garden map overlay.
// SW = bottom-left corner, NE = top-right corner of the image.
// Fine-tune these values if the GPS dot appears slightly offset.
const OVERLAY_BOUNDS: LatLngBoundsExpression = [
  [25.6730, -80.2785], // SW (bottom-left of image)
  [25.6820, -80.2675], // NE (top-right of image)
];

// Restrict the map to the garden area so users can't scroll to random streets
const MAX_BOUNDS: LatLngBoundsExpression = [
  [25.6720, -80.2800],
  [25.6830, -80.2660],
];

// Inverse-polygon mask — large world rectangle with garden hole cut out.
// This grays out everything outside the illustrated map.
const WORLD_MASK_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          // Outer ring — covers the entire world
          [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
          // Inner ring (hole) — the illustrated map bounds, counter-clockwise
          [
            [-80.2785, 25.6730],
            [-80.2785, 25.6820],
            [-80.2675, 25.6820],
            [-80.2675, 25.6730],
            [-80.2785, 25.6730],
          ],
        ],
      },
    },
  ],
};

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

function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}


type Zone = {
  id: string;
  geometry_geojson: GeoJSON.Polygon;
};

type MapData = {
  config: { name: string; center: [number, number]; zoom: number };
  pois: Poi[];
  zones: Zone[];
};

function MapFlyTo({ poi, trigger }: { poi: Poi | null; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    if (!poi || !trigger) return;
    map.flyTo([poi.lat, poi.lng], 17, { duration: 0.5 });
  }, [map, poi, trigger]);
  return null;
}

type GardenMapLeafletProps = {
  /** Supabase `map_config.slug` */
  configSlug?: string;
  /** Path used for POI detail “back” link when not the main /map list */
  poiListReturnPath?: string;
};

function poiDetailHref(poiId: string, listReturnPath: string) {
  if (listReturnPath === "/map") {
    return `/map/${poiId}`;
  }
  return `/map/${poiId}?returnTo=${encodeURIComponent(listReturnPath)}`;
}

export default function GardenMapLeaflet({
  configSlug = "default",
  poiListReturnPath = "/map",
}: GardenMapLeafletProps) {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [flyToTrigger, setFlyToTrigger] = useState(0);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/map?config=${encodeURIComponent(configSlug)}`);
    const json = await res.json();
    if (json.error) {
      setData({ config: { name: "Fairchild", center: CENTER, zoom: 16 }, pois: [], zones: [] });
    } else {
      setData({
        config: json.config,
        pois: json.pois ?? [],
        zones: json.zones ?? [],
      });
    }
  }, [configSlug]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

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
    let list: Poi[];
    if (q && fuse) {
      list = fuse.search(q).map((r) => r.item);
    } else {
      list = data.pois;
    }
    if (filter !== "all") {
      list = list.filter((p) => (p.category ?? "exhibit") === filter);
    }
    return list;
  }, [data?.pois, filter, search, fuse]);

  const searchResults = useMemo(() => {
    if (!search.trim() || !fuse) return [];
    return fuse.search(search.trim(), { limit: 6 }).map((r) => r.item);
  }, [fuse, search]);

  const boundaryGeoJson = useMemo(() => {
    if (!data?.zones?.length) return null;
    return {
      type: "FeatureCollection" as const,
      features: data.zones.map((z) => ({
        type: "Feature" as const,
        properties: {},
        geometry: z.geometry_geojson,
      })),
    };
  }, [data?.zones]);

  if (loading) {
    return (
      <div className="flex h-[480px] w-full items-center justify-center rounded-lg bg-[var(--surface)]">
        <span className="text-[var(--text-muted)]">Loading map…</span>
      </div>
    );
  }

  const center = (data?.config?.center ?? CENTER) as [number, number];
  const zoom = data?.config?.zoom ?? 16;

  return (
    <div className="space-y-0">
      {/* Map / List toggle — pill-shaped, left-aligned */}
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
            <MapTrifold size={16} weight="regular" />
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
            <List size={16} weight="regular" />
            List
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 sm:px-0">
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
                      setFlyToTrigger((t) => t + 1);
                      setSearch("");
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

      {/* Filter pills — horizontally scrollable row */}
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

      {viewMode === "list" ? (
        <div className="mx-6 sm:mx-0 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] overflow-hidden">
          {filteredPois.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <p className="text-[var(--text-muted)]">
                No locations match your search.
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Try a different filter or search term.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--surface-border)]">
              {filteredPois.map((poi) => {
                const imgSrc = resolveImageUrl(poi.image_url, DEFAULT_IMAGE);
                const previewDesc = poi.description ?? poi.details ?? "";
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
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-[var(--text-primary)]">{poi.name}</h3>
                        {previewDesc && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
                            {previewDesc}
                          </p>
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
      <div className="px-3 sm:px-0"><div className="relative h-[340px] w-full rounded-xl sm:overflow-hidden sm:rounded-2xl">
        {filteredPois.length === 0 && (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center rounded-lg bg-[var(--surface)]/95">
            <p className="text-[var(--text-muted)] text-center px-4">
              No locations match your search.
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1 text-center px-4">
              Try a different filter or search term.
            </p>
          </div>
        )}
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          keyboard={false}
          className="h-full w-full"
          zoomControl={false}
          maxBounds={MAX_BOUNDS}
          maxBoundsViscosity={1.0}
          minZoom={15}
        >
          <MapFlyTo poi={selectedPoi} trigger={flyToTrigger} />
          <ZoomControl position="topright" />
          {/* Light basemap sits underneath — mostly hidden by the overlay */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
            maxZoom={19}
            opacity={0.3}
          />
          {/* Illustrated garden map overlay — pinned to real-world coordinates */}
          <ImageOverlay
            url="/garden-map-overlay.png"
            bounds={OVERLAY_BOUNDS}
            opacity={1}
            zIndex={10}
          />
          {/* Gray mask outside the illustrated map bounds */}
          <GeoJSON
            key="world-mask"
            data={WORLD_MASK_GEOJSON}
            style={() => ({
              fillColor: "#e8e4dc",
              fillOpacity: 0.85,
              color: "transparent",
              weight: 0,
            })}
          />
          {/* Garden boundary outline if configured in Supabase */}
          {boundaryGeoJson && (
            <GeoJSON
              key="boundary"
              data={boundaryGeoJson}
              style={() => ({
                fillColor: "transparent",
                fillOpacity: 0,
                color: "#15803d",
                weight: 2,
                lineJoin: "round" as const,
                lineCap: "round" as const,
              })}
            />
          )}
          {filteredPois.map((poi) => {
            const imgSrc = resolveImageUrl(poi.image_url, DEFAULT_IMAGE);
            const fullDesc = poi.description ?? poi.details ?? "";
            const previewDesc = fullDesc.length > 120 ? fullDesc.slice(0, 120).trim() + "…" : fullDesc;
            return (
              <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={getPinIcon(poi.category)}>
                <Popup maxWidth={340} minWidth={280}>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{poi.name}</h3>
                        {previewDesc && (
                          <p className="mt-0.5 text-xs leading-relaxed text-gray-600 line-clamp-3">
                            {previewDesc}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <div className="relative h-20 w-24 overflow-hidden rounded-lg bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgSrc}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                            }}
                          />
                        </div>
                        <Link
                          href={poiDetailHref(poi.id, poiListReturnPath)}
                          className="text-xs font-medium text-[var(--primary)] hover:underline"
                        >
                          Learn More →
                        </Link>
                      </div>
                    </div>
                    <div className="flex justify-center border-t border-[var(--surface-border)] pt-2">
                      <a
                        href={getDirectionsUrl(poi.lat, poi.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold bg-[var(--primary)] transition hover:opacity-90 !text-white"
                      >
                        Get Directions
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div></div>
      )}
    </div>
  );
}
