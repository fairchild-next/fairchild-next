"use client";

import Link from "next/link";
import { MagnifyingGlass, Lightbulb, Trophy, ChartBar } from "@phosphor-icons/react";

export default function QuizPage() {
  return (
    <div className="px-6 pt-6 pb-24">
      <Link href="/learn" className="text-sm text-[var(--primary)] font-medium mb-6 inline-block">
        ← Back to Learn
      </Link>
      <h2 className="text-2xl font-semibold mb-6">Garden Quiz</h2>

      <div className="relative h-48 rounded-xl overflow-hidden bg-[var(--surface)] mb-6">
        <img
          src="/stock/quiz-garden.png"
          alt="Visitors exploring the garden"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 mb-8">
        <p className="text-sm text-[var(--text-primary)]">
          <strong className="text-[var(--primary)]">Did you know?</strong>{" "}
          Fairchild is more than a garden. It&apos;s a center for science,
          conservation, and education.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 min-w-0">
        <div className="aspect-square p-3 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] text-center shadow-sm flex flex-col items-center justify-center min-w-0 overflow-hidden">
          <MagnifyingGlass size={22} weight="regular" className="mx-auto mb-1.5 text-[var(--primary)] shrink-0" />
          <p className="font-medium text-sm">Learn</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-tight line-clamp-2">Uncover plant facts</p>
        </div>
        <div className="aspect-square p-3 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] text-center shadow-sm flex flex-col items-center justify-center min-w-0 overflow-hidden">
          <Lightbulb size={22} weight="regular" className="mx-auto mb-1.5 text-[var(--primary)] shrink-0" />
          <p className="font-medium text-sm">Challenge</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-tight line-clamp-2">Test your garden knowledge</p>
        </div>
        <div className="aspect-square p-3 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] text-center shadow-sm flex flex-col items-center justify-center min-w-0 overflow-hidden">
          <Trophy size={22} weight="regular" className="mx-auto mb-1.5 text-[var(--primary)] shrink-0" />
          <p className="font-medium text-sm">Collect</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-tight line-clamp-2">Earn badges & rewards</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] text-center mb-4">
        <p className="text-[var(--text-muted)] text-sm mb-4">
          Test your garden knowledge with interactive questions!
        </p>
        <Link
          href="/learn/quiz/play"
          className="inline-block px-8 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors"
        >
          Get Started
        </Link>
      </div>
      <div className="text-center">
        <Link
          href="/account/stats"
          className="inline-flex items-center gap-2 text-sm text-[var(--primary)] font-medium hover:underline"
        >
          <ChartBar size={18} weight="regular" />
          See your stats
        </Link>
      </div>
    </div>
  );
}
