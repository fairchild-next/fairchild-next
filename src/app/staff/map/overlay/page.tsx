"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";

const OverlayEditorMap = dynamic(() => import("./OverlayEditorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span style={{ color: "#4a4a4a" }}>Loading map…</span>
    </div>
  ),
});

type Bounds = { sw: [number, number]; ne: [number, number] };

const DEFAULT_BOUNDS: Bounds = {
  sw: [25.6730, -80.2785],
  ne: [25.6820, -80.2675],
};

export default function MapOverlayPage() {
  const supabase = useSupabaseBrowserClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [bounds, setBounds] = useState<Bounds>(DEFAULT_BOUNDS);
  const [opacity, setOpacity] = useState(0.7);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Load existing overlay config on mount
  useEffect(() => {
    fetch("/api/map?config=default")
      .then((r) => r.json())
      .then((json) => {
        const ov = json?.config?.overlay;
        if (ov?.image_url) {
          setImageUrl(ov.image_url);
          setBounds({ sw: ov.sw, ne: ov.ne });
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
      const session = supabase ? (await supabase.auth.getSession()).data.session : null;
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
        setImageUrl(json.url);
        setMessage({ type: "ok", text: "Image uploaded — now drag the corner handles to position it." });
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
    if (!imageUrl) {
      setMessage({ type: "err", text: "Upload an image first." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const session = supabase ? (await supabase.auth.getSession()).data.session : null;
      const token = session?.access_token;
      const res = await fetch("/api/map/overlay", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          config_slug: "default",
          image_url: imageUrl,
          sw_lat: bounds.sw[0],
          sw_lng: bounds.sw[1],
          ne_lat: bounds.ne[0],
          ne_lng: bounds.ne[1],
        }),
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

  return (
    <div
      className="flex flex-col"
      style={{ height: "100%", minHeight: 0, background: "#F3EFEE", color: "#193521" }}
    >
      {/* ── Header ── */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "#F8F8F8", borderColor: "#e5e0d8" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/staff" className="text-sm" style={{ color: "#4a4a4a" }}>
            ← Staff
          </Link>
          <h1 className="text-base font-semibold">Map Overlay Editor</h1>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !imageUrl}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "#6A8468" }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div
        className="shrink-0 flex items-center gap-4 px-4 py-2 border-b flex-wrap"
        style={{ background: "#F8F8F8", borderColor: "#e5e0d8" }}
      >
        {/* Upload */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg px-3 py-1.5 text-sm font-medium border"
          style={{ borderColor: "#e5e0d8", background: "white", color: "#193521" }}
        >
          {uploading ? "Uploading…" : imageUrl ? "Replace Image" : "Upload Map Image"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

        {/* Opacity */}
        {imageUrl && (
          <label className="flex items-center gap-2 text-sm" style={{ color: "#4a4a4a" }}>
            Overlay opacity
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-28 accent-[#6A8468]"
            />
            <span className="tabular-nums w-8">{Math.round(opacity * 100)}%</span>
          </label>
        )}

        {/* Instructions */}
        {imageUrl && (
          <p className="text-xs" style={{ color: "#4a4a4a" }}>
            Drag the <strong>NW / NE / SW / SE</strong> corner handles to fit the image over the garden.
          </p>
        )}

        {!imageUrl && (
          <p className="text-xs" style={{ color: "#4a4a4a" }}>
            Upload your illustrated garden map to get started.
          </p>
        )}
      </div>

      {/* ── Message ── */}
      {message && (
        <div
          className="shrink-0 px-4 py-2 text-sm font-medium"
          style={{
            background: message.type === "ok" ? "#f0fdf4" : "#fef2f2",
            color: message.type === "ok" ? "#166534" : "#991b1b",
            borderBottom: "1px solid",
            borderColor: message.type === "ok" ? "#bbf7d0" : "#fecaca",
          }}
        >
          {message.text}
        </div>
      )}

      {/* ── Map ── */}
      <div className="min-h-0 flex-1">
        <OverlayEditorMap
          imageUrl={imageUrl}
          bounds={bounds}
          opacity={opacity}
          onChange={setBounds}
        />
      </div>
    </div>
  );
}
