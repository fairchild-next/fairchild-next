"use client";

import Link from "next/link";

const LEAF_SHAPES = [
  { name: "Lanceolate", href: "/learn/plant-id/leaf-shapes/lanceolate", desc: "Long and narrow, like a spear tip" },
  { name: "Pinnate", href: "/learn/plant-id/leaf-shapes/pinnate", desc: "Leaflets arranged along a central stem" },
  { name: "Ovate", href: "/learn/plant-id/leaf-shapes/ovate", desc: "Egg-shaped, broader at the base" },
  { name: "Elliptic", href: "/learn/plant-id/leaf-shapes/elliptic", desc: "Oval, widest in the middle" },
  { name: "Palmate", href: "/learn/plant-id/leaf-shapes/palmate", desc: "Lobes radiate from a central point like a hand" },
  { name: "Heart-shaped", href: "/learn/plant-id/leaf-shapes/heart-shaped", desc: "Cordate, with a notch at the base" },
  { name: "Linear", href: "/learn/plant-id/leaf-shapes/linear", desc: "Long, narrow, parallel sides" },
  { name: "Round", href: "/learn/plant-id/leaf-shapes/round", desc: "Circular or nearly circular outline" },
];

export default function LeafShapesPage() {
  return (
    <div className="pb-24">
      <div className="px-6 pt-4">
        <Link
          href="/learn/plant-id"
          className="text-sm text-[var(--primary)] font-medium"
        >
          ← Back to Plant ID Guide
        </Link>
      </div>

      <div className="px-6 pt-4 pb-6">
        <h2 className="text-2xl font-semibold mb-2">Guide to Leaf Shapes</h2>
        <p className="text-[var(--text-muted)]">
          Discover the various leaf shapes and how they can help you identify
          specific plants.
        </p>
      </div>

      <div className="px-6 space-y-4">
        {LEAF_SHAPES.map((shape) => (
          <Link
            key={shape.name}
            href={shape.href}
            className="block p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
          >
            <div className="flex gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1">{shape.name}</h3>
                <p className="text-sm text-[var(--text-muted)]">{shape.desc}</p>
              </div>
              <span className="shrink-0 text-[var(--text-muted)]">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
