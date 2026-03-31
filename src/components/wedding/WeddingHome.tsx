"use client";

import Image from "next/image";
import Link from "next/link";
import {
  weddingSiteUrl,
  weddingBookletPdfUrl,
  weddingImages,
  weddingContactEmail,
} from "@/lib/clients/fairchild/weddingContent";
import { useMember } from "@/lib/memberContext";

const forestGreen = "#2d3e24";

type HomeTile = {
  href: string;
  label: string;
  image: string;
  /** Light = white bar + dark serif text; dark = forest green bar + white text */
  bar: "light" | "dark";
};

const homeTiles: HomeTile[] = [
  {
    href: "/wedding/venues",
    label: "Wedding Venues",
    image: weddingImages.homeTiles.venues,
    bar: "light",
  },
  {
    href: "/wedding/packages",
    label: "Wedding Packages",
    image: weddingImages.homeTiles.packages,
    bar: "dark",
  },
  {
    href: "/wedding/map",
    label: "Map View",
    image: weddingImages.homeTiles.map,
    bar: "dark",
  },
  {
    href: "/wedding/gallery",
    label: "Photo Gallery",
    image: weddingImages.homeTiles.gallery,
    bar: "light",
  },
];

const bookTourHref = `mailto:${weddingContactEmail}?subject=${encodeURIComponent("Book a wedding tour")}`;

export default function WeddingHome() {
  const { member } = useMember();
  const profileHref = member ? "/member/profile" : "/account";

  return (
    <div className="min-h-screen pb-24">
      {/* Hero — matches “Fairchild Garden Wedding” mockup */}
      <div className="relative overflow-hidden">
        <div className="relative h-[13rem] min-h-[208px]">
          <Image
            src={weddingImages.heroHome}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <h1 className="text-2xl sm:text-[1.65rem] font-bold text-white drop-shadow-lg font-serif tracking-tight">
            Fairchild Garden Wedding
          </h1>
        </div>
      </div>

      {/* 2×2 grid — image on top, label bar below (alternating light / dark) */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-2 gap-3">
          {homeTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="flex flex-col rounded-2xl overflow-hidden border border-[var(--surface-border)] shadow-md bg-white active:opacity-95 transition"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 448px) 50vw, 224px"
                  unoptimized
                />
              </div>
              <div
                className={`py-3 px-2 text-center font-serif font-semibold text-sm leading-tight ${
                  tile.bar === "light"
                    ? "bg-white text-[#1a1a1a]"
                    : "text-white"
                }`}
                style={tile.bar === "dark" ? { backgroundColor: forestGreen } : undefined}
              >
                {tile.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Book a tour — pill CTA */}
      <div className="px-6 mt-6 flex justify-center">
        <a
          href={bookTourHref}
          className="inline-block py-3.5 px-10 rounded-full text-center font-serif font-semibold text-white shadow-md hover:opacity-92 transition"
          style={{ backgroundColor: forestGreen }}
        >
          Book a Tour!
        </a>
      </div>

      <div className="px-6 mt-8 text-center">
        <Link
          href={profileHref}
          className="text-sm text-[var(--primary)] font-medium underline"
        >
          Profile & settings
        </Link>
      </div>

      {/* Same UI as before — below profile link */}
      <div className="px-6 mt-8 space-y-3">
        <a
          href={weddingBookletPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white text-center font-semibold hover:opacity-90 transition"
        >
          View Wedding Booklet (PDF)
        </a>
        <a
          href={weddingSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3.5 rounded-2xl border-2 border-[var(--primary)] text-[var(--primary)] text-center font-semibold hover:bg-[var(--primary)]/5 transition"
        >
          Full details on fairchildgarden.org
        </a>
      </div>
    </div>
  );
}
