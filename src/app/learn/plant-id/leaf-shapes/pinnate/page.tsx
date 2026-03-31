"use client";

import Link from "next/link";

export default function PinnatePage() {
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
        <h2 className="text-2xl font-semibold">Pinnate</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-leaf-pinnate.png"
            alt="Pinnate compound leaf with leaflets arranged along the rachis"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          A leaf structure in which multiple smaller leaflets are arranged along
          a central axis called the rachis. Although it may look like many
          individual leaves, a pinnate leaf is actually one compound leaf. Ferns,
          ash trees, and many legumes have pinnate leaves.
        </p>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <p className="text-[var(--text-primary)] leading-relaxed">
          The term also applies to simple leaves with pinnate venation, where
          smaller veins branch off a single central midrib, much like the
          structure of a feather.
        </p>
      </div>
    </div>
  );
}
