"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { WeddingBooking } from "@/lib/couple/types";
import { daysUntil, formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/couple/types";

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function CoordinatorDashboardPage() {
  const [bookings, setBookings] = useState<WeddingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newCouple, setNewCouple] = useState("");
  const [newPartner, setNewPartner] = useState("");
  const [newDate, setNewDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/couple/booking");
      const data = await res.json() as { bookings?: WeddingBooking[]; error?: string };
      setBookings(data.bookings ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newCouple.trim() || !newPartner.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/couple/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: "__new__",
          couple_name: newCouple.trim(),
          partner_name: newPartner.trim(),
          wedding_date: newDate || null,
          status: "inquiry",
        }),
      });
      // The PATCH route requires an existing booking ID — use the admin direct insert instead
      // For now we surface a clear note; a dedicated POST endpoint can be added when needed.
      if (!res.ok) {
        setCreateError("To create a new booking, add the couple directly in Supabase and return here.");
      } else {
        const d = await res.json() as { booking?: WeddingBooking };
        if (d.booking) setBookings((prev) => [...prev, d.booking!]);
        setShowCreate(false);
        setNewCouple(""); setNewPartner(""); setNewDate("");
      }
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  const upcoming = bookings.filter((b) => {
    const d = daysUntil(b.wedding_date);
    return d !== null && d >= 0;
  });
  const thisMonth = upcoming.filter((b) => {
    const d = daysUntil(b.wedding_date);
    return d !== null && d <= 31;
  });
  const active = bookings.filter((b) => b.status !== "complete");

  const filtered = statusFilter === "all"
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-700 mb-1">All Weddings</h1>
          <p className="text-stone-400 text-sm">Coordinator view — manage all bookings</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white shrink-0"
          style={{ background: "#5c4a2a" }}
        >
          <IconPlus />
          New
        </button>
      </div>

      {/* New booking form */}
      {showCreate && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "#fff", border: "1px solid #e8dfd0" }}
        >
          <p className="font-serif text-stone-700 text-lg">New booking</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wide">Partner 1</label>
              <input
                type="text"
                value={newCouple}
                onChange={(e) => setNewCouple(e.target.value)}
                placeholder="First & Last name"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-stone-700 focus:outline-none border"
                style={{ borderColor: "#e8dfd0", background: "#fdf9f4" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wide">Partner 2</label>
              <input
                type="text"
                value={newPartner}
                onChange={(e) => setNewPartner(e.target.value)}
                placeholder="First & Last name"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-stone-700 focus:outline-none border"
                style={{ borderColor: "#e8dfd0", background: "#fdf9f4" }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1 uppercase tracking-wide">Wedding date <span className="font-normal">(optional)</span></label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-stone-700 focus:outline-none border"
              style={{ borderColor: "#e8dfd0", background: "#fdf9f4" }}
            />
          </div>
          {createError && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">{createError}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={!newCouple.trim() || !newPartner.trim() || creating}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition"
              style={{ background: "#5c4a2a" }}
            >
              {creating ? "Creating…" : "Create Booking"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setCreateError(null); }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-500 border"
              style={{ borderColor: "#e8dfd0" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active",      value: active.length },
          { label: "This month",  value: thisMonth.length },
          { label: "Total",       value: bookings.length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl p-4 text-center"
            style={{ background: "#fff", border: "1px solid #e8dfd0" }}
          >
            <p className="text-2xl font-serif text-amber-700">{value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      {bookings.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(["all", "inquiry", "contract_signed", "planning", "confirmed", "complete"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                statusFilter === s
                  ? "bg-amber-700 text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Bookings list */}
      {bookings.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "#fff", border: "1px solid #e8dfd0" }}
        >
          <p className="text-4xl mb-3">💍</p>
          <p className="text-stone-400 text-sm">No bookings yet.</p>
          <p className="text-stone-300 text-xs mt-1">Use the New button above to start a booking, or add one directly in Supabase.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl py-8 text-center"
          style={{ background: "#fff", border: "1px solid #e8dfd0" }}
        >
          <p className="text-stone-400 text-sm">No bookings match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const countdown = daysUntil(booking.wedding_date);
            return (
              <Link
                key={booking.id}
                href={`/couple/coordinator/${booking.id}`}
                className="block rounded-2xl p-5 hover:shadow-md transition-shadow"
                style={{ background: "#fff", border: "1px solid #e8dfd0" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-stone-700 text-lg">
                      {booking.couple_name} &amp; {booking.partner_name}
                    </h3>
                    <p className="text-stone-400 text-sm mt-0.5">
                      {formatDate(booking.wedding_date)}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[booking.status]}`}>
                    {STATUS_LABELS[booking.status]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-stone-400">
                  {booking.venue && <span>📍 {booking.venue}</span>}
                  {booking.package && <span>📦 {booking.package}</span>}
                  {booking.guest_count != null && <span>👥 {booking.guest_count} guests</span>}
                  {countdown !== null && countdown >= 0 && (
                    <span className={`font-medium ${countdown <= 14 ? "text-amber-600" : "text-stone-400"}`}>
                      {countdown === 0 ? "Today! 🎉" : `${countdown} days away`}
                    </span>
                  )}
                  {!booking.couple_user_id && (
                    <span className="text-amber-600">⚠ No account linked</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
