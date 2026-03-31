/**
 * Quiz stats - persisted to localStorage for offline access.
 */

const HISTORY_KEY = "fairchild-quiz-history";

export interface QuizCompletion {
  quizId: string;
  score: number;
  total: number;
  completedAt: number;
}

export interface QuizStats {
  totalCompletions: number;
  totalCorrect: number;
  totalQuestions: number;
  bestScore: number;
  completions: QuizCompletion[];
}

function loadHistory(): QuizCompletion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(completions: QuizCompletion[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(completions));
  } catch {
    /* ignore */
  }
}

/** Append a completion to history (call when quiz is finished). */
export function recordQuizCompletion(completion: QuizCompletion): void {
  const history = loadHistory();
  history.push(completion);
  // Keep last 100 completions to avoid bloat
  const trimmed = history.slice(-100);
  saveHistory(trimmed);
}

/** Get aggregated quiz stats from localStorage. */
export function getQuizStats(): QuizStats {
  const completions = loadHistory();
  let totalCorrect = 0;
  let totalQuestions = 0;
  let bestScore = 0;

  for (const c of completions) {
    totalCorrect += c.score;
    totalQuestions += c.total;
    if (c.total > 0) {
      const pct = (c.score / c.total) * 100;
      if (pct > bestScore) bestScore = Math.round(pct);
    }
  }

  return {
    totalCompletions: completions.length,
    totalCorrect,
    totalQuestions,
    bestScore,
    completions: [...completions].reverse(),
  };
}
