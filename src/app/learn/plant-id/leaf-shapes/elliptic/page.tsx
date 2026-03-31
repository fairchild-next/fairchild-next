"use client";

import Link from "next/link";

export default function EllipticPage() {
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
        <h2 className="text-2xl font-semibold">Elliptic</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-leaf-elliptic.png"
            alt="Elliptic leaves showing oval shape widest at center"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          Oval in outline and widest at the center, tapering evenly toward both
          the base and the tip.
        </p>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <p className="text-[var(--text-primary)] leading-relaxed">
          Elliptic leaves are among the most common shapes in nature. Because
          both ends narrow in a similar way, they often appear balanced and
          symmetrical.
        </p>
      </div>
    </div>
  );
}
