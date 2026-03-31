"use client";

import Image from "next/image";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  bunnyHoppeningAboutEventParagraphs,
  bunnyHoppeningEvent,
  eventModeAccentButtonStyle,
  eventModeAccentCtaClassName,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";

export default function EventsAboutEventPage() {
  const ev = bunnyHoppeningEvent;
  const accent = getCurrentEventAccentColor();

  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader
        title="About the Event"
        backHref="/learn"
        titleClassName="text-2xl font-bold font-serif text-[#2d3e24]"
      />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-5 shadow-md">
          <Image
            src={ev.images.aboutEvent}
            alt=""
            width={800}
            height={500}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <div className="space-y-4 text-sm leading-relaxed font-serif text-[#1a1a1a]">
          {bunnyHoppeningAboutEventParagraphs.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-pink-600 font-bold uppercase text-xs tracking-wide text-center"
                  : i === 1
                    ? "font-semibold text-base"
                    : ""
              }
              style={i === 1 ? { color: accent } : undefined}
            >
              {p}
            </p>
          ))}
        </div>
        <a
          href={ev.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-8 block w-full py-3.5 rounded-2xl ${eventModeAccentCtaClassName}`}
          style={eventModeAccentButtonStyle(accent)}
        >
          Tickets & details on fairchildgarden.org
        </a>
      </div>
    </div>
  );
}
