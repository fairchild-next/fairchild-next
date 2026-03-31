"use client";

import Link from "next/link";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  bunnyHoppeningEvent,
  eventModeAccentButtonStyle,
  eventModeAccentCtaClassName,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";

export default function EventsTicketsPage() {
  const ev = bunnyHoppeningEvent;
  const accent = getCurrentEventAccentColor();

  return (
    <div className="min-h-screen pb-24 px-6">
      <WeddingHeader
        title="Event tickets"
        backHref="/"
        titleClassName="text-2xl font-bold font-serif text-[#2d3e24]"
      />
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--text-primary)]">
        <p>
          <strong>General admission</strong> to {ev.shortName} (including free member reservations)
          is handled in the main member app—same as other Fairchild events.
        </p>
        <Link
          href="/tickets/events"
          className={`block w-full py-3.5 rounded-2xl ${eventModeAccentCtaClassName}`}
          style={eventModeAccentButtonStyle(accent)}
        >
          View special events & reserve tickets
        </Link>
        <p className="text-[var(--text-muted)]">
          After you have admission squared away, use <strong>Premium Add-Ons</strong> in this mode
          for picnic baskets, flights, and other event extras—sold separately on Fairchild’s site.
        </p>
        <Link
          href="/events/add-ons"
          className="block w-full py-3 rounded-2xl border-2 text-center font-semibold"
          style={{ borderColor: accent, color: accent }}
        >
          Browse premium add-ons
        </Link>
        <a
          href={ev.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm underline font-medium"
          style={{ color: accent }}
        >
          Official event page (fairchildgarden.org)
        </a>
      </div>
    </div>
  );
}
