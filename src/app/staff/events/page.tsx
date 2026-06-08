"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Event = {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_festival: boolean;
  image_url: string | null;
  sort_order: number;
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
function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const e = new Date(end + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return start === end ? e : `${s} – ${e}`;
}

export default function StaffEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // New event form state
  const [newName, setNewName] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { events: Event[] };
        setEvents(d.events ?? []);
      }
    } finally { setLoading(false); }
  }

  async function toggleActive(event: Event) {
    setTogglingId(event.id);
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !event.is_active }),
      });
      if (res.ok) {
        setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, is_active: !e.is_active } : e));
      }
    } finally { setTogglingId(null); }
  }

  async function handleCreate() {
    if (!newName.trim() || !newStartDate || !newEndDate) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, start_date: newStartDate, end_date: newEndDate }),
      });
      const d = await res.json() as { event?: Event; error?: string };
      if (res.ok && d.event) {
        router.push(`/staff/events/${d.event.id}`);
      } else {
        setCreateError(d.error ?? "Failed to create event");
      }
    } finally { setCreating(false); }
  }

  const active = events.filter((e) => e.is_active);
  const inactive = events.filter((e) => !e.is_active);

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"><IconBack /></Link>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Events</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white transition"
          style={{ background: "var(--primary)" }}
        >
          <IconPlus /> New
        </button>
      </div>

      <div className="px-5 space-y-5">

        {/* New event form */}
        {showNewForm && (
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <p className="text-[15px] font-bold text-[var(--text-primary)]">New Event</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Event Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mango Festival 2027"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Start Date</label>
                  <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">End Date</label>
                  <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--background)", border: "1px solid var(--surface-border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
            </div>
            {createError && <p className="text-sm text-red-600 font-medium">{createError}</p>}
            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={!newName.trim() || !newStartDate || !newEndDate || creating}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition"
                style={{ background: "var(--primary)" }}>
                {creating ? "Creating…" : "Create & Edit"}
              </button>
              <button onClick={() => { setShowNewForm(false); setNewName(""); setNewStartDate(""); setNewEndDate(""); setCreateError(null); }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-muted)]"
                style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        ) : (
          <>
            {/* Active events */}
            {active.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-1">Active — visible to guests</p>
                {active.map((event) => (
                  <EventRow key={event.id} event={event} toggling={togglingId === event.id} onToggle={() => toggleActive(event)} />
                ))}
              </div>
            )}

            {/* Inactive events */}
            {inactive.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-1 mt-2">Inactive — hidden from guests</p>
                {inactive.map((event) => (
                  <EventRow key={event.id} event={event} toggling={togglingId === event.id} onToggle={() => toggleActive(event)} />
                ))}
              </div>
            )}

            {events.length === 0 && (
              <div className="py-10 text-center text-[var(--text-muted)] text-sm">
                No events yet. Tap + New to create your first event.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EventRow({ event, toggling, onToggle }: { event: Event; toggling: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
      {/* Active toggle */}
      <button
        onClick={onToggle}
        disabled={toggling}
        className="shrink-0 w-10 h-6 rounded-full relative transition-colors disabled:opacity-50"
        style={{ background: event.is_active ? "var(--primary)" : "var(--surface-border)" }}
        aria-label={event.is_active ? "Deactivate event" : "Activate event"}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
          style={{ left: event.is_active ? "calc(100% - 22px)" : "2px" }}
        />
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--text-primary)] truncate">{event.name}</p>
        <p className="text-xs text-[var(--text-muted)]">{formatDateRange(event.start_date, event.end_date)}</p>
      </div>

      {/* Edit link */}
      <Link
        href={`/staff/events/${event.id}`}
        className="text-[var(--primary)] transition-opacity active:opacity-50"
      >
        <IconChevron />
      </Link>
    </div>
  );
}
