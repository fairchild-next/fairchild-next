"use client";

import Image from "next/image";
import WeddingHeader from "@/components/wedding/WeddingHeader";
import { weddingImages } from "@/lib/clients/fairchild/weddingContent";

export default function WeddingGalleryPage() {
  return (
    <div className="min-h-screen pb-24">
      <WeddingHeader title="Photo Gallery" backHref="/wedding" />
      <div className="px-6 mt-4">
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Inspiration from weddings and events at Fairchild Tropical Botanic Garden.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {weddingImages.gallery.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[var(--surface-border)] bg-[var(--surface)]"
            >
              <Image
                src={src}
                alt={`Wedding gallery ${i + 1}`}
                fill
                className="object-cover"
                sizes="50vw"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
