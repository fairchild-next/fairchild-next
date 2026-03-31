"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  weddingImages,
  weddingVenues,
  weddingVenuesIntro,
  weddingSiteUrl,
} from "@/lib/clients/fairchild/weddingContent";

/** Match Details tab row thumbnails */
const THUMB_W = "5.5rem";

export default function WeddingVenuesPage() {
  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader
        title="Wedding Venues"
        titleClassName="text-3xl font-bold font-serif tracking-tight text-[#2d3e24]"
      />
      <div className="px-6 mt-4 space-y-6">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] shadow-md">
          <Image
            src={weddingImages.venuesOverview}
            alt=""
            width={800}
            height={1200}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          {weddingVenuesIntro}{" "}
          <a
            href={weddingSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] font-medium underline"
          >
            Full details on fairchildgarden.org
          </a>
          .
        </p>
        <h2 className="text-xl font-bold font-serif tracking-tight text-[#2d3e24]">
          Featured spaces
        </h2>
        <div className="space-y-3">
          {weddingVenues.map((v) => (
            <Link
              key={v.slug}
              href={`/wedding/venues/${v.slug}`}
              className="flex items-stretch min-h-[4.25rem] w-full rounded-2xl bg-white border border-[var(--surface-border)] shadow-md hover:border-[var(--primary)]/40 active:opacity-95 transition overflow-hidden"
            >
              <div
                className="relative shrink-0 self-stretch"
                style={{ width: THUMB_W, minWidth: THUMB_W }}
              >
                <Image
                  src={v.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="88px"
                  unoptimized
                />
              </div>
              <div className="flex-1 flex items-center min-w-0 py-3 pl-3 pr-2 gap-2">
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-serif font-bold text-base leading-tight text-[#2d3e24]">
                    {v.title}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-snug line-clamp-2">
                    {v.synopsis}
                  </p>
                </div>
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
        <Link
          href="/wedding/map"
          className="block w-full py-3 rounded-2xl border-2 border-[var(--primary)] text-[var(--primary)] text-center font-semibold"
        >
          Map & directions
        </Link>
      </div>
    </div>
  );
}
