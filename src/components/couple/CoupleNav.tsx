"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PortalRole } from "@/lib/couple/types";

const COUPLE_LINKS = [
  { href: "/couple/dashboard",   label: "Dashboard" },
  { href: "/couple/timeline",    label: "Timeline" },
  { href: "/couple/details",     label: "My Wedding" },
  { href: "/couple/vendors",     label: "Vendors" },
  { href: "/couple/messages",    label: "Messages" },
  { href: "/couple/documents",   label: "Documents" },
];

const COORDINATOR_LINKS = [
  { href: "/couple/coordinator", label: "All Weddings" },
];

export default function CoupleNav({ role }: { role: PortalRole }) {
  const pathname = usePathname();
  const links = role === "coordinator" ? COORDINATOR_LINKS : COUPLE_LINKS;

  return (
    <header style={{ background: "#ffffff", borderBottom: "1px solid #e8dfd0" }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Wordmark */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">💍</span>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-widest leading-none">Fairchild</p>
              <p className="font-serif text-stone-700 text-base leading-tight">
                {role === "coordinator" ? "Coordinator Portal" : "Wedding Portal"}
              </p>
            </div>
          </div>
          <a
            href="/"
            className="text-xs text-stone-400 hover:text-amber-700 transition-colors"
          >
            ← Fairchild App
          </a>
        </div>

        {/* Nav tabs */}
        <nav className="flex gap-0 overflow-x-auto -mb-px">
          {links.map(({ href, label }) => {
            const active = pathname === href || (href !== "/couple/coordinator" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`
                  text-sm px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors
                  ${active
                    ? "border-amber-500 text-amber-700 font-medium"
                    : "border-transparent text-stone-400 hover:text-stone-600 hover:border-stone-200"
                  }
                `}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
