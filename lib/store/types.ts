/**
 * The ProgressStore seam — the persistence twin of lib/llm/provider.ts.
 * Everything the app remembers about a learner (errors, lesson progress, SRS
 * cards) goes through this interface, so guest mode (localStorage) and
 * signed-in mode (Postgres via API routes) are interchangeable.
 */

import type { ErrorRecord } from "../error-log";
import type { LessonEntry, LessonProgress } from "../lesson-progress";
import type { SrsQuality, SrsState } from "../srs";

export type LessonProgressMap = LessonProgress;

/** One distinct mistake under review — mirrors the srs_cards table. */
export interface SrsCard extends SrsState {
  id: string;
  sourceMessage: string;
  span: string;
  correction: string;
  explanation: string;
  type: ErrorRecord["type"];
  level: ErrorRecord["level"];
  createdAt: number;
}

export interface ProgressStore {
  listErrors(): Promise<ErrorRecord[]>;
  appendErrors(records: ErrorRecord[]): Promise<void>;
  getLessonProgress(): Promise<LessonProgressMap>;
  /** Undefined only where the store is unreachable (SSR for LocalStore). */
  recordLessonTurn(lessonId: string): Promise<LessonEntry | undefined>;
  startLesson(lessonId: string): Promise<void>;
  /** Due cards, most overdue first. */
  listDueCards(now: number): Promise<SrsCard[]>;
  reviewCard(id: string, quality: SrsQuality, now: number): Promise<void>;
  /** Fires after any change visible through this store. Returns unsubscribe. */
  subscribe(cb: () => void): () => void;
}
