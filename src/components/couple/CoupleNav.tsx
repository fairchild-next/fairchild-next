"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House, Heart, CalendarCheck, UsersThree, ChatCircle, User, ListBullets,
} from "@phosphor-icons/react";
import type { PortalRole } from "@/lib/couple/types";

const COUPLE_NAV = [
  { href: "/couple/dashboard", label: "Home",       Icon: House },
  { href: "/couple/details",   label: "My Wedding", Icon: Heart },
  { href: "/couple/timeline",  label: "Timeline",   Icon: CalendarCheck },
  { href: "/couple/vendors",   label: "Vendors",    Icon: UsersThree },
  { href: "/couple/messages",  label: "Messages",   Icon: ChatCircle },
  { href: "/couple/profile",   label: "Profile",    Icon: User },
];

const COORDINATOR_NAV = [
  { href: "/couple/coordinator", label: "Weddings", Icon: ListBullets },
  { href: "/couple/profile",     label: "Profile",  Icon: User },
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
            <Icon size={22} weight={active ? "fill" : "regular"} />
            <span className="text-[10px] leading-none font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
