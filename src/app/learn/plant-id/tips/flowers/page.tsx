"use client";

import Link from "next/link";

const SECTIONS = [
  {
    title: "Petal count and symmetry",
    content: "Count the petals and look closely at the flower's overall shape. Flowers with petals in multiples of three are often monocots such as lilies or tulips. Flowers with petals in multiples of four or five are typically dicots such as roses or buttercups. Also notice symmetry. Some flowers are evenly shaped all the way around like daisies, while others mirror along a single line, such as snapdragons.",
  },
  {
    title: "Reproductive parts",
    content: "The stamens are the pollen-producing structures usually found surrounding the center of the flower. The pistil is the central female structure. Its base, the ovary, develops into fruit after pollination. At the top of the pistil is the stigma, where pollen lands and begins the process of fertilization.",
  },
  {
    title: "Sepals",
    content: "Sepals form the outermost layer of the flower bud and protect the developing flower before it opens. They are often green and leaflike. Counting and observing sepals can provide useful identification clues.",
  },
  {
    title: "Fragrance",
    content: "Scent plays an important role in attracting pollinators. Sweet floral fragrances commonly attract bees and butterflies, while stronger or musky scents may attract flies or beetles.",
  },
];

export default function FlowersTipPage() {
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
        <h2 className="text-2xl font-semibold">Flowers</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-flowers-diagram.png"
            alt="Flower diagram showing symmetry types, reproductive parts, inflorescence arrangements, and sepals"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          Flower structure is one of the most reliable ways to identify a plant.
          These characteristics are genetically consistent within a species and
          often provide clear clues about a plant&apos;s identity.
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
            When possible, also observe the position of the ovary and how the
            flowers are arranged. Some plants produce individual flowers, while
            others grow in clusters such as umbels, spikes, or racemes.
          </p>
        </section>
      </div>
    </div>
  );
}
