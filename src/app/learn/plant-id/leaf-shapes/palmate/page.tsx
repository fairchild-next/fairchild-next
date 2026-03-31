"use client";

import Link from "next/link";

export default function PalmatePage() {
  return (
    <div className="pb-24">
      <div className="px-6 pt-4">
        <Link
          href="/learn/plant-id/leaf-shapes"
          className="text-sm text-[var(--primary)] font-medium"
        >
          ← Back to Leaf Shapes
        </Link>
      </div>

      <div className="px-6 pt-4 space-y-6">
        <h2 className="text-2xl font-semibold">Palmate</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-leaf-palmate.png"
            alt="Palmate leaves with lobes radiating from a central point"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          A leaf shape where the lobes spread outward from a single central
          point, similar to the fingers of a hand.
        </p>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <p className="text-[var(--text-primary)] leading-relaxed">
          In palmate leaves, the main veins also radiate from that central
          point. Maples and many tropical plants display this distinctive
          pattern.
        </p>
      </div>
    </div>
  );
}
