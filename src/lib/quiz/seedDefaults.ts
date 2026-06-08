import type { Quiz } from "./types";

/** Load built-in quiz JSON files for seeding the DB. */
export async function loadDefaultQuizzes(): Promise<Quiz[]> {
  const [garden, kids] = await Promise.all([
    import("@/data/quizzes/garden-quiz.json").then((m) => m.default as Quiz),
    import("@/data/quizzes/garden-quiz-kids.json").then((m) => m.default as Quiz),
  ]);
  return [garden, kids];
}
