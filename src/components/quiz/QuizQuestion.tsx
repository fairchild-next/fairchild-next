"use client";

import type { QuizQuestion as QuizQuestionType, QuizAnswer, QuizDifficulty } from "@/lib/quiz/types";
import { Circle } from "@phosphor-icons/react";

const DIFFICULTY_CONFIG: Record<
  QuizDifficulty,
  { label: string; dotColor: string }
> = {
  easy: { label: "Easy", dotColor: "bg-green-500" },
  medium: { label: "Medium", dotColor: "bg-blue-500" },
  hard: { label: "Hard", dotColor: "bg-red-500" },
  expert: { label: "Expert", dotColor: "bg-black" },
};

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswerId: string | null;
  onSelect: (answerId: string) => void;
}

export default function QuizQuestion({
  question,
  selectedAnswerId,
  onSelect,
}: QuizQuestionProps) {
  const config = DIFFICULTY_CONFIG[question.difficulty] ?? DIFFICULTY_CONFIG.easy;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)]">
          <span className={`w-2 h-2 rounded-full shrink-0 ${config.dotColor}`} />
          {config.label}
        </span>
      </div>
      <h3 className="text-lg font-medium text-[var(--text-primary)] leading-snug">
        {question.text}
      </h3>
      <div className="space-y-2">
        {question.answers.map((answer: QuizAnswer) => {
          const isSelected = selectedAnswerId === answer.id;
          return (
            <button
              key={answer.id}
              type="button"
              onClick={() => onSelect(answer.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--surface-border)] bg-[var(--surface)] hover:border-[var(--primary)]/50"
              }`}
            >
              <span className="shrink-0">
                <Circle
                  size={20}
                  weight={isSelected ? "fill" : "regular"}
                  className={isSelected ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}
                />
              </span>
              <span className="text-sm text-[var(--text-primary)]">{answer.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
