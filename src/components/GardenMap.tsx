"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, ImageOverlay, Polyline } from "react-leaflet";
import L from "leaflet";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import "leaflet/dist/leaflet.css";

// Small pin for overlay mode (Brooklyn Botanic Garden style)
const smallIcon = L.divIcon({
  html: `<div style="
    width:12px;height:12px;background:#2563eb;border:2px solid white;
    border-radius:50%;box-shadow:0 1px 2px rgba(0,0,0,0.3);
  "></div>`,
  className: "!border-0 !bg-transparent",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const FALLBACK_CENTER: [number, number] = [25.677, -80.273];

type MapData = {
  config: { name: string; center: [number, number]; zoom: number };
  layers: Array<{ id: string; slug: string; name: string; is_default?: boolean }>;
  pois: Array<{ id: string; name: string; description: string | null; lat: number; lng: number; layer_id: string | null }>;
  overlays: Array<{
    layer_id: string;
    image_url: string;
    bounds_sw_lat: number;
    bounds_sw_lng: number;
    bounds_ne_lat: number;
    bounds_ne_lng: number;
    opacity: number;
  }>;
  routes: Array<{ layer_id: string; name: string | null; path_geojson: number[][]; color: string; weight: number }>;
};

const FALLBACK_DATA: MapData = {
  config: { name: "Fairchild Tropical Botanic Garden", center: FALLBACK_CENTER, zoom: 17 },
  layers: [{ id: "1", slug: "default", name: "Garden Map", is_default: true }],
  pois: [
    { id: "1", name: "Visitor Center", description: "Start your visit here.", lat: 25.6775, lng: -80.2725, layer_id: null },
    { id: "2", name: "Rainforest Exhibit", description: "Explore the lush tropical rainforest.", lat: 25.6765, lng: -80.2735, layer_id: null },
    { id: "3", name: "Waterfall Garden", description: "Tranquil waterfall and lily pond.", lat: 25.6768, lng: -80.272, layer_id: null },
    { id: "4", name: "Palm Grove", description: "Palm trees from around the world.", lat: 25.6778, lng: -80.2738, layer_id: null },
    { id: "5", name: "Butterfly Garden", description: "Colorful butterflies among flowers.", lat: 25.6762, lng: -80.2718, layer_id: null },
    { id: "6", name: "Waterfront Trail", description: "Scenic path along the water.", lat: 25.676, lng: -80.274, layer_id: null },
  ],
  overlays: [],
  routes: [],
};

export default function GardenMap({ configSlug = "default" }: { configSlug?: string }) {
  const [data, setData] = useState<MapData | null>(null);
  const [activeLayer, setActiveLayer] = useState<string>("default");
  const [loading, setLoading] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.9);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/map?config=${encodeURIComponent(configSlug)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) {
          setData(FALLBACK_DATA);
        } else {
          setData(json);
        }
      })
      .catch(() => {
        if (!cancelled) setData(FALLBACK_DATA);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [configSlug]);

  const displayData = data ?? FALLBACK_DATA;

  if (loading) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center">
        <span className="text-[var(--text-muted)]">Loading map…</span>
      </div>
    );
  }

  const centerDisplay = displayData.config?.center ?? FALLBACK_CENTER;
  const zoomDisplay = displayData.config?.zoom ?? 17;
  const layersDisplay = displayData.layers ?? [];
  const poisDisplay = displayData.pois ?? [];
  const overlaysDisplay = displayData.overlays ?? [];
  const routesDisplay = displayData.routes ?? [];

  const activeLayerId = layersDisplay.find((l) => l.slug === activeLayer)?.id ?? layersDisplay.find((l) => l.is_default)?.id;
  const activeLayerIds = activeLayerId ? new Set([activeLayerId]) : new Set<string>();
  const visiblePois = poisDisplay.filter((p) => !p.layer_id || activeLayerIds.has(p.layer_id));
  const visibleOverlays = overlaysDisplay.filter((o) => activeLayerIds.has(o.layer_id));
  const visibleRoutes = routesDisplay.filter((r) => activeLayerIds.has(r.layer_id));

  const hasOverlay = visibleOverlays.length > 0;

  return (
    <div className="space-y-3">
      {hasOverlay && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--text-muted)]">Map overlay</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
            className="w-24 accent-[var(--primary)]"
          />
          <span className="text-[var(--text-muted)] tabular-nums">{Math.round(overlayOpacity * 100)}%</span>
        </div>
      )}
      {layersDisplay.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {layersDisplay.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(l.slug)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeLayer === l.slug
                  ? "bg-[var(--primary)] text-black"
                  : "bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)]"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}
      <div className="w-full h-[480px] overflow-hidden rounded-lg z-0 [&_.leaflet-container]:rounded-lg">
        <MapContainer
          center={centerDisplay}
          zoom={zoomDisplay}
          scrollWheelZoom
          className="h-full w-full"
          zoomControl={false}
        >
          <ZoomControl position="topright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
          />
          {visibleOverlays.map((ov) => {
            const bounds = L.latLngBounds(
              [ov.bounds_sw_lat, ov.bounds_sw_lng],
              [ov.bounds_ne_lat, ov.bounds_ne_lng]
            );
            const url = resolveImageUrl(ov.image_url, "");
            return <ImageOverlay key={ov.layer_id + ov.image_url} url={url} bounds={bounds} opacity={overlayOpacity} />;
          })}
          {visibleRoutes.map((r) => {
            const positions = (r.path_geojson as [number, number][]).map(([lng, lat]) => [lat, lng] as [number, number]);
            return <Polyline key={r.layer_id + (r.name ?? "")} positions={positions} color={r.color} weight={r.weight} />;
          })}
          {visiblePois.map((poi) => (
            <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={smallIcon}>
              <Popup>
                <div className="min-w-[180px]">
                  <h3 className="font-semibold text-gray-900">{poi.name}</h3>
                  {poi.description && (
                    <p className="text-sm text-gray-600 mt-1">{poi.description}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
