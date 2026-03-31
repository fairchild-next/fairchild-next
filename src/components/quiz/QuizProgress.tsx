"use client";

interface QuizProgressProps {
  current: number;
  total: number;
}

export default function QuizProgress({ current, total }: QuizProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--text-muted)]">
        Question {current + 1} of {total}
      </p>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= current ? "bg-[var(--primary)]" : "bg-[var(--surface-border)]"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
