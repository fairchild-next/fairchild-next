"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { CalendarBlank, Leaf, MapPin, QrCode } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMember } from "@/lib/memberContext";
import { useKidsMode } from "@/lib/kidsModeContext";
import { useWeddingMode } from "@/lib/weddingModeContext";
import { useEventsMode } from "@/lib/eventsModeContext";
import GuestHeroDispersed from "@/components/GuestHeroDispersed";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

const MemberHome = dynamic(() => import("@/components/MemberHome"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-muted)]">Loading…</p>
    </div>
  ),
});

const KidsHome = dynamic(() => import("@/components/kids/KidsHome"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-muted)]">Loading…</p>
    </div>
  ),
});

const WeddingHome = dynamic(() => import("@/components/wedding/WeddingHome"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-muted)]">Loading…</p>
    </div>
  ),
});

const EventsHome = dynamic(() => import("@/components/events/EventsHome"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-muted)]">Loading…</p>
    </div>
  ),
});

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
  if (start === end) return s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

const GUEST_HOME_IMAGES = {
  gardenMap: "/home/garden-map.png",
  buyTickets: "/home/buy-tickets.png",
  /** Full-color ticket hero (my-tickets tile reads flat/gray on some screens) */
  wallet: "/hero-tickets.png",
} as const;

/** Fairchild plant shop — orchids collection (opens in new tab) */
const FAIRCHILD_SHOP_ORCHIDS =
  "https://orders.fairchildgarden.org/collections/all-plants/orchids";

type GuestShortcut = {
  href: string;
  label: string;
  image: string;
};

const GUEST_HOME_TOP_THREE: GuestShortcut[] = [
  { href: "/wallet", label: "My Wallet", image: GUEST_HOME_IMAGES.wallet },
  { href: "/tickets/daily", label: "Buy Tickets", image: GUEST_HOME_IMAGES.buyTickets },
  { href: "/map", label: "Garden Map", image: GUEST_HOME_IMAGES.gardenMap },
];

const QUICK_TOOLS = [
  { href: "/learn/scan", title: "Scan QR Code", Icon: QrCode },
  { href: "/tickets/events", title: "Special Events", Icon: CalendarBlank },
  { href: "/learn/plants", title: "Browse Plants", Icon: Leaf },
  { href: "/tickets", title: "Plan Your Visit", Icon: MapPin },
] as const;

export default function Home() {
  const router = useRouter();
  const { member, loading, hasSession, authReady } = useMember();
  const { isKidsMode, setKidsMode } = useKidsMode();
  const { isWeddingMode, setWeddingMode } = useWeddingMode();
  const { isEventsMode, setEventsMode } = useEventsMode();
  const [featuredEvent, setFeaturedEvent] = useState<FeaturedEvent | null>(null);

  const activateGuestMode = (mode: "kids" | "wedding" | "events") => {
    if (!authReady) return;
    if (!hasSession) {
      router.push(`/login?redirect=${encodeURIComponent("/")}`);
      return;
    }
    if (mode === "kids") {
      setWeddingMode(false);
      setEventsMode(false);
      setKidsMode(true);
    } else if (mode === "wedding") {
      setEventsMode(false);
      setKidsMode(false);
      setWeddingMode(true);
    } else {
      setEventsMode(true);
    }
  };

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

  if (!loading && member) {
    if (isKidsMode) return <KidsHome />;
    if (isEventsMode) return <EventsHome />;
    if (isWeddingMode) return <WeddingHome />;
    return <MemberHome member={member} />;
  }

  if (authReady && !loading && hasSession && !member) {
    if (isKidsMode) return <KidsHome />;
    if (isEventsMode) return <EventsHome />;
    if (isWeddingMode) return <WeddingHome />;
  }

  return (
    <div className="min-h-screen bg-[#F3EFEE]">
      {/* Hero: dispersed hours / weather / events on stock photo (refetches via /api/today) */}
      <div className="relative">
        <GuestHeroDispersed hasSession={hasSession} />
      </div>

      {/* Top actions — three equal tiles (edge-aligned with hero) */}
      <div className="mt-4 px-3 sm:px-4">
        <div className="grid grid-cols-3 gap-2">
          {GUEST_HOME_TOP_THREE.map((item) => {
            const isCta = item.label === "Buy Tickets";
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`flex flex-col overflow-hidden rounded-xl border-2 shadow-sm transition ${
                  isCta
                    ? "border-[#193521] bg-[#193521] hover:opacity-95"
                    : "border-[#6A8468] bg-white hover:border-[#5a7360]"
                }`}
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
                <div className={`flex min-h-[46px] items-center justify-center px-1 py-2.5 text-center ${isCta ? "bg-[#193521]" : "bg-white"}`}>
                  <span className={`text-xs font-semibold leading-tight line-clamp-2 ${isCta ? "text-white" : "text-black"}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick tools row (no section title) */}
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

      {/* What's Blooming — under quick tools */}
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

      {/* Mode shortcuts — pill row */}
      <div className="mt-8 border-t border-[#e8e4de] pt-6 px-3 sm:px-4">
        <div className="grid grid-cols-3 gap-2.5 font-system">
          <button
            type="button"
            onClick={() => activateGuestMode("kids")}
            className="flex min-h-[46px] min-w-0 items-center justify-center rounded-xl bg-[#d4e8d0] px-1.5 py-2 text-center text-xs font-semibold leading-snug text-[#193521] transition hover:brightness-[0.97] active:brightness-95 sm:px-2 sm:text-sm"
          >
            Kids Mode
          </button>
          <button
            type="button"
            onClick={() => activateGuestMode("events")}
            className="flex min-h-[46px] min-w-0 items-center justify-center rounded-xl bg-[#193521] px-1.5 py-2 text-center text-xs font-semibold leading-snug text-white transition hover:opacity-95 active:opacity-90 sm:px-2 sm:text-sm"
          >
            Events Mode
          </button>
          <button
            type="button"
            onClick={() => activateGuestMode("wedding")}
            className="flex min-h-[46px] min-w-0 items-center justify-center rounded-xl border border-[#e0dcd6] bg-white px-1.5 py-2 text-center text-xs font-semibold leading-snug text-[#193521] transition hover:border-[#c5c0b8] active:bg-[#fafafa] sm:px-2 sm:text-sm"
          >
            Wedding Mode
          </button>
        </div>
      </div>

      {/* Don't Miss This - single upcoming event preview (dynamic) */}
      <div className="mt-8 border-t border-[#e8e4de] pt-6 px-6 pb-10">
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
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
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
