"use client";

import { useEffect, useState, useCallback } from "react";
import type { ChecklistItem } from "@/lib/couple/types";
import { formatDate, daysUntil } from "@/lib/couple/types";

function getItemStyle(item: ChecklistItem): { bar: string; badge: string; badgeText: string } {
  if (item.completed) return { bar: "#4a6741", badge: "#e8efe6", badgeText: "#4a6741" };
  if (!item.due_date)  return { bar: "#d4dcd4", badge: "#f0f3ee", badgeText: "#9aab9a" };
  const d = daysUntil(item.due_date);
  if (d === null)  return { bar: "#d4dcd4", badge: "#f0f3ee",  badgeText: "#9aab9a" };
  if (d < 0)       return { bar: "#e05a5a", badge: "#fdeaea",  badgeText: "#c44" };
  if (d <= 14)     return { bar: "#d4a843", badge: "#fdf6e3",  badgeText: "#9a7020" };
  return           { bar: "#6aaed6", badge: "#e8f3fb",  badgeText: "#2a6a9a" };
}

function getBadgeLabel(item: ChecklistItem): string | null {
  if (item.completed) return "Done";
  if (!item.due_date) return null;
  const d = daysUntil(item.due_date);
  if (d === null) return null;
  if (d < 0)  return "Overdue";
  if (d === 0) return "Today";
  if (d <= 14) return `${d}d left`;
  return "Upcoming";
}

export default function TimelinePage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/couple/checklist");
    const data = await res.json();
    setItems(data.items ?? []);
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

  const pending = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#2a3d2a" }}>Timeline</h1>
        <p className="text-sm mt-0.5" style={{ color: "#9aab9a" }}>
          {pending.length} remaining · {done.length} complete
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="mx-4 rounded-2xl p-8 bg-white text-center shadow-sm">
          <p className="text-[#9aab9a] text-sm">No milestones yet. Your coordinator will add them soon.</p>
        </div>
      )}

      <div className="px-4 space-y-2.5 pb-4">
        {[...pending, ...done].map((item) => {
          const style = getItemStyle(item);
          const badge = getBadgeLabel(item);
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-white shadow-sm overflow-hidden flex"
            >
              {/* Color bar */}
              <div className="w-1 shrink-0" style={{ background: style.bar }} />
              <div className="flex items-start gap-3 px-4 py-3.5 flex-1">
                {/* Checkbox */}
                <button
                  onClick={() => toggle(item)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                  style={{
                    background: item.completed ? "#4a6741" : "transparent",
                    borderColor: item.completed ? "#4a6741" : "#c4d4c4",
                  }}
                  aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {item.completed && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-snug ${item.completed ? "line-through" : ""}`}
                       style={{ color: item.completed ? "#9aab9a" : "#2a3d2a" }}>
                      {item.title}
                    </p>
                    {badge && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: style.badge, color: style.badgeText }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs mt-0.5" style={{ color: "#7a8a7a" }}>{item.description}</p>
                  )}
                  {item.due_date && (
                    <p className="text-xs mt-1" style={{ color: "#9aab9a" }}>Due {formatDate(item.due_date)}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
