"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PortalRole } from "@/lib/couple/types";

/* ── SVG icons (inline, no dependency) ──────────────────────────── */
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);
const WeddingIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21.7C5.4 17.5 2 13.5 2 9.5a5 5 0 0110-1 5 5 0 0110 1c0 4-3.4 8-10 12.2z" />
  </svg>
);
const TimelineIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="6" cy="18" r="2" />
    <line x1="10" y1="6" x2="20" y2="6" /><line x1="10" y1="12" x2="20" y2="12" /><line x1="10" y1="18" x2="20" y2="18" />
  </svg>
);
const VendorsIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const MessagesIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const ListIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const COUPLE_NAV = [
  { href: "/couple/dashboard", label: "Home",       Icon: HomeIcon },
  { href: "/couple/details",   label: "My Wedding", Icon: WeddingIcon },
  { href: "/couple/timeline",  label: "Timeline",   Icon: TimelineIcon },
  { href: "/couple/vendors",   label: "Vendors",    Icon: VendorsIcon },
  { href: "/couple/messages",  label: "Messages",   Icon: MessagesIcon },
  { href: "/couple/profile",   label: "Profile",    Icon: ProfileIcon },
];

const COORDINATOR_NAV = [
  { href: "/couple/coordinator", label: "Weddings", Icon: ListIcon },
  { href: "/couple/profile",     label: "Profile",  Icon: ProfileIcon },
];

export default function CoupleNav({ role }: { role: PortalRole }) {
  const pathname = usePathname() ?? "";
  const links = role === "coordinator" ? COORDINATOR_NAV : COUPLE_NAV;

  return (
    <nav
      className="shrink-0 flex items-stretch justify-around border-t pb-[env(safe-area-inset-bottom,0px)]"
      style={{
        background: "#ffffff",
        borderColor: "#e4ebe4",
        minHeight: "var(--nav-height, 56px)",
      }}
    >
      {links.map(({ href, label, Icon }) => {
        const active = pathname === href || (pathname.startsWith(href) && href !== "/couple/dashboard");
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors"
            style={{ color: active ? "#4a6741" : "#9aab9a" }}
          >
            <Icon active={active} />
            <span className="text-[10px] leading-none font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
