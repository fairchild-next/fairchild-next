"use client";

import Image from "next/image";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import WeddingMapInteractive from "./WeddingMapInteractive";
import { weddingImages, gardenAddress } from "@/lib/clients/fairchild/weddingContent";

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${gardenAddress.line2}, ${gardenAddress.city}`
)}`;

export default function WeddingMapPage() {
  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader title="Map & Directions" backHref="/wedding" />
      <div className="px-6 mt-4 space-y-4">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          <strong>North Gate (main):</strong> first entrance from the north on Old Cutler Road, or
          second from the south. Park at the visitors center lot or Lowlands when directed.
        </p>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          <strong>South Gate | Phillips Gate:</strong> second entrance from the north, or first
          from the south. Designated event parking as coordinated with Fairchild.
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          Interactive map below is the wedding-mode map—pins are edited in Staff → Map Editor →
          Wedding mode.
        </p>
        <WeddingMapInteractive />
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide pt-2">
          Reference overview
        </p>
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)]">
          <Image
            src={weddingImages.mapView}
            alt="Garden map"
            width={800}
            height={1200}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)]">
          <Image
            src={weddingImages.mapViewAlt}
            alt="Garden map alternate view"
            width={800}
            height={1200}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-2xl bg-[var(--primary)] text-white text-center font-semibold"
        >
          Open in Google Maps
        </a>
        <a
          href="/map"
          className="block w-full py-3 rounded-2xl border-2 border-[var(--surface-border)] text-[var(--text-primary)] text-center font-semibold"
        >
          Main visitor map (guest & member home)
        </a>
      </div>
    </div>
  );
}
