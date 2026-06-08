"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { QuizQuestion } from "@/lib/quiz/types";

type QuizSummary = {
  slug: string;
  title: string;
  description: string | null;
  question_count: number | null;
  is_active: boolean;
};

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function StaffQuizPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("garden");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void loadList(); }, []);

  useEffect(() => {
    if (selectedSlug) void loadQuiz(selectedSlug);
  }, [selectedSlug]);

  async function loadList() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quizzes", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { quizzes: QuizSummary[] };
        setQuizzes(d.quizzes ?? []);
        if (d.quizzes?.length && !d.quizzes.find((q) => q.slug === selectedSlug)) {
          setSelectedSlug(d.quizzes[0].slug);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadQuiz(slug: string) {
    const res = await fetch(`/api/admin/quizzes/${slug}`, { credentials: "include" });
    if (res.ok) {
      const d = await res.json() as { quiz: { title: string; description: string | null; questions: QuizQuestion[] } };
      setTitle(d.quiz.title);
      setDescription(d.quiz.description ?? "");
      setQuestions(d.quiz.questions ?? []);
    }
  }

  async function seedDefaults() {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: true }),
      });
      if (res.ok) {
        await loadList();
        await loadQuiz(selectedSlug);
      } else {
        const d = await res.json() as { error?: string };
        setError(d.error ?? "Seed failed");
      }
    } finally {
      setSeeding(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/quizzes/${selectedSlug}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, questions }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        await loadList();
      } else {
        const d = await res.json() as { error?: string };
        setError(d.error ?? "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  function updateQuestionText(id: string, text: string) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-28">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff/more" className="text-[var(--text-muted)]"><IconBack /></Link>
        <div className="flex-1">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Garden Quiz</p>
        </div>
      </div>

      <div className="px-5 space-y-5">
        <div className="rounded-2xl px-4 py-3 text-sm text-[var(--text-muted)]"
          style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
          Edit quiz titles and question text shown in Learn. Run &quot;Import defaults&quot; once after migration to load bundled quizzes into the database.
        </div>

        {quizzes.length === 0 && !loading && (
          <button onClick={seedDefaults} disabled={seeding}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "var(--primary)" }}>
            {seeding ? "Importing…" : "Import Default Quizzes"}
          </button>
        )}

        <div className="flex gap-2">
          {(["garden", "garden-kids"] as const).map((slug) => (
            <button key={slug} onClick={() => setSelectedSlug(slug)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${selectedSlug === slug ? "text-white" : "text-[var(--text-muted)]"}`}
              style={{ background: selectedSlug === slug ? "var(--primary)" : "var(--surface)", border: "1px solid var(--surface-border)" }}>
              {slug === "garden" ? "Adult Quiz" : "Kids Quiz"}
            </button>
          ))}
        </div>

        {!loading && (
          <>
            <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-[var(--text-primary)] px-1">{questions.length} questions</p>
              {questions.map((q, i) => (
                <div key={q.id} className="rounded-2xl p-4 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">Question {i + 1}</p>
                  <textarea value={q.text} onChange={(e) => updateQuestionText(q.id, e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: "var(--background)", border: "1px solid var(--surface-border)" }} />
                  <p className="text-xs text-[var(--text-muted)]">Correct: {q.answers.find((a) => a.id === q.correctAnswerId)?.text ?? "—"}</p>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3" style={{ background: "var(--background)", borderTop: "1px solid var(--surface-border)" }}>
        <button onClick={save} disabled={saving || loading}
          className="w-full py-3.5 rounded-2xl text-base font-bold text-white disabled:opacity-60" style={{ background: "var(--primary)" }}>
          {saving ? "Saving…" : saved ? "Saved!" : "Save Quiz"}
        </button>
      </div>
    </div>
  );
}
