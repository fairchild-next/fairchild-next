"use client";

import Link from "next/link";

const STEPS = [
  {
    num: 1,
    icon: "🔭",
    title: "Observe in the Field",
    text: "Take notes and photos of the plant's flowers, leaves, bark, fruit, and habitat.",
  },
  {
    num: 2,
    icon: "📖",
    title: "Use a Field Guide",
    text: "Compare your observations with field guide illustrations to identify the plant.",
  },
  {
    num: 3,
    icon: "📱",
    title: "Check a Plant ID App",
    text: "Use a smartphone app to identify the plant if you're unsure.",
  },
  {
    num: 4,
    icon: "👤",
    title: "Ask an Expert",
    text: "Seek help from knowledgeable staff or local experts for identification confirmation.",
  },
];

export default function FieldGuidePage() {
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
          Field Guide for Beginners
        </h2>
        <p className="text-[var(--text-muted)]">
          Follow the step-by-step guide to learn how to identify plants in the
          wild.
        </p>
      </div>

      <div className="px-6 space-y-6">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)]"
          >
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center font-bold text-[var(--primary)]">
                {step.num}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{step.icon}</span>
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {step.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
