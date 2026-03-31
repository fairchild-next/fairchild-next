"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, Ticket, MapTrifold, BookOpen, User, GameController, Medal, Images, Info } from "@phosphor-icons/react"
import { useMember } from "@/lib/memberContext"
import { useKidsMode } from "@/lib/kidsModeContext"
import { useWeddingMode } from "@/lib/weddingModeContext"
import { useEventsMode } from "@/lib/eventsModeContext"
import { getCurrentEventAccentColor } from "@/lib/clients/fairchild/eventModeContent"

export default function BottomNav() {
  const pathname = usePathname() ?? ""
  const { member, hasSession, authReady } = useMember()
  const { isKidsMode } = useKidsMode()
  const { isWeddingMode } = useWeddingMode()
  const { isEventsMode } = useEventsMode()
  const eventAccent = getCurrentEventAccentColor()
  const profileHref = member ? "/member/profile" : "/account"
  const profileNavActive =
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname.startsWith("/member/profile")

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return pathname === path
    return pathname === path || pathname.startsWith(path + "/")
  }

  const showKidsNav = authReady && hasSession && isKidsMode
  const showEventsNav = authReady && hasSession && isEventsMode
  const showWeddingNav = authReady && hasSession && isWeddingMode

  /** Events Mode: Details = hub + detail subpages; not map or ticket hub */
  const eventsDetailsActive =
    pathname === "/learn" ||
    (pathname.startsWith("/events/") &&
      !pathname.startsWith("/events/map") &&
      !pathname.startsWith("/events/tickets"))

  const navItems = showKidsNav
    ? [
        { href: "/", label: "Home", icon: House },
        { href: "/map", label: "Map", icon: MapTrifold },
        { href: "/learn", label: "Learn", icon: GameController },
        { href: "/badges", label: "Badges", icon: Medal },
        {
          href: profileHref,
          label: "Profile",
          icon: User,
          active: profileNavActive,
        },
      ]
    : showEventsNav
    ? [
        { href: "/", label: "Home", icon: House, active: pathname === "/" },
        {
          href: "/events/tickets",
          label: "Event Tickets",
          icon: Ticket,
          active: pathname.startsWith("/events/tickets"),
        },
        {
          href: "/events/map",
          label: "Map",
          icon: MapTrifold,
          active: pathname.startsWith("/events/map"),
        },
        {
          href: "/learn",
          label: "Details",
          icon: Info,
          active: eventsDetailsActive,
        },
        {
          href: profileHref,
          label: "Profile",
          icon: User,
          active: profileNavActive,
        },
      ]
    : showWeddingNav
    ? [
        { href: "/", label: "Home", icon: House },
        { href: "/wedding/map", label: "Map", icon: MapTrifold },
        {
          href: "/learn",
          label: "Details",
          icon: Info,
          active: pathname === "/learn",
        },
        {
          href: "/wedding/gallery",
          label: "Gallery",
          icon: Images,
          active: pathname.startsWith("/wedding/gallery"),
        },
        {
          href: profileHref,
          label: "Profile",
          icon: User,
          active: profileNavActive,
        },
      ]
    : [
        { href: "/", label: "Home", icon: House },
        { href: "/tickets", label: "Tickets", icon: Ticket },
        { href: "/map", label: "Map", icon: MapTrifold },
        { href: "/learn", label: "Learn", icon: BookOpen },
        {
          href: profileHref,
          label: "Profile",
          icon: User,
          active: profileNavActive,
        },
      ]

  const navBarClass = showEventsNav
    ? "bg-white border-t border-neutral-200"
    : "border-t border-white/[0.06] bg-[#1a2f26]/98 backdrop-blur-md"

  return (
    <nav
      className={`absolute bottom-0 left-0 right-0 z-[1000] h-[var(--nav-height)] min-h-[var(--tap-target-min)] flex items-center pb-[env(safe-area-inset-bottom,0px)] ${navBarClass}`}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const active = "active" in item ? item.active : isActive(item.href)
        const eventsInactive = showEventsNav && !active
        const eventsActive = showEventsNav && active
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[var(--tap-target-min)] transition ${
              showEventsNav
                ? eventsInactive
                  ? "text-neutral-500 hover:text-neutral-800"
                  : "font-semibold"
                : active
                  ? "text-white"
                  : "text-white/80 hover:text-white"
            }`}
            style={eventsActive ? { color: eventAccent } : undefined}
          >
            <Icon size={22} weight={active ? "fill" : "regular"} />
            <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
