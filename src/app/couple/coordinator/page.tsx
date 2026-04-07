"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { WeddingBooking } from "@/lib/couple/types";
import { daysUntil, formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/couple/types";

export default function CoordinatorDashboardPage() {
  const [bookings, setBookings] = useState<WeddingBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/couple/booking");
      const data = await res.json();
      setBookings(data.bookings ?? []);
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

  const upcoming = bookings.filter((b) => {
    const d = daysUntil(b.wedding_date);
    return d !== null && d >= 0;
  });
  const thisMonth = upcoming.filter((b) => {
    const d = daysUntil(b.wedding_date);
    return d !== null && d <= 31;
  });
  const active = bookings.filter((b) => b.status !== "complete");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-700 mb-1">All Weddings</h1>
        <p className="text-stone-400 text-sm">Coordinator view — all bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active",       value: active.length },
          { label: "This month",   value: thisMonth.length },
          { label: "Total",        value: bookings.length },
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

      {/* Bookings list */}
      {bookings.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "#fff", border: "1px solid #e8dfd0" }}
        >
          <p className="text-4xl mb-3">💍</p>
          <p className="text-stone-400 text-sm">No bookings yet.</p>
          <p className="text-stone-300 text-xs mt-1">Add bookings directly in Supabase to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
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
