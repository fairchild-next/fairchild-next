"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";
import { getQuizStats } from "@/lib/quiz/stats";
import { Trophy, Plant, ChartBar } from "@phosphor-icons/react";

export default function AccountStatsPage() {
  const router = useRouter();
  const supabase = useSupabaseBrowserClient();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [quizStats, setQuizStats] = useState<ReturnType<typeof getQuizStats> | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login?redirect=" + encodeURIComponent("/account/stats"));
        return;
      }
      setSessionChecked(true);

      // Fetch visit count from my-tickets API
      const res = await fetch("/api/my-tickets", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setVisitCount(json.visitCount ?? 0);
      } else {
        setVisitCount(0);
      }

      // Quiz stats from localStorage
      setQuizStats(getQuizStats());
    };
    void check();
  }, [router, supabase]);

  if (!sessionChecked) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  const hasQuizStats = quizStats && quizStats.totalCompletions > 0;
  const overallPercent =
    quizStats && quizStats.totalQuestions > 0
      ? Math.round((quizStats.totalCorrect / quizStats.totalQuestions) * 100)
      : 0;

  return (
    <div className="px-6 pt-6 pb-24">
      <Link
        href="/account"
        className="text-[var(--primary)] text-sm font-medium mb-6 inline-block"
      >
        ← Back
      </Link>

      <h1 className="text-2xl font-semibold mb-6">Your Stats</h1>

      <div className="space-y-6">
        {/* Visit count - same style as tickets/my past tab */}
        {visitCount !== null && visitCount > 0 && (
          <div className="p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex items-center gap-3">
            <Plant size={24} weight="fill" className="shrink-0 text-[var(--primary)]" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Wow! You visited the garden {visitCount} time
              {visitCount === 1 ? "" : "s"} this year.
            </p>
          </div>
        )}

        {/* Quiz stats */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)]">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} weight="fill" className="text-[var(--primary)]" />
            <h2 className="font-semibold text-[var(--text-primary)]">Garden Quiz</h2>
          </div>

          {hasQuizStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--surface-border)]">
                  <p className="text-sm font-medium text-[var(--text-muted)]">
                    Quizzes completed
                  </p>
                  <p className="text-xl font-bold text-[var(--primary)] mt-0.5">
                    {quizStats!.totalCompletions}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--surface-border)]">
                  <p className="text-sm font-medium text-[var(--text-muted)]">
                    Best score
                  </p>
                  <p className="text-xl font-bold text-[var(--primary)] mt-0.5">
                    {quizStats!.bestScore}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <ChartBar size={18} weight="regular" />
                <span>
                  {quizStats!.totalCorrect} of {quizStats!.totalQuestions} correct overall (
                  {overallPercent}%)
                </span>
              </div>
              <Link
                href="/learn/quiz"
                className="inline-block text-sm text-[var(--primary)] font-medium"
              >
                Take the quiz again →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-muted)]">
                Complete the Garden Quiz to see your stats here.
              </p>
              <div className="flex justify-center">
                <Link
                  href="/learn/quiz"
                  className="inline-block px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium"
                >
                  Start Quiz
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
