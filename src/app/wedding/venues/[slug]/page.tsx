"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  getWeddingVenueBySlug,
  weddingSiteUrl,
  weddingBookletPdfUrl,
} from "@/lib/clients/fairchild/weddingContent";

export default function WeddingVenueDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const venue = getWeddingVenueBySlug(slug);

  if (!venue) {
    return (
      <div className="min-h-screen pb-24 px-6 pt-6">
        <WeddingHeader title="Venue not found" backHref="/wedding/venues" />
        <p className="text-[var(--text-muted)] mt-4">
          <Link href="/wedding/venues" className="text-[var(--primary)] underline">
            Back to venues
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader
        title={venue.title}
        backHref="/wedding/venues"
        titleClassName="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#2d3e24]"
      />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-5 shadow-md">
          <Image
            src={venue.image}
            alt=""
            width={800}
            height={1400}
            className="w-full h-auto"
            unoptimized
            priority
          />
        </div>
        <div className="text-center space-y-1 mb-6">
          <p className="text-sm text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)]">Capacity:</span>{" "}
            {venue.capacity}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)]">Uses:</span>{" "}
            {venue.uses}
          </p>
        </div>
        <p className="text-[var(--text-primary)] text-sm leading-relaxed mb-6">
          {venue.description}
        </p>
        <div className="space-y-3">
          <a
            href={weddingSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-2xl bg-[var(--primary)] text-white text-center font-semibold"
          >
            Pricing & booking on fairchildgarden.org
          </a>
          <a
            href={weddingBookletPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-2xl border-2 border-[var(--primary)] text-[var(--primary)] text-center font-semibold"
          >
            Download wedding booklet (PDF)
          </a>
          <Link
            href="/wedding/venues"
            className="block text-center text-sm text-[var(--text-muted)] py-2"
          >
            ← All venues
          </Link>
        </div>
      </div>
    </div>
  );
}
