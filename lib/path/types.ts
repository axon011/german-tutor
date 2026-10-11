/**
 * The learning path (beta) — the contract between the /api/me/path routes and
 * the Today tab. The path walks LESSONS in order, A1-01 → B2-08; every day
 * the Today tab offers three steps: review due words, study the next lesson,
 * then speak about it with the tutor.
 *
 * Beta and signed-in only: the routes answer 404 to anyone whose GitHub login
 * is not in PATH_BETA_LOGINS, so guests and other accounts never see it. That
 * is also why this talks to the server directly instead of going through the
 * ProgressStore seam — there is no localStorage twin to keep in step.
 */

import type { CefrLevel } from "../tutor-prompt";
import type { SrsQuality, SrsState } from "../srs";
import type { Gender } from "../lessons/types";

/**
 * One lesson word under spaced repetition. Seeded from the lesson's study
 * sheet the first time its quick check is submitted. The card shows `en`;
 * the learner types the German — with its article when `gender` is set.
 */
export interface WordCard extends SrsState {
  id: string;
  lessonId: string;
  de: string;
  en: string;
  gender?: Gender;
  plural?: string;
  createdAt: number;
}

/** Where a learner stands on one lesson. Only lessons with any progress appear. */
export interface PathLessonState {
  lessonId: string;
  turns: number;
  /** Reached COMPLETE_TURNS conversation turns at some point. */
  completed: boolean;
  /** Best quick-check score so far (0–3), null before the first check. */
  checkBest: number | null;
  /** Word cards seeded for this lesson (0 before the first check). */
  wordsTotal: number;
  /** Of those, cards reviewed at least once (reps ≥ 1). */
  wordsReviewed: number;
  /**
   * completed && checkBest ≥ 2 && wordsTotal > 0 && wordsReviewed === wordsTotal.
   * Computed on read, never stored.
   */
  mastered: boolean;
}

export interface TodayState {
  /** The learner's local calendar day, YYYY-MM-DD, as sent by the client. */
  day: string;
  /** First lesson in LESSONS order that is not mastered; null when all are. */
  nextLessonId: string | null;
  /** Position of nextLessonId inside its level: "A1 · lesson 3 of 8". */
  position: { level: CefrLevel; index: number; total: number } | null;
  lessons: Record<string, PathLessonState>;
  dueWords: number;
  dueMistakes: number;
  /** Word cards with reps ≥ 1 across all lessons. */
  wordsLearned: number;
  /** Consecutive active days ending today (or yesterday if today has no activity yet). */
  streak: number;
  /** What was done on `day`. */
  today: { reviews: number; checks: number; turns: number };
}

/**
 * API (all JSON, all session-scoped; 401 when signed out, 404 when not beta):
 *
 *   GET  /api/me/path/today?day=YYYY-MM-DD             → TodayState
 *   POST /api/me/path/check   { lessonId, correct, total, day }
 *        records the score (checkBest = max), seeds the lesson's word cards
 *        (idempotent), counts one check for `day`         → TodayState
 *   GET  /api/me/path/words/due?limit=20               → { cards: WordCard[] }
 *   POST /api/me/path/words/review { id, quality, day } → { ok: true }
 *
 * The existing POST /api/me/lessons/turn also accepts an optional `day` and,
 * when present, counts the turn toward that day's activity.
 */
export type WordReviewQuality = SrsQuality;

/** YYYY-MM-DD — validated by the routes. */
export const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
