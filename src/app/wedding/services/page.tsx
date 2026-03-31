"use client";

import Image from "next/image";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  weddingImages,
  weddingServicesHighlights,
  weddingSiteUrl,
} from "@/lib/clients/fairchild/weddingContent";

export default function WeddingServicesPage() {
  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader title="Our Services" backHref="/wedding" />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-6">
          <Image
            src={weddingImages.ourServices}
            alt=""
            width={800}
            height={1200}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <ul className="space-y-3 mb-6">
          {weddingServicesHighlights.map((line) => (
            <li
              key={line}
              className="flex gap-2 text-sm text-[var(--text-primary)] leading-relaxed"
            >
              <span className="text-[var(--primary)] shrink-0" aria-hidden>
                ✓
              </span>
              {line}
            </li>
          ))}
        </ul>
        <p className="text-sm text-[var(--text-muted)]">
          Rain backup options, rehearsal services, and à la carte enhancements are available. See{" "}
          <a
            href={weddingSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] font-medium underline"
          >
            fairchildgarden.org/garden-wedding-miami
          </a>{" "}
          for the complete list.
        </p>
      </div>
    </div>
  );
}
