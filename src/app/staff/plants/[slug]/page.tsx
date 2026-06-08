"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

type Plant = {
  id: string;
  slug: string;
  common_name: string;
  scientific_name: string;
  description: string | null;
  did_you_know: string | null;
  image_url: string | null;
  plant_type: string | null;
  location: string | null;
  characteristics: string[];
  sort_order: number;
};

const PLANT_TYPES = ["Tree", "Palm", "Flower", "Shrub", "Vine", "Orchid", "Bromeliad", "Fern", "Grass", "Cactus", "Other"];
const LOCATIONS = ["Palm Grove", "Rainforest Exhibit", "Butterfly Garden", "Mast Tree Forest", "Sunken Garden", "Arboretum", "Main Path", "Entrance", "Other"];

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">{label}</label>
      {hint && <p className="text-xs text-[var(--text-muted)] mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none";
const inputStyle = { background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" } as React.CSSProperties;

export default function StaffPlantEditorPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit fields
  const [commonName, setCommonName] = useState("");
  const [sciName, setSciName] = useState("");
  const [description, setDescription] = useState("");
  const [didYouKnow, setDidYouKnow] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [plantType, setPlantType] = useState("");
  const [location, setLocation] = useState("");
  const [characteristics, setCharacteristics] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => { void load(); }, [slug]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plants", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { plants: Plant[] };
        const p = d.plants.find((x) => x.slug === slug) ?? null;
        if (p) {
          setPlant(p);
          setCommonName(p.common_name);
          setSciName(p.scientific_name);
          setDescription(p.description ?? "");
          setDidYouKnow(p.did_you_know ?? "");
          setImageUrl(p.image_url ?? "");
          setPlantType(p.plant_type ?? "");
          setLocation(p.location ?? "");
          setCharacteristics((p.characteristics ?? []).join(", "));
          setSortOrder(p.sort_order);
        }
      }
    } finally { setLoading(false); }
  }

  async function save() {
    if (!plant) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/plants/${slug}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          common_name: commonName.trim(),
          scientific_name: sciName.trim(),
          description: description.trim() || null,
          did_you_know: didYouKnow.trim() || null,
          image_url: imageUrl.trim() || null,
          plant_type: plantType.trim() || null,
          location: location.trim() || null,
          characteristics: characteristics.split(",").map((s) => s.trim()).filter(Boolean),
          sort_order: sortOrder,
        }),
      });
      const d = await res.json() as { plant?: Plant; error?: string };
      if (res.ok) {
        setPlant(d.plant!);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(d.error ?? "Failed to save");
      }
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    const res = await fetch(`/api/admin/plants/${slug}`, { method: "DELETE", credentials: "include" });
    if (res.ok) router.push("/staff/plants");
    else setError("Failed to delete plant");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/plants/${slug}/upload-image`, { method: "POST", credentials: "include", body: form });
      const d = await res.json() as { image_url?: string; error?: string };
      if (res.ok && d.image_url) setImageUrl(d.image_url);
      else setError(d.error ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
        <div className="px-5 pt-12 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />)}
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center space-y-3 px-5">
          <p className="text-[var(--text-primary)] font-semibold">Plant not found</p>
          <Link href="/staff/plants" className="text-sm text-[var(--primary)] font-semibold">← Back to Plants</Link>
        </div>
      </div>
    );
  }

  const card = "rounded-2xl p-5 space-y-4";
  const cardStyle = { background: "var(--surface)", border: "1px solid var(--surface-border)" };

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-32">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff/plants" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"><IconBack /></Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Plants Database</p>
          <p className="text-xl font-bold text-[var(--text-primary)] truncate">{plant.common_name}</p>
          <p className="text-xs text-[var(--text-muted)] italic">{plant.scientific_name}</p>
        </div>
      </div>

      <div className="px-5 space-y-5">

        {/* Image */}
        <div className={card} style={cardStyle}>
          <p className="text-[15px] font-bold text-[var(--text-primary)]">Photo</p>
          <div className="relative rounded-xl overflow-hidden bg-[var(--background)]" style={{ aspectRatio: "16/9" }}>
            {imageUrl ? (
              <Image src={imageUrl} alt={plant.common_name} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">🌿</div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "var(--primary)" }}
            >
              <IconUpload /> {uploading ? "Uploading…" : "Upload Photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Or paste image URL</label>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/stock/plant.png" className={inputClass} style={inputStyle} />
          </div>
        </div>

        {/* Names */}
        <div className={card} style={cardStyle}>
          <p className="text-[15px] font-bold text-[var(--text-primary)]">Names</p>
          <Field label="Common Name">
            <input type="text" value={commonName} onChange={(e) => setCommonName(e.target.value)} className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Scientific Name">
            <input type="text" value={sciName} onChange={(e) => setSciName(e.target.value)} className={inputClass} style={inputStyle} />
          </Field>
        </div>

        {/* Classification */}
        <div className={card} style={cardStyle}>
          <p className="text-[15px] font-bold text-[var(--text-primary)]">Classification</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plant Type">
              <select value={plantType} onChange={(e) => setPlantType(e.target.value)} className={inputClass} style={inputStyle}>
                <option value="">— select —</option>
                {PLANT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Garden Location">
              <select value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} style={inputStyle}>
                <option value="">— select —</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Characteristics" hint="Comma-separated: e.g. flowering, tropical, edible">
            <input type="text" value={characteristics} onChange={(e) => setCharacteristics(e.target.value)}
              placeholder="flowering, tropical, edible" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Sort Order" hint="Lower = shown first in Browse Plants">
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              min={0} max={999} className={inputClass} style={inputStyle} />
          </Field>
        </div>

        {/* Descriptions */}
        <div className={card} style={cardStyle}>
          <p className="text-[15px] font-bold text-[var(--text-primary)]">Descriptions</p>
          <Field label="Main Description" hint="Shown on the plant detail page.">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
              placeholder="Describe this plant's appearance, origin, and significance…"
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none" style={inputStyle} />
          </Field>
          <Field label="Did You Know?" hint="Fun fact — shown in the kids-friendly Learn section.">
            <textarea value={didYouKnow} onChange={(e) => setDidYouKnow(e.target.value)} rows={4}
              placeholder="An exciting fact that will wow young visitors…"
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none" style={inputStyle} />
          </Field>
        </div>

        {/* Danger zone */}
        <div className={card} style={{ ...cardStyle, border: "1px solid #fca5a5" }}>
          <p className="text-[15px] font-bold text-red-600">Danger Zone</p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 transition"
              style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}
            >
              <IconTrash /> Delete Plant
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-700 font-medium">This will permanently remove the plant from the database. Are you sure?</p>
              <div className="flex gap-3">
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "#dc2626" }}>Yes, Delete</button>
                <button onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)]"
                  style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-red-700 font-medium" style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
            {error}
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3" style={{ background: "var(--background)", borderTop: "1px solid var(--surface-border)" }}>
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl text-base font-bold text-white disabled:opacity-60 transition flex items-center justify-center gap-2"
          style={{ background: "var(--primary)" }}
        >
          {saving ? "Saving…" : saved ? <><IconCheck /> Saved!</> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
