"use client";

import Link from "next/link";

export default function LinearPage() {
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
        <h2 className="text-2xl font-semibold">Linear</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-leaf-linear.png"
            alt="Linear leaves long and narrow with parallel sides"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          Very long and narrow with nearly parallel sides from base to tip.
        </p>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <p className="text-[var(--text-primary)] leading-relaxed">
          Linear leaves are typical of grasses and many monocots. Their
          streamlined shape allows them to bend easily in wind and rain.
        </p>
      </div>
    </div>
  );
}
