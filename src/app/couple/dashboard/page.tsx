"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { WeddingBooking, ChecklistItem, WeddingMessage } from "@/lib/couple/types";
import { daysUntil, formatDate, formatTime } from "@/lib/couple/types";

function timeAgo(ts: string): string {
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1)    return "just now";
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

export default function CoupleDashboardPage() {
  const [booking, setBooking]     = useState<WeddingBooking | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [messages, setMessages]   = useState<WeddingMessage[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const [bRes, cRes, mRes] = await Promise.all([
        fetch("/api/couple/booking"),
        fetch("/api/couple/checklist"),
        fetch("/api/couple/messages"),
      ]);
      setBooking((await bRes.json()).booking ?? null);
      setChecklist((await cRes.json()).items ?? []);
      setMessages((await mRes.json()).messages ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" style={{ background: "#f0f3ee" }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#4a6741] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6" style={{ background: "#f0f3ee" }}>
        <p className="text-sm text-center" style={{ color: "#7a907a" }}>No booking found. Contact your coordinator.</p>
      </div>
    );
  }

  const countdown      = daysUntil(booking.wedding_date);
  const completedCount = checklist.filter((i) => i.completed).length;
  const progress       = checklist.length ? Math.round((completedCount / checklist.length) * 100) : 0;
  const nextItem       = checklist.find((i) => !i.completed);
  const latestMessage  = [...messages].reverse().find((m) => m.sender_role === "coordinator")
                         ?? messages[messages.length - 1]
                         ?? null;

  const firstNames = (() => {
    const a = booking.couple_name.split(" ")[0];
    const b = booking.partner_name?.split(" ")[0];
    return b ? `${a} & ${b}` : a;
  })();

  return (
    <div style={{ background: "#f0f3ee" }}>

      {/* ── Hero — taller so full photo is visible ──────────────── */}
      <div className="relative w-full" style={{ height: 270 }}>
        <Image
          src="/wedding/couple-hero.png"
          alt="Fairchild Garden Wedding"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Only gradient on the bottom quarter for text */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.18) 75%, rgba(0,0,0,0.62) 100%)",
          }}
        />
        {/* Message button */}
        <Link
          href="/couple/messages"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: "#4a6741" }}>
              {messages.length > 9 ? "9+" : messages.length}
            </span>
          )}
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </Link>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <p className="font-serif text-white text-xl font-bold leading-tight drop-shadow-md">
            Fairchild Garden Wedding
          </p>
          <p className="text-white/85 text-sm mt-0.5 drop-shadow">Welcome back, {firstNames}</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* ── Countdown card — celebratory ────────────────────────── */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div
            className="px-5 pt-5 pb-4 text-center"
            style={{ background: "linear-gradient(135deg, #f7fbf5 0%, #eef5ec 100%)" }}
          >
            <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: "#9aab9a" }}>
              Your wedding is in
            </p>
            {countdown !== null && countdown > 0 ? (
              <>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-7xl font-serif font-light leading-none" style={{ color: "#4a6741" }}>
                    {countdown}
                  </span>
                  <span className="text-lg font-serif mb-2" style={{ color: "#4a6741" }}>days</span>
                </div>
                <p className="text-sm font-medium mt-1" style={{ color: "#5a6e5a" }}>
                  {formatDate(booking.wedding_date)}
                </p>
              </>
            ) : countdown === 0 ? (
              <p className="text-2xl font-serif py-2" style={{ color: "#4a6741" }}>Today is the day! 💍</p>
            ) : (
              <p className="text-sm py-2" style={{ color: "#9aab9a" }}>{formatDate(booking.wedding_date)}</p>
            )}
          </div>
          {checklist.length > 0 && (
            <div className="px-5 py-3 border-t" style={{ borderColor: "#f0f3ee" }}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold" style={{ color: "#9aab9a" }}>Wedding Checklist</p>
                <p className="text-[10px] font-bold" style={{ color: "#4a6741" }}>{completedCount}/{checklist.length} complete</p>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e4ebe4" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "#4a6741" }} />
              </div>
            </div>
          )}
        </div>

        {/* ── At-a-glance grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "VENUE",    value: booking.venue ?? "TBD" },
            { label: "PACKAGE",  value: booking.package ?? "TBD" },
            { label: "GUESTS",   value: booking.guest_count != null ? `${booking.guest_count} guests` : "TBD" },
            { label: "CEREMONY", value: formatTime(booking.ceremony_time) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3.5 bg-white shadow-sm">
              <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#9aab9a" }}>{label}</p>
              <p className="font-semibold text-sm mt-1 leading-snug" style={{ color: "#2a3d2a" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Next Step ─────────────────────────────────────────────── */}
        {nextItem ? (
          <Link href="/couple/timeline">
            <div className="rounded-2xl p-4 shadow-sm" style={{ background: "#4a6741" }}>
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Next Step
                  </p>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0 mt-6">
                  <p className="text-white font-bold text-base leading-snug">{nextItem.title}</p>
                  {nextItem.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "rgba(255,255,255,0.65)" }}>{nextItem.description}</p>
                  )}
                  {nextItem.due_date && (
                    <p className="text-[11px] font-semibold mt-1.5" style={{ color: "#f0c070" }}>Due {formatDate(nextItem.due_date)}</p>
                  )}
                </div>
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 mt-6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </Link>
        ) : checklist.length > 0 ? (
          <div className="rounded-2xl p-4 flex items-center gap-3 shadow-sm" style={{ background: "#4a6741" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-white font-semibold text-sm">All checklist items complete!</p>
          </div>
        ) : null}

        {/* ── Message preview ───────────────────────────────────────── */}
        <Link href="/couple/messages">
          <div className="rounded-2xl px-4 py-3.5 bg-white shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#e8efe6" }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4a6741" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold" style={{ color: "#4a6741" }}>Fairchild Events Team</p>
                {latestMessage && (
                  <p className="text-[10px] shrink-0" style={{ color: "#9aab9a" }}>{timeAgo(latestMessage.created_at)}</p>
                )}
              </div>
              <p className="text-xs truncate mt-0.5" style={{ color: latestMessage ? "#5a6e5a" : "#9aab9a" }}>
                {latestMessage ? latestMessage.message : "No messages yet — say hello!"}
              </p>
            </div>
            {latestMessage && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#4a6741" }} />}
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="#c4d4c4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>

        {/* ── Explore ───────────────────────────────────────────────── */}
        <div className="pt-2">
          <p className="font-bold text-base mb-3" style={{ color: "#2a3d2a" }}>Explore</p>

          {/* Square-ish photo+label tiles */}
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            {[
              { href: "/couple/details",   label: "My Wedding",  img: "/wedding/venues-overview.png" },
              { href: "/couple/timeline",  label: "Timeline",    img: "/wedding/package-ceremony.png" },
              { href: "/couple/documents", label: "Documents",   img: "/wedding/additional-information.png" },
            ].map(({ href, label, img }) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col"
              >
                <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
                  <Image src={img} alt={label} fill className="object-cover" />
                </div>
                <div className="py-2 px-1.5">
                  <p className="text-[11px] font-bold text-center" style={{ color: "#2a3d2a" }}>{label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Icon tiles */}
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                href: "/couple/vendors",
                label: "Vendors",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                ),
              },
              {
                href: "/couple/details",
                label: "Floral Details",
                icon: (
                  /* Proper flower icon */
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#4a6741" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="2.5" />
                    <ellipse cx="12" cy="6.5" rx="2" ry="3" />
                    <ellipse cx="12" cy="17.5" rx="2" ry="3" />
                    <ellipse cx="6.5" cy="12" rx="3" ry="2" />
                    <ellipse cx="17.5" cy="12" rx="3" ry="2" />
                    <ellipse cx="8.1" cy="8.1" rx="2" ry="3" transform="rotate(-45 8.1 8.1)" />
                    <ellipse cx="15.9" cy="15.9" rx="2" ry="3" transform="rotate(-45 15.9 15.9)" />
                    <ellipse cx="15.9" cy="8.1" rx="2" ry="3" transform="rotate(45 15.9 8.1)" />
                    <ellipse cx="8.1" cy="15.9" rx="2" ry="3" transform="rotate(45 8.1 15.9)" />
                  </svg>
                ),
              },
              {
                href: "/couple/documents",
                label: "Upload Files",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                ),
              },
              {
                href: "/couple/gallery",
                label: "Photo Gallery",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#4a6741" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                ),
              },
            ].map(({ href, label, icon }) => (
              <Link key={label} href={href} className="rounded-2xl flex flex-col items-center justify-center gap-1.5 py-3.5 bg-white shadow-sm">
                {icon}
                <span className="text-[10px] font-semibold text-center leading-tight px-1" style={{ color: "#5a6e5a" }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
}
