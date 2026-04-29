"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabaseBrowser } from "@/lib/supabase/SupabaseBrowserProvider";

type OverlayConfig = {
  image_url: string;
  sw_lat: string;
  sw_lng: string;
  ne_lat: string;
  ne_lng: string;
};

const EMPTY: OverlayConfig = {
  image_url: "",
  sw_lat: "",
  sw_lng: "",
  ne_lat: "",
  ne_lng: "",
};

// Helper: rough degree offset per pixel at a given zoom level
// (Not needed for this UI, just for reference comments)

export default function MapOverlayPage() {
  const supabase = useSupabaseBrowser();
  const fileRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<OverlayConfig>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Load existing overlay config on mount
  useEffect(() => {
    fetch("/api/map?config=default")
      .then((r) => r.json())
      .then((json) => {
        const ov = json?.config?.overlay;
        if (ov) {
          setConfig({
            image_url: ov.image_url ?? "",
            sw_lat: String(ov.sw?.[0] ?? ""),
            sw_lng: String(ov.sw?.[1] ?? ""),
            ne_lat: String(ov.ne?.[0] ?? ""),
            ne_lng: String(ov.ne?.[1] ?? ""),
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/map/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json();
      if (json.url) {
        setConfig((c) => ({ ...c, image_url: json.url }));
        setMessage({ type: "ok", text: "Image uploaded. Now set the coordinates below and save." });
      } else {
        setMessage({ type: "err", text: json.error ?? "Upload failed" });
      }
    } catch {
      setMessage({ type: "err", text: "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!config.image_url) {
      setMessage({ type: "err", text: "Upload an image first." });
      return;
    }
    const sw_lat = parseFloat(config.sw_lat);
    const sw_lng = parseFloat(config.sw_lng);
    const ne_lat = parseFloat(config.ne_lat);
    const ne_lng = parseFloat(config.ne_lng);
    if ([sw_lat, sw_lng, ne_lat, ne_lng].some(isNaN)) {
      setMessage({ type: "err", text: "All four coordinate fields must be valid numbers." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch("/api/map/overlay", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ config_slug: "default", image_url: config.image_url, sw_lat, sw_lng, ne_lat, ne_lng }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessage({ type: "ok", text: "Saved! The guest map will update immediately." });
      } else {
        setMessage({ type: "err", text: json.error ?? "Save failed" });
      }
    } catch {
      setMessage({ type: "err", text: "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  const field = (label: string, hint: string, key: keyof OverlayConfig) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-[var(--text-primary)]">{label}</label>
      <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      <input
        type="text"
        inputMode="decimal"
        value={config[key]}
        onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.value }))}
        placeholder={key.includes("lat") ? "e.g. 25.6730" : "e.g. -80.2785"}
        className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none"
      />
    </div>
  );

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }}>
      <div className="px-5 pt-12 pb-3">
        <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">Map Settings</p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Garden Map Overlay</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Upload your illustrated garden map and set its position so it lines up with GPS coordinates.
        </p>
      </div>

      <div className="px-5 space-y-6 pb-10">

        {/* ── Step 1: Upload ───────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
        >
          <div>
            <p className="font-bold text-[var(--text-primary)]">Step 1 — Upload Map Image</p>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">PNG or JPG, high resolution recommended.</p>
          </div>

          {config.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.image_url}
              alt="Current overlay"
              className="w-full rounded-xl object-cover max-h-48"
            />
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full rounded-xl py-3 text-sm font-semibold transition"
            style={{
              background: "var(--background)",
              border: "1px dashed var(--surface-border)",
              color: "var(--text-primary)",
            }}
          >
            {uploading ? "Uploading…" : config.image_url ? "Replace Image" : "Choose Image File"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {/* ── Step 2: Coordinates ──────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
        >
          <div>
            <p className="font-bold text-[var(--text-primary)]">Step 2 — Set Bounding Box</p>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              These four coordinates tell the map exactly where to place your image.
              Open{" "}
              <a
                href="https://www.google.com/maps/@25.677,-80.273,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] underline"
              >
                Google Maps
              </a>{" "}
              → right-click the bottom-left corner of your image area → copy coordinates for SW,
              then repeat for the top-right corner for NE.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field("SW Latitude", "Bottom-left corner — latitude", "sw_lat")}
            {field("SW Longitude", "Bottom-left corner — longitude", "sw_lng")}
            {field("NE Latitude", "Top-right corner — latitude", "ne_lat")}
            {field("NE Longitude", "Top-right corner — longitude", "ne_lng")}
          </div>

          <div
            className="rounded-xl p-3 text-xs space-y-1"
            style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}
          >
            <p className="font-semibold text-[var(--text-primary)]">Quick reference — Fairchild approximate bounds:</p>
            <p className="text-[var(--text-muted)]">SW: 25.6730, -80.2785 &nbsp;|&nbsp; NE: 25.6820, -80.2675</p>
            <p className="text-[var(--text-muted)]">
              Start with these, save, check the guest map, then nudge the numbers until the paths line up with the GPS dot.
            </p>
          </div>
        </div>

        {/* ── Message ──────────────────────────────────────────────────── */}
        {message && (
          <div
            className="rounded-xl px-4 py-3 text-sm font-medium"
            style={{
              background: message.type === "ok" ? "#f0fdf4" : "#fef2f2",
              color: message.type === "ok" ? "#166534" : "#991b1b",
              border: `1px solid ${message.type === "ok" ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* ── Save ─────────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="w-full rounded-2xl py-4 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {saving ? "Saving…" : "Save & Update Guest Map"}
        </button>
      </div>
    </div>
  );
}
