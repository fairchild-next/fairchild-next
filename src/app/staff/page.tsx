"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// ── Inline SVG icons ────────────────────────────────────────────────────────

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
function IconHelp() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.5} />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// ── Quick-action cards ───────────────────────────────────────────────────────

const ACTIONS = [
  { label: "Update Homepage Content", icon: IconHome,     href: "/staff/homepage" },
  { label: "Update Events Content",   icon: IconCalendar, href: "/staff/events" },
  { label: "Update Garden Map",       icon: IconMap,      href: "/staff/map/edit" },
  { label: "Map Overlay Image",       icon: IconMap,      href: "/staff/map/overlay" },
  { label: "Update Learn Content",    icon: IconBook,     href: "/staff/learn" },
];

// ── Mode edit buttons ────────────────────────────────────────────────────────

const MODES = [
  {
    label: "EDIT\nKids Mode",
    href: "/staff/modes/kids",
    style: { background: "#d4e6d0", color: "#193521" },
  },
  {
    label: "EDIT\nEvents Mode",
    href: "/staff/modes/events",
    style: { background: "#193521", color: "#fff" },
  },
  {
    label: "EDIT\nWedding Mode",
    href: "/staff/modes/wedding",
    style: { background: "#fff", color: "#193521", border: "1px solid #e5e0d8" },
  },
];

// ── Utility cards ────────────────────────────────────────────────────────────

const UTILS = [
  { label: "Push Notifications", icon: IconBell,   href: "/staff/notifications" },
  { label: "Help Center",        icon: IconHelp,   href: "/staff/help" },
  { label: "Safety Settings",    icon: IconShield, href: "/staff/safety" },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function StaffHomePage() {
  const [staffName, setStaffName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setStaffName(user.email.split("@")[0]);
    })();
  }, []);

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div>
          <p className="text-xs text-[var(--text-muted)] font-medium leading-tight tracking-wide uppercase">Fairchild</p>
          <p className="text-xl font-bold text-[var(--text-primary)] leading-tight">Staff Portal</p>
        </div>

        {/* View-mode selector — shows staff what mode guests see */}
        <button
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
        >
          All Modes
          <IconChevron />
        </button>
      </div>

      <div className="px-5 space-y-5 pb-6">

        {/* ── Welcome + hero photo ─────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
            Welcome back{staffName ? `, ${staffName}` : ""}!
          </h2>
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: 200 }}>
            <Image
              src="/hero-welcome.png"
              alt="Fairchild Garden"
              fill
              className="object-cover object-center"
              priority
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45) 100%)" }}
            />
            <div className="absolute bottom-3 inset-x-0 flex justify-center">
              <button
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
                style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}
              >
                <IconEdit />
                Edit Home Photo
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick action cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-start gap-4 rounded-2xl p-5 transition-opacity active:opacity-70"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "var(--background)", color: "var(--primary)" }}
              >
                <Icon />
              </div>
              <span className="text-[15px] font-bold text-[var(--text-primary)] leading-snug">{label}</span>
            </Link>
          ))}
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <hr style={{ borderColor: "var(--surface-border)" }} />

        {/* ── Mode edit buttons ─────────────────────────────────────────── */}
        <div className="flex gap-2">
          {MODES.map(({ label, href, style }) => (
            <Link
              key={href}
              href={href}
              className="flex-1 rounded-xl py-2.5 text-center text-xs font-bold leading-tight transition-opacity active:opacity-70"
              style={style}
            >
              {label.split("\n").map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </Link>
          ))}
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <hr style={{ borderColor: "var(--surface-border)" }} />

        {/* ── Utility cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {UTILS.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl py-4 px-2 text-center transition-opacity active:opacity-70"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
            >
              <span style={{ color: "var(--primary)" }}>
                <Icon />
              </span>
              <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">{label}</span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
