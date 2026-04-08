"use client";

import Image from "next/image";
import { useState } from "react";

const GALLERY_IMAGES = [
  "/wedding/gallery-1.png",
  "/wedding/gallery-2.png",
  "/wedding/gallery-3.png",
  "/wedding/gallery-4.png",
  "/wedding/gallery-5.png",
  "/wedding/gallery-6.png",
  "/wedding/gallery-7.png",
  "/wedding/gallery-8.png",
  "/wedding/gallery-9.png",
  "/wedding/gallery-10.png",
  "/wedding/venues-overview.png",
  "/wedding/reception-locations.png",
  "/wedding/venue-allee-overlook.png",
  "/wedding/venue-arboretum.png",
  "/wedding/venue-art-center.png",
  "/wedding/package-ceremony.png",
  "/wedding/package-garden-house.png",
  "/wedding/package-art-center.png",
  "/wedding/package-marquee.png",
];

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div style={{ background: "#f0f3ee", minHeight: "100%" }}>
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold" style={{ color: "#2a3d2a" }}>Photo Gallery</h1>
        <p className="text-sm mt-0.5" style={{ color: "#9aab9a" }}>Fairchild venues &amp; inspiration</p>
      </div>

      {/* Grid */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        {GALLERY_IMAGES.map((src, i) => (
          <button
            key={src}
            onClick={() => setLightbox(src)}
            className="relative rounded-2xl overflow-hidden shadow-sm focus:outline-none"
            style={{ aspectRatio: i % 5 === 0 ? "16/9" : "1/1", gridColumn: i % 5 === 0 ? "span 2" : "span 1" }}
          >
            <Image src={src} alt={`Fairchild wedding ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={() => setLightbox(null)}
        >
          <div className="relative w-full max-w-sm" style={{ aspectRatio: "4/3" }}>
            <Image src={lightbox} alt="Gallery" fill className="object-contain rounded-2xl" />
          </div>
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
