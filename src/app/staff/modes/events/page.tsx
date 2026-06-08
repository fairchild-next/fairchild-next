"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type EventOption = {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

type EventsModeConfig = {
  active: boolean;
  featured_event_slug: string | null;
};

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
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

function formatDateRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const e = new Date(end + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return start === end ? e : `${s} – ${e}`;
}

export default function StaffEventsModeTogglePage() {
  const [config, setConfig] = useState<EventsModeConfig>({ active: true, featured_event_slug: null });
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [cfgRes, evRes] = await Promise.all([
        fetch("/api/admin/app-config?key=events_mode", { credentials: "include" }),
        fetch("/api/admin/events", { credentials: "include" }),
      ]);
      if (cfgRes.ok) {
        const d = await cfgRes.json() as { value: EventsModeConfig | null };
        if (d.value) setConfig(d.value);
      }
      if (evRes.ok) {
        const d = await evRes.json() as { events: EventOption[] };
        setEvents(d.events ?? []);
      }
    } finally { setLoading(false); }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/app-config", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "events_mode", value: config }),
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

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff/more" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"><IconBack /></Link>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Events Mode</p>
        </div>
      </div>

      <div className="px-5 space-y-5">

        {/* What is Events Mode */}
        <div className="rounded-2xl px-4 py-3 text-sm text-[var(--text-muted)]"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          Events Mode shows a special mode button on the homepage and enables event-specific ticketing.
          Turn it on when a major event is approaching, select the featured event below, and save.
        </div>

        {/* Toggle */}
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-[var(--text-primary)]">Events Mode</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {config.active ? "On — events button visible to guests" : "Off — events button hidden from guests"}
              </p>
            </div>
            <button
              onClick={() => setConfig((c) => ({ ...c, active: !c.active }))}
              className="w-14 h-8 rounded-full relative transition-colors"
              style={{ background: config.active ? "var(--primary)" : "var(--surface-border)" }}
              aria-label={config.active ? "Turn off Events Mode" : "Turn on Events Mode"}
            >
              <span
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform"
                style={{ left: config.active ? "calc(100% - 28px)" : "4px" }}
              />
            </button>
          </div>
        </div>

        {/* Featured event picker */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          <div>
            <p className="text-[15px] font-bold text-[var(--text-primary)]">Featured Event</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              The event whose ticketing appears when guests enter Events Mode.
            </p>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--background)" }} />)}
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((ev) => {
                const isFeatured = config.featured_event_slug === ev.slug;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, featured_event_slug: ev.slug }))}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition"
                    style={{
                      background: isFeatured ? "#d4e8d0" : "var(--background)",
                      border: `1px solid ${isFeatured ? "var(--primary)" : "var(--surface-border)"}`,
                    }}
                  >
                    {isFeatured && <span className="text-[#193521]"><IconCheck /></span>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{ev.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{formatDateRange(ev.start_date, ev.end_date)}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${ev.is_active ? "text-[#193521] bg-[#d4e8d0]" : "text-[var(--text-muted)] bg-[var(--surface)]"}`}>
                      {ev.is_active ? "Live" : "Draft"}
                    </span>
                  </button>
                );
              })}
              {events.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-3">
                  No events yet.{" "}
                  <Link href="/staff/events" className="text-[var(--primary)] font-semibold">Create one →</Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Preview */}
        {config.active && config.featured_event_slug && (
          <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: "#d4e8d0", border: "1px solid #6A8468" }}>
            <p className="font-bold text-[#193521] mb-0.5">Ready</p>
            <p className="text-[#193521]/80">
              Events Mode is on. The homepage will show the Events button pointing to <strong>{config.featured_event_slug}</strong>.
              Guests who enter Events Mode will be able to buy tickets for this event.
            </p>
          </div>
        )}

        {!config.active && (
          <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <p className="font-bold text-[var(--text-primary)] mb-0.5">Events Mode is off</p>
            <p className="text-[var(--text-muted)]">The Events button is hidden on the homepage. Turn it on when an event is coming up.</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-red-700 font-medium" style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
            {error}
          </div>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl text-base font-bold text-white disabled:opacity-60 transition flex items-center justify-center gap-2"
          style={{ background: "var(--primary)" }}
        >
          {saving ? "Saving…" : saved ? <><IconCheck /> Saved!</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
