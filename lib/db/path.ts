/**
 * The Postgres side of the learning path (beta): word cards, daily activity
 * and the Today state. Like lib/db/progress.ts, every statement is scoped to
 * the session's userId. neon-http has no transactions, so each write is a
 * single idempotent-or-additive statement and the multi-step ones (recordCheck)
 * are safe to retry.
 */

import { and, asc, eq, lte, sql } from "drizzle-orm";
import { getLessonContent } from "../lessons";
import type { Gender } from "../lessons/types";
import { computeStreak, isMastered, nextLesson } from "../path/today";
import type {
  PathLessonState,
  TodayState,
  WordCard,
  WordReviewQuality,
} from "../path/types";
import { newCardState, review } from "../srs";
import { getDb } from "./index";
import { listDueCards } from "./progress";
import { dailyActivity, lessonProgress, wordCards } from "./schema";

// ── Daily activity ─────────────────────────────────────────────────────────

/** Add to a day's counters in one atomic upsert. */
export async function bumpActivity(
  userId: string,
  day: string,
  delta: { reviews?: number; checks?: number; turns?: number },
): Promise<void> {
  const reviews = delta.reviews ?? 0;
  const checks = delta.checks ?? 0;
  const turns = delta.turns ?? 0;
  await getDb()
    .insert(dailyActivity)
    .values({ userId, day, reviews, checks, turns })
    .onConflictDoUpdate({
      target: [dailyActivity.userId, dailyActivity.day],
      set: {
        reviews: sql`${dailyActivity.reviews} + ${reviews}`,
        checks: sql`${dailyActivity.checks} + ${checks}`,
        turns: sql`${dailyActivity.turns} + ${turns}`,
      },
    });
}

// ── Quick check + word cards ───────────────────────────────────────────────

/**
 * Record a quick-check score and seed the lesson's word cards. check_best
 * only ever rises (null before the first check, so a first score of 0 still
 * registers as "checked"). Seeding relies on the unique (user, lesson, word)
 * index, so repeating a check never duplicates or resets a card.
 */
export async function recordCheck(
  userId: string,
  lessonId: string,
  correct: number,
  day: string,
): Promise<void> {
  const db = getDb();
  await db
    .insert(lessonProgress)
    .values({ userId, lessonId, turns: 0, checkBest: correct })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        checkBest: sql`greatest(coalesce(${lessonProgress.checkBest}, 0), ${correct})`,
      },
    });

  const vocab = getLessonContent(lessonId)?.vocab ?? [];
  if (vocab.length > 0) {
    const state = newCardState(Date.now());
    await db
      .insert(wordCards)
      .values(
        vocab.map((v) => ({
          userId,
          lessonId,
          de: v.de,
          en: v.en,
          gender: v.gender ?? null,
          plural: v.plural ?? null,
          ease: state.ease,
          intervalDays: state.intervalDays,
          reps: state.reps,
          lapses: state.lapses,
          dueAt: new Date(state.dueAt),
        })),
      )
      .onConflictDoNothing({
        target: [wordCards.userId, wordCards.lessonId, wordCards.de],
      });
  }

  await bumpActivity(userId, day, { checks: 1 });
}

type WordRow = typeof wordCards.$inferSelect;

function toWord(row: WordRow): WordCard {
  const card: WordCard = {
    id: row.id,
    lessonId: row.lessonId,
    de: row.de,
    en: row.en,
    ease: row.ease,
    intervalDays: row.intervalDays,
    reps: row.reps,
    lapses: row.lapses,
    dueAt: row.dueAt.getTime(),
    createdAt: row.createdAt.getTime(),
  };
  if (row.gender) card.gender = row.gender as Gender;
  if (row.plural) card.plural = row.plural;
  return card;
}

/** Words due at `now`, most overdue first. */
export async function listDueWords(
  userId: string,
  now: number,
  limit: number,
): Promise<WordCard[]> {
  const rows = await getDb()
    .select()
    .from(wordCards)
    .where(and(eq(wordCards.userId, userId), lte(wordCards.dueAt, new Date(now))))
    .orderBy(asc(wordCards.dueAt))
    .limit(limit);
  return rows.map(toWord);
}

/** Apply one SM-2 review to a word. False when the card is not this user's. */
export async function reviewWord(
  userId: string,
  id: string,
  quality: WordReviewQuality,
  now: number,
  day: string,
): Promise<boolean> {
  const db = getDb();
  const owned = and(eq(wordCards.id, id), eq(wordCards.userId, userId));
  const [row] = await db.select().from(wordCards).where(owned).limit(1);
  if (!row) return false;
  const next = review(toWord(row), quality, now);
  await db
    .update(wordCards)
    .set({
      ease: next.ease,
      intervalDays: next.intervalDays,
      reps: next.reps,
      lapses: next.lapses,
      dueAt: new Date(next.dueAt),
    })
    .where(owned);
  await bumpActivity(userId, day, { reviews: 1 });
  return true;
}

// ── Today ──────────────────────────────────────────────────────────────────

export async function getTodayState(
  userId: string,
  day: string,
  now: number,
): Promise<TodayState> {
  const db = getDb();
  const [progressRows, wordCounts, dueWordRows, activityRows, dueCards] =
    await Promise.all([
      db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId)),
      db
        .select({
          lessonId: wordCards.lessonId,
          total: sql<number>`count(*)::int`,
          reviewed: sql<number>`(count(*) filter (where ${wordCards.reps} >= 1))::int`,
        })
        .from(wordCards)
        .where(eq(wordCards.userId, userId))
        .groupBy(wordCards.lessonId),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(wordCards)
        .where(
          and(eq(wordCards.userId, userId), lte(wordCards.dueAt, new Date(now))),
        ),
      db.select().from(dailyActivity).where(eq(dailyActivity.userId, userId)),
      listDueCards(userId, now),
    ]);

  const counts = new Map(wordCounts.map((c) => [c.lessonId, c]));
  const ids = new Set([
    ...progressRows.map((r) => r.lessonId),
    ...wordCounts.map((c) => c.lessonId),
  ]);
  const progress = new Map(progressRows.map((r) => [r.lessonId, r]));

  const lessons: Record<string, PathLessonState> = {};
  let wordsLearned = 0;
  for (const lessonId of ids) {
    const p = progress.get(lessonId);
    const c = counts.get(lessonId);
    const turns = p?.turns ?? 0;
    const partial = {
      lessonId,
      turns,
      completed: p?.completedAt != null,
      checkBest: p?.checkBest ?? null,
      wordsTotal: c?.total ?? 0,
      wordsReviewed: c?.reviewed ?? 0,
    };
    wordsLearned += partial.wordsReviewed;
    lessons[lessonId] = { ...partial, mastered: isMastered(partial) };
  }

  const activeDays = activityRows
    .filter((a) => a.reviews + a.checks + a.turns > 0)
    .map((a) => a.day);
  const todayRow = activityRows.find((a) => a.day === day);
  const next = nextLesson(lessons);

  return {
    day,
    nextLessonId: next?.lessonId ?? null,
    position: next?.position ?? null,
    lessons,
    dueWords: dueWordRows[0]?.n ?? 0,
    dueMistakes: dueCards.length,
    wordsLearned,
    streak: computeStreak(activeDays, day),
    today: {
      reviews: todayRow?.reviews ?? 0,
      checks: todayRow?.checks ?? 0,
      turns: todayRow?.turns ?? 0,
    },
  };
}
