"use client";

import Link from "next/link";

const SECTIONS = [
  {
    title: "Fleshy or dry fruits",
    content: "Fleshy fruits are often brightly colored and meant to be eaten by animals, which carry the seeds away from the parent plant. Dry fruits such as pods, capsules, or winged seeds disperse through wind, water, or mechanical action.",
  },
  {
    title: "Dispersal clues",
    content: "Wings or feathery structures allow seeds to travel on the wind, as seen in maple samaras or dandelions. Hooks, barbs, or sticky coatings allow seeds to attach to animal fur or clothing. Brightly colored fruits with sweet flesh attract birds and mammals that spread the seeds after eating them. Floating husks allow seeds to travel through water. Some pods split open suddenly when dry, releasing seeds with force.",
  },
  {
    title: "Seed number",
    content: "Some fruits contain a single seed, such as cherries, peaches, or avocados. Others contain many seeds, such as tomatoes, grapes, or cucumbers.",
  },
  {
    title: "Fruit classification",
    content: "Simple fruits develop from a single ovary, as seen in apples or cherries. Aggregate fruits form from a single flower that contains multiple ovaries, such as raspberries or blackberries. Multiple fruits develop from clusters of flowers that fuse together, such as mulberries, figs, or pineapples.",
  },
];

export default function FruitSeedsTipPage() {
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
        <h2 className="text-2xl font-semibold">Fruit and Seeds</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-fruit-seeds-diagram.png"
            alt="Fruit and seeds diagram showing simple, aggregate, and multiple fruits, plus botanical fruits"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          Fruit develops from the flower after pollination and serves an
          important role in protecting and dispersing seeds.
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
        <div className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30">
          <h3 className="text-sm font-semibold text-[var(--primary)] mb-2">Did you know?</h3>
          <p className="text-sm text-[var(--text-primary)]">
            Many foods commonly thought of as vegetables are botanically fruits.
            Tomatoes, peppers, cucumbers, and squash all develop from the ovary
            of a flower.
          </p>
        </div>
      </div>
    </div>
  );
}
