"use client";

import Image from "next/image";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  weddingImages,
  weddingSiteUrl,
  weddingBookletPdfUrl,
  weddingContactEmail,
  gardenAddress,
} from "@/lib/clients/fairchild/weddingContent";

export default function WeddingInformationPage() {
  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader title="Policies & Contact" backHref="/wedding" />
      <div className="px-6 mt-4 space-y-6">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)]">
          <Image
            src={weddingImages.additionalInformation}
            alt=""
            width={800}
            height={1200}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">Wedding team</h2>
          <a
            href={`mailto:${weddingContactEmail}`}
            className="text-[var(--primary)] font-medium"
          >
            {weddingContactEmail}
          </a>
          <p className="text-sm text-[var(--text-muted)] mt-3">
            {gardenAddress.line1}
            <br />
            {gardenAddress.line2}
            <br />
            {gardenAddress.city}
          </p>
        </div>
        <div className="text-sm text-[var(--text-primary)] space-y-3 leading-relaxed">
          <p>
            A professional wedding coordinator is required (day-of for ceremonies; month-of for
            larger packages). Certificate of insurance and vendor requirements apply—see the{" "}
            <a
              href={weddingSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] font-medium underline"
            >
              wedding guidelines
            </a>
            .
          </p>
        </div>
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--surface-border)]">
          <Image
            src={weddingImages.aboutFairchild}
            alt=""
            width={800}
            height={600}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <a
          href={weddingBookletPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-2xl bg-[var(--primary)] text-white text-center font-semibold"
        >
          View wedding booklet (PDF)
        </a>
        <a
          href={weddingSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-2xl border-2 border-[var(--primary)] text-[var(--primary)] text-center font-semibold"
        >
          Visit fairchildgarden.org
        </a>
      </div>
    </div>
  );
}
