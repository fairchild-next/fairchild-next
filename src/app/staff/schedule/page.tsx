"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TimeSlot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity_remaining: number;
  is_active: boolean;
};

type AdmissionDate = {
  id: string;
  date: string;
  capacity: number;
  capacity_remaining: number;
  is_active: boolean;
};

type ScheduledAdmissionConfig = {
  time_slots_enabled: boolean;
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

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function StaffSchedulePage() {
  const [config, setConfig] = useState<ScheduledAdmissionConfig>({ time_slots_enabled: true });
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [admissionDates, setAdmissionDates] = useState<AdmissionDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotStart, setNewSlotStart] = useState("09:00");
  const [newSlotEnd, setNewSlotEnd] = useState("12:00");
  const [newSlotCapacity, setNewSlotCapacity] = useState("100");
  const [addingSlot, setAddingSlot] = useState(false);

  const [showAddDate, setShowAddDate] = useState(false);
  const [newAdmissionDate, setNewAdmissionDate] = useState("");
  const [newAdmissionCapacity, setNewAdmissionCapacity] = useState("500");
  const [addingDate, setAddingDate] = useState(false);

  const [filterDate, setFilterDate] = useState("");

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [cfgRes, slotsRes, datesRes] = await Promise.all([
        fetch("/api/admin/app-config?key=scheduled_admission", { credentials: "include" }),
        fetch("/api/admin/time-slots", { credentials: "include" }),
        fetch("/api/admin/admission-dates", { credentials: "include" }),
      ]);
      if (cfgRes.ok) {
        const d = await cfgRes.json() as { value: ScheduledAdmissionConfig | null };
        if (d.value) setConfig(d.value);
      }
      if (slotsRes.ok) {
        const d = await slotsRes.json() as { slots: TimeSlot[] };
        setSlots(d.slots ?? []);
      }
      if (datesRes.ok) {
        const d = await datesRes.json() as { dates: AdmissionDate[] };
        setAdmissionDates(d.dates ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig(next: ScheduledAdmissionConfig) {
    setSavingConfig(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/app-config", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "scheduled_admission", value: next }),
      });
      const d = await res.json() as { error?: string };
      if (res.ok) {
        setConfig(next);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(d.error ?? "Failed to save");
      }
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleAddSlot() {
    if (!newSlotDate) return;
    setAddingSlot(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/time-slots", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newSlotDate,
          start_time: newSlotStart,
          end_time: newSlotEnd,
          capacity_remaining: Number(newSlotCapacity) || 100,
        }),
      });
      const d = await res.json() as { slot?: TimeSlot; error?: string };
      if (res.ok && d.slot) {
        setSlots((prev) => [...prev, d.slot!].sort((a, b) =>
          a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time)
        ));
        setShowAddSlot(false);
        setNewSlotDate("");
      } else {
        setError(d.error ?? "Failed to add slot");
      }
    } finally {
      setAddingSlot(false);
    }
  }

  async function handleAddAdmissionDate() {
    if (!newAdmissionDate) return;
    setAddingDate(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/admission-dates", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newAdmissionDate,
          capacity: Number(newAdmissionCapacity) || 500,
        }),
      });
      const d = await res.json() as { admissionDate?: AdmissionDate; error?: string };
      if (res.ok && d.admissionDate) {
        setAdmissionDates((prev) => [...prev.filter((x) => x.date !== d.admissionDate!.date), d.admissionDate!]
          .sort((a, b) => a.date.localeCompare(b.date)));
        setShowAddDate(false);
        setNewAdmissionDate("");
      } else {
        setError(d.error ?? "Failed to add date");
      }
    } finally {
      setAddingDate(false);
    }
  }

  async function updateSlot(id: string, updates: Partial<TimeSlot>) {
    const res = await fetch(`/api/admin/time-slots/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const d = await res.json() as { slot: TimeSlot };
      setSlots((prev) => prev.map((s) => (s.id === id ? d.slot : s)));
    }
  }

  async function deleteSlot(id: string) {
    const res = await fetch(`/api/admin/time-slots/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  async function updateAdmissionDate(id: string, updates: Partial<AdmissionDate>) {
    const res = await fetch(`/api/admin/admission-dates/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const d = await res.json() as { admissionDate: AdmissionDate };
      setAdmissionDates((prev) => prev.map((x) => (x.id === id ? d.admissionDate : x)));
    }
  }

  async function deleteAdmissionDate(id: string) {
    const res = await fetch(`/api/admin/admission-dates/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setAdmissionDates((prev) => prev.filter((d) => d.id !== id));
  }

  const filteredSlots = useMemo(() => {
    if (!filterDate) return slots;
    return slots.filter((s) => s.date === filterDate);
  }, [slots, filterDate]);

  const uniqueSlotDates = useMemo(
    () => [...new Set(slots.map((s) => s.date))].sort(),
    [slots]
  );

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff/more" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
          <IconBack />
        </Link>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Daily Schedule</p>
        </div>
      </div>

      <div className="px-5 space-y-5">
        <div className="rounded-2xl px-4 py-3 text-sm text-[var(--text-muted)]"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          Manage scheduled daily admission. Turn time slots off on quiet days so guests pick a date and enter anytime during hours.
        </div>

        {/* Toggle */}
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-bold text-[var(--text-primary)]">Require time slots</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {config.time_slots_enabled
                  ? "On — guests choose a date and time"
                  : "Off — guests choose a date only (anytime entry)"}
              </p>
            </div>
            <button
              onClick={() => {
                const next = { time_slots_enabled: !config.time_slots_enabled };
                void saveConfig(next);
              }}
              disabled={savingConfig}
              className="w-14 h-8 rounded-full relative transition-colors shrink-0 disabled:opacity-50"
              style={{ background: config.time_slots_enabled ? "var(--primary)" : "var(--surface-border)" }}
            >
              <span
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all"
                style={{ left: config.time_slots_enabled ? "1.75rem" : "0.25rem" }}
              />
            </button>
          </div>
          {saved && <p className="text-xs font-semibold text-[var(--primary)] mt-3">Saved</p>}
          {error && <p className="text-xs font-semibold text-red-600 mt-3">{error}</p>}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        ) : config.time_slots_enabled ? (
          /* Time slots mode */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[var(--text-primary)]">Time slots</p>
              <button
                onClick={() => setShowAddSlot((v) => !v)}
                className="flex items-center gap-1 text-sm font-semibold text-[var(--primary)]"
              >
                <IconPlus /> Add slot
              </button>
            </div>

            {showAddSlot && (
              <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
                <input type="date" value={newSlotDate} onChange={(e) => setNewSlotDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="time" value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                  <input type="time" value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                </div>
                <input type="number" min={1} value={newSlotCapacity} onChange={(e) => setNewSlotCapacity(e.target.value)}
                  placeholder="Capacity"
                  className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                <button onClick={handleAddSlot} disabled={!newSlotDate || addingSlot}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "var(--primary)" }}>
                  {addingSlot ? "Adding…" : "Add time slot"}
                </button>
              </div>
            )}

            {uniqueSlotDates.length > 0 && (
              <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text-primary)]"
                style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
                <option value="">All dates</option>
                {uniqueSlotDates.map((d) => (
                  <option key={d} value={d}>{formatDate(d)}</option>
                ))}
              </select>
            )}

            {filteredSlots.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-6">No time slots yet.</p>
            ) : (
              <div className="space-y-2">
                {filteredSlots.map((slot) => (
                  <div key={slot.id} className="rounded-2xl p-4 space-y-3"
                    style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-bold text-[var(--text-primary)]">{formatDate(slot.date)}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        </p>
                      </div>
                      <button onClick={() => void deleteSlot(slot.id)} className="text-xs font-semibold text-red-500">Remove</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-[var(--text-muted)] shrink-0">Capacity left</label>
                      <input type="number" min={0} defaultValue={slot.capacity_remaining}
                        onBlur={(e) => void updateSlot(slot.id, { capacity_remaining: Number(e.target.value) })}
                        className="flex-1 px-3 py-2 rounded-xl text-sm"
                        style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                      <button
                        onClick={() => void updateSlot(slot.id, { is_active: !slot.is_active })}
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${slot.is_active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}
                      >
                        {slot.is_active ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Date-only mode */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[var(--text-primary)]">Open dates</p>
              <button
                onClick={() => setShowAddDate((v) => !v)}
                className="flex items-center gap-1 text-sm font-semibold text-[var(--primary)]"
              >
                <IconPlus /> Add date
              </button>
            </div>

            {showAddDate && (
              <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
                <input type="date" value={newAdmissionDate} onChange={(e) => setNewAdmissionDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                <input type="number" min={1} value={newAdmissionCapacity} onChange={(e) => setNewAdmissionCapacity(e.target.value)}
                  placeholder="Daily capacity"
                  className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                <button onClick={handleAddAdmissionDate} disabled={!newAdmissionDate || addingDate}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: "var(--primary)" }}>
                  {addingDate ? "Adding…" : "Add open date"}
                </button>
              </div>
            )}

            {admissionDates.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-6">No open dates yet.</p>
            ) : (
              <div className="space-y-2">
                {admissionDates.map((row) => (
                  <div key={row.id} className="rounded-2xl p-4 space-y-3"
                    style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-bold text-[var(--text-primary)]">{formatDate(row.date)}</p>
                        <p className="text-xs text-[var(--text-muted)]">Anytime entry on this date</p>
                      </div>
                      <button onClick={() => void deleteAdmissionDate(row.id)} className="text-xs font-semibold text-red-500">Remove</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-[var(--text-muted)] shrink-0">Capacity left</label>
                      <input type="number" min={0} defaultValue={row.capacity_remaining}
                        onBlur={(e) => void updateAdmissionDate(row.id, { capacity_remaining: Number(e.target.value) })}
                        className="flex-1 px-3 py-2 rounded-xl text-sm"
                        style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                      <button
                        onClick={() => void updateAdmissionDate(row.id, { is_active: !row.is_active })}
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${row.is_active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}
                      >
                        {row.is_active ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
