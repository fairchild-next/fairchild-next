"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { WeddingBooking } from "@/lib/couple/types";
import { STATUS_LABELS, STATUS_COLORS, formatDate } from "@/lib/couple/types";
import Image from "next/image";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [booking, setBooking] = useState<WeddingBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
      const res = await fetch("/api/couple/booking");
      const data = await res.json();
      setBooking(data.booking ?? null);
      setLoading(false);
    }
    load();
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>
      {/* Header image */}
      <div className="relative w-full" style={{ height: 140 }}>
        <Image src="/wedding/about-fairchild.png" alt="Fairchild" fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <p className="font-serif text-white text-lg font-bold">Your Wedding Account</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Account info */}
            <div className="rounded-2xl bg-white shadow-sm p-4 space-y-3">
              <p className="font-serif text-sm font-semibold" style={{ color: "#4a6741" }}>Account</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9aab9a" }}>Email</span>
                <span className="text-sm font-medium" style={{ color: "#2a3d2a" }}>{email ?? "—"}</span>
              </div>
              {booking && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9aab9a" }}>Status</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_COLORS[booking.status]}`}>
                    {STATUS_LABELS[booking.status]}
                  </span>
                </div>
              )}
            </div>

            {/* Booking info */}
            {booking && (
              <div className="rounded-2xl bg-white shadow-sm p-4 space-y-2">
                <p className="font-serif text-sm font-semibold" style={{ color: "#4a6741" }}>Your Wedding</p>
                {[
                  ["Couple", `${booking.couple_name} & ${booking.partner_name}`],
                  ["Date",   formatDate(booking.wedding_date)],
                  ["Venue",  booking.venue ?? "TBD"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-1 border-b" style={{ borderColor: "#f0f3ee" }}>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9aab9a" }}>{label}</span>
                    <span className="text-sm font-medium text-right" style={{ color: "#2a3d2a" }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Contact */}
            <div className="rounded-2xl bg-white shadow-sm p-4">
              <p className="font-serif text-sm font-semibold mb-2" style={{ color: "#4a6741" }}>Need Help?</p>
              <p className="text-sm" style={{ color: "#7a8a7a" }}>
                Contact Fairchild Events at{" "}
                <a href="mailto:weddings@fairchildgarden.org" className="hover:underline" style={{ color: "#4a6741" }}>
                  weddings@fairchildgarden.org
                </a>
              </p>
              <a
                href="tel:3056671651"
                className="block text-sm mt-1 hover:underline"
                style={{ color: "#4a6741" }}
              >
                (305) 667-1651
              </a>
            </div>

            {/* Sign out */}
            <button
              onClick={signOut}
              className="w-full py-3 rounded-2xl text-sm font-semibold transition-opacity"
              style={{ background: "#fff", color: "#c44", border: "1.5px solid #f0e4e4", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              Sign Out
            </button>
          </>
        )}
        <div className="h-2" />
      </div>
    </div>
  );
}
