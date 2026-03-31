"use client";

import Image from "next/image";
import Link from "next/link";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  bunnyHoppeningEvent,
  bunnyHoppeningPricingParagraphs,
  bunnyHoppeningTicketIncludes,
  eventModeAccentButtonStyle,
  eventModeAccentCtaClassName,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";

export default function EventsPricingPage() {
  const ev = bunnyHoppeningEvent;
  const accent = getCurrentEventAccentColor();

  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader
        title="Pricing Options"
        backHref="/learn"
        titleClassName="text-2xl font-bold font-serif text-[#2d3e24]"
      />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-5 shadow-md">
          <Image
            src={ev.images.pricingHero}
            alt=""
            width={800}
            height={400}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-[var(--text-primary)] mb-8">
          {bunnyHoppeningPricingParagraphs.map((p, i) => (
            <p
              key={i}
              className={i === 1 || i === 2 ? "font-medium" : ""}
              style={i === 1 || i === 2 ? { color: accent } : undefined}
            >
              {p}
            </p>
          ))}
        </div>

        <h2 className="text-base font-serif font-bold text-[#2d3e24] mb-3 text-center">
          What your ticket includes
        </h2>
        <div className="space-y-3 mb-8">
          {bunnyHoppeningTicketIncludes.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-pink-200/80 bg-pink-50/50 p-4"
            >
              <p className="font-serif font-bold text-[#2d3e24]">{item.title}</p>
              <p className="text-sm text-[var(--text-primary)] mt-1">{item.body}</p>
              <p className="text-xs mt-2 italic" style={{ color: accent }}>
                {item.note}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/tickets/events"
          className={`block w-full py-3.5 rounded-2xl mb-3 ${eventModeAccentCtaClassName}`}
          style={eventModeAccentButtonStyle(accent)}
        >
          Reserve tickets in the app
        </Link>
        <a
          href={ev.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-2xl border-2 text-center font-semibold"
          style={{ borderColor: accent, color: accent }}
        >
          Full pricing on fairchildgarden.org
        </a>
      </div>
    </div>
  );
}
