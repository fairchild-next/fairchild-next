"use client";

import { useEffect, useState, useCallback } from "react";
import type { ChecklistItem } from "@/lib/couple/types";
import { formatDate, daysUntil } from "@/lib/couple/types";

type StatusStyle = { dot: string; badge: string; badgeText: string; label: string };

function getStatus(item: ChecklistItem): StatusStyle {
  if (item.completed) return { dot: "#4a6741", badge: "#e8efe6", badgeText: "#4a6741",  label: "Complete" };
  if (!item.due_date)  return { dot: "#c4d4c4", badge: "#f0f3ee", badgeText: "#9aab9a",  label: "Upcoming" };
  const d = daysUntil(item.due_date);
  if (d === null) return  { dot: "#c4d4c4", badge: "#f0f3ee", badgeText: "#9aab9a",  label: "Upcoming" };
  if (d < 0)      return  { dot: "#d95555", badge: "#fdeaea", badgeText: "#c44444",  label: "Overdue" };
  if (d === 0)    return  { dot: "#d4a843", badge: "#fdf6e3", badgeText: "#9a7020",  label: "Today" };
  if (d <= 14)    return  { dot: "#d4a843", badge: "#fdf6e3", badgeText: "#9a7020",  label: `${d}d left` };
  return                  { dot: "#6aaed6", badge: "#e8f3fb", badgeText: "#2a6a9a",  label: "Upcoming" };
}

export default function TimelinePage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/couple/checklist");
    setItems((await res.json()).items ?? []);
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

  const pending   = items.filter((i) => !i.completed);
  const done      = items.filter((i) => i.completed);
  const displayed = filter === "pending" ? pending : filter === "done" ? done : items;

  const progress = items.length ? Math.round((done.length / items.length) * 100) : 0;

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>

      {/* Header */}
      <div className="px-4 pt-5 pb-2">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#2a3d2a" }}>Timeline</h1>
        <p className="text-sm mt-0.5" style={{ color: "#9aab9a" }}>
          {pending.length} remaining · {done.length} of {items.length} complete
        </p>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="px-4 mb-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#dde6dd" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "#4a6741" }} />
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 px-4 mb-3">
        {(["all", "pending", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors"
            style={filter === f
              ? { background: "#4a6741", color: "#fff" }
              : { background: "#fff", color: "#7a8a7a", border: "1.5px solid #e4ebe4" }}
          >
            {f === "all" ? "All" : f === "pending" ? "To Do" : "Done"}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="mx-4 rounded-2xl bg-white shadow-sm p-8 text-center">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm" style={{ color: "#9aab9a" }}>
            No milestones yet. Your coordinator will add them soon.
          </p>
        </div>
      )}

      {/* Checklist items */}
      <div className="px-4 space-y-2.5 pb-4">
        {displayed.map((item) => {
          const st = getStatus(item);
          return (
            <div key={item.id} className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="flex items-start gap-3 p-4">
                {/* Tap-to-complete circle */}
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
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p
                      className="text-sm font-semibold leading-snug"
                      style={{ color: item.completed ? "#9aab9a" : "#2a3d2a", textDecoration: item.completed ? "line-through" : "none" }}
                    >
                      {item.title}
                    </p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: st.badge, color: st.badgeText }}
                    >
                      {st.label}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs leading-relaxed" style={{ color: "#7a8a7a" }}>{item.description}</p>
                  )}
                  {item.due_date && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: st.dot }} />
                      <p className="text-[11px]" style={{ color: "#9aab9a" }}>Due {formatDate(item.due_date)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* All done state */}
        {!loading && filter !== "done" && pending.length === 0 && items.length > 0 && (
          <div className="rounded-2xl p-5 text-center shadow-sm" style={{ background: "#e8efe6" }}>
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-serif font-semibold" style={{ color: "#4a6741" }}>All items complete!</p>
            <p className="text-xs mt-1" style={{ color: "#6a8a6a" }}>Your coordinator will add next steps as planning continues.</p>
          </div>
        )}
      </div>
    </div>
  );
}
