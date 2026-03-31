/**
 * QuizProvider interface - abstract data source for quiz content.
 * Swap implementations (Static vs API) without changing UI.
 */

import type { Quiz, QuizQuestion } from "./types";

export interface QuizProvider {
  getQuiz(slug: string): Promise<Quiz>;
}

/** Static provider - loads quiz from JSON. Works offline. */
export class StaticQuizProvider implements QuizProvider {
  private quizzes: Map<string, Quiz> = new Map();

  async getQuiz(slug: string): Promise<Quiz> {
    const cached = this.quizzes.get(slug);
    if (cached) return cached;

    const quizLoaders: Record<string, () => Promise<Quiz>> = {
      garden: () =>
        import("@/data/quizzes/garden-quiz.json").then((m) => m.default as Quiz),
      "garden-kids": () =>
        import("@/data/quizzes/garden-quiz-kids.json").then((m) => m.default as Quiz),
    };

    const loader = quizLoaders[slug];
    if (!loader) throw new Error(`Quiz not found: ${slug}`);

    const quiz = await loader();
    this.quizzes.set(slug, quiz);
    return quiz;
  }
}

const defaultProvider = new StaticQuizProvider();

export function getQuizProvider(): QuizProvider {
  return defaultProvider;
}
