"use client";

import Link from "next/link";

export default function OvatePage() {
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
        <h2 className="text-2xl font-semibold">Ovate</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-leaf-ovate.png"
            alt="Ovate leaves showing egg-shaped blade with widest part near the base"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          Egg-shaped, with the widest part of the leaf closer to the base where
          it meets the stem. The tip gradually narrows toward the end of the
          blade.
        </p>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <p className="text-[var(--text-primary)] leading-relaxed">
          This shape is common in many flowering plants and trees. Because the
          base is broader than the tip, ovate leaves often appear slightly
          heavier toward the bottom.
        </p>
      </div>
    </div>
  );
}
