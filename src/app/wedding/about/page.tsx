"use client";

import Image from "next/image";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import {
  weddingImages,
  weddingSiteUrl,
} from "@/lib/clients/fairchild/weddingContent";

export default function WeddingAboutPage() {
  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader title="About Fairchild" backHref="/learn" backLabel="← Back" />
      <div className="px-6 mt-4 space-y-4">
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
        <div className="font-serif text-sm text-[var(--text-primary)] leading-relaxed space-y-3">
          <p>
            Fairchild Tropical Botanic Garden is a renowned botanical sanctuary in Coral Gables,
            Florida—83 acres of rare and tropical plants, conservation, and unforgettable outdoor
            spaces for your celebration.
          </p>
          <p>
            Learn more about hosting your wedding here on our official site.
          </p>
        </div>
        <a
          href={weddingSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-2xl bg-[var(--primary)] text-white text-center font-semibold"
        >
            Garden weddings at Fairchild
        </a>
      </div>
    </div>
  );
}
