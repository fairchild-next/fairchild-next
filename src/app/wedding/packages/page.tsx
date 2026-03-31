"use client";

import Image from "next/image";
import Link from "next/link";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  weddingPackages,
  weddingImages,
  weddingSiteUrl,
} from "@/lib/clients/fairchild/weddingContent";

export default function WeddingPackagesPage() {
  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader title="Wedding Packages" backHref="/wedding" />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-6">
          <Image
            src={weddingImages.packagesOverview}
            alt=""
            width={800}
            height={1200}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Each package includes upgrades and add-ons. See the{" "}
          <a
            href={weddingSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] font-medium underline"
          >
            full wedding page
          </a>{" "}
          for rates, deposits, and schedules.
        </p>
        <div className="space-y-3">
          {weddingPackages.map((p) => (
            <Link
              key={p.slug}
              href={`/wedding/packages/${p.slug}`}
              className="block p-4 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] hover:border-[var(--primary)] transition"
            >
              <p className="font-semibold text-[var(--text-primary)]">{p.title}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                {p.summary}
              </p>
              <span className="text-sm text-[var(--primary)] font-medium mt-2 inline-block">
                View details →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
