"use client";

import Link from "next/link";

const SECTIONS = [
  {
    title: "Woody or herbaceous",
    content: "Woody plants such as trees and shrubs have stems that persist year round. Herbaceous plants have softer stems that typically die back at the end of the growing season even though the roots survive underground.",
  },
  {
    title: "Tree or shrub",
    content: "Trees usually grow with a single dominant trunk and reach greater heights. Shrubs typically branch near the ground and have multiple stems.",
  },
  {
    title: "Vines and climbers",
    content: "Some plants rely on surrounding structures for support. They may climb using tendrils, aerial roots, or twining stems. The way a plant climbs is often characteristic of a particular species or family.",
  },
  {
    title: "Annual or perennial",
    content: "Annual plants complete their entire life cycle in a single growing season. Perennial plants live for multiple years and return each season from the same root system.",
  },
  {
    title: "Silhouette",
    content: "Observe the plant's overall shape. Some species grow tall and narrow, others spread outward, and some form rounded or mounding crowns. This silhouette is often recognizable even from a distance.",
  },
];

export default function GrowthHabitTipPage() {
  return (
    <div className="pb-24">
      <div className="px-6 pt-4">
        <Link
          href="/learn/plant-id/tips"
          className="text-sm text-[var(--primary)] font-medium"
        >
          ← Back to Plant ID Tips
        </Link>
      </div>

      <div className="px-6 pt-4 space-y-6">
        <h2 className="text-2xl font-semibold">Growth Habit</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-growth-habit-diagram.png"
            alt="Growth habit diagram showing tree, shrub, weeping, annual, and perennial forms"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          Before focusing on small details, step back and observe the plant as a
          whole. Its overall form often provides immediate clues about its identity.
        </p>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">{section.title}</h3>
            <p className="text-[var(--text-primary)] leading-relaxed">
              {section.content}
            </p>
          </section>
        ))}
        <section>
          <p className="text-[var(--text-primary)] leading-relaxed">
            The shape of the stem itself can also provide clues. Stems may be
            round, square, or triangular. Some plants also have specialized
            stem structures such as rhizomes, bulbs, or tendrils.
          </p>
        </section>
      </div>
    </div>
  );
}
