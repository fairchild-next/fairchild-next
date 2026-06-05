"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarBlank, Heart, Leaf, QrCode, Smiley, Tag, Ticket } from "@phosphor-icons/react";
import type { MemberInfo } from "@/lib/memberContext";
import { useKidsMode } from "@/lib/kidsModeContext";
import { useWeddingMode } from "@/lib/weddingModeContext";
import { useEventsMode } from "@/lib/eventsModeContext";
import TodayAtFairchild from "@/components/TodayAtFairchild";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

type FeaturedEvent = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  start_date: string;
  end_date: string;
  image_url: string | null;
};

function formatEventDate(start: string, end: string): string {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (start === end)
    return s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

/** Fairchild plant shop — orchids collection */
const FAIRCHILD_SHOP_ORCHIDS =
  "https://orders.fairchildgarden.org/collections/all-plants/orchids";

const MEMBER_TOP_THREE = [
  { href: "/tickets/member", label: "Reserve Tickets", image: "/home/buy-tickets.png" },
  { href: "/tickets/my", label: "Member Card & Tickets", image: "/hero-tickets.png" },
  { href: "/map", label: "Garden Map", image: "/home/garden-map.png" },
] as const;

const QUICK_TOOLS = [
  { href: "/learn/scan", title: "Scan QR Code", Icon: QrCode },
  { href: "/tickets/events", title: "Special Events", Icon: CalendarBlank },
  { href: "/learn/plants", title: "Browse Plants", Icon: Leaf },
  { href: "/member/discounts", title: "Member Discounts", Icon: Tag },
] as const;

export default function MemberHome({ member }: { member: MemberInfo }) {
  const { setKidsMode } = useKidsMode();
  const { setWeddingMode } = useWeddingMode();
  const { setEventsMode } = useEventsMode();
  const [featuredEvent, setFeaturedEvent] = useState<FeaturedEvent | null>(null);

  function activateMode(mode: "kids" | "wedding" | "events") {
    setKidsMode(mode === "kids");
    setWeddingMode(mode === "wedding");
    setEventsMode(mode === "events");
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/events/featured?limit=1", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.events?.[0]) setFeaturedEvent(data.events[0]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!member) return null;

  const displayName = member.display_name || "Fairchild Member";

  return (
    <div className="min-h-screen bg-[#F3EFEE]">
      {/* Hero — member photo + dark overlay */}
      <div className="relative">
        <div className="relative h-[16.25rem] z-0 overflow-hidden">
          <Image
            src="/hero-member.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        {/* Profile shortcut — top right */}
        <header className="absolute top-0 right-0 z-20 flex items-center justify-end px-4 py-3">
          <Link
            href="/member/profile"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition"
            aria-label="Member profile"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </header>

        {/* Personalized welcome */}
        <div className="absolute top-0 left-0 right-0 z-10 pt-[calc(6rem+env(safe-area-inset-top,0px))] px-6 text-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">
            Welcome back, {displayName.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-sm text-white/95 drop-shadow-sm">
            Enjoy exclusive perks and benefits designed just for you.
          </p>
        </div>

        {/* Today at Fairchild — membership line + expiry preserved */}
        <div className="relative z-10 px-3 sm:px-4 -mt-18 pb-2">
          <TodayAtFairchild
            showMembershipLine
            membershipLabel={
              member.membership_type?.endsWith("Membership")
                ? member.membership_type
                : `${member.membership_type ?? "Member"} Membership`
            }
            expiresAt={member.expires_at}
          />
        </div>
      </div>

      {/* Mode switcher */}
      <div className="mt-4 px-3 sm:px-4">
        <div className="grid grid-cols-3 gap-2 font-system">
          <button
            type="button"
            onClick={() => activateMode("kids")}
            className="flex min-h-[40px] min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#d4e8d0] px-1.5 py-2 text-center text-xs font-semibold leading-snug text-[#193521] transition hover:brightness-[0.97] active:brightness-95 sm:px-2 sm:text-sm"
          >
            <Smiley size={16} weight="duotone" aria-hidden />
            Kids Mode
          </button>
          <button
            type="button"
            onClick={() => activateMode("events")}
            className="flex min-h-[40px] min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#193521] px-1.5 py-2 text-center text-xs font-semibold leading-snug text-white transition hover:opacity-95 active:opacity-90 sm:px-2 sm:text-sm"
          >
            <Ticket size={16} weight="duotone" aria-hidden />
            Events Mode
          </button>
          <button
            type="button"
            onClick={() => activateMode("wedding")}
            className="flex min-h-[40px] min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#e0dcd6] bg-white px-1.5 py-2 text-center text-xs font-semibold leading-snug text-[#193521] transition hover:border-[#c5c0b8] active:bg-[#fafafa] sm:px-2 sm:text-sm"
          >
            <Heart size={16} weight="duotone" aria-hidden />
            Wedding Mode
          </button>
        </div>
      </div>

      {/* Top actions — three image tiles */}
      <div className="mt-5 px-3 sm:px-4">
        <div className="grid grid-cols-3 gap-2">
          {MEMBER_TOP_THREE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col overflow-hidden rounded-xl border-2 border-[#6A8468] bg-white shadow-sm transition hover:border-[#5a7360]"
            >
              <div className="relative h-[92px] shrink-0 bg-[#e8e4e0]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 448px) 33vw, 180px"
                />
              </div>
              <div className="flex min-h-[46px] items-center justify-center bg-white px-1 py-2.5 text-center">
                <span className="text-xs font-semibold leading-tight text-black line-clamp-2">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick tools — 4-column icon grid */}
      <div className="mt-5 px-3 sm:px-4">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_TOOLS.map(({ href, title, Icon }) => (
            <Link
              key={href + title}
              href={href}
              className="flex min-h-[5.75rem] min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-[#e5e5e5] bg-white px-1.5 py-2.5 text-center shadow-sm transition hover:border-[#cfcfcf]"
            >
              <Icon className="shrink-0 text-[#6A8468]" size={22} weight="duotone" aria-hidden />
              <span className="font-system text-xs font-bold leading-snug text-black line-clamp-2 sm:text-[13px]">
                {title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* What's Blooming */}
      <div className="mt-8 border-t border-[#e8e4de] pt-6 px-3 sm:px-4">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-[#193521]">What&apos;s Blooming</h2>
          <a
            href={FAIRCHILD_SHOP_ORCHIDS}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 font-system text-sm font-semibold text-[#6A8468] transition hover:text-[#5a7360]"
          >
            {`See all >`}
          </a>
        </div>
        <a
          href={FAIRCHILD_SHOP_ORCHIDS}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[132px] overflow-hidden rounded-2xl border border-[#6A8468]/35 bg-white shadow-sm transition hover:border-[#6A8468]/55"
        >
          <div className="relative w-[44%] max-w-[200px] shrink-0 bg-[#e8e4e0]">
            <Image
              src="/home/browse-plans.png"
              alt=""
              fill
              className="object-cover object-center"
              sizes="200px"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-[42%] bg-gradient-to-r from-transparent to-white"
              aria-hidden
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
            <h3 className="font-system text-base font-bold text-black">Tropical Flower Garden</h3>
            <p className="font-system mt-1 text-sm leading-snug text-black">
              Orchids, bromeliads &amp; exotic blooms at their peak
            </p>
            <span className="font-system mt-3 inline-flex w-fit rounded-full bg-[#d4e8d0] px-3 py-1 text-xs font-semibold text-[#193521]">
              Peak Bloom
            </span>
          </div>
        </a>
      </div>

      {/* Don't Miss This — dynamic featured event */}
      <div className="mt-8 border-t border-[#e8e4de] pt-6 px-3 sm:px-4 pb-10">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-[#193521]">Don&apos;t Miss This</h2>
          <Link
            href="/tickets/events"
            className="font-system text-sm font-semibold text-[#6A8468] transition hover:text-[#5a7360]"
          >
            View all →
          </Link>
        </div>
        {!featuredEvent ? (
          <div className="overflow-hidden rounded-2xl border border-[#6A8468]/35 bg-white shadow-sm">
            <div className="aspect-[3/1] bg-gradient-to-br from-[#CED4C9]/40 to-transparent" />
            <div className="p-4">
              <p className="text-sm text-[#4a4a4a]">Loading events…</p>
            </div>
          </div>
        ) : (
          <Link href={`/tickets/events/${featuredEvent.slug}`} className="block">
            <div className="overflow-hidden rounded-2xl border border-[#6A8468]/35 bg-white shadow-sm transition hover:border-[#6A8468]/65">
              <div className="aspect-[3/1] relative overflow-hidden bg-gradient-to-br from-[#CED4C9]/40 to-transparent">
                {featuredEvent.image_url && (
                  <img
                    src={resolveImageUrl(featuredEvent.image_url)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-serif font-semibold text-[#193521]">{featuredEvent.name}</h3>
                <p className="mt-1 font-system text-sm text-[#4a4a4a]">
                  {formatEventDate(featuredEvent.start_date, featuredEvent.end_date)}
                </p>
                <span className="mt-3 inline-block font-system text-sm font-semibold text-[#6A8468]">
                  Learn more →
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
