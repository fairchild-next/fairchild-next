"use client";

import Image from "next/image";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import { weddingImages, weddingSiteUrl } from "@/lib/clients/fairchild/weddingContent";

const bullets = [
  "Fairchild follows a bring-your-own-professionals model for planners, caterers, music, and décor.",
  "All vendors must be pre-approved by the garden; new vendors need a mandatory site visit about 30 days before the event.",
  "Vendors must provide proof of insurance ($1M liability, Fairchild named additional insured).",
  "Load-in, load-out, and cleanup are coordinated with the Fairchild events team.",
] as const;

export default function WeddingVendorsPage() {
  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader title="Vendor Information" backHref="/wedding" />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-6">
          <Image
            src={weddingImages.vendorInformation}
            alt=""
            width={800}
            height={1200}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <ul className="space-y-4 mb-6">
          {bullets.map((b) => (
            <li key={b} className="text-sm text-[var(--text-primary)] leading-relaxed">
              {b}
            </li>
          ))}
        </ul>
        <p className="text-sm text-[var(--text-muted)]">
          Fairchild can provide a curated list of preferred vendors on request.{" "}
          <a
            href={weddingSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] font-medium underline"
          >
            Read full vendor guidelines
          </a>
          .
        </p>
      </div>
    </div>
  );
}
