"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PortalRole } from "@/lib/couple/types";

// SVG icon components — inline so there's no icon-library dependency churn
function IconHome({ fill }: { fill: boolean }) {
  return fill ? (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}
function IconHeart({ fill }: { fill: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={fill ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}
function IconCalendar({ fill }: { fill: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} />
      {fill ? (
        <path d="M3 10h18M8 2v4M16 2v4" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
      ) : (
        <>
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </>
      )}
    </svg>
  );
}
function IconDocument({ fill }: { fill: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {fill ? (
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm0 0v6h6M9 13h6M9 17h4" />
      ) : (
        <>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </>
      )}
    </svg>
  );
}
function IconChat({ fill }: { fill: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
function IconUser({ fill }: { fill: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconList({ fill }: { fill: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={fill ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

const COUPLE_NAV = [
  { href: "/couple/dashboard", label: "Home",       Icon: IconHome },
  { href: "/couple/details",   label: "My Wedding", Icon: IconHeart },
  { href: "/couple/timeline",  label: "Timeline",   Icon: IconCalendar },
  { href: "/couple/documents", label: "Documents",  Icon: IconDocument },
  { href: "/couple/messages",  label: "Messages",   Icon: IconChat },
  { href: "/couple/profile",   label: "Profile",    Icon: IconUser },
];

const COORDINATOR_NAV = [
  { href: "/couple/coordinator", label: "Weddings", Icon: IconList },
  { href: "/couple/profile",     label: "Profile",  Icon: IconUser },
];

export default function CoupleNav({ role }: { role: PortalRole }) {
  const pathname = usePathname() ?? "";
  const links = role === "coordinator" ? COORDINATOR_NAV : COUPLE_NAV;

  return (
    <nav
      className="flex items-stretch justify-around border-t"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(100vw, 28rem)",
        background: "#ffffff",
        borderColor: "#e4ebe4",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "calc(56px + env(safe-area-inset-bottom, 0px))",
        zIndex: 50,
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
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
            style={{ color: active ? "#4a6741" : "#a0b4a0" }}
          >
            <Icon fill={active} />
            <span className="text-[10px] leading-none font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
