"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Plant = {
  id: string;
  slug: string;
  common_name: string;
  scientific_name: string;
  image_url: string | null;
  plant_type: string | null;
  location: string | null;
};

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function StaffPlantsPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCommonName, setNewCommonName] = useState("");
  const [newSciName, setNewSciName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plants", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { plants: Plant[] };
        setPlants(d.plants ?? []);
      }
    } finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!newCommonName.trim() || !newSciName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/plants", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ common_name: newCommonName, scientific_name: newSciName }),
      });
      const d = await res.json() as { plant?: { slug: string }; error?: string };
      if (res.ok && d.plant) {
        router.push(`/staff/plants/${d.plant.slug}`);
      } else {
        setCreateError(d.error ?? "Failed to create plant");
      }
    } finally { setCreating(false); }
  }

  const filtered = plants.filter(
    (p) =>
      !search ||
      p.common_name.toLowerCase().includes(search.toLowerCase()) ||
      p.scientific_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"><IconBack /></Link>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Plants Database</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "var(--primary)" }}
        >
          <IconPlus /> Add Plant
        </button>
      </div>

      <div className="px-5 space-y-4">

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          <span className="text-[var(--text-muted)]"><IconSearch /></span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or species…"
            className="flex-1 text-sm bg-transparent focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* New plant form */}
        {showNewForm && (
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <p className="text-[15px] font-bold text-[var(--text-primary)]">New Plant</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Common Name</label>
                <input type="text" value={newCommonName} onChange={(e) => setNewCommonName(e.target.value)}
                  placeholder="e.g. Mango Tree" autoFocus
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Scientific Name</label>
                <input type="text" value={newSciName} onChange={(e) => setNewSciName(e.target.value)}
                  placeholder="e.g. Mangifera indica"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
            {createError && <p className="text-sm text-red-600 font-medium">{createError}</p>}
            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={!newCommonName.trim() || !newSciName.trim() || creating}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "var(--primary)" }}>
                {creating ? "Creating…" : "Create & Edit"}
              </button>
              <button onClick={() => { setShowNewForm(false); setNewCommonName(""); setNewSciName(""); setCreateError(null); }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)]"
                style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Plant list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-[var(--text-muted)] text-sm">
                {search ? `No plants matching "${search}"` : "No plants yet. Tap + Add Plant to get started."}
              </div>
            ) : (
              filtered.map((plant) => (
                <Link
                  key={plant.slug}
                  href={`/staff/plants/${plant.slug}`}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-opacity active:opacity-70"
                  style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
                >
                  {/* Thumbnail */}
                  <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-[#e8e4e0] relative">
                    {plant.image_url ? (
                      <Image src={plant.image_url} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[var(--text-muted)] text-lg">🌿</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{plant.common_name}</p>
                    <p className="text-xs text-[var(--text-muted)] italic truncate">{plant.scientific_name}</p>
                    {(plant.plant_type || plant.location) && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{[plant.plant_type, plant.location].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>

                  <IconChevron />
                </Link>
              ))
            )}
          </div>
        )}

        <p className="text-xs text-center text-[var(--text-muted)] pt-1">
          {filtered.length} plant{filtered.length !== 1 ? "s" : ""}
          {search ? ` matching "${search}"` : " in database"}
        </p>
      </div>
    </div>
  );
}
