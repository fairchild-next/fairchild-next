"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

type BloomingCard = {
  title: string;
  description: string;
  badge: string;
  image_url: string;
  link_url: string;
};

const DEFAULT_CARD: BloomingCard = {
  title: "Tropical Flower Garden",
  description: "Orchids, bromeliads & exotic blooms at their peak",
  badge: "Peak Bloom",
  image_url: "/home/browse-plans.png",
  link_url: "https://fairchildgarden.org/plants-collections/plants/orchid-collection/",
};

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
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
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

export default function StaffHomepagePage() {
  const [card, setCard] = useState<BloomingCard>(DEFAULT_CARD);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/app-config?key=blooming_card", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { value: BloomingCard | null };
        if (d.value) setCard(d.value);
      }
    } finally { setLoading(false); }
  }

  async function save() {
    if (!card.title.trim() || !card.description.trim()) {
      setError("Title and description are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/app-config", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "blooming_card", value: card }),
      });
      const d = await res.json() as { error?: string };
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(d.error ?? "Failed to save");
      }
    } finally { setSaving(false); }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload-home-image", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const d = await res.json() as { image_url?: string; error?: string };
      if (res.ok && d.image_url) {
        setCard((c) => ({ ...c, image_url: d.image_url! }));
      } else {
        setError(d.error ?? "Upload failed");
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function set(field: keyof BloomingCard, value: string) {
    setCard((c) => ({ ...c, [field]: value }));
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none";
  const inputStyle = { background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" };

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-32">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"><IconBack /></Link>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">What&apos;s Blooming</p>
        </div>
      </div>

      <div className="px-5 space-y-5">

        {/* Live preview */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Preview</p>
          <a
            href={card.link_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex overflow-hidden rounded-2xl border border-[#6A8468]/35 bg-white shadow-sm"
          >
            <div className="relative w-[44%] max-w-[200px] shrink-0 bg-[#e8e4e0]" style={{ minHeight: 96 }}>
              {card.image_url && (
                <Image
                  src={card.image_url}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="200px"
                  unoptimized
                />
              )}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-[42%] bg-gradient-to-r from-transparent to-white" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
              <p className="font-bold text-sm text-black">{card.title || "Card Title"}</p>
              <p className="mt-1 text-xs leading-snug text-black">{card.description || "Description"}</p>
              {card.badge && (
                <span className="mt-2 inline-flex w-fit rounded-full bg-[#d4e8d0] px-2.5 py-0.5 text-xs font-semibold text-[#193521]">
                  {card.badge}
                </span>
              )}
            </div>
          </a>
          <p className="text-xs text-[var(--text-muted)]">This card appears on the guest and member home pages.</p>
        </div>

        {/* Editor fields */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          <p className="text-[15px] font-bold text-[var(--text-primary)]">Card Content</p>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Title</label>
            <input type="text" value={card.title} onChange={(e) => set("title", e.target.value)}
              placeholder="Tropical Flower Garden" className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Description</label>
            <input type="text" value={card.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Orchids, bromeliads & exotic blooms at their peak" className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Badge Label</label>
            <input type="text" value={card.badge} onChange={(e) => set("badge", e.target.value)}
              placeholder="Peak Bloom" className={inputClass} style={inputStyle} />
            <p className="text-xs text-[var(--text-muted)] mt-1">Leave blank to hide the badge</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Link URL</label>
            <input type="url" value={card.link_url} onChange={(e) => set("link_url", e.target.value)}
              placeholder="https://fairchildgarden.org/…" className={inputClass} style={inputStyle} />
          </div>
        </div>

        {/* Image */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          <p className="text-[15px] font-bold text-[var(--text-primary)]">Card Image</p>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Image URL</label>
            <input type="text" value={card.image_url} onChange={(e) => set("image_url", e.target.value)}
              placeholder="/home/browse-plans.png" className={inputClass} style={inputStyle} />
            <p className="text-xs text-[var(--text-muted)] mt-1">Paste a URL or use the upload button below.</p>
          </div>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition"
            style={{ background: "var(--primary)" }}
          >
            <IconUpload /> {uploading ? "Uploading…" : "Upload Image"}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-red-700 font-medium" style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="h-4 w-32 rounded animate-pulse mx-auto" style={{ background: "var(--surface)" }} />
        )}
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3" style={{ background: "var(--background)", borderTop: "1px solid var(--surface-border)" }}>
        <button
          onClick={save}
          disabled={saving || loading}
          className="w-full py-3.5 rounded-2xl text-base font-bold text-white disabled:opacity-60 transition flex items-center justify-center gap-2"
          style={{ background: "var(--primary)" }}
        >
          {saving ? "Saving…" : saved ? <><IconCheck /> Saved — changes are live</> : "Save & Publish"}
        </button>
      </div>
    </div>
  );
}
