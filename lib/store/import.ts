/**
 * Turning a guest's browser history into an /api/me/import payload. Browser
 * data is loosely typed (older builds stored rows without `level` or
 * `explanation`), so each row is normalised, then validated on its own: one
 * malformed row is dropped rather than failing the whole import.
 */

import {
  errorRecordSchema,
  importCardSchema,
  lessonEntrySchema,
  MAX_IMPORT_CARDS,
  MAX_IMPORT_ERRORS,
  MAX_IMPORT_LESSONS,
  type ImportCard,
  type ImportPayload,
} from "../api/schemas";
import type { ErrorRecord } from "../error-log";
import type { LessonProgress } from "../lesson-progress";
import { isCefrLevel } from "../tutor-prompt";
import type { SrsCard } from "./types";

function levelOr(v: unknown) {
  return isCefrLevel(v) ? v : "B1";
}

function text(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function buildImportPayload(
  errors: ErrorRecord[],
  lessons: LessonProgress,
  cards: SrsCard[],
): ImportPayload {
  const outErrors: ImportPayload["errors"] = [];
  for (const r of errors.slice(-MAX_IMPORT_ERRORS)) {
    const parsed = errorRecordSchema.safeParse({
      ...r,
      level: levelOr(r.level),
      explanation: text(r.explanation),
    });
    if (parsed.success) outErrors.push(parsed.data);
  }

  const outLessons: ImportPayload["lessons"] = {};
  for (const [id, entry] of Object.entries(lessons).slice(
    0,
    MAX_IMPORT_LESSONS,
  )) {
    const parsed = lessonEntrySchema.safeParse(entry);
    if (parsed.success && id.length <= 80) outLessons[id] = parsed.data;
  }

  const outCards: ImportCard[] = [];
  for (const c of cards.slice(-MAX_IMPORT_CARDS)) {
    const parsed = importCardSchema.safeParse({
      sourceMessage: c.sourceMessage,
      span: c.span,
      correction: c.correction,
      explanation: text(c.explanation),
      type: c.type,
      level: levelOr(c.level),
      ease: c.ease,
      intervalDays: c.intervalDays,
      reps: c.reps,
      lapses: c.lapses,
      dueAt: Math.round(c.dueAt),
      createdAt: Math.round(
        typeof c.createdAt === "number" ? c.createdAt : c.dueAt,
      ),
    });
    if (parsed.success) outCards.push(parsed.data);
  }

  return { errors: outErrors, lessons: outLessons, srsCards: outCards };
}

export function isEmptyImport(p: ImportPayload): boolean {
  return (
    p.errors.length === 0 &&
    Object.keys(p.lessons).length === 0 &&
    p.srsCards.length === 0
  );
}

/** localStorage key marking that this browser's history was offered to a user. */
export function importFlagKey(userId: string): string {
  return `dt-imported:${userId}`;
}
