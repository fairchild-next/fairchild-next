"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TicketType = {
  id: string;
  name: string;
  price: number;
  price_peak: number | null;
  is_active: boolean;
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function StaffDailyPricingPage() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeekday, setEditWeekday] = useState("");
  const [editPeak, setEditPeak] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWeekday, setNewWeekday] = useState("");
  const [newPeak, setNewPeak] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ticket-types", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { ticket_types: TicketType[] };
        setTicketTypes(d.ticket_types ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function savePrices(id: string) {
    const price = parseFloat(editWeekday);
    const price_peak = parseFloat(editPeak);
    if (isNaN(price) || isNaN(price_peak)) return;
    const res = await fetch(`/api/admin/ticket-types/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price, price_peak }),
    });
    if (res.ok) {
      setTicketTypes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, price, price_peak } : t))
      );
      setEditingId(null);
    }
  }

  async function toggleActive(ticket: TicketType) {
    const res = await fetch(`/api/admin/ticket-types/${ticket.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !ticket.is_active }),
    });
    if (res.ok) {
      setTicketTypes((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, is_active: !t.is_active } : t))
      );
    }
  }

  async function handleAdd() {
    const price = parseFloat(newWeekday);
    const price_peak = parseFloat(newPeak || newWeekday);
    if (!newName.trim() || isNaN(price)) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ticket-types", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), price, price_peak }),
      });
      const d = await res.json() as { ticket_type?: TicketType; error?: string };
      if (res.ok && d.ticket_type) {
        setTicketTypes((prev) => [...prev, d.ticket_type!]);
        setShowAdd(false);
        setNewName("");
        setNewWeekday("");
        setNewPeak("");
      } else {
        setError(d.error ?? "Failed to add ticket type");
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff/more" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
          <IconBack />
        </Link>
        <div>
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Daily Ticket Pricing</p>
        </div>
      </div>

      <div className="px-5 space-y-5">
        <div className="rounded-2xl px-4 py-3 text-sm text-[var(--text-muted)]"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          Prices for scheduled and flex daily admission. Weekday = Mon–Fri; Peak = Sat–Sun. Event tickets are edited inside each event.
        </div>

        <button
          onClick={() => setShowAdd((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white"
          style={{ background: "var(--primary)" }}
        >
          <IconPlus /> Add Ticket Type
        </button>

        {showAdd && (
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Adult (18–64)"
              className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Weekday ($)</label>
                <input type="number" step="0.01" value={newWeekday} onChange={(e) => setNewWeekday(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Peak ($)</label>
                <input type="number" step="0.01" value={newPeak} onChange={(e) => setNewPeak(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button onClick={handleAdd} disabled={adding || !newName.trim() || !newWeekday}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "var(--primary)" }}>
              {adding ? "Adding…" : "Add Ticket Type"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        ) : ticketTypes.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)] py-8">No daily ticket types yet.</p>
        ) : (
          <div className="space-y-2">
            {ticketTypes.map((t) => (
              <div key={t.id} className="rounded-2xl p-4 space-y-3"
                style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", opacity: t.is_active ? 1 : 0.55 }}>
                {editingId === t.id ? (
                  <>
                    <p className="font-bold text-[var(--text-primary)]">{t.name}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">Weekday ($)</label>
                        <input type="number" step="0.01" value={editWeekday} onChange={(e) => setEditWeekday(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">Peak ($)</label>
                        <input type="number" step="0.01" value={editPeak} onChange={(e) => setEditPeak(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => savePrices(t.id)} className="flex-1 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "var(--primary)" }}>Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl text-sm text-[var(--text-muted)]" style={{ border: "1px solid var(--surface-border)" }}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--text-primary)]">{t.name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Weekday ${t.price.toFixed(2)} · Peak ${(t.price_peak ?? t.price).toFixed(2)}
                      </p>
                    </div>
                    <button onClick={() => { setEditingId(t.id); setEditWeekday(String(t.price)); setEditPeak(String(t.price_peak ?? t.price)); }}
                      className="text-xs font-semibold text-[var(--primary)] px-2 py-1 rounded-lg" style={{ border: "1px solid var(--primary)" }}>
                      Edit
                    </button>
                    <button onClick={() => toggleActive(t)} className="text-xs font-semibold text-[var(--text-muted)] px-2 py-1 rounded-lg" style={{ border: "1px solid var(--surface-border)" }}>
                      {t.is_active ? "Hide" : "Show"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
