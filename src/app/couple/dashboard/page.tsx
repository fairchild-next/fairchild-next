"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { WeddingBooking, ChecklistItem } from "@/lib/couple/types";
import { daysUntil, formatDate, formatTime, STATUS_LABELS, STATUS_COLORS } from "@/lib/couple/types";

export default function CoupleDashboardPage() {
  const [booking, setBooking] = useState<WeddingBooking | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [bRes, cRes] = await Promise.all([
        fetch("/api/couple/booking"),
        fetch("/api/couple/checklist"),
      ]);
      const bData = await bRes.json();
      const cData = await cRes.json();
      setBooking(bData.booking ?? null);
      setChecklist(cData.items ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-400">No booking found. Contact your coordinator.</p>
      </div>
    );
  }

  const countdown = daysUntil(booking.wedding_date);
  const nextItem = checklist.find((i) => !i.completed && i.due_date);
  const incompleteCount = checklist.filter((i) => !i.completed).length;
  const completedCount = checklist.filter((i) => i.completed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-stone-700 mb-1">
          {booking.couple_name} &amp; {booking.partner_name}
        </h1>
        <span className={`inline-flex text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[booking.status]}`}>
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      {/* Countdown hero card */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: "linear-gradient(135deg, #fdf6e3 0%, #fef9ec 100%)",
          border: "1px solid #e8dfd0",
        }}
      >
        {countdown !== null ? (
          countdown > 0 ? (
            <>
              <p className="text-6xl font-serif text-amber-700 font-light">{countdown}</p>
              <p className="text-stone-500 mt-1">days until your wedding</p>
            </>
          ) : countdown === 0 ? (
            <>
              <p className="text-4xl">💍</p>
              <p className="text-2xl font-serif text-amber-700 mt-2">Today is the day!</p>
            </>
          ) : (
            <>
              <p className="text-stone-400 text-sm">Wedding date has passed</p>
              <p className="font-serif text-stone-600 mt-1">{formatDate(booking.wedding_date)}</p>
            </>
          )
        ) : (
          <p className="text-stone-400">Wedding date not yet set</p>
        )}
        {booking.wedding_date && countdown !== null && countdown > 0 && (
          <p className="text-stone-400 text-sm mt-2">{formatDate(booking.wedding_date)}</p>
        )}
      </div>

      {/* At-a-glance grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Venue", value: booking.venue ?? "TBD" },
          { label: "Package", value: booking.package ?? "TBD" },
          { label: "Guests", value: booking.guest_count != null ? String(booking.guest_count) : "TBD" },
          { label: "Ceremony", value: formatTime(booking.ceremony_time) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{ background: "#fff", border: "1px solid #e8dfd0" }}
          >
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-stone-700 font-medium text-sm leading-snug">{value}</p>
          </div>
        ))}
      </div>

      {/* Checklist progress */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#fff", border: "1px solid #e8dfd0" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-stone-700 text-lg">Checklist Progress</h2>
          <Link href="/couple/timeline" className="text-amber-700 text-xs hover:underline">
            View all →
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{
                width: checklist.length
                  ? `${(completedCount / checklist.length) * 100}%`
                  : "0%",
              }}
            />
          </div>
          <span className="text-xs text-stone-400 shrink-0">
            {completedCount}/{checklist.length} complete
          </span>
        </div>
        {nextItem ? (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-amber-500 mt-0.5">→</span>
            <div>
              <p className="text-stone-600 font-medium">{nextItem.title}</p>
              {nextItem.due_date && (
                <p className="text-stone-400 text-xs mt-0.5">Due {formatDate(nextItem.due_date)}</p>
              )}
            </div>
          </div>
        ) : incompleteCount === 0 && checklist.length > 0 ? (
          <p className="text-emerald-600 text-sm">All items complete! 🎉</p>
        ) : (
          <p className="text-stone-400 text-sm">No items yet — your coordinator will add them soon.</p>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: "/couple/messages",  label: "Messages",  emoji: "💬" },
          { href: "/couple/documents", label: "Documents", emoji: "📄" },
          { href: "/couple/vendors",   label: "Vendors",   emoji: "📋" },
        ].map(({ href, label, emoji }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl p-4 flex items-center gap-3 transition-colors hover:bg-amber-50"
            style={{ background: "#fff", border: "1px solid #e8dfd0" }}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-stone-600 font-medium text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
