"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PortalRole } from "@/lib/couple/types";

/* ── Icons ──────────────────────────────────────────────────────────────── */
function IconHome({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="#4a6741">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}

function IconCalendar({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" fill={active ? "#4a6741" : "none"} stroke={active ? "#4a6741" : "currentColor"} />
      {active ? (
        <>
          <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth={1.8} />
          <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth={1.8} />
          <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth={1.8} />
          <circle cx="8" cy="15" r="1" fill="white" stroke="none" />
          <circle cx="12" cy="15" r="1" fill="white" stroke="none" />
          <circle cx="16" cy="15" r="1" fill="white" stroke="none" />
        </>
      ) : (
        <>
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
          <circle cx="16" cy="15" r="1" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

function IconDocument({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="#4a6741">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm0 0v6h6M9 13h6M9 17h4" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="13" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconChat({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="#4a6741">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="#4a6741">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconList({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

/* ── Nav config — 5 tabs max ─────────────────────────────────────────────── */
const COUPLE_NAV = [
  { href: "/couple/dashboard", label: "Home",      Icon: IconHome },
  { href: "/couple/timeline",  label: "Timeline",  Icon: IconCalendar },
  { href: "/couple/documents", label: "Documents", Icon: IconDocument },
  { href: "/couple/messages",  label: "Messages",  Icon: IconChat },
  { href: "/couple/profile",   label: "Profile",   Icon: IconUser },
];

const COORDINATOR_NAV = [
  { href: "/couple/coordinator", label: "Weddings", Icon: IconList },
  { href: "/couple/profile",     label: "Profile",  Icon: IconUser },
];

/* ── Component ───────────────────────────────────────────────────────────── */
export default function CoupleNav({ role }: { role: PortalRole }) {
  const pathname = usePathname() ?? "";
  const links = role === "coordinator" ? COORDINATOR_NAV : COUPLE_NAV;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(100vw, 28rem)",
        background: "#ffffff",
        borderTop: "1px solid #e4ebe4",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "calc(62px + env(safe-area-inset-bottom, 0px))",
        zIndex: 50,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-around",
      }}
    >
      {links.map(({ href, label, Icon }) => {
        const active =
          pathname === href ||
          (href !== "/couple/dashboard" &&
           href !== "/couple/coordinator" &&
           pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              flex: 1,
              color: active ? "#4a6741" : "#8a9e8a",
              paddingTop: 6,
              paddingBottom: 4,
              textDecoration: "none",
            }}
          >
            <Icon active={active} />
            <span style={{
              fontSize: 10,
              lineHeight: 1,
              fontWeight: active ? 700 : 500,
              letterSpacing: 0,
            }}>
              {label}
            </span>
            {/* Active indicator dot */}
            {active && (
              <span style={{
                width: 4, height: 4,
                borderRadius: "50%",
                background: "#4a6741",
                marginTop: -1,
              }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
