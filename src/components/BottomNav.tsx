"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNav() {
  const pathname = usePathname()

  const linkClasses = (path: string) =>
    `flex-1 text-center transition ${
      pathname === path
        ? "text-green-400 font-semibold"
        : "text-gray-400 hover:text-green-400"
    }`

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-800 flex items-center">
      <Link href="/" className={linkClasses("/")}>Home</Link>
      <Link href="/tickets" className={linkClasses("/tickets")}>Tickets</Link>
      <Link href="/map" className={linkClasses("/map")}>Map</Link>
      <Link href="/learn" className={linkClasses("/learn")}>Learn</Link>
      <Link href="/membership" className={linkClasses("/membership")}>Membership</Link>
    </nav>
  )
}