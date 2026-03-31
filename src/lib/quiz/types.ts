/**
 * Quiz types - shared schema for static JSON and future API providers.
 */

export interface QuizAnswer {
  id: string;
  text: string;
}

export type QuizDifficulty = "easy" | "medium" | "hard" | "expert";

export interface QuizQuestion {
  id: string;
  text: string;
  difficulty: QuizDifficulty;
  answers: QuizAnswer[];
  correctAnswerId: string;
  /** Optional explanation shown after answering */
  explanation?: string;
}

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description?: string;
  /** Number of questions to show (for random subset). Omit = use all. */
  questionCount?: number;
  questions: QuizQuestion[];
}

export interface QuizState {
  quizId: string;
  /** IDs of questions in this session (random subset) */
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, string>; // questionId -> selected answerId
  startedAt: number;
}

export interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  answers: Record<string, { selectedId: string; correctId: string; isCorrect: boolean }>;
  completedAt: number;
}
