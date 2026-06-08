"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, GeoJSON, ImageOverlay, Circle, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import Fuse from "fuse.js";
import { getPinIcon } from "@/lib/map-icons";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { MapTrifold, List, ArrowsOut, ArrowsIn, Crosshair, Funnel } from "@phosphor-icons/react";

const CENTER: [number, number] = [25.677, -80.273];
const DEFAULT_IMAGE = "/stock/garden-1.png";
/** Walkable zoom — avoids showing the whole garden as a small illustrated rectangle */
const IMMERSIVE_ZOOM = 17;
const IMMERSIVE_MIN_ZOOM = 16;
/** Reserve space for floating chrome when auto-panning popups */
const POPUP_TOP_COLLAPSED_PX = 88;
const POPUP_TOP_EXPANDED_PX = 130;
const POPUP_BOTTOM_INSET_PX = 96;

const GLASS =
  "border border-[color-mix(in_srgb,var(--surface-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] shadow-sm backdrop-blur-md";

const FALLBACK_OVERLAY_BOUNDS: LatLngBoundsExpression = [
  [25.6730, -80.2785],
  [25.6820, -80.2675],
];

function buildMask(sw: [number, number], ne: [number, number]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
            [
              [sw[1], sw[0]],
              [sw[1], ne[0]],
              [ne[1], ne[0]],
              [ne[1], sw[0]],
              [sw[1], sw[0]],
            ],
          ],
        },
      },
    ],
  };
}

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

type OverlayConfig = {
  image_url: string;
  sw: [number, number];
  ne: [number, number];
  opacity?: number;
};

type Zone = {
  id: string;
  geometry_geojson: GeoJSON.Polygon;
};

type MapData = {
  config: {
    name: string;
    center: [number, number];
    zoom: number;
    overlay: OverlayConfig | null;
  };
  pois: Poi[];
  zones: Zone[];
};

function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function MapFlyTo({ poi, trigger }: { poi: Poi | null; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    if (!poi || !trigger) return;
    map.flyTo([poi.lat, poi.lng], 17, { duration: 0.5 });
  }, [map, poi, trigger]);
  return null;
}

function MapInvalidateSize({ trigger }: { trigger: unknown }) {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 50);
    return () => window.clearTimeout(id);
  }, [map, trigger]);
  return null;
}

function MapInitialView({
  center,
  zoom,
  immersive,
}: {
  center: [number, number];
  zoom: number;
  immersive: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const targetZoom = immersive ? Math.max(zoom, IMMERSIVE_ZOOM) : zoom;
    map.setView(center, targetZoom, { animate: false });
  }, [map, center, zoom, immersive]);

  return null;
}

function MapLocateHandler({
  trigger,
  onLocated,
  onError,
}: {
  trigger: number;
  onLocated: (position: [number, number]) => void;
  onError: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!trigger) return;
    if (!navigator.geolocation) {
      onError();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const position: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        onLocated(position);
        map.flyTo(position, 17, { duration: 0.5 });
      },
      () => onError(),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [trigger, map, onLocated, onError]);

  return null;
}

function UserLocationMarker({ position }: { position: [number, number] | null }) {
  if (!position) return null;
  return (
    <>
      <Circle
        center={position}
        radius={18}
        pathOptions={{
          color: "#4285F4",
          fillColor: "#4285F4",
          fillOpacity: 0.18,
          weight: 1,
        }}
      />
      <Circle
        center={position}
        radius={7}
        pathOptions={{
          color: "#ffffff",
          fillColor: "#4285F4",
          fillOpacity: 1,
          weight: 2,
        }}
      />
    </>
  );
}

type GardenMapLeafletProps = {
  configSlug?: string;
  poiListReturnPath?: string;
  /** Show expand / collapse control for immersive full-height map */
  allowFullscreen?: boolean;
  /** Start in expanded full-height mode (e.g. main /map tab) */
  defaultExpanded?: boolean;
};

function poiDetailHref(poiId: string, listReturnPath: string) {
  if (listReturnPath === "/map") return `/map/${poiId}`;
  return `/map/${poiId}?returnTo=${encodeURIComponent(listReturnPath)}`;
}

export default function GardenMapLeaflet({
  configSlug = "default",
  poiListReturnPath = "/map",
  allowFullscreen = false,
  defaultExpanded = false,
}: GardenMapLeafletProps) {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [flyToTrigger, setFlyToTrigger] = useState(0);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(defaultExpanded);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locateTrigger, setLocateTrigger] = useState(0);
  const [locateFailed, setLocateFailed] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLocated = useCallback((position: [number, number]) => {
    setUserPosition(position);
    setLocateFailed(false);
  }, []);

  const handleLocateError = useCallback(() => {
    setLocateFailed(true);
  }, []);

  const load = useCallback(async () => {
    const res = await fetch(`/api/map?config=${encodeURIComponent(configSlug)}`);
    const json = await res.json();
    if (json.error) {
      setData({ config: { name: "Fairchild", center: CENTER, zoom: 15, overlay: null }, pois: [], zones: [] });
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

  useEffect(() => {
    if (!isFullscreen) return;
    const main = document.querySelector("main");
    const prevOverflow = main?.style.overflow;
    if (main) main.style.overflow = "hidden";
    return () => {
      if (main) main.style.overflow = prevOverflow ?? "";
    };
  }, [isFullscreen]);

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

  const overlay = data?.config?.overlay ?? null;
  const overlayImageUrl = overlay?.image_url ?? "/garden-map-overlay.png";
  const overlayBounds: LatLngBoundsExpression = overlay
    ? [overlay.sw, overlay.ne]
    : FALLBACK_OVERLAY_BOUNDS;

  const sw = overlay ? overlay.sw : (FALLBACK_OVERLAY_BOUNDS as [[number, number], [number, number]])[0];
  const ne = overlay ? overlay.ne : (FALLBACK_OVERLAY_BOUNDS as [[number, number], [number, number]])[1];
  const worldMask = useMemo(() => buildMask(sw, ne), [sw, ne]);

  const dynamicMaxBounds: LatLngBoundsExpression = [
    [sw[0] - 0.001, sw[1] - 0.001],
    [ne[0] + 0.001, ne[1] + 0.001],
  ];

  const immersive = isFullscreen;
  const mapResizeKey = `${isFullscreen}-${viewMode}-${filtersExpanded}`;
  const popupTopInset =
    immersive && (filtersExpanded || filter !== "all")
      ? POPUP_TOP_EXPANDED_PX
      : POPUP_TOP_COLLAPSED_PX;

  const toggleFullscreen = () => setIsFullscreen((v) => !v);

  const selectFilter = (id: string) => {
    setFilter(id);
    if (id !== "all") setFiltersExpanded(false);
  };

  const renderImmersiveMapChrome = () => (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-[500]"
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-24"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--background) 92%, transparent) 0%, color-mix(in srgb, var(--background) 55%, transparent) 45%, transparent 100%)",
        }}
      />
      <div className="relative pointer-events-auto space-y-1.5 px-3 pb-1">
        <div className="flex items-center gap-2">
          <div className={`flex shrink-0 rounded-full p-0.5 ${GLASS}`}>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              aria-label="Map view"
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                viewMode === "map" ? "bg-[var(--text-primary)] text-white" : "text-[var(--text-muted)]"
              }`}
            >
              <MapTrifold size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                viewMode === "list" ? "bg-[var(--text-primary)] text-white" : "text-[var(--text-muted)]"
              }`}
            >
              <List size={16} weight="bold" />
            </button>
          </div>

          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              placeholder="Search the garden…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
              className={`w-full rounded-full py-2 pl-3.5 pr-9 text-sm placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none ${GLASS}`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden>
              🔍
            </span>
            {searchFocused && search.trim() && searchResults.length > 0 && (
              <ul className={`absolute top-full left-0 right-0 z-[600] mt-1 max-h-44 overflow-y-auto rounded-xl py-1 shadow-lg ${GLASS}`}>
                {searchResults.map((poi) => (
                  <li key={poi.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPoi(poi);
                        setFlyToTrigger((t) => t + 1);
                        setSearch("");
                        setSearchFocused(false);
                        setViewMode("map");
                      }}
                      className="w-full px-3.5 py-2 text-left text-sm hover:bg-[var(--surface-border)]/40"
                    >
                      {poi.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFiltersExpanded((v) => !v)}
            aria-label={filtersExpanded ? "Hide filters" : "Show filters"}
            aria-expanded={filtersExpanded}
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${GLASS} ${
              filter !== "all" ? "text-[var(--primary)]" : "text-[var(--text-primary)]"
            }`}
          >
            <Funnel size={17} weight="bold" />
            {filter !== "all" && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
            )}
          </button>

          {allowFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Exit full screen map"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-primary)] ${GLASS}`}
            >
              <ArrowsIn size={17} weight="bold" />
            </button>
          )}
        </div>

        {(filtersExpanded || filter !== "all") && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => selectFilter(c.id)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition ${GLASS} ${
                  filter === c.id
                    ? "!bg-[var(--primary)] !text-white !border-[var(--primary)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderToolbar = (floating: boolean) => (
    <div className={`flex items-center gap-2 ${floating ? "" : "px-6 sm:px-0 pt-4 pb-3"}`}>
      <div className="flex p-1 rounded-full bg-[var(--surface)] border border-[var(--surface-border)] shadow-sm">
        <button
          type="button"
          onClick={() => setViewMode("map")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
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
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
            viewMode === "list"
              ? "bg-[var(--text-primary)] text-white"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <List size={16} weight="regular" />
          List
        </button>
      </div>
      {allowFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit full screen map" : "Expand map to full screen"}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition active:scale-[0.98]"
        >
          {isFullscreen ? (
            <>
              <ArrowsIn size={16} weight="bold" />
              Exit
            </>
          ) : (
            <>
              <ArrowsOut size={16} weight="bold" />
              Expand
            </>
          )}
        </button>
      )}
    </div>
  );

  const renderSearch = (floating: boolean) => (
    <div className={floating ? "" : "px-6 sm:px-0"}>
      <div className="relative">
        <input
          type="search"
          placeholder="Find exhibits, cafés, restrooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 pr-10 text-sm placeholder-[var(--text-muted)] shadow-sm focus:border-[var(--primary)] focus:outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden>
          🔍
        </span>
        {search.trim() && searchResults.length > 0 && (
          <ul className="absolute top-full left-0 right-0 z-[600] mt-1 max-h-48 overflow-y-auto rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] py-1 shadow-lg">
            {searchResults.map((poi) => (
              <li key={poi.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPoi(poi);
                    setFlyToTrigger((t) => t + 1);
                    setSearch("");
                    setViewMode("map");
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
  );

  const renderFilters = (floating: boolean) => (
    <div
      className={`flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        floating ? "" : "px-6 sm:px-0 py-3"
      }`}
    >
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          onClick={() => setFilter(c.id)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition shadow-sm ${
            filter === c.id
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)]"
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );

  const renderControls = (floating: boolean) => (
    <>
      {renderToolbar(floating)}
      {renderSearch(floating)}
      {renderFilters(floating)}
    </>
  );

  const renderList = () => (
    <div
      className={`overflow-hidden border border-[var(--surface-border)] bg-[var(--surface)] ${
        immersive ? "mx-3 mb-3 flex-1 min-h-0 overflow-y-auto rounded-2xl" : "mx-6 sm:mx-0 rounded-2xl"
      }`}
    >
      {filteredPois.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <p className="text-[var(--text-muted)]">No locations match your search.</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Try a different filter or search term.</p>
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
  );

  const renderMapCanvas = (center: [number, number], zoom: number) => {
    const initialZoom = immersive ? Math.max(zoom, IMMERSIVE_ZOOM) : zoom;
    const minZoom = immersive ? IMMERSIVE_MIN_ZOOM : 15;

    return (
    <div className={`relative w-full ${immersive ? "absolute inset-0" : "h-[min(52vh,28rem)]"}`}>
      {filteredPois.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-[var(--surface)]/95">
          <p className="text-[var(--text-muted)] text-center px-4">No locations match your search.</p>
          <p className="text-sm text-[var(--text-muted)] mt-1 text-center px-4">Try a different filter or search term.</p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setLocateTrigger((t) => t + 1)}
        aria-label="Show my location on map"
        className="absolute bottom-20 right-3 z-[600] flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-primary)] shadow-md transition active:scale-[0.96]"
        style={{ background: "color-mix(in srgb, var(--surface) 88%, transparent)", backdropFilter: "blur(12px)" }}
      >
        <Crosshair size={20} weight="bold" />
      </button>
      {locateFailed && (
        <p className="absolute bottom-32 right-3 z-[600] max-w-[10rem] rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] shadow-md">
          Location unavailable
        </p>
      )}
      <MapContainer
        center={center}
        zoom={initialZoom}
        scrollWheelZoom
        touchZoom
        doubleClickZoom
        keyboard={false}
        className="h-full w-full"
        zoomControl={false}
        maxBounds={dynamicMaxBounds}
        maxBoundsViscosity={1.0}
        minZoom={minZoom}
      >
        <MapInitialView center={center} zoom={zoom} immersive={immersive} />
        <MapInvalidateSize trigger={mapResizeKey} />
        <MapFlyTo poi={selectedPoi} trigger={flyToTrigger} />
        <MapLocateHandler trigger={locateTrigger} onLocated={handleLocated} onError={handleLocateError} />
        <UserLocationMarker position={userPosition} />
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
          maxZoom={19}
          opacity={immersive ? 0.45 : 0.3}
        />

        <ImageOverlay
          url={overlayImageUrl}
          bounds={overlayBounds}
          opacity={overlay?.opacity ?? 1}
          zIndex={10}
        />

        {!immersive && (
          <GeoJSON
            key={`mask-${sw[0]}-${ne[0]}`}
            data={worldMask}
            style={() => ({
              fillColor: "#e8e4dc",
              fillOpacity: 0.88,
              color: "transparent",
              weight: 0,
            })}
          />
        )}

        {filteredPois.map((poi) => {
          const imgSrc = resolveImageUrl(poi.image_url, DEFAULT_IMAGE);
          const fullDesc = poi.description ?? poi.details ?? "";
          const previewDesc = fullDesc.length > 120 ? fullDesc.slice(0, 120).trim() + "…" : fullDesc;
          return (
            <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={getPinIcon(poi.category)}>
              <Popup
                maxWidth={340}
                minWidth={280}
                autoPan
                autoPanPaddingTopLeft={[16, popupTopInset]}
                autoPanPaddingBottomRight={[16, POPUP_BOTTOM_INSET_PX]}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900">{poi.name}</h3>
                      {previewDesc && (
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-600 line-clamp-3">{previewDesc}</p>
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
    </div>
    );
  };

  if (loading) {
    return (
      <div
        className={`flex w-full items-center justify-center bg-[var(--surface)] ${
          immersive ? "flex-1 min-h-0" : "h-[min(52vh,28rem)] rounded-xl"
        }`}
      >
        <span className="text-[var(--text-muted)]">Loading map…</span>
      </div>
    );
  }

  const center = (data?.config?.center ?? CENTER) as [number, number];
  const zoom = data?.config?.zoom ?? 15;

  const shellClass = immersive
    ? "fixed inset-x-0 top-0 z-[1100] mx-auto flex max-w-[28rem] flex-col overflow-hidden"
    : "relative flex flex-col";

  const shellStyle = immersive
    ? {
        bottom: "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }
    : undefined;

  return (
    <div className={shellClass} style={shellStyle}>
      {immersive ? (
        viewMode === "list" ? (
          <div className="flex min-h-0 flex-1 flex-col bg-[var(--background)]">
            <div className="shrink-0 space-y-2 px-3 pt-3">{renderControls(false)}</div>
            {renderList()}
          </div>
        ) : (
          <div className="relative min-h-0 flex-1">
            {renderMapCanvas(center, zoom)}
            {renderImmersiveMapChrome()}
          </div>
        )
      ) : (
        <>
          {renderControls(false)}

          {viewMode === "list" ? (
            renderList()
          ) : (
            <div className="px-3 sm:px-0">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">{renderMapCanvas(center, zoom)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
