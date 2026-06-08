"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { CalendarBlank, Heart, Leaf, MapPin, QrCode, Smiley, Ticket } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
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

type BloomingCard = {
  title: string;
  description: string;
  badge: string;
  image_url: string;
  link_url: string;
};

type EventsModeConfig = {
  active: boolean;
  featured_event_slug: string | null;
};

const DEFAULT_BLOOMING_CARD: BloomingCard = {
  title: "Tropical Flower Garden",
  description: "Orchids, bromeliads & exotic blooms at their peak",
  badge: "Peak Bloom",
  image_url: "/home/browse-plans.png",
  link_url: "https://orders.fairchildgarden.org/collections/all-plants/orchids",
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
  { href: "/tickets/daily", label: "Buy Tickets", image: GUEST_HOME_IMAGES.buyTickets },
  { href: "/wallet", label: "My Wallet", image: GUEST_HOME_IMAGES.wallet },
  { href: "/map", label: "Garden Map", image: GUEST_HOME_IMAGES.gardenMap },
];

// ── Mode exit strip — shown at top of every mode home ──────────────────────
type ModeKey = "kids" | "events" | "wedding";

const MODE_CONFIG: Record<
  ModeKey,
  { label: string; bg: string; text: string; border?: string; IconEl: React.ElementType }
> = {
  kids: {
    label: "Kids Mode",
    bg: "bg-[#d4e8d0]",
    text: "text-[#193521]",
    IconEl: Smiley,
  },
  events: {
    label: "Events Mode",
    bg: "bg-[#193521]",
    text: "text-white",
    IconEl: Ticket,
  },
  wedding: {
    label: "Wedding Mode",
    bg: "bg-white",
    text: "text-[#193521]",
    border: "border-b border-[#e0dcd6]",
    IconEl: Heart,
  },
};

function ModeExitBar({ mode, onExit }: { mode: ModeKey; onExit: () => void }) {
  const { label, bg, text, border = "", IconEl } = MODE_CONFIG[mode];
  return (
    <div className={`sticky top-0 z-50 flex items-center justify-between px-4 py-2 ${bg} ${border}`}>
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${text}`}>
        <IconEl size={14} weight="duotone" aria-hidden />
        {label}
      </div>
      <button
        type="button"
        onClick={onExit}
        className={`text-xs font-semibold ${text} opacity-70 hover:opacity-100 transition`}
      >
        ← Main View
      </button>
    </div>
  );
}

const QUICK_TOOLS = [
  { href: "/learn/scan", title: "Scan QR Code", Icon: QrCode },
  { href: "/tickets/events", title: "Special Events", Icon: CalendarBlank },
  { href: "/learn/plants", title: "Browse Plants", Icon: Leaf },
  { href: "/tickets", title: "Plan Your Visit", Icon: MapPin },
] as const;

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { member, loading, hasSession, authReady } = useMember();
  const { isKidsMode, setKidsMode } = useKidsMode();
  const { isWeddingMode, setWeddingMode } = useWeddingMode();
  const { isEventsMode, setEventsMode } = useEventsMode();
  const [featuredEvent, setFeaturedEvent] = useState<FeaturedEvent | null>(null);
  const [bloomingCard, setBloomingCard] = useState<BloomingCard>(DEFAULT_BLOOMING_CARD);
  const [eventsModeConfig, setEventsModeConfig] = useState<EventsModeConfig>({ active: true, featured_event_slug: null });

  const activateGuestMode = (mode: "kids" | "wedding" | "events") => {
    if (!authReady) return;
    if (mode === "kids") {
      setWeddingMode(false);
      setEventsMode(false);
      // Logged-in users go through the profile picker so they can select a child.
      // Guests activate Kids Mode directly (no profiles possible without an account).
      if (hasSession) {
        router.push("/kids/profiles");
        return;
      }
      setKidsMode(true);
    } else if (mode === "wedding") {
      setEventsMode(false);
      setKidsMode(false);
      setWeddingMode(true);
    } else {
      setEventsMode(true);
    }
  };

  // Auto-activate mode when ?preview=kids/events/wedding is in the URL
  // (used by staff portal "Preview" buttons which open in a new tab)
  useEffect(() => {
    if (!authReady) return;
    const preview = searchParams.get("preview") as "kids" | "events" | "wedding" | null;
    if (preview === "kids" || preview === "events" || preview === "wedding") {
      setKidsMode(preview === "kids");
      setEventsMode(preview === "events");
      setWeddingMode(preview === "wedding");
    }
  }, [authReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    fetch("/api/events/featured?limit=1", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { events?: FeaturedEvent[] }) => {
        if (!cancelled && data.events?.[0]) setFeaturedEvent(data.events[0]);
      })
      .catch(() => {});

    fetch("/api/admin/app-config", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { config?: Record<string, unknown> }) => {
        if (cancelled) return;
        const cfg = data.config ?? {};
        if (cfg.blooming_card) setBloomingCard(cfg.blooming_card as BloomingCard);
        if (cfg.events_mode) setEventsModeConfig(cfg.events_mode as EventsModeConfig);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  const exitMode = () => {
    setKidsMode(false);
    setEventsMode(false);
    setWeddingMode(false);
  };

  if (!loading && member) {
    if (isKidsMode) return <><ModeExitBar mode="kids" onExit={exitMode} /><KidsHome /></>;
    if (isEventsMode) return <><ModeExitBar mode="events" onExit={exitMode} /><EventsHome /></>;
    if (isWeddingMode) return <><ModeExitBar mode="wedding" onExit={exitMode} /><WeddingHome /></>;
    return <MemberHome member={member} />;
  }

  // Authenticated session without member record, OR unauthenticated guest who
  // activated a mode — both get the mode home in read-only/guest capacity.
  if (authReady && !loading) {
    if (isKidsMode) return <><ModeExitBar mode="kids" onExit={exitMode} /><KidsHome /></>;
    if (isEventsMode) return <><ModeExitBar mode="events" onExit={exitMode} /><EventsHome /></>;
    if (isWeddingMode) return <><ModeExitBar mode="wedding" onExit={exitMode} /><WeddingHome /></>;
  }

  return (
    <div className="min-h-screen bg-[#F3EFEE]">
      {/* Hero: dispersed hours / weather / events on stock photo (refetches via /api/today) */}
      <div className="relative">
        <GuestHeroDispersed hasSession={hasSession} />
      </div>

      {/* Mode switcher — original colors restored, Phosphor icons */}
      <div className="mt-4 px-3 sm:px-4">
        <div className={`grid gap-2 font-system ${eventsModeConfig.active ? "grid-cols-3" : "grid-cols-2"}`}>
          <button
            type="button"
            onClick={() => activateGuestMode("kids")}
            className="flex min-h-[40px] min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#d4e8d0] px-1.5 py-2 text-center text-xs font-semibold leading-snug text-[#193521] transition hover:brightness-[0.97] active:brightness-95 sm:px-2 sm:text-sm"
          >
            <Smiley size={16} weight="duotone" aria-hidden />
            Kids Mode
          </button>
          {eventsModeConfig.active && (
            <button
              type="button"
              onClick={() => activateGuestMode("events")}
              className="flex min-h-[40px] min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#193521] px-1.5 py-2 text-center text-xs font-semibold leading-snug text-white transition hover:opacity-95 active:opacity-90 sm:px-2 sm:text-sm"
            >
              <Ticket size={16} weight="duotone" aria-hidden />
              Events Mode
            </button>
          )}
          <button
            type="button"
            onClick={() => activateGuestMode("wedding")}
            className="flex min-h-[40px] min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#e0dcd6] bg-white px-1.5 py-2 text-center text-xs font-semibold leading-snug text-[#193521] transition hover:border-[#c5c0b8] active:bg-[#fafafa] sm:px-2 sm:text-sm"
          >
            <Heart size={16} weight="duotone" aria-hidden />
            Wedding Mode
          </button>
        </div>
      </div>

      {/* Top actions — three equal tiles (edge-aligned with hero) */}
      <div className="mt-5 px-3 sm:px-4">
        <div className="grid grid-cols-3 gap-2">
          {GUEST_HOME_TOP_THREE.map((item) => (
            <Link
              key={item.href + item.label}
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

      {/* What's Blooming — under quick tools (content managed by staff in /staff/homepage) */}
      <div className="mt-8 border-t border-[#e8e4de] pt-6 px-3 sm:px-4">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-[#193521]">What&apos;s Blooming</h2>
          <a
            href={bloomingCard.link_url || FAIRCHILD_SHOP_ORCHIDS}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 font-system text-sm font-semibold text-[#6A8468] transition hover:text-[#5a7360]"
          >
            {`See all >`}
          </a>
        </div>
        <a
          href={bloomingCard.link_url || FAIRCHILD_SHOP_ORCHIDS}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[132px] overflow-hidden rounded-2xl border border-[#6A8468]/35 bg-white shadow-sm transition hover:border-[#6A8468]/55"
        >
          <div className="relative w-[44%] max-w-[200px] shrink-0 bg-[#e8e4e0]">
            <Image
              src={bloomingCard.image_url || "/home/browse-plans.png"}
              alt=""
              fill
              className="object-cover object-center"
              sizes="200px"
              unoptimized
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-[42%] bg-gradient-to-r from-transparent to-white"
              aria-hidden
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
            <h3 className="font-system text-base font-bold text-black">{bloomingCard.title}</h3>
            <p className="font-system mt-1 text-sm leading-snug text-black">{bloomingCard.description}</p>
            {bloomingCard.badge && (
              <span className="font-system mt-3 inline-flex w-fit rounded-full bg-[#d4e8d0] px-3 py-1 text-xs font-semibold text-[#193521]">
                {bloomingCard.badge}
              </span>
            )}
          </div>
        </a>
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
