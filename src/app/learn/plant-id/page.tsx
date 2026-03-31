"use client";

import Link from "next/link";

export default function PlantIDGuidePage() {
  return (
    <div className="pb-24">
      <div className="px-6 pt-4">
        <Link href="/learn" className="text-sm text-[var(--primary)] font-medium">
          ← Back to Learn
        </Link>
      </div>

      <div className="px-6 pt-4 pb-8">
        <h2 className="text-2xl font-semibold mb-2">Plant Identification Guide</h2>
        <p className="text-[var(--text-muted)]">
          Learn how to identify plants using helpful tips and techniques to
          recognize plant life at Fairchild and beyond.
        </p>
      </div>

      <div className="relative h-48 mx-6 rounded-xl overflow-hidden bg-[var(--surface)]">
        <img
          src="/stock/plant-id-orchids.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="px-6 mt-8 space-y-4">
        <Link
          href="/learn/plant-id/tips"
          className="block p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <div className="flex gap-4">
            <span className="text-2xl shrink-0">📖</span>
            <div>
              <h3 className="font-semibold">Plant Identification Tips</h3>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Learn key features to look for when identifying plants.
              </p>
            </div>
            <span className="shrink-0 text-[var(--text-muted)]">→</span>
          </div>
        </Link>

        <Link
          href="/learn/plant-id/leaf-shapes"
          className="block p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <div className="flex gap-4">
            <span className="text-2xl shrink-0">🍃</span>
            <div>
              <h3 className="font-semibold">Guide to Leaf Shapes</h3>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Discover the various leaf shapes and how they help identify plants.
              </p>
            </div>
            <span className="shrink-0 text-[var(--text-muted)]">→</span>
          </div>
        </Link>

        <Link
          href="/learn/plant-id/field-guide"
          className="block p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <div className="flex gap-4">
            <span className="text-2xl shrink-0">📋</span>
            <div>
              <h3 className="font-semibold">Field Guide for Beginners</h3>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Follow a step-by-step guide to identifying plants in the garden.
              </p>
            </div>
            <span className="shrink-0 text-[var(--text-muted)]">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
