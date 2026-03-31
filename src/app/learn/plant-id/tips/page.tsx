"use client";

import Link from "next/link";

const TIPS = [
  { icon: "🌸", title: "Flowers", href: "/learn/plant-id/tips/flowers", text: "Note the size, shape, color, fragrance, and the number of petals and stamens. Flower structure is often key to plant identification." },
  { icon: "🍃", title: "Leaves", href: "/learn/plant-id/tips/leaves", text: "Observe the shape, size, edge (smooth or toothed), arrangement on the stem, and any unique textures or patterns." },
  { icon: "🌳", title: "Stem & Bark", href: "/learn/plant-id/tips/stem-bark", text: "Examine the stem or bark for color, texture, thorns, and presence of sap. Bark pattern can distinguish similar trees." },
  { icon: "🌿", title: "Growth Habit", href: "/learn/plant-id/tips/growth-habit", text: "Determine if the plant is a tree, shrub, vine, or another type, and observe its overall size and shape." },
  { icon: "🥑", title: "Fruit & Seeds", href: "/learn/plant-id/tips/fruit-seeds", text: "Look at the plant's fruit, seed pods, or berries. Note their shape, color, and how they are arranged." },
];

export default function PlantIDTipsPage() {
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
        <h2 className="text-2xl font-semibold mb-2">
          Plant Identification Tips
        </h2>
        <p className="text-[var(--text-muted)]">
          Use these helpful tips and observations to identify plants by examining
          their key characteristics in the garden and beyond.
        </p>
      </div>

      <div className="px-6 space-y-6">
        {TIPS.map((tip) => (
          <Link
            key={tip.title}
            href={tip.href}
            className="block p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
          >
            <div className="flex gap-4">
              <span className="text-2xl shrink-0">{tip.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-2">{tip.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {tip.text}
                </p>
              </div>
              <span className="shrink-0 text-[var(--text-muted)]">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
