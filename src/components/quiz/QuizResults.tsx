"use client";

import Link from "next/link";
import { Trophy, ArrowCounterClockwise } from "@phosphor-icons/react";
import type { QuizResult } from "@/lib/quiz/types";

interface QuizResultsProps {
  result: QuizResult;
  quizTitle: string;
  onRestart: () => void;
}

export default function QuizResults({
  result,
  quizTitle,
  onRestart,
}: QuizResultsProps) {
  const percent = Math.round((result.score / result.total) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Trophy size={48} weight="fill" className="mx-auto mb-3 text-[var(--primary)]" />
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
          Quiz Complete!
        </h3>
        <p className="text-3xl font-bold text-[var(--primary)]">
          {result.score} / {result.total}
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {percent}% correct
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold"
        >
          <ArrowCounterClockwise size={20} weight="bold" />
          Try Again
        </button>
        <Link
          href="/learn/quiz"
          className="flex-1 flex items-center justify-center py-3 rounded-xl border border-[var(--surface-border)] text-[var(--text-primary)] font-semibold"
        >
          Back to Quiz
        </Link>
      </div>
    </div>
  );
}
