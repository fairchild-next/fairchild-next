"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { WeddingBooking } from "@/lib/couple/types";
import { formatDate, formatTime } from "@/lib/couple/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: "#f0f3ee" }}>
      <span className="text-sm font-semibold" style={{ color: "#9aab9a" }}>{label}</span>
      <span className="text-sm font-semibold text-right" style={{ color: "#2a3d2a" }}>{value}</span>
    </div>
  );
}

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
    await fetch("/api/couple/booking", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_count: guestCount ? parseInt(guestCount, 10) : null,
        catering_notes: cateringNotes || null,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" style={{ background: "#f0f3ee" }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="px-4 py-20 text-center" style={{ background: "#f0f3ee" }}>
        <p style={{ color: "#9aab9a" }} className="text-sm">No booking found.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>
      {/* Venue hero */}
      <div className="relative w-full" style={{ height: 180 }}>
        <Image src="/wedding/venues-overview.png" alt="Venue" fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <p className="font-serif text-white text-lg font-bold">{booking.venue ?? "Your Venue"}</p>
          <p className="text-white/70 text-xs mt-0.5">{booking.package ?? ""}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Event info card */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <p className="font-serif text-sm font-semibold mb-1" style={{ color: "#4a6741" }}>Event Information</p>
          <Row label="Wedding Date"  value={formatDate(booking.wedding_date)} />
          <Row label="Ceremony"      value={formatTime(booking.ceremony_time)} />
          <Row label="Cocktail Hour" value={formatTime(booking.cocktail_time)} />
          <Row label="Reception"     value={formatTime(booking.reception_time)} />
          <Row label="Venue"         value={booking.venue ?? "TBD"} />
          <div className="pt-1">
            <Row label="Package" value={booking.package ?? "TBD"} />
          </div>
        </div>

        {/* Editable card */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <p className="font-serif text-sm font-semibold mb-3" style={{ color: "#4a6741" }}>Guest Count &amp; Catering</p>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#9aab9a" }}>
                Estimated Guest Count
              </label>
              <input
                type="number" min="1" max="2000"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="e.g. 150"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2"
                style={{ border: "1.5px solid #e4ebe4", background: "#f7faf7", color: "#2a3d2a" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#9aab9a" }}>
                Dietary &amp; Catering Notes
              </label>
              <textarea
                value={cateringNotes}
                onChange={(e) => setCateringNotes(e.target.value)}
                rows={4}
                placeholder="Dietary restrictions, allergy info, special requests…"
                className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:ring-2"
                style={{ border: "1.5px solid #e4ebe4", background: "#f7faf7", color: "#2a3d2a" }}
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: "#4a6741" }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              {saved && <span className="text-sm font-medium" style={{ color: "#4a6741" }}>Saved ✓</span>}
            </div>
          </form>
        </div>

        {/* Contact */}
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <p className="font-serif text-sm font-semibold mb-2" style={{ color: "#4a6741" }}>Questions?</p>
          <p className="text-sm" style={{ color: "#7a8a7a" }}>
            Reach your coordinator at{" "}
            <a href="mailto:weddings@fairchildgarden.org" className="hover:underline" style={{ color: "#4a6741" }}>
              weddings@fairchildgarden.org
            </a>
            {" "}or use the{" "}
            <a href="/couple/messages" className="hover:underline" style={{ color: "#4a6741" }}>Messages tab</a>.
          </p>
        </div>
        <div className="h-2" />
      </div>
    </div>
  );
}
