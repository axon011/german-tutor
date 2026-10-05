/**
 * The Postgres side of the ProgressStore: every query the /api/me/* routes
 * run. Each function takes the session's userId and scopes every statement
 * to it — no caller can reach another learner's rows. Rows are converted to
 * the same plain shapes the browser store uses (epoch-ms timestamps), so the
 * client cannot tell the two stores apart.
 */

import { and, asc, desc, eq, lte, sql } from "drizzle-orm";
import type { ImportPayload } from "../api/schemas";
import type { ErrorRecord, ErrorType } from "../error-log";
import { getFocusEntry } from "../focus";
import {
  COMPLETE_TURNS,
  type LessonEntry,
  type LessonProgress,
} from "../lesson-progress";
import { review, type SrsQuality } from "../srs";
import { cardKey, deriveCardDrafts } from "../srs-cards";
import type { SrsCard } from "../store/types";
import type { CefrLevel } from "../tutor-prompt";
import { getDb } from "./index";
import { errorRecords, lessonProgress, srsCards } from "./schema";

/** Newest rows returned by listErrors — the same order of magnitude the
 *  browser log keeps, and plenty for the recommender's 7-day half-life. */
const MAX_LISTED_ERRORS = 2000;
/** Rows per multi-row INSERT, well under Postgres' bind-parameter limit. */
const CHUNK = 500;

function chunks<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += CHUNK)
    out.push(items.slice(i, i + CHUNK));
  return out;
}

// ── Errors ─────────────────────────────────────────────────────────────────

type ErrorRow = typeof errorRecords.$inferSelect;

function toRecord(r: ErrorRow): ErrorRecord {
  return {
    ts: r.ts.getTime(),
    level: r.level as CefrLevel,
    message: r.message,
    span: r.span,
    type: r.type as ErrorType,
    correction: r.correction,
    explanation: r.explanation,
  };
}

function toErrorRow(userId: string, r: ErrorRecord) {
  return {
    userId,
    ts: new Date(r.ts),
    level: r.level,
    message: r.message,
    span: r.span,
    type: r.type,
    correction: r.correction,
    explanation: r.explanation,
  };
}

/** The learner's log, oldest first (the order the browser log uses). */
export async function listErrors(userId: string): Promise<ErrorRecord[]> {
  const rows = await getDb()
    .select()
    .from(errorRecords)
    .where(eq(errorRecords.userId, userId))
    .orderBy(desc(errorRecords.ts))
    .limit(MAX_LISTED_ERRORS);
  return rows.reverse().map(toRecord);
}

export async function appendErrors(
  userId: string,
  records: ErrorRecord[],
): Promise<void> {
  if (records.length === 0) return;
  await getDb()
    .insert(errorRecords)
    .values(records.map((r) => toErrorRow(userId, r)));
}

// ── Lessons ────────────────────────────────────────────────────────────────

type LessonRow = typeof lessonProgress.$inferSelect;

function toEntry(row: LessonRow): LessonEntry {
  const entry: LessonEntry = {
    startedAt: row.startedAt.getTime(),
    turns: row.turns,
  };
  if (row.completedAt) entry.completedAt = row.completedAt.getTime();
  return entry;
}

export async function getLessonProgress(
  userId: string,
): Promise<LessonProgress> {
  const rows = await getDb()
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
  const out: LessonProgress = {};
  for (const row of rows) out[row.lessonId] = toEntry(row);
  return out;
}

/** Mark a lesson as started. No-op if it already has a row. */
export async function startLesson(
  userId: string,
  lessonId: string,
): Promise<void> {
  await getDb()
    .insert(lessonProgress)
    .values({ userId, lessonId })
    .onConflictDoNothing();
}

/**
 * Count one turn, in a single atomic upsert. `completed_at` is stamped the
 * first time `turns` reaches COMPLETE_TURNS and never moved afterwards — the
 * same contract as the browser store, so the chat can catch the completion
 * moment exactly once.
 */
export async function recordLessonTurn(
  userId: string,
  lessonId: string,
): Promise<LessonEntry> {
  const [row] = await getDb()
    .insert(lessonProgress)
    .values({
      userId,
      lessonId,
      turns: 1,
      completedAt: COMPLETE_TURNS <= 1 ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        turns: sql`${lessonProgress.turns} + 1`,
        completedAt: sql`coalesce(${lessonProgress.completedAt}, case when ${lessonProgress.turns} + 1 >= ${COMPLETE_TURNS} then now() end)`,
      },
    })
    .returning();
  return toEntry(row);
}

// ── SRS ────────────────────────────────────────────────────────────────────

type CardRow = typeof srsCards.$inferSelect;

function toCard(row: CardRow): SrsCard {
  return {
    id: row.id,
    sourceMessage: row.sourceMessage,
    span: row.span,
    correction: row.correction,
    explanation: row.explanation,
    type: row.type as ErrorType,
    level: row.level as CefrLevel,
    ease: row.ease,
    intervalDays: row.intervalDays,
    reps: row.reps,
    lapses: row.lapses,
    dueAt: row.dueAt.getTime(),
    createdAt: row.createdAt.getTime(),
  };
}

const cardConflictTarget = [
  srsCards.userId,
  srsCards.sourceMessage,
  srsCards.span,
];

/**
 * Due cards, most overdue first. First derives a card for every drillable
 * mistake that has none yet (the same rule as the browser store); the unique
 * (user, message, span) index makes a concurrent derivation harmless.
 */
export async function listDueCards(
  userId: string,
  now: number,
): Promise<SrsCard[]> {
  const db = getDb();
  const [log, existing] = await Promise.all([
    listErrors(userId),
    db
      .select({ message: srsCards.sourceMessage, span: srsCards.span })
      .from(srsCards)
      .where(eq(srsCards.userId, userId)),
  ]);
  const known = new Set(existing.map((c) => cardKey(c.message, c.span)));
  const drafts = deriveCardDrafts(log, known, now);
  for (const batch of chunks(drafts)) {
    await db
      .insert(srsCards)
      .values(
        batch.map((d) => ({
          userId,
          sourceMessage: d.sourceMessage,
          span: d.span,
          correction: d.correction,
          explanation: d.explanation,
          type: d.type,
          level: d.level,
          ease: d.ease,
          intervalDays: d.intervalDays,
          reps: d.reps,
          lapses: d.lapses,
          dueAt: new Date(d.dueAt),
          createdAt: new Date(d.createdAt),
        })),
      )
      .onConflictDoNothing({ target: cardConflictTarget });
  }

  const rows = await db
    .select()
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), lte(srsCards.dueAt, new Date(now))))
    .orderBy(asc(srsCards.dueAt));
  return rows.map(toCard);
}

/** Apply one SM-2 review. False when the card is not this user's. */
export async function reviewCard(
  userId: string,
  id: string,
  quality: SrsQuality,
  now: number,
): Promise<boolean> {
  const db = getDb();
  const owned = and(eq(srsCards.id, id), eq(srsCards.userId, userId));
  const [row] = await db.select().from(srsCards).where(owned).limit(1);
  if (!row) return false;
  const next = review(toCard(row), quality, now);
  await db
    .update(srsCards)
    .set({
      ease: next.ease,
      intervalDays: next.intervalDays,
      reps: next.reps,
      lapses: next.lapses,
      dueAt: new Date(next.dueAt),
    })
    .where(owned);
  return true;
}

// ── One-time import ────────────────────────────────────────────────────────

export interface ImportResult {
  errors: { imported: number; skipped: number };
  lessons: number;
  srsCards: { imported: number; skipped: number };
}

function errorKey(ts: number, message: string, span: string): string {
  return `${ts}\u0000${message}\u0000${span}`;
}

/**
 * Merge a guest's browser history into the account. Idempotent, so a retry
 * after a partial failure (neon-http has no transactions) is always safe:
 *   errors   — skipped when (ts, message, span) already exists
 *   lessons  — merged: max turns, earliest start, first completion wins
 *   srsCards — skipped when the (message, span) card already exists, so a
 *              deck already reviewed on another device keeps its schedule
 */
export async function importHistory(
  userId: string,
  payload: ImportPayload,
): Promise<ImportResult> {
  const db = getDb();

  // Errors.
  const existing = await db
    .select({
      ts: errorRecords.ts,
      message: errorRecords.message,
      span: errorRecords.span,
    })
    .from(errorRecords)
    .where(eq(errorRecords.userId, userId));
  const seen = new Set(
    existing.map((r) => errorKey(r.ts.getTime(), r.message, r.span)),
  );
  const freshErrors: ErrorRecord[] = [];
  for (const r of payload.errors) {
    const key = errorKey(r.ts, r.message, r.span);
    if (seen.has(key)) continue;
    seen.add(key);
    freshErrors.push(r);
  }
  for (const batch of chunks(freshErrors)) {
    await db
      .insert(errorRecords)
      .values(batch.map((r) => toErrorRow(userId, r)));
  }

  // Lessons.
  const lessonRows = Object.entries(payload.lessons)
    .filter(([id]) => getFocusEntry(id) !== undefined)
    .map(([lessonId, e]) => ({
      userId,
      lessonId,
      startedAt: new Date(e.startedAt),
      turns: e.turns,
      completedAt: e.completedAt !== undefined ? new Date(e.completedAt) : null,
    }));
  if (lessonRows.length > 0) {
    await db
      .insert(lessonProgress)
      .values(lessonRows)
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          turns: sql`greatest(${lessonProgress.turns}, excluded.turns)`,
          startedAt: sql`least(${lessonProgress.startedAt}, excluded.started_at)`,
          completedAt: sql`coalesce(${lessonProgress.completedAt}, excluded.completed_at)`,
        },
      });
  }

  // SRS cards.
  let cardsImported = 0;
  for (const batch of chunks(payload.srsCards)) {
    const inserted = await db
      .insert(srsCards)
      .values(
        batch.map((c) => ({
          userId,
          sourceMessage: c.sourceMessage,
          span: c.span,
          correction: c.correction,
          explanation: c.explanation,
          type: c.type,
          level: c.level,
          ease: c.ease,
          intervalDays: c.intervalDays,
          reps: c.reps,
          lapses: c.lapses,
          dueAt: new Date(c.dueAt),
          createdAt: new Date(c.createdAt),
        })),
      )
      .onConflictDoNothing({ target: cardConflictTarget })
      .returning({ id: srsCards.id });
    cardsImported += inserted.length;
  }

  return {
    errors: {
      imported: freshErrors.length,
      skipped: payload.errors.length - freshErrors.length,
    },
    lessons: lessonRows.length,
    srsCards: {
      imported: cardsImported,
      skipped: payload.srsCards.length - cardsImported,
    },
  };
}
