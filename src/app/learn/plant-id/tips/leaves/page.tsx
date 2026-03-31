"use client";

import Link from "next/link";

const SECTIONS = [
  {
    title: "Arrangement on the stem",
    content: "Look at how the leaves attach to the stem. They may grow alternately along the stem, in opposite pairs, or in circular groupings called whorls. This simple observation can quickly narrow down possible plant families.",
  },
  {
    title: "Simple or compound leaves",
    content: "A simple leaf consists of one blade attached to a stem. A compound leaf is divided into multiple leaflets that all connect to a single central stalk. Although it may appear to be several leaves, botanically it is considered one leaf.",
  },
  {
    title: "Shape and edges",
    content: "Leaf shapes vary widely. Some are long and narrow, others are oval or heart-shaped. The edges may be smooth, toothed, or deeply lobed.",
  },
  {
    title: "Texture and surface",
    content: "Leaves may feel waxy, hairy, rough, or smooth. These textures often reflect how a plant has adapted to its environment. For example, many plants that grow in dry climates have thick waxy leaves that help reduce water loss.",
  },
  {
    title: "Venation",
    content: "The pattern of veins can also provide clues. Parallel veins are typical of monocots such as grasses, while branching networks of veins are typical of dicots such as oaks and maples.",
  },
];

export default function LeavesTipPage() {
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
        <h2 className="text-2xl font-semibold">Leaves</h2>

        <div className="w-full rounded-xl overflow-hidden">
          <img
            src="/stock/plant-id-leaves-diagram.png"
            alt="Leaf diagram showing arrangement on stem, simple and compound leaves, margins, and stem features"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-[var(--text-muted)]">
          Leaves are usually the most visible and accessible feature on a plant,
          and their details are often specific to particular species.
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
            Also notice whether leaves attach to the stem by a small stalk called
            a petiole or attach directly to the stem. Some species also have
            small structures called stipules at the base of the leaf stalk.
          </p>
        </section>
      </div>
    </div>
  );
}
