"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import {
  bunnyHoppeningEvent,
  bunnyHoppeningDetailsLinks,
  getCurrentEventAccentColor,
} from "@/lib/clients/fairchild/eventModeContent";

const TITLE_GREEN = "#2d3e24";
const THUMB_W = "5.5rem";

export default function EventsDetails() {
  const ev = bunnyHoppeningEvent;
  const accent = getCurrentEventAccentColor();

  return (
    <div
      className="min-h-screen pb-24 bg-[var(--background)]"
      style={{ ["--event-accent" as string]: accent }}
    >
      <div className="pt-6">
        <div className="pl-0 pr-6">
          <h1
            className="text-3xl font-bold font-serif tracking-tight mb-4 text-left"
            style={{ color: TITLE_GREEN }}
          >
            Details
          </h1>
        </div>

        <div className="-mx-6 relative w-[calc(100%+3rem)] left-1/2 -translate-x-1/2 shadow-md aspect-[16/10] bg-[var(--surface)]">
          <Image
            src={ev.images.detailsHero}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            unoptimized
          />
        </div>

        <div className="pr-6 pl-0">
          <p className="text-center text-sm sm:text-[15px] leading-relaxed font-serif text-[#1a1a1a] mt-5 mb-8 max-w-md mx-auto px-1">
            {ev.detailsIntro}
          </p>

          <div className="space-y-3">
            {bunnyHoppeningDetailsLinks.map((row) => (
              <Link
                key={row.href}
                href={row.href}
                className="flex items-stretch min-h-[4.25rem] w-full rounded-2xl bg-white border-2 border-[var(--surface-border)] shadow-md hover:border-[var(--event-accent)] active:opacity-95 transition overflow-hidden"
              >
                <div
                  className="relative shrink-0 self-stretch overflow-hidden rounded-l-2xl"
                  style={{ width: THUMB_W, minWidth: THUMB_W }}
                >
                  <Image
                    src={row.thumb}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="88px"
                    unoptimized
                  />
                </div>
                <div className="flex-1 flex items-center min-w-0 py-3 pl-2.5 pr-2 gap-2">
                  <span
                    className="flex-1 text-left font-serif font-bold text-base leading-tight"
                    style={{ color: TITLE_GREEN }}
                  >
                    {row.label}
                  </span>
                  <CaretRight
                    size={22}
                    weight="bold"
                    className="text-[#b0b0b0] shrink-0"
                    aria-hidden
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
