/**
 * Pure rules of the learning path — no DB, no clock — so the Today state can
 * be tested without Postgres. lib/db/path.ts feeds these with query results.
 */

import { LESSONS, lessonsForLevel } from "../curriculum";
import type { PathLessonState, TodayState } from "./types";

/** completed && checkBest ≥ 2 && words seeded && every word reviewed once. */
export function isMastered(s: Omit<PathLessonState, "mastered">): boolean {
  return (
    s.completed &&
    s.checkBest !== null &&
    s.checkBest >= 2 &&
    s.wordsTotal > 0 &&
    s.wordsReviewed === s.wordsTotal
  );
}

/** The first lesson (path order) that is not yet mastered, with its place in its level. */
export function nextLesson(
  lessons: Record<string, PathLessonState>,
): { lessonId: string; position: NonNullable<TodayState["position"]> } | null {
  for (const lesson of LESSONS) {
    if (lessons[lesson.id]?.mastered) continue;
    const inLevel = lessonsForLevel(lesson.level);
    return {
      lessonId: lesson.id,
      position: {
        level: lesson.level,
        index: inLevel.findIndex((l) => l.id === lesson.id) + 1,
        total: inLevel.length,
      },
    };
  }
  return null;
}

const MS_PER_DAY = 86_400_000;

/** Whole-day number for a YYYY-MM-DD string; Date.UTC keeps timezones out of it. */
function dayNumber(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / MS_PER_DAY);
}

/**
 * Consecutive active days ending at `today`. If today has no activity yet the
 * count ends yesterday instead, so an unfinished morning does not zero the
 * streak; with neither day active it is 0.
 */
export function computeStreak(activeDays: string[], today: string): number {
  const active = new Set(activeDays.map(dayNumber));
  let cursor = dayNumber(today);
  if (!active.has(cursor)) cursor -= 1;
  let streak = 0;
  while (active.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}
