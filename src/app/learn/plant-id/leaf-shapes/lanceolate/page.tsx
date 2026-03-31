"use client";

import Link from "next/link";

export default function LanceolatePage() {
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
        <h2 className="text-2xl font-semibold">Lanceolate</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-leaf-lanceolate.png"
            alt="Lanceolate leaves showing long, narrow spear-tip shape"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          Long and narrow, shaped like the tip of a spear. The leaf is widest in
          the lower third of the blade and tapers gradually toward both ends,
          with the tip being more drawn out than the base.
        </p>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <p className="text-[var(--text-primary)] leading-relaxed">
          Lanceolate leaves are common in plants that grow in sunny or dry
          environments, where a narrower surface can help reduce water loss.
        </p>
      </div>
    </div>
  );
}
