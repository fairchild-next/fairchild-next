"use client";

import Link from "next/link";

const SECTIONS = [
  {
    title: "Texture",
    content: "Bark may be smooth, papery, scaly, furrowed, or plated. Young trees often begin with smooth bark that becomes thicker and more deeply ridged as the tree ages.",
  },
  {
    title: "Color",
    content: "Bark color ranges from pale white to gray, reddish brown, or nearly black. Young stems may appear green because they still contain chlorophyll.",
  },
  {
    title: "Lenticels",
    content: "Small pores called lenticels often appear as dots or horizontal lines on the bark. These openings allow gases to move between the internal tissues of the plant and the surrounding air. Their shape and pattern can vary by species.",
  },
  {
    title: "Sap and scent",
    content: "Breaking a small twig may reveal colored sap, milky latex, or a distinctive scent. Some trees can even be recognized by smell. Sassafras twigs have a scent often compared to root beer, while yellow birch may smell like wintergreen.",
  },
  {
    title: "Thorns and prickles",
    content: "Thorns are modified branches that grow directly from the stem and are firmly attached to the wood. Prickles, like those on roses, grow from the outer surface of the stem and can break away more easily.",
  },
];

export default function StemBarkTipPage() {
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
        <h2 className="text-2xl font-semibold">Stem and Bark</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-stem-bark-diagram.png"
            alt="Stem and bark diagram showing textures, lenticels, thorns, and prickles"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          Stems and bark can reveal important identification clues, particularly
          when leaves or flowers are not present.
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
      </div>
    </div>
  );
}
