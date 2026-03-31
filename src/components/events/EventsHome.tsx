"use client";

import Image from "next/image";
import Link from "next/link";
import {
  bunnyHoppeningEvent,
  eventModeAccentButtonStyle,
  eventModeAccentCtaClassName,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";
import { useMember } from "@/lib/memberContext";

type HomeTile = {
  href: string;
  label: string;
  image: string;
  bar: "light" | "dark";
};

const homeTiles: HomeTile[] = [
  {
    href: "/learn",
    label: "Event Details",
    image: bunnyHoppeningEvent.images.tileDetails,
    bar: "light",
  },
  {
    href: "/events/add-ons",
    label: "Event Add-Ons",
    image: bunnyHoppeningEvent.images.tileAddOns,
    bar: "dark",
  },
  {
    href: "/events/map",
    label: "Events Map",
    image: bunnyHoppeningEvent.images.tileMap,
    bar: "dark",
  },
  {
    href: "/events/schedule",
    label: "Event Schedule",
    image: bunnyHoppeningEvent.images.tileSchedule,
    bar: "light",
  },
];

export default function EventsHome() {
  const { member } = useMember();
  const profileHref = member ? "/member/profile" : "/account";
  const ev = bunnyHoppeningEvent;
  const accent = getCurrentEventAccentColor();

  return (
    <div className="min-h-screen pb-24 bg-[var(--background)]">
      <div className="relative overflow-hidden">
        <div className="relative h-[13rem] min-h-[208px]">
          <Image
            src={ev.images.heroHome}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            unoptimized
          />
        </div>
      </div>

      <div className="px-6 mt-6">
        <div className="grid grid-cols-2 gap-3">
          {homeTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="flex flex-col rounded-2xl overflow-hidden border border-[var(--surface-border)] shadow-md bg-white active:opacity-95 transition"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 448px) 50vw, 224px"
                  unoptimized
                />
              </div>
              <div
                className={`py-3 px-2 text-center font-serif font-semibold text-sm leading-tight bg-[var(--surface)] ${
                  tile.bar === "light" ? "text-[#1a1a1a]" : ""
                }`}
                style={tile.bar === "dark" ? { color: accent } : undefined}
              >
                {tile.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-6 mt-6 flex justify-center">
        <Link
          href="/events/schedule"
          className={`inline-block py-3.5 px-10 rounded-full font-serif font-semibold ${eventModeAccentCtaClassName} hover:opacity-92 transition`}
          style={eventModeAccentButtonStyle(accent)}
        >
          Plan your day!
        </Link>
      </div>

      <div className="px-6 mt-8 text-center">
        <Link
          href={profileHref}
          className="text-sm font-medium underline"
          style={{ color: accent }}
        >
          Profile & settings
        </Link>
      </div>

      <div className="px-6 mt-8 space-y-3">
        <a
          href={ev.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full py-3.5 rounded-2xl ${eventModeAccentCtaClassName} hover:opacity-90 transition`}
          style={eventModeAccentButtonStyle(accent)}
        >
          Get tickets & add-ons on fairchildgarden.org
        </a>
        <p className="text-center text-xs text-[var(--text-muted)] px-2">
          General admission and member reservations are handled in the main Tickets flow. This mode
          highlights add-ons and day-of details for members exploring the event.
        </p>
      </div>
    </div>
  );
}
