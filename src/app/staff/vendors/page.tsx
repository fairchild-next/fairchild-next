"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Vendor = {
  id: string;
  category_slug: string;
  category_label: string;
  category_emoji: string | null;
  name: string;
  description: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
  is_active: boolean;
};

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function StaffVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    category_slug: "catering", category_label: "Catering", category_emoji: "🍽️",
    name: "", description: "", website: "", phone: "", email: "", note: "",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vendors", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { vendors: Vendor[] };
        setVendors(d.vendors ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!form.name.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          website: form.website || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
          note: form.note || undefined,
        }),
      });
      if (res.ok) {
        await load();
        setShowAdd(false);
        setForm({ ...form, name: "", description: "", website: "", phone: "", email: "", note: "" });
      }
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(v: Vendor) {
    await fetch(`/api/admin/vendors/${v.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !v.is_active }),
    });
    setVendors((prev) => prev.map((x) => (x.id === v.id ? { ...x, is_active: !x.is_active } : x)));
  }

  async function remove(v: Vendor) {
    if (!confirm(`Remove ${v.name}?`)) return;
    await fetch(`/api/admin/vendors/${v.id}`, { method: "DELETE", credentials: "include" });
    setVendors((prev) => prev.filter((x) => x.id !== v.id));
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Vendor[]>();
    for (const v of vendors) {
      const list = map.get(v.category_slug) ?? [];
      list.push(v);
      map.set(v.category_slug, list);
    }
    return map;
  }, [vendors]);

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff/more" className="text-[var(--text-muted)]"><IconBack /></Link>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Wedding Vendors</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="text-sm font-bold text-[var(--primary)]">+ Add</button>
      </div>

      <div className="px-5 space-y-5">
        <div className="rounded-2xl px-4 py-3 text-sm text-[var(--text-muted)]"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          Preferred vendors shown to couples in the wedding portal. Hide vendors instead of deleting if you may need them again.
        </div>

        {showAdd && (
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Category slug" value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
                className="px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
              <input placeholder="Category label" value={form.category_label} onChange={(e) => setForm({ ...form, category_label: e.target.value })}
                className="px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
            </div>
            <input placeholder="Vendor name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
            <input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
            </div>
            <button onClick={handleAdd} disabled={adding || !form.name.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "var(--primary)" }}>
              {adding ? "Adding…" : "Add Vendor"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />)}</div>
        ) : (
          [...grouped.entries()].map(([slug, list]) => (
            <div key={slug} className="space-y-2">
              <p className="text-sm font-bold text-[var(--text-primary)] px-1">
                {list[0]?.category_emoji} {list[0]?.category_label}
              </p>
              {list.map((v) => (
                <div key={v.id} className="rounded-2xl p-4 flex items-start justify-between gap-3"
                  style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", opacity: v.is_active ? 1 : 0.5 }}>
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">{v.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{v.description}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => toggleActive(v)} className="text-xs font-semibold text-[var(--text-muted)]">{v.is_active ? "Hide" : "Show"}</button>
                    <button onClick={() => remove(v)} className="text-xs font-semibold text-red-500">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
