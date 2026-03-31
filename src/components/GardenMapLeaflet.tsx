"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getPinIcon } from "@/lib/map-icons";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { MapTrifold, List } from "@phosphor-icons/react";

const CENTER: [number, number] = [25.677, -80.273];
const DEFAULT_IMAGE = "/stock/garden-1.png";

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

  const filteredPois = useMemo(() => {
    if (!data?.pois) return [];
    let list = filter === "all" ? data.pois : data.pois.filter((p) => (p.category ?? "exhibit") === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q)) ||
          (p.details?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data?.pois, filter, search]);

  const searchResults = useMemo(() => {
    if (!search.trim() || !data?.pois) return [];
    const q = search.trim().toLowerCase();
    return data.pois
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.details?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [data?.pois, search]);

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
    <div className="space-y-3">
      <div className="relative">
        <input
          type="search"
          placeholder="Find exhibits, cafés, restrooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 pr-10 text-sm placeholder-[var(--text-muted)]"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden>🔍</span>
        {search.trim() && searchResults.length > 0 && (
          <ul className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] py-1 shadow-lg">
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === c.id ? "bg-[var(--primary)] text-black" : "bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)]"
            }`}
          >
            {c.label}
          </button>
        ))}
        </div>
        <div className="flex shrink-0 rounded-lg border border-[var(--surface-border)] overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition ${
              viewMode === "map" ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] text-[var(--text-muted)]"
            }`}
            title="Map view"
          >
            <MapTrifold size={18} weight="regular" />
            <span className="hidden sm:inline">Map</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition ${
              viewMode === "list" ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] text-[var(--text-muted)]"
            }`}
            title="List view"
          >
            <List size={18} weight="regular" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>
      {viewMode === "list" ? (
        <div className="h-[480px] w-full overflow-y-auto rounded-lg border border-[var(--surface-border)] bg-[var(--surface)]">
          {filteredPois.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
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
      <div className="relative h-[480px] w-full overflow-hidden rounded-lg">
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
        >
          <MapFlyTo poi={selectedPoi} trigger={flyToTrigger} />
          <ZoomControl position="topright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          {boundaryGeoJson && (
            <GeoJSON
              key="boundary"
              data={boundaryGeoJson}
              style={() => ({
                fillColor: "#22c55e",
                fillOpacity: 0.38,
                color: "#15803d",
                weight: 3,
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
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Learn More →
                        </Link>
                      </div>
                    </div>
                    <div className="flex justify-center border-t border-gray-100 pt-2">
                      <a
                        href={getDirectionsUrl(poi.lat, poi.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90"
                        style={{ backgroundColor: "#1d4ed8", color: "#ffffff" }}
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
      </div>
      )}
    </div>
  );
}
