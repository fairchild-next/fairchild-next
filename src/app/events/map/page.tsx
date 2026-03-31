"use client";

import dynamic from "next/dynamic";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  bunnyHoppeningEvent,
  eventModeAccentButtonStyle,
  eventModeAccentCtaClassName,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";

const GardenMap = dynamic(
  () => import("@/components/GardenMapLeaflet"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] rounded-lg bg-[var(--surface)] flex items-center justify-center">
        <span className="text-[var(--text-muted)]">Loading map…</span>
      </div>
    ),
  }
);

export default function EventsMapPage() {
  const accent = getCurrentEventAccentColor();
  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader
        title="Events map"
        backHref="/"
        titleClassName="text-2xl font-bold font-serif text-[#2d3e24]"
      />
      <div className="px-4 pt-4">
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Explore the Garden. Pins and wayfinding for {bunnyHoppeningEvent.shortName} are edited in
          Staff → Map Editor → Events mode.
        </p>
        <div className="-mx-4 sm:mx-0 rounded-2xl overflow-hidden border border-[var(--surface-border)]">
          <GardenMap configSlug="events" poiListReturnPath="/events/map" />
        </div>
        <a
          href={bunnyHoppeningEvent.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 block w-full py-3 rounded-2xl ${eventModeAccentCtaClassName}`}
          style={eventModeAccentButtonStyle(accent)}
        >
          Event details on fairchildgarden.org
        </a>
      </div>
    </div>
  );
}
