"use client";

import { useEffect, useState, useCallback } from "react";
import type { ChecklistItem } from "@/lib/couple/types";
import { formatDate, daysUntil } from "@/lib/couple/types";

function itemColor(item: ChecklistItem): string {
  if (item.completed) return "border-l-emerald-400";
  if (!item.due_date) return "border-l-stone-200";
  const days = daysUntil(item.due_date);
  if (days === null) return "border-l-stone-200";
  if (days < 0) return "border-l-red-400";
  if (days <= 14) return "border-l-amber-400";
  return "border-l-sky-300";
}

function itemBadge(item: ChecklistItem): { label: string; cls: string } | null {
  if (item.completed) return { label: "Done", cls: "bg-emerald-50 text-emerald-700" };
  if (!item.due_date) return null;
  const days = daysUntil(item.due_date);
  if (days === null) return null;
  if (days < 0) return { label: "Overdue", cls: "bg-red-50 text-red-600" };
  if (days === 0) return { label: "Due today", cls: "bg-amber-50 text-amber-700" };
  if (days <= 14) return { label: `${days}d left`, cls: "bg-amber-50 text-amber-700" };
  return { label: "Upcoming", cls: "bg-sky-50 text-sky-700" };
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
    if (data.item) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  const pending = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-700 mb-1">Your Timeline</h1>
        <p className="text-stone-400 text-sm">
          {pending.length} remaining · {done.length} complete
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { color: "bg-emerald-400", label: "Complete" },
          { color: "bg-sky-300",     label: "Upcoming" },
          { color: "bg-amber-400",   label: "Due soon" },
          { color: "bg-red-400",     label: "Overdue" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-stone-500">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {items.length === 0 && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "#fff", border: "1px solid #e8dfd0" }}
        >
          <p className="text-stone-400 text-sm">
            No milestones yet. Your coordinator will add items as planning begins.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {[...pending, ...done].map((item) => {
          const badge = itemBadge(item);
          return (
            <div
              key={item.id}
              className={`rounded-xl p-4 border-l-4 flex items-start gap-4 ${itemColor(item)}`}
              style={{ background: "#fff", border: "1px solid #e8dfd0", borderLeftWidth: 4 }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggle(item)}
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors
                  ${item.completed
                    ? "bg-emerald-400 border-emerald-400 text-white"
                    : "border-stone-300 hover:border-amber-400"
                  }
                `}
                aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
              >
                {item.completed && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-medium text-sm ${item.completed ? "line-through text-stone-400" : "text-stone-700"}`}>
                    {item.title}
                  </p>
                  {badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-stone-400 text-xs mt-1">{item.description}</p>
                )}
                {item.due_date && (
                  <p className="text-stone-400 text-xs mt-1">Due {formatDate(item.due_date)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
