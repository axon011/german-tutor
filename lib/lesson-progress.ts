/**
 * Per-lesson progress for the guided curriculum.
 *
 * Same shape as lib/error-log.ts and for the same reason: localStorage now,
 * Postgres in slice 3, behind read/mutate/subscribe so the swap touches only
 * this file. Client-safe, SSR-guarded, silent on failure — losing progress is
 * an annoyance, never an error the learner has to deal with.
 */

const STORAGE_KEY = "lesson-progress";
const CHANGE_EVENT = "lesson-progress-changed";

/** User turns inside a lesson before it counts as complete. */
export const COMPLETE_TURNS = 6;

export interface LessonEntry {
  startedAt: number;
  /** User messages sent while this lesson was active. */
  turns: number;
  completedAt?: number;
}

export type LessonProgress = Record<string, LessonEntry>;

function isLessonEntry(v: unknown): v is LessonEntry {
  if (typeof v !== "object" || v === null) return false;
  const e = v as Record<string, unknown>;
  return typeof e.startedAt === "number" && typeof e.turns === "number";
}

/** Read the whole map. Returns {} on SSR or any failure. */
export function readLessonProgress(): LessonProgress {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}",
    );
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const out: LessonProgress = {};
    for (const [id, entry] of Object.entries(parsed)) {
      if (isLessonEntry(entry)) out[id] = entry;
    }
    return out;
  } catch {
    return {};
  }
}

function write(progress: LessonProgress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Quota / private mode — still notify so the open view stays consistent.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Mark a lesson as started. No-op if it already has an entry. */
export function startLesson(lessonId: string): LessonEntry | undefined {
  if (typeof window === "undefined") return undefined;
  const progress = readLessonProgress();
  const existing = progress[lessonId];
  if (existing) return existing;
  const entry: LessonEntry = { startedAt: Date.now(), turns: 0 };
  progress[lessonId] = entry;
  write(progress);
  return entry;
}

/**
 * Count one user turn in this lesson. Sets `completedAt` the moment `turns`
 * reaches {@link COMPLETE_TURNS}, and only then — so the caller can compare
 * the returned entry against its own knowledge to catch the completion moment
 * exactly once.
 */
export function recordLessonTurn(lessonId: string): LessonEntry | undefined {
  if (typeof window === "undefined") return undefined;
  const progress = readLessonProgress();
  const prev = progress[lessonId] ?? { startedAt: Date.now(), turns: 0 };
  const entry: LessonEntry = { ...prev, turns: prev.turns + 1 };
  if (!entry.completedAt && entry.turns >= COMPLETE_TURNS) {
    entry.completedAt = Date.now();
  }
  progress[lessonId] = entry;
  write(progress);
  return entry;
}

/** Subscribe to progress changes. Returns an unsubscribe function. */
export function onLessonProgressChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
}

export function isCompleted(entry: LessonEntry | undefined): boolean {
  return Boolean(entry?.completedAt);
}
