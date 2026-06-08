"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// ── Icons ────────────────────────────────────────────────────────────────────

function IconScan() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
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
function IconOverlay() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
function IconTeam() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
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

// ── Quick-action cards ───────────────────────────────────────────────────────

const ACTIONS = [
  { label: "Scan Tickets",     icon: IconScan,    href: "/staff/scanner" },
  { label: "Garden Status",    icon: IconShield,  href: "/staff/garden-status" },
  { label: "Garden Map",       icon: IconMap,     href: "/staff/map/edit" },
  { label: "Map Overlay",      icon: IconOverlay, href: "/staff/map/overlay" },
  { label: "Manage Team",      icon: IconTeam,    href: "/staff/team" },
  { label: "More Tools",       icon: IconGrid,    href: "/staff/more" },
];

// ── Mode preview buttons ─────────────────────────────────────────────────────

const MODE_PREVIEWS = [
  {
    label: "PREVIEW\nKids Mode",
    href: "/?preview=kids",
    style: { background: "#d4e6d0", color: "#193521" },
  },
  {
    label: "PREVIEW\nEvents Mode",
    href: "/?preview=events",
    style: { background: "#193521", color: "#fff" },
  },
  {
    label: "PREVIEW\nWedding Mode",
    href: "/?preview=wedding",
    style: { background: "#fff", color: "#193521", border: "1px solid #e5e0d8" },
  },
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

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div>
          <p className="text-xs text-[var(--text-muted)] font-medium leading-tight tracking-wide uppercase">Fairchild</p>
          <p className="text-xl font-bold text-[var(--text-primary)] leading-tight">Staff Portal</p>
        </div>
        <Link
          href="/staff/more"
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-opacity active:opacity-70"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
        >
          All Tools
          <IconChevron />
        </Link>
      </div>

      <div className="px-5 space-y-5 pb-6">

        {/* ── Welcome + hero ─────────────────────────────────────────── */}
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
          </div>
        </div>

        {/* ── Quick actions ──────────────────────────────────────────── */}
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

        {/* ── Divider ────────────────────────────────────────────────── */}
        <hr style={{ borderColor: "var(--surface-border)" }} />

        {/* ── Utility links ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Help Center", href: "/staff/help" },
            { label: "Push Notifications", href: "/staff/notifications" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-4 py-3 rounded-2xl transition-opacity active:opacity-70"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
            >
              <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>

        <hr style={{ borderColor: "var(--surface-border)" }} />

        {/* ── Mode previews ──────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Preview Guest Modes</p>
          <div className="flex gap-2">
            {MODE_PREVIEWS.map(({ label, href, style }) => (
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
        </div>

      </div>
    </div>
  );
}
