"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  bunnyHoppeningEvent,
  bunnyHoppeningPremiumAddOns,
  eventModeAccentButtonStyle,
  eventModeAccentCtaClassName,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";

const THUMB_W = "5.5rem";

export default function EventsAddOnsPage() {
  const ev = bunnyHoppeningEvent;
  const accent = getCurrentEventAccentColor();

  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader
        title="Premium Add-Ons"
        backHref="/learn"
        titleClassName="text-2xl font-bold font-serif text-[#2d3e24]"
      />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-5 shadow-md">
          <Image
            src={ev.images.addOnsHero}
            alt=""
            width={800}
            height={400}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <p className="text-sm text-center text-[var(--text-muted)] mb-2">Sold separately</p>
        <p className="text-sm text-[var(--text-primary)] mb-6 leading-relaxed">
          Purchase add-ons through Fairchild’s secure checkout. You’ll complete payment on
          fairchildgarden.org—prices and availability match the official event page.
        </p>

        <div className="space-y-3">
          {bunnyHoppeningPremiumAddOns.map((addon) => (
            <a
              key={addon.id}
              href={addon.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-stretch min-h-[4.25rem] w-full rounded-2xl bg-white border-2 border-[var(--surface-border)] shadow-md hover:border-[var(--event-accent)] active:opacity-95 transition overflow-hidden"
            >
              <div
                className="relative shrink-0 self-stretch overflow-hidden rounded-l-2xl"
                style={{ width: THUMB_W, minWidth: THUMB_W }}
              >
                {addon.sellingFast && (
                  <span className="absolute top-1 left-1 z-10 text-[10px] font-bold uppercase tracking-wide text-white bg-[#2d3e24]/90 px-1.5 py-0.5 rounded">
                    Selling fast!
                  </span>
                )}
                <Image
                  src={addon.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="88px"
                  unoptimized
                />
              </div>
              <div className="flex-1 flex items-center min-w-0 py-3 pl-2.5 pr-2 gap-2">
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-serif font-bold text-[#2d3e24] text-base leading-tight">
                    {addon.title}
                  </p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: accent }}>
                    {addon.price}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                    {addon.description}
                  </p>
                </div>
                <CaretRight
                  size={22}
                  weight="bold"
                  className="text-[#b0b0b0] shrink-0"
                  aria-hidden
                />
              </div>
            </a>
          ))}
        </div>

        <a
          href={`${ev.officialUrl}#premium-add-ons`}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-8 block w-full py-3.5 rounded-2xl ${eventModeAccentCtaClassName}`}
          style={eventModeAccentButtonStyle(accent)}
        >
          Buy add-ons on fairchildgarden.org
        </a>

        <Link
          href="/events/tickets"
          className="mt-3 block text-center text-sm text-[var(--text-muted)] py-2 underline"
        >
          General admission & member tickets
        </Link>
      </div>
    </div>
  );
}
