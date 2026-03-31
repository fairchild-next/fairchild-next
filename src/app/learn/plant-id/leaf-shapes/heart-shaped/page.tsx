"use client";

import Link from "next/link";

export default function HeartShapedPage() {
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
        <h2 className="text-2xl font-semibold">Heart-shaped (Cordate)</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-leaf-heart-shaped.png"
            alt="Heart-shaped cordate leaves with rounded lobes at the base"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          A leaf with a rounded outline and a noticeable notch at the base where
          the leaf meets the stem.
        </p>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <p className="text-[var(--text-primary)] leading-relaxed">
          The two rounded lobes at the base give the leaf its heart-like
          appearance. This shape is often seen in plants such as redbuds and
          many vines.
        </p>
      </div>
    </div>
  );
}
