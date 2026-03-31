"use client";

import Link from "next/link";

export default function RoundPage() {
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
        <h2 className="text-2xl font-semibold">Round</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-leaf-round.png"
            alt="Round or circular leaves"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          Circular or nearly circular in outline, with the length and width of
          the leaf blade appearing almost equal.
        </p>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <p className="text-[var(--text-primary)] leading-relaxed">
          Round leaves are less common but easy to recognize. In some aquatic
          plants, such as water lilies, the leaf blade can appear almost
          perfectly circular.
        </p>
      </div>
    </div>
  );
}
