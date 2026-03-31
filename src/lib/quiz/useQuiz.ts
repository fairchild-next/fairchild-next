"use client";

import { useState, useEffect, useCallback } from "react";
import { getQuizProvider } from "./provider";
import { recordQuizCompletion } from "./stats";
import type {
  Quiz,
  QuizQuestion,
  QuizState,
  QuizResult,
} from "./types";

const STORAGE_KEY = "fairchild-quiz-state";
const RESULT_KEY = "fairchild-quiz-result";
const QUESTIONS_PER_SESSION = 5;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadState(quizId: string): QuizState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizState;
    if (parsed.quizId !== quizId) return null;
    if (!parsed.questionIds?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function pickRandomQuestions(questions: QuizQuestion[]): string[] {
  const shuffled = shuffle(questions);
  return shuffled.slice(0, QUESTIONS_PER_SESSION).map((q) => q.id);
}

function saveState(state: QuizState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function saveResult(result: QuizResult): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RESULT_KEY, JSON.stringify(result));
  } catch {
    /* ignore */
  }
}

export function useQuiz(slug: string = "garden") {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<QuizState | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Load quiz and optionally restore state
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getQuizProvider()
      .getQuiz(slug)
      .then((q) => {
        if (cancelled) return;
        setQuiz(q);
        const restored = loadState(q.id);
        if (restored) {
          setState(restored);
        } else {
          const questionIds = pickRandomQuestions(q.questions);
          setState({
            quizId: q.id,
            questionIds,
            currentIndex: 0,
            answers: {},
            startedAt: Date.now(),
          });
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to load quiz");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const sessionQuestions: QuizQuestion[] =
    quiz && state
      ? state.questionIds
          .map((id) => quiz.questions.find((q) => q.id === id))
          .filter((q): q is QuizQuestion => q != null)
      : [];
  const currentQuestion = sessionQuestions[state?.currentIndex ?? 0];
  const totalQuestions = sessionQuestions.length;
  const selectedAnswerId = currentQuestion
    ? state?.answers[currentQuestion.id] ?? null
    : null;
  const isLastQuestion =
    state !== null && sessionQuestions.length > 0 && state.currentIndex >= sessionQuestions.length - 1;

  const selectAnswer = useCallback(
    (answerId: string) => {
      if (!quiz || !state || !currentQuestion) return;
      const nextAnswers = { ...state.answers, [currentQuestion.id]: answerId };
      const nextState: QuizState = { ...state, answers: nextAnswers };
      setState(nextState);
      saveState(nextState);
    },
    [quiz, state, currentQuestion]
  );

  const submitAndAdvance = useCallback(() => {
    if (!quiz || !state || !selectedAnswerId) return;

    const session = state.questionIds
      .map((id) => quiz.questions.find((q) => q.id === id))
      .filter((q): q is QuizQuestion => q != null);

    if (isLastQuestion) {
      // Compute result
      const answers: QuizResult["answers"] = {};
      let score = 0;
      for (const q of session) {
        const selected = state.answers[q.id];
        const correct = q.correctAnswerId;
        const isCorrect = selected === correct;
        if (isCorrect) score++;
        answers[q.id] = {
          selectedId: selected ?? "",
          correctId: correct,
          isCorrect,
        };
      }
      const quizResult: QuizResult = {
        quizId: quiz.id,
        score,
        total: session.length,
        answers,
        completedAt: Date.now(),
      };
      setResult(quizResult);
      saveResult(quizResult);
      recordQuizCompletion({
        quizId: quiz.id,
        score,
        total: session.length,
        completedAt: Date.now(),
      });
      setState(null);
      localStorage.removeItem(STORAGE_KEY);
    } else {
      const nextState: QuizState = {
        ...state,
        currentIndex: state.currentIndex + 1,
      };
      setState(nextState);
      saveState(nextState);
    }
  }, [quiz, state, selectedAnswerId, isLastQuestion]);

  const restart = useCallback(() => {
    if (!quiz) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RESULT_KEY);
    const questionIds = pickRandomQuestions(quiz.questions);
    setState({
      quizId: quiz.id,
      questionIds,
      currentIndex: 0,
      answers: {},
      startedAt: Date.now(),
    });
    setResult(null);
  }, [quiz]);

  return {
    quiz,
    loading,
    error,
    state,
    result,
    currentQuestion,
    totalQuestions,
    currentIndex: state?.currentIndex ?? 0,
    selectedAnswerId,
    isLastQuestion,
    selectAnswer,
    submitAndAdvance,
    restart,
  };
}
