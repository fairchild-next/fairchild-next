"use client";

import { useEffect, useState, useCallback } from "react";
import type { ChecklistItem, WeddingBooking } from "@/lib/couple/types";
import { formatDate, daysUntil } from "@/lib/couple/types";

type Filter = "all" | "upcoming" | "complete";

/** Returns how many days before the wedding this due_date falls */
function daysBeforeWedding(dueDate: string, weddingDate: string): number {
  const due     = new Date(dueDate + "T00:00:00");
  const wedding = new Date(weddingDate + "T00:00:00");
  return Math.round((wedding.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

function getPhaseLabel(daysLeft: number): string {
  if (daysLeft > 365) return "12+ Months Out";
  if (daysLeft > 270) return "9–12 Months Out";
  if (daysLeft > 180) return "6–9 Months Out";
  if (daysLeft > 60)  return "2–6 Months Out";
  if (daysLeft > 21)  return "3–8 Weeks Out";
  if (daysLeft > 0)   return "Final 3 Weeks";
  return "Day Of";
}

const PHASE_ORDER = [
  "12+ Months Out",
  "9–12 Months Out",
  "6–9 Months Out",
  "2–6 Months Out",
  "3–8 Weeks Out",
  "Final 3 Weeks",
  "Day Of",
  "No Due Date",
];

type DueStatus = { label: string; color: string; bg: string };

function getDueStatus(item: ChecklistItem): DueStatus | null {
  if (item.completed) {
    const d = item.completed_at ? new Date(item.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
    return { label: d ? `Completed ${d}` : "Completed", color: "#4a6741", bg: "#e8efe6" };
  }
  if (!item.due_date) return null;
  const d = daysUntil(item.due_date);
  if (d === null) return null;
  if (d < 0)  return { label: `Due ${formatDate(item.due_date)} · Overdue`, color: "#c44", bg: "#fdeaea" };
  if (d === 0) return { label: "Due today", color: "#9a7020", bg: "#fdf6e3" };
  return { label: `Due ${formatDate(item.due_date)}`, color: "#9a7020", bg: "#fdf6e3" };
}

export default function TimelinePage() {
  const [booking, setBooking]   = useState<WeddingBooking | null>(null);
  const [items, setItems]       = useState<ChecklistItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<Filter>("all");

  const load = useCallback(async () => {
    const [bRes, cRes] = await Promise.all([
      fetch("/api/couple/booking"),
      fetch("/api/couple/checklist"),
    ]);
    setBooking((await bRes.json()).booking ?? null);
    setItems((await cRes.json()).items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(item: ChecklistItem) {
    const res = await fetch("/api/couple/checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, completed: !item.completed }),
    });
    const data = await res.json();
    if (data.item) setItems((p) => p.map((i) => (i.id === item.id ? data.item : i)));
  }

  const completed = items.filter((i) => i.completed).length;
  const overdue   = items.filter((i) => !i.completed && i.due_date && (daysUntil(i.due_date) ?? 0) < 0).length;
  const inProgress = items.length - completed;

  const filtered = filter === "upcoming"
    ? items.filter((i) => !i.completed)
    : filter === "complete"
    ? items.filter((i) => i.completed)
    : items;

  // Group by phase
  const grouped = new Map<string, ChecklistItem[]>();
  for (const item of filtered) {
    let phase = "No Due Date";
    if (item.due_date && booking?.wedding_date) {
      const dbw = daysBeforeWedding(item.due_date, booking.wedding_date);
      phase = getPhaseLabel(dbw);
    }
    if (!grouped.has(phase)) grouped.set(phase, []);
    grouped.get(phase)!.push(item);
  }

  // Sort phases in logical order
  const sortedPhases = Array.from(grouped.keys()).sort(
    (a, b) => PHASE_ORDER.indexOf(a) - PHASE_ORDER.indexOf(b)
  );

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#2a3d2a" }}>Wedding Checklist</h1>
      </div>

      {/* ── Stats row ───────────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="flex justify-around px-4 pb-3">
          {[
            { value: completed,  label: "Complete",    color: "#4a6741" },
            { value: inProgress, label: "In progress", color: "#9a7020" },
            { value: overdue,    label: "Overdue",      color: "#c44444" },
          ].map(({ value, label, color }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-serif font-light" style={{ color }}>{value}</p>
              <p className="text-xs" style={{ color: "#9aab9a" }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter tabs ─────────────────────────────────────────── */}
      <div className="flex px-4 mb-3 border-b" style={{ borderColor: "#e4ebe4" }}>
        {([["all", "All tasks"], ["upcoming", "Upcoming"], ["complete", "Complete"]] as [Filter, string][]).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-2 text-xs font-semibold border-b-2 transition-colors mr-1"
            style={filter === f
              ? { borderColor: "#4a6741", color: "#2a3d2a" }
              : { borderColor: "transparent", color: "#9aab9a" }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="mx-4 rounded-2xl bg-white shadow-sm p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#e8efe6" }}>
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "#5a6e5a" }}>No milestones yet</p>
          <p className="text-xs mt-1" style={{ color: "#9aab9a" }}>Your coordinator will add items as planning begins.</p>
        </div>
      )}

      {/* ── Grouped items ───────────────────────────────────────── */}
      <div className="px-4 pb-6 space-y-1">
        {sortedPhases.map((phase) => {
          const phaseItems = grouped.get(phase)!;
          // Calculate due date header subtitle
          const dueDates = phaseItems.filter((i) => i.due_date).map((i) => i.due_date!);
          const latestDue = dueDates.length ? dueDates.sort().at(-1) : null;

          return (
            <div key={phase}>
              {/* Phase header */}
              <div className="flex items-baseline gap-2 pt-4 pb-2">
                <p className="text-xs font-bold tracking-wider uppercase" style={{ color: "#9aab9a" }}>
                  {phase}
                </p>
                {latestDue && (
                  <p className="text-xs" style={{ color: "#b4c4b4" }}>
                    · Due by {formatDate(latestDue)}
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2">
                {phaseItems.map((item) => {
                  const dueStatus = getDueStatus(item);
                  return (
                    <div key={item.id} className="rounded-2xl bg-white shadow-sm p-4 flex gap-3">
                      <button
                        onClick={() => toggle(item)}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                        style={{
                          background: item.completed ? "#4a6741" : "transparent",
                          borderColor: item.completed ? "#4a6741" : "#c4d4c4",
                        }}
                        aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                      >
                        {item.completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold leading-snug"
                          style={{
                            color: item.completed ? "#9aab9a" : "#2a3d2a",
                            textDecoration: item.completed ? "line-through" : "none",
                          }}
                        >
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs leading-relaxed mt-1" style={{ color: "#7a8a7a" }}>
                            {item.description}
                          </p>
                        )}
                        {dueStatus && (
                          <span
                            className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2"
                            style={{ background: dueStatus.bg, color: dueStatus.color }}
                          >
                            {dueStatus.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
