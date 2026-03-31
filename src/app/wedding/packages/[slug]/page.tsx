"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  weddingPackages,
  weddingSiteUrl,
  weddingBookletPdfUrl,
} from "@/lib/clients/fairchild/weddingContent";

export default function WeddingPackageDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const pkg = weddingPackages.find((p) => p.slug === slug);

  if (!pkg) {
    return (
      <div className="min-h-screen pb-24 px-6 pt-6">
        <WeddingHeader title="Package not found" backHref="/wedding/packages" />
        <p className="text-[var(--text-muted)] mt-4">
          <Link href="/wedding/packages" className="text-[var(--primary)] underline">
            Back to packages
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader
        title={pkg.title}
        backHref="/wedding/packages"
        titleClassName="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#2d3e24]"
      />
      <div className="px-6 mt-4">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)] mb-4 shadow-md">
          <Image
            src={pkg.image}
            alt=""
            width={800}
            height={1400}
            className="w-full h-auto"
            unoptimized
            priority
          />
        </div>
        <div className="space-y-3 mb-6 font-serif text-[#2d3e24]">
          <p className="text-sm sm:text-[15px] leading-relaxed font-semibold">
            {pkg.summary}
          </p>
          {pkg.moreInfo.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed font-normal opacity-95">
              {paragraph}
            </p>
          ))}
        </div>
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
            href="/wedding/packages"
            className="block text-center text-sm text-[var(--text-muted)] py-2"
          >
            ← All packages
          </Link>
        </div>
      </div>
    </div>
  );
}
