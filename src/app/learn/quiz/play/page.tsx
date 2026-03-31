"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuiz } from "@/lib/quiz/useQuiz";
import QuizProgress from "@/components/quiz/QuizProgress";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizResults from "@/components/quiz/QuizResults";

function QuizPlayContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("quiz") ?? "garden";

  const {
    quiz,
    loading,
    error,
    result,
    currentQuestion,
    totalQuestions,
    currentIndex,
    selectedAnswerId,
    selectAnswer,
    submitAndAdvance,
    restart,
  } = useQuiz(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 guest-theme bg-[var(--background)]">
        <p className="text-[var(--text-muted)]">Loading quiz...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 guest-theme bg-[var(--background)]">
        <p className="text-red-600 mb-4">{error ?? "Quiz not found"}</p>
        <Link
          href={slug === "garden-kids" ? "/kids/learn" : "/learn/quiz"}
          className="text-[var(--primary)] font-medium"
        >
          ← Back to {slug === "garden-kids" ? "Learn" : "Quiz"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col guest-theme bg-[var(--background)]">
      {/* Background image - blurred */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url(/stock/quiz-garden.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px) brightness(0.85)",
        }}
      />
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: "rgba(243, 239, 238, 0.92)" }}
      />

      <div className="px-6 pt-6 pb-24">
        <Link
          href={slug === "garden-kids" ? "/kids/learn" : "/learn/quiz"}
          className="text-sm text-[var(--primary)] font-medium mb-4 inline-block"
        >
          ← Back to {slug === "garden-kids" ? "Learn" : "Quiz"}
        </Link>

        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 text-center">
          {quiz.title}
        </h2>

        {result ? (
          <div className="rounded-2xl bg-white/95 backdrop-blur border border-[var(--surface-border)] p-6 shadow-lg">
            <QuizResults
              result={result}
              quizTitle={quiz.title}
              onRestart={restart}
            />
          </div>
        ) : currentQuestion ? (
          <div className="rounded-2xl bg-white/95 backdrop-blur border border-[var(--surface-border)] p-6 shadow-lg">
            <QuizProgress current={currentIndex} total={totalQuestions} />
            <div className="mt-6">
              <QuizQuestion
                question={currentQuestion}
                selectedAnswerId={selectedAnswerId}
                onSelect={selectAnswer}
              />
            </div>
            <button
              type="button"
              onClick={submitAndAdvance}
              disabled={!selectedAnswerId}
              className="w-full mt-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function QuizPlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center px-6 guest-theme bg-[var(--background)]">
        <p className="text-[var(--text-muted)]">Loading quiz...</p>
      </div>
    }>
      <QuizPlayContent />
    </Suspense>
  );
}
