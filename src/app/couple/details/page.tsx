"use client";

import { useEffect, useState } from "react";
import type { WeddingBooking } from "@/lib/couple/types";
import { formatDate, formatTime } from "@/lib/couple/types";

export default function DetailsPage() {
  const [booking, setBooking] = useState<WeddingBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [guestCount, setGuestCount] = useState("");
  const [cateringNotes, setCateringNotes] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/couple/booking");
      const data = await res.json();
      const b: WeddingBooking = data.booking;
      setBooking(b);
      if (b) {
        setGuestCount(b.guest_count != null ? String(b.guest_count) : "");
        setCateringNotes(b.catering_notes ?? "");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/couple/booking", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_count: guestCount ? parseInt(guestCount, 10) : null,
        catering_notes: cateringNotes || null,
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

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

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-stone-700">My Wedding Details</h1>

      {/* Venue & Event info */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e8dfd0" }}>
        <div className="px-5 py-3" style={{ background: "#fdf6e3" }}>
          <h2 className="font-serif text-stone-600 text-base">Event Information</h2>
        </div>
        <div className="divide-y" style={{ background: "#fff", borderColor: "#f0e9dc" }}>
          {[
            { label: "Venue",           value: booking.venue },
            { label: "Package",         value: booking.package },
            { label: "Wedding Date",    value: formatDate(booking.wedding_date) },
            { label: "Ceremony",        value: formatTime(booking.ceremony_time) },
            { label: "Cocktail Hour",   value: formatTime(booking.cocktail_time) },
            { label: "Reception",       value: formatTime(booking.reception_time) },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-3.5 flex justify-between gap-4">
              <span className="text-stone-400 text-sm">{label}</span>
              <span className="text-stone-700 text-sm font-medium text-right">{value || "TBD"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editable fields */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e8dfd0" }}>
        <div className="px-5 py-3" style={{ background: "#fdf6e3" }}>
          <h2 className="font-serif text-stone-600 text-base">Guest Count &amp; Catering</h2>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4" style={{ background: "#fff" }}>
          <div>
            <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1.5">
              Estimated Guest Count
            </label>
            <input
              type="number"
              min="1"
              max="2000"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              placeholder="e.g. 150"
              className="w-full rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-amber-300"
              style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
            />
          </div>
          <div>
            <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1.5">
              Dietary &amp; Catering Notes
            </label>
            <textarea
              value={cateringNotes}
              onChange={(e) => setCateringNotes(e.target.value)}
              rows={4}
              placeholder="Any dietary restrictions, allergy info, or catering requests…"
              className="w-full rounded-lg px-3 py-2 text-sm text-stone-700 resize-none outline-none focus:ring-2 focus:ring-amber-300"
              style={{ border: "1px solid #e8dfd0", background: "#faf7f2" }}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {saved && <span className="text-emerald-600 text-sm">Saved ✓</span>}
          </div>
        </form>
      </div>

      {/* Contact */}
      <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e8dfd0" }}>
        <h2 className="font-serif text-stone-600 text-base mb-3">Questions?</h2>
        <p className="text-stone-400 text-sm">
          Reach your coordinator any time at{" "}
          <a href="mailto:weddings@fairchildgarden.org" className="text-amber-700 hover:underline">
            weddings@fairchildgarden.org
          </a>
          {" "}or use the{" "}
          <a href="/couple/messages" className="text-amber-700 hover:underline">Messages tab</a>.
        </p>
      </div>
    </div>
  );
}
