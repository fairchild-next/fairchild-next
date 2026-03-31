"use client";

import Image from "next/image";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  bunnyHoppeningAboutFairchildParagraphs,
  bunnyHoppeningEvent,
  eventModeAccentButtonStyle,
  eventModeAccentCtaClassName,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";

export default function EventsAboutFairchildPage() {
  const ev = bunnyHoppeningEvent;
  const accent = getCurrentEventAccentColor();

  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader
        title="About Fairchild"
        backHref="/learn"
        titleClassName="text-2xl font-bold font-serif text-[#2d3e24]"
      />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-5 shadow-md">
          <Image
            src={ev.images.aboutFairchild}
            alt=""
            width={800}
            height={500}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <div className="space-y-4 text-sm leading-relaxed font-serif text-[#1a1a1a]">
          {bunnyHoppeningAboutFairchildParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <a
          href="https://fairchildgarden.org/"
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-8 block w-full py-3.5 rounded-2xl ${eventModeAccentCtaClassName}`}
          style={eventModeAccentButtonStyle(accent)}
        >
          Plan your visit
        </a>
      </div>
    </div>
  );
}
