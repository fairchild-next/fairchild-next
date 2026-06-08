/**
 * QuizProvider interface - abstract data source for quiz content.
 */

import type { Quiz, QuizQuestion } from "./types";

export interface QuizProvider {
  getQuiz(slug: string): Promise<Quiz>;
}

async function loadFromJson(slug: string): Promise<Quiz> {
  const quizLoaders: Record<string, () => Promise<Quiz>> = {
    garden: () =>
      import("@/data/quizzes/garden-quiz.json").then((m) => m.default as Quiz),
    "garden-kids": () =>
      import("@/data/quizzes/garden-quiz-kids.json").then((m) => m.default as Quiz),
  };
  const loader = quizLoaders[slug];
  if (!loader) throw new Error(`Quiz not found: ${slug}`);
  return loader();
}

/** Loads quiz from DB API first, falls back to bundled JSON. */
export class StaticQuizProvider implements QuizProvider {
  private cache = new Map<string, Quiz>();

  async getQuiz(slug: string): Promise<Quiz> {
    const cached = this.cache.get(slug);
    if (cached) return cached;

    try {
      const res = await fetch(`/api/quizzes/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json() as { quiz: Quiz };
        this.cache.set(slug, data.quiz);
        return data.quiz;
      }
    } catch {
      // fall through to JSON
    }

    const quiz = await loadFromJson(slug);
    this.cache.set(slug, quiz);
    return quiz;
  }
}

const defaultProvider = new StaticQuizProvider();

export function getQuizProvider(): QuizProvider {
  return defaultProvider;
}
