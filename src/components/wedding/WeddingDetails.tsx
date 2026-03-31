"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import {
  weddingImages,
  weddingDetailsLinks,
  weddingDetailsIntro,
} from "@/lib/clients/fairchild/weddingContent";

const detailsTitleGreen = "#2d3e24";

/** Thumbnail column width — flush left/top/bottom; row height unchanged */
const THUMB_W = "5.5rem";

export default function WeddingDetails() {
  return (
    <div className="min-h-screen pb-24 bg-[var(--background)]">
      <div className="pt-6">
        {/* Flush left with full-bleed hero / button photos (no extra inset) */}
        <div className="pl-0 pr-6">
          <h1
            className="text-3xl font-bold font-serif tracking-tight mb-4 text-left"
            style={{ color: detailsTitleGreen }}
          >
            Details
          </h1>
        </div>

        {/* Hero: full-bleed left/right within app column (like kids home cards) */}
        <div className="-mx-6 relative w-[calc(100%+3rem)] left-1/2 -translate-x-1/2 shadow-md aspect-[16/10] bg-[var(--surface)]">
          <Image
            src={weddingImages.detailsHero}
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
            {weddingDetailsIntro}
          </p>

          <div className="space-y-3">
            {weddingDetailsLinks.map((row) => (
              <Link
                key={row.href}
                href={row.href}
                className="flex items-stretch min-h-[4.25rem] w-full rounded-2xl bg-white border border-[var(--surface-border)] shadow-md hover:border-[var(--primary)]/40 active:opacity-95 transition overflow-hidden"
              >
                {/* Image flush left, top, bottom — fixed width, same as before */}
                <div
                  className="relative shrink-0 self-stretch"
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
                <div className="flex-1 flex items-center min-w-0 py-3 pl-3 pr-2 gap-2">
                  <span className="flex-1 text-left font-serif font-bold text-[#1a1a1a] text-base leading-tight">
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
