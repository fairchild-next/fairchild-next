"use client";

import Image from "next/image";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  bunnyHoppeningEvent,
  bunnyHoppeningFaqs,
  eventModeAccentButtonStyle,
  eventModeAccentCtaClassName,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";

export default function EventsFaqsPage() {
  const ev = bunnyHoppeningEvent;
  const accent = getCurrentEventAccentColor();

  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader
        title="FAQs"
        backHref="/learn"
        titleClassName="text-2xl font-bold font-serif text-[#2d3e24]"
      />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-5 shadow-md">
          <Image
            src={ev.images.faqsHero}
            alt=""
            width={800}
            height={400}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <div className="space-y-5">
          {bunnyHoppeningFaqs.map((faq) => (
            <div key={faq.q}>
              <p className="font-serif font-bold text-[#2d3e24] text-sm">{faq.q}</p>
              <p className="text-sm text-[var(--text-primary)] mt-1 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        <a
          href={ev.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-8 block w-full py-3.5 rounded-2xl ${eventModeAccentCtaClassName}`}
          style={eventModeAccentButtonStyle(accent)}
        >
          More on fairchildgarden.org
        </a>
      </div>
    </div>
  );
}
