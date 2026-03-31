"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const CENTER: [number, number] = [25.677, -80.273];
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "exhibit", label: "Exhibits" },
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
  lat: number;
  lng: number;
  category: string | null;
};

type Zone = {
  id: string;
  name: string | null;
  geometry_geojson: GeoJSON.Polygon;
};

type MapData = {
  config: { name: string; center: [number, number]; zoom: number };
  pois: Poi[];
  zones: Zone[];
};

export default function GardenMapMaplibre({ configSlug = "default" }: { configSlug?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

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
    if (filter === "all") return data.pois;
    return data.pois.filter((p) => (p.category ?? "exhibit") === filter);
  }, [data?.pois, filter]);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://demotiles.maplibre.org/tiles/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
            paint: { "raster-opacity": 0.85 },
          },
        ],
      },
      center: data.config.center as [number, number],
      zoom: data.config.zoom ?? 16,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, [data?.config]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;

    const addLayers = () => {
      try {
        if (data.zones.length > 0 && !map.getSource("boundary")) {
          const fc: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: data.zones.map((z) => ({
              type: "Feature" as const,
              properties: { name: z.name },
              geometry: z.geometry_geojson,
            })),
          };
          map.addSource("boundary", { type: "geojson", data: fc });
          map.addLayer({
            id: "boundary-fill",
            type: "fill",
            source: "boundary",
            paint: {
              "fill-color": "#2e7d57",
              "fill-opacity": 0.15,
            },
          });
          map.addLayer({
            id: "boundary-outline",
            type: "line",
            source: "boundary",
            paint: {
              "line-color": "#2e7d57",
              "line-width": 2,
            },
          });
        }

        const poiData = {
          type: "FeatureCollection" as const,
          features: filteredPois.map((p) => ({
            type: "Feature" as const,
            properties: { id: p.id, name: p.name, description: p.description },
            geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] as [number, number] },
          })),
        };

        if (map.getSource("pois")) {
          (map.getSource("pois") as maplibregl.GeoJSONSource).setData(poiData);
        } else {
          map.addSource("pois", { type: "geojson", data: poiData });
          map.addLayer({
            id: "pois-circles",
            type: "circle",
            source: "pois",
            paint: {
              "circle-radius": 8,
              "circle-color": "#2563eb",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            },
          });
          map.addLayer({
            id: "pois-symbols",
            type: "symbol",
            source: "pois",
            layout: {
              "text-field": ["get", "name"],
              "text-size": 11,
              "text-offset": [0, 1.2],
              "text-anchor": "top",
            },
            paint: {
              "text-color": "#111",
              "text-halo-color": "#fff",
              "text-halo-width": 2,
            },
          });
        }
      } catch (_) {}
    };

    if (map.isStyleLoaded()) addLayers();
    else map.once("load", addLayers);
  }, [data?.zones, data?.pois, filteredPois]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onPoiClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["pois-circles"] });
      if (features.length === 0) {
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
        return;
      }
      const props = features[0].properties as { name?: string; description?: string };
      if (popupRef.current) popupRef.current.remove();
      const popup = new maplibregl.Popup({ closeButton: true })
        .setLngLat((features[0].geometry as GeoJSON.Point).coordinates as [number, number])
        .setHTML(
          `<div class="min-w-[180px]">
            <h3 class="font-semibold text-gray-900">${props.name ?? ""}</h3>
            ${props.description ? `<p class="text-sm text-gray-600 mt-1">${props.description}</p>` : ""}
          </div>`
        )
        .addTo(map);
      popupRef.current = popup;
    };

    map.on("click", "pois-circles", onPoiClick);
    return () => {
      map.off("click", "pois-circles", onPoiClick);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[480px] w-full items-center justify-center rounded-lg bg-[var(--surface)]">
        <span className="text-[var(--text-muted)]">Loading map…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
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
      <div ref={containerRef} className="h-[480px] w-full rounded-lg overflow-hidden" />
    </div>
  );
}
