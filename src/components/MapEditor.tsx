"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";
import {
  MAP_CONFIG_OPTIONS,
  isMapConfigSlug,
  mapConfigPreviewPath,
  type MapConfigSlug,
} from "@/lib/mapConfigs";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMapEvents,
  FeatureGroup,
  Polygon,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getPinIcon, CATEGORY_OPTIONS } from "@/lib/map-icons";
import { MapImageUpload } from "@/components/MapImageUpload";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { GeomanControls } from "react-leaflet-geoman-v2";

const FALLBACK_CENTER: [number, number] = [25.677, -80.273];

const BOUNDARY_STYLE: L.PathOptions = {
  fillColor: "#22c55e",
  fillOpacity: 0.38,
  color: "#15803d",
  weight: 3,
  lineJoin: "round",
  lineCap: "round",
};

const CATEGORY_COLORS: Record<string, string> = {
  exhibit: "#166534",
  artwork: "#7c3aed",
  entrance: "#16a34a",
  restroom: "#2563eb",
  cafe: "#ea580c",
  shop: "#0d9488",
  info: "#dc2626",
  tram: "#dc2626",
};

type Poi = {
  id: string;
  name: string;
  description: string | null;
  details?: string | null;
  image_url?: string | null;
  lat: number;
  lng: number;
  sort_order: number;
  category?: string | null;
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

/** Pass JWT to map APIs so Route Handlers use your session (fixes missing auth cookies on some hosts/browsers). */
async function staffMapFetchHeaders(): Promise<HeadersInit> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

function MapClickHandler({
  onMapClick,
  disabled,
}: {
  onMapClick: (lat: number, lng: number) => void;
  disabled: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapEditor() {
  const router = useRouter();
  const pathname = usePathname() ?? "/staff/map/edit";
  const searchParams = useSearchParams();
  const configSlug: MapConfigSlug = useMemo(() => {
    const q = searchParams.get("config");
    if (q && isMapConfigSlug(q)) return q;
    return "default";
  }, [searchParams]);

  const supabase = useSupabaseBrowserClient();
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pois, setPois] = useState<Poi[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addPinMode, setAddPinMode] = useState(false);
  const [boundaryMode, setBoundaryMode] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyModalText, setCopyModalText] = useState("");
  /** Bumps when server map data is applied so Leaflet remounts (markers otherwise often stick empty after copy). */
  const [mapRenderNonce, setMapRenderNonce] = useState(0);
  const [addPinAt, setAddPinAt] = useState<{ lat: number; lng: number } | null>(null);
  const [newPinName, setNewPinName] = useState("");
  const [newPinDesc, setNewPinDesc] = useState("");
  const [newPinDetails, setNewPinDetails] = useState("");
  const [newPinImageUrl, setNewPinImageUrl] = useState("");
  const [newPinCategory, setNewPinCategory] = useState<string>("exhibit");
  const [editingBoundary, setEditingBoundary] = useState<GeoJSON.Polygon | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);
  /** Latest slug; used to ignore stale fetch results after switching maps. */
  const configSlugRef = useRef(configSlug);
  configSlugRef.current = configSlug;

  const normalizePois = useCallback((raw: unknown): Poi[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((p: Record<string, unknown>, i: number) => {
      const lat = typeof p.lat === "number" ? p.lat : parseFloat(String(p.lat ?? ""));
      const lng = typeof p.lng === "number" ? p.lng : parseFloat(String(p.lng ?? ""));
      return {
        id: String(p.id ?? `row-${i}`),
        name: String(p.name ?? ""),
        description: (p.description as string | null) ?? null,
        details: (p.details as string | null) ?? null,
        image_url: (p.image_url as string | null) ?? null,
        lat: Number.isFinite(lat) ? lat : 0,
        lng: Number.isFinite(lng) ? lng : 0,
        sort_order: typeof p.sort_order === "number" ? p.sort_order : i,
        category: (p.category as string | null) ?? "exhibit",
      };
    });
  }, []);

  const applyMapJson = useCallback(
    (json: Record<string, unknown>) => {
      if (json.error) {
        setData(null);
        setPois([]);
        setZones([]);
        setEditingBoundary(null);
        setMapRenderNonce((n) => n + 1);
        return;
      }
      setData(json as unknown as MapData);
      setPois(normalizePois(json.pois));
      setZones((json.zones as Zone[]) ?? []);
      const z = (json.zones as Zone[] | undefined)?.[0];
      setEditingBoundary(z?.geometry_geojson ?? null);
      setMapRenderNonce((n) => n + 1);
    },
    [normalizePois]
  );

  const fetchMapJson = useCallback(async (slug: MapConfigSlug) => {
    const res = await fetch(`/api/map?config=${encodeURIComponent(slug)}`, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { ...(await staffMapFetchHeaders()) },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Map load failed (${res.status})`);
    }
    return res.json() as Promise<Record<string, unknown>>;
  }, []);

  /** Reload whichever config is currently selected (after save/copy). */
  const reloadCurrentMap = useCallback(async () => {
    const slug = configSlugRef.current;
    const json = await fetchMapJson(slug);
    if (configSlugRef.current !== slug) return;
    applyMapJson(json);
  }, [applyMapJson, fetchMapJson]);

  useEffect(() => {
    const forSlug = configSlug;
    let cancelled = false;

    setPois([]);
    setZones([]);
    setEditingBoundary(null);
    setData(null);
    setLoading(true);

    void (async () => {
      try {
        const json = await fetchMapJson(forSlug);
        if (cancelled || configSlugRef.current !== forSlug) return;
        applyMapJson(json);
      } catch {
        if (!cancelled && configSlugRef.current === forSlug) {
          applyMapJson({ error: "Map load failed" });
        }
      }
    })().finally(() => {
      if (!cancelled && configSlugRef.current === forSlug) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [configSlug, applyMapJson, fetchMapJson]);

  const openCopyFromMainModal = () => {
    if (configSlug === "default") return;
    setCopyModalText("");
    setCopyModalOpen(true);
  };

  const runCopyFromMainConfirmed = async () => {
    if (copyModalText.trim().toUpperCase() !== "REPLACE") {
      return;
    }
    setCopyModalOpen(false);
    setCopying(true);
    const slug = configSlugRef.current;
    try {
      const res = await fetch("/api/map/copy-from", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await staffMapFetchHeaders()),
        },
        credentials: "same-origin",
        body: JSON.stringify({ fromSlug: "default", toSlug: slug }),
      });
      const raw = await res.text();
      let json: {
        error?: string;
        hint?: string;
        copied?: number;
        sourceSlug?: string;
        usedFallbackFromRichestMap?: boolean;
      } = {};
      try {
        json = raw
          ? (JSON.parse(raw) as {
              error?: string;
              hint?: string;
              copied?: number;
              sourceSlug?: string;
              usedFallbackFromRichestMap?: boolean;
            })
          : {};
      } catch {
        json = { error: raw.slice(0, 200) || `Copy failed (HTTP ${res.status})` };
      }
      if (!res.ok) {
        const hint = json.hint ? `\n\n${json.hint}` : "";
        alert((json.error ?? `Copy failed (HTTP ${res.status})`) + hint);
        return;
      }
      const n = json.copied ?? 0;
      await reloadCurrentMap();
      const src = json.sourceSlug ?? "main";
      let msg =
        n === 0
          ? "Copy completed with 0 pins (unexpected). Check the main map in the editor and try again."
          : `Copied ${n} pin(s) from “${src}” into this mode.`;
      if (json.usedFallbackFromRichestMap) {
        msg +=
          `\n\nNote: slug “default” (main) had no pins in the database, so we used “${src}”—the map with the most pins. Add/save pins on “Main map (guest & member)” if you want that to be the source next time.`;
      }
      msg += "\n\nIf markers don’t show, zoom the map or switch mode and back.";
      alert(msg);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Copy failed (including refresh). Try reloading the page.");
    } finally {
      setCopying(false);
    }
  };

  const handleSave = async () => {
    if (loading) {
      alert("Still loading this map—wait a moment, then save again.");
      return;
    }
    const saveSlug = configSlugRef.current;
    if (saveSlug !== configSlug) {
      alert("Map mode changed—wait for the editor to finish loading.");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        configSlug: saveSlug,
        pois: pois.map((p, i) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          details: p.details ?? null,
          image_url: p.image_url ?? null,
          lat: p.lat,
          lng: p.lng,
          sort_order: i,
          category: p.category ?? "exhibit",
        })),
      };
      if (editingBoundary) {
        body.boundary = {
          geometry_geojson: editingBoundary,
          ...(zones[0]?.id ? { zoneId: zones[0].id } : {}),
        };
      }

      if (configSlugRef.current !== saveSlug) {
        alert("Map mode changed before save finished. Reload and try again.");
        return;
      }

      const res = await fetch("/api/map/edit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(await staffMapFetchHeaders()),
        },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const raw = await res.text();
      let result: { error?: string } = {};
      try {
        result = raw ? (JSON.parse(raw) as { error?: string }) : {};
      } catch {
        alert(`Save failed: bad response (HTTP ${res.status}). ${raw.slice(0, 120)}`);
        return;
      }
      if (!res.ok || result.error) {
        alert("Save failed: " + (result.error ?? `HTTP ${res.status}`));
        return;
      }
      try {
        await reloadCurrentMap();
        alert(`Saved (${saveSlug} map only).`);
      } catch (re) {
        alert(
          `Saved (${saveSlug}), but the map could not refresh: ${re instanceof Error ? re.message : "unknown error"}. Reload the page.`
        );
      }
      setBoundaryMode(false);
    } catch (e) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (addPinMode) {
      setAddPinAt({ lat, lng });
      setNewPinName("");
      setNewPinDesc("");
      setNewPinDetails("");
      setNewPinImageUrl("");
    }
  };

  const confirmAddPin = () => {
    if (!addPinAt || !newPinName.trim()) return;
    const newPoi: Poi = {
      id: `new-${Date.now()}`,
      name: newPinName.trim(),
      description: newPinDesc.trim() || null,
      details: newPinDetails.trim() || null,
      image_url: newPinImageUrl.trim() || null,
      lat: addPinAt.lat,
      lng: addPinAt.lng,
      sort_order: pois.length,
      category: newPinCategory,
    };
    setPois((prev) => [...prev, newPoi]);
    setAddPinAt(null);
    setNewPinName("");
    setNewPinDesc("");
    setNewPinDetails("");
    setNewPinImageUrl("");
    setAddPinMode(false);
  };

  const movePoi = (id: string, lat: number, lng: number) => {
    setPois((prev) => prev.map((p) => (p.id === id ? { ...p, lat, lng } : p)));
  };

  const removePoi = (id: string) => {
    setPois((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePoi = (id: string, updates: Partial<Poi>) => {
    setPois((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleBoundaryCreate = (e: { layer: L.Layer }) => {
    const layer = e.layer as L.Polygon;
    const latlngs = layer.getLatLngs()[0] as L.LatLng[];
    const coords = latlngs.map((ll) => [ll.lng, ll.lat] as [number, number]);
    coords.push(coords[0]);
    setEditingBoundary({ type: "Polygon", coordinates: [coords] });
    layer.remove();
  };

  const handleBoundaryEdit = (e: { layer: L.Layer }) => {
    const layer = e.layer as L.Polygon;
    const latlngs = layer.getLatLngs()[0] as L.LatLng[];
    const coords = latlngs.map((ll) => [ll.lng, ll.lat] as [number, number]);
    coords.push(coords[0]);
    setEditingBoundary({ type: "Polygon", coordinates: [coords] });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-[var(--text-muted)]">Loading map…</span>
      </div>
    );
  }

  const config = data?.config ?? { center: FALLBACK_CENTER, zoom: 16 };
  const center = (config.center ?? FALLBACK_CENTER) as [number, number];
  const zoom = config.zoom ?? 16;

  const boundaryPositions = editingBoundary
    ? (editingBoundary.coordinates[0].slice(0, -1) as [number, number][]).map(([lng, lat]) => [lat, lng] as [number, number])
    : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="relative z-[5000] shrink-0 space-y-2 border-b border-[var(--surface-border)] bg-neutral-950 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Link href="/staff/scanner" className="shrink-0 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
              ← Staff
            </Link>
            <h1 className="text-base font-semibold sm:text-lg">Map Editor</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {saving ? "Saving…" : loading ? "Loading…" : "Save"}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!supabase) return;
                await supabase.auth.signOut();
                router.push("/staff/login");
                router.refresh();
              }}
              className="text-sm text-gray-400 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-0 flex-1 basis-full items-center gap-2 text-sm sm:basis-auto sm:flex-initial">
            <span className="shrink-0 text-[var(--text-muted)]">Editing</span>
            <select
              value={configSlug}
              onChange={(e) => {
                const v = e.target.value;
                if (!isMapConfigSlug(v)) return;
                router.replace(`${pathname}?config=${encodeURIComponent(v)}`);
              }}
              className="min-w-0 flex-1 rounded border border-[var(--surface-border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--text-primary)] sm:max-w-[16rem] sm:flex-none"
            >
              {MAP_CONFIG_OPTIONS.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <Link
            href={mapConfigPreviewPath(configSlug)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm text-[var(--primary)] hover:underline"
          >
            Preview ↗
          </Link>
          {configSlug !== "default" && (
            <button
              type="button"
              onClick={openCopyFromMainModal}
              disabled={copying}
              className="shrink-0 rounded border border-amber-600/60 px-2 py-1.5 text-xs text-amber-200 hover:bg-amber-900/30 disabled:opacity-50 sm:text-sm"
            >
              {copying ? "Copying…" : "Copy from main"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="shrink-0 rounded border border-[var(--surface-border)] px-2 py-1.5 text-sm"
          >
            {sidebarOpen ? "Hide list" : `Pins (${pois.length})`}
          </button>
          <button
            type="button"
            onClick={() => {
              setAddPinMode((m) => !m);
              setBoundaryMode(false);
            }}
            className={`shrink-0 rounded-lg px-3 py-2.5 text-sm font-semibold min-h-11 ${addPinMode ? "bg-[var(--primary)] text-black" : "border-2 border-[var(--surface-border)]"}`}
          >
            {addPinMode ? "Cancel add pin" : "+ Add pin"}
          </button>
          <button
            type="button"
            onClick={() => {
              setBoundaryMode((m) => !m);
              setAddPinMode(false);
            }}
            className={`shrink-0 rounded px-3 py-1.5 text-sm font-medium ${boundaryMode ? "bg-[var(--primary)] text-black" : "border border-[var(--surface-border)]"}`}
          >
            Boundary
          </button>
        </div>
        <details className="group rounded border border-neutral-800 bg-neutral-900/80 px-2 py-1.5 text-neutral-400">
          <summary className="cursor-pointer select-none text-xs marker:text-neutral-500">
            Help: pins, copy from main, save
          </summary>
          <p className="mt-2 border-t border-neutral-800 pt-2 text-xs leading-relaxed text-neutral-400">
            Pick the map with <strong className="text-neutral-200">Editing</strong>. Tap{" "}
            <strong className="text-neutral-200">+ Add pin</strong>, then <strong className="text-neutral-200">tap the map</strong>{" "}
            to place. Scroll the <strong className="text-neutral-200">Pins</strong> list below the map to edit each pin.
            <strong className="text-neutral-200"> Save</strong> writes only this mode. On desktop, map and list are side‑by‑side.
          </p>
        </details>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        {sidebarOpen && (
          <aside className="order-2 flex min-h-0 min-w-0 flex-1 flex-col border-t border-[var(--surface-border)] bg-[var(--surface)] md:order-1 md:h-full md:w-[min(100%,20rem)] md:shrink-0 md:flex-none md:border-t-0 md:border-r">
            <div className="shrink-0 border-b border-[var(--surface-border)] px-3 py-2">
              <h2 className="text-sm font-medium text-[var(--text-primary)]">Pins ({pois.length})</h2>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                Scroll this list. Fields are below—zoom the page if the keyboard hides them.
              </p>
            </div>
            <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-3 py-3 [-webkit-overflow-scrolling:touch]">
              {pois.map((p) => (
                <li key={p.id} className="rounded border border-[var(--surface-border)] bg-[var(--bg)] p-2">
                  <div className="mb-1 flex items-center gap-1">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[p.category ?? "exhibit"] }}
                    />
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updatePoi(p.id, { name: e.target.value })}
                      className="flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm focus:border-[var(--primary)]"
                      placeholder="Name"
                    />
                  </div>
                  <select
                    value={p.category ?? "exhibit"}
                    onChange={(e) => updatePoi(p.id, { category: e.target.value })}
                    className="mb-2 w-full rounded border border-[var(--surface-border)] bg-[var(--bg)] px-2 py-1 text-xs"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <MapImageUpload
                    value={p.image_url ?? ""}
                    onChange={(url) => updatePoi(p.id, { image_url: url || null })}
                    placeholder="Photo URL or upload"
                    className="mb-1"
                  />
                  <input
                    type="text"
                    value={p.description ?? ""}
                    onChange={(e) => updatePoi(p.id, { description: e.target.value || null })}
                    placeholder="Short preview (for map popup)"
                    className="mb-1 w-full rounded border border-[var(--surface-border)] bg-[var(--bg)] px-2 py-1 text-xs"
                  />
                  <textarea
                    value={p.details ?? ""}
                    onChange={(e) => updatePoi(p.id, { details: e.target.value || null })}
                    placeholder="Full info (for detail page)"
                    rows={3}
                    className="mb-2 w-full resize-y rounded border border-[var(--surface-border)] bg-[var(--bg)] px-2 py-1 text-xs"
                  />
                  <div className="flex justify-between text-xs">
                    <button onClick={() => removePoi(p.id)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                    <span className="text-[var(--text-muted)]">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <main
          className={`relative z-0 min-h-0 w-full md:min-h-0 ${
            sidebarOpen
              ? "order-1 h-[min(42vh,320px)] shrink-0 border-b border-neutral-800 md:order-2 md:h-auto md:flex-1 md:border-b-0"
              : "flex-1"
          }`}
        >
          <MapContainer
            key={`${configSlug}-${mapRenderNonce}`}
            center={center}
            zoom={zoom}
            scrollWheelZoom
            className="h-full min-h-[200px] w-full"
            zoomControl={false}
          >
            <ZoomControl position="topright" />
            <MapClickHandler onMapClick={handleMapClick} disabled={!addPinMode || boundaryMode} />
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            {!boundaryMode && editingBoundary && boundaryPositions.length > 0 && (
              <Polygon
                positions={boundaryPositions}
                pathOptions={BOUNDARY_STYLE}
              />
            )}

            {boundaryMode && (
              <FeatureGroup>
                {editingBoundary && boundaryPositions.length > 0 && (
                  <Polygon
                    positions={boundaryPositions}
                    pathOptions={{ ...BOUNDARY_STYLE, fillOpacity: 0.35 }}
                  />
                )}
                <GeomanControls
                  options={{
                    position: "topleft",
                    drawMarker: false,
                    drawCircleMarker: false,
                    drawCircle: false,
                    drawRectangle: false,
                    drawPolyline: false,
                    drawText: false,
                    editMode: true,
                    dragMode: true,
                    cutPolygon: false,
                    removalMode: true,
                    drawPolygon: true,
                  }}
                  globalOptions={{
                    continueDrawing: false,
                    editable: true,
                  }}
                  onCreate={handleBoundaryCreate}
                  onEdit={handleBoundaryEdit}
                  onUpdate={handleBoundaryEdit}
                />
              </FeatureGroup>
            )}

            {!boundaryMode &&
              pois.map((poi) => (
                <Marker
                  key={poi.id}
                  position={[poi.lat, poi.lng]}
                  icon={getPinIcon(poi.category ?? "exhibit")}
                  draggable
                  eventHandlers={{
                    dragend(e) {
                      const pos = e.target.getLatLng();
                      movePoi(poi.id, pos.lat, pos.lng);
                    },
                  }}
                >
                  <Popup>
                    <strong>{poi.name}</strong>
                    {poi.description && <p className="text-sm text-gray-600">{poi.description}</p>}
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {addPinMode && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-[400] max-w-[90%] -translate-x-1/2 rounded-full bg-black/85 px-4 py-2.5 text-center text-sm font-medium text-white shadow-lg">
              Tap anywhere on the map to drop the pin
            </div>
          )}
        </main>
      </div>

      {copyModalOpen && (
        <div
          className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setCopyModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-amber-700/50 bg-neutral-900 p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 font-medium text-white">Copy pins from main map?</h3>
            <p className="mb-3 text-sm text-neutral-300">
              This replaces <strong>every pin</strong> on the <strong>{configSlug}</strong> map with copies from the main map.
              This cannot be undone from the app.
            </p>
            <p className="mb-2 text-xs text-amber-200/90">
              Type <span className="font-mono font-semibold">REPLACE</span> to confirm:
            </p>
            <input
              type="text"
              value={copyModalText}
              onChange={(e) => setCopyModalText(e.target.value)}
              placeholder="REPLACE"
              autoCapitalize="characters"
              autoCorrect="off"
              className="mb-4 w-full rounded-lg border border-neutral-600 bg-black px-3 py-2 text-white placeholder:text-neutral-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={runCopyFromMainConfirmed}
                disabled={copyModalText.trim().toUpperCase() !== "REPLACE" || copying}
                className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-medium text-black disabled:opacity-40"
              >
                Copy now
              </button>
              <button
                type="button"
                onClick={() => setCopyModalOpen(false)}
                className="rounded-lg border border-neutral-600 px-4 py-2 text-sm text-neutral-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {addPinAt && (
        <div
          className="fixed inset-0 z-[6200] flex flex-col justify-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-4"
          onClick={() => setAddPinAt(null)}
        >
          <div
            className="flex max-h-[min(92dvh,100%)] w-full max-w-md flex-col rounded-t-2xl border border-[var(--surface-border)] bg-[var(--surface)] shadow-xl sm:max-h-[min(88dvh,640px)] sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2 pt-4 [-webkit-overflow-scrolling:touch]">
              <h3 className="mb-3 font-medium text-[var(--text-primary)]">Add pin</h3>
              <p className="mb-3 text-xs text-[var(--text-muted)]">
                {addPinAt.lat.toFixed(5)}, {addPinAt.lng.toFixed(5)}
              </p>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Exhibit name</label>
              <input
                type="text"
                value={newPinName}
                onChange={(e) => setNewPinName(e.target.value)}
                placeholder="Name (required)"
                className="mb-3 w-full rounded border border-[var(--surface-border)] bg-[var(--bg)] px-3 py-3 text-base text-[var(--text-primary)]"
                autoFocus
                autoComplete="off"
              />
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Category</label>
              <select
                value={newPinCategory}
                onChange={(e) => setNewPinCategory(e.target.value)}
                className="mb-3 w-full rounded border border-[var(--surface-border)] bg-[var(--bg)] px-3 py-2 text-[var(--text-primary)]"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <MapImageUpload
                value={newPinImageUrl}
                onChange={setNewPinImageUrl}
                placeholder="Photo URL or upload"
                className="mb-3"
              />
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Short preview (map popup)</label>
              <input
                type="text"
                value={newPinDesc}
                onChange={(e) => setNewPinDesc(e.target.value)}
                placeholder="Short preview (for map popup)"
                className="mb-3 w-full rounded border border-[var(--surface-border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Full info (detail page)</label>
              <textarea
                value={newPinDetails}
                onChange={(e) => setNewPinDetails(e.target.value)}
                placeholder="Full info (for detail page)"
                rows={4}
                className="mb-2 w-full resize-y rounded border border-[var(--surface-border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </div>
            <div className="flex shrink-0 gap-2 border-t border-[var(--surface-border)] bg-[var(--surface)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={confirmAddPin}
                disabled={!newPinName.trim()}
                className="flex-1 rounded-lg bg-[var(--primary)] py-3 text-sm font-medium text-black disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddPinAt(null)}
                className="rounded-lg border border-[var(--surface-border)] px-4 py-3 text-sm text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
