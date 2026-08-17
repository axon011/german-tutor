/**
 * The learner's error log — the data feed behind slice 2.5's recommendation
 * loop (Talk → Extract → Recommend → Talk).
 *
 * Storage is localStorage until slice 3's Postgres replaces it behind this
 * same interface: read/append/subscribe are the only entry points, so the
 * swap touches this file and nothing else. Every function is client-safe and
 * SSR-guarded; failure is always silent and returns empty data, because the
 * conversation is the product and the log is a bonus.
 */

import type { CorrectionError } from "./corrector";
import type { CefrLevel } from "./tutor-prompt";

const STORAGE_KEY = "error-log";
const CHANGE_EVENT = "error-log-changed";
const MAX_RECORDS = 500;

/** One error, one row. Flat and boring on purpose — this maps to a DB row. */
export interface ErrorRecord {
  ts: number;
  level: CefrLevel;
  /** The full learner message the error occurred in. */
  message: string;
  /** Exact substring of `message` that was wrong. */
  span: string;
  type: CorrectionError["type"];
  correction: string;
  explanation: string;
}

export type ErrorType = CorrectionError["type"];

/**
 * Display label + one line of practical advice per error type.
 *
 * UI chrome is English; German is reserved for learning content, so the tips
 * are written in English and keep the German grammatical terms the learner
 * will meet in any textbook.
 */
export const TYPE_LABELS: Record<ErrorType, { label: string; tip: string }> = {
  grammar: {
    label: "Grammar",
    tip: "Check the case of every noun: who is acting (Nominativ), what is acted on (Akkusativ), who it is for (Dativ)?",
  },
  vocabulary: {
    label: "Vocabulary",
    tip: "Learn new words inside a whole sentence rather than on their own — you pick up how to use them at the same time.",
  },
  spelling: {
    label: "Spelling",
    tip: "Watch the capitalisation of nouns and the umlauts ä, ö, ü — schon and schön are two different words.",
  },
  "word-order": {
    label: "Word order",
    tip: "Remember the verb-second rule: the conjugated verb goes in position 2, and right at the end in a Nebensatz.",
  },
};

export const ERROR_TYPES = Object.keys(TYPE_LABELS) as ErrorType[];

function isErrorType(v: unknown): v is ErrorType {
  return typeof v === "string" && v in TYPE_LABELS;
}

/** Read the whole log, oldest first. Returns [] on SSR or any failure. */
export function readErrorLog(): ErrorRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isErrorRecord);
  } catch {
    // Private mode / corrupt value — the log is a nice-to-have.
    return [];
  }
}

function isErrorRecord(v: unknown): v is ErrorRecord {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.ts === "number" &&
    typeof r.message === "string" &&
    typeof r.span === "string" &&
    typeof r.correction === "string" &&
    isErrorType(r.type)
  );
}

/**
 * Append this turn's corrections to the log: one row per error, newest last,
 * capped so localStorage can't grow unbounded. Notifies open tabs via a
 * window event so the Practice and Progress views refresh live.
 */
export function appendErrorLog(
  errors: CorrectionError[],
  message: string,
  level: CefrLevel,
) {
  if (typeof window === "undefined" || errors.length === 0) return;
  try {
    const ts = Date.now();
    const log = readErrorLog();
    for (const e of errors) {
      log.push({
        ts,
        level,
        message,
        span: e.span,
        type: e.type,
        correction: e.correction,
        explanation: e.explanation,
      });
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(log.slice(-MAX_RECORDS)),
    );
  } catch {
    // Quota exceeded — still notify, the in-memory view is unaffected.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscribe to log changes. Returns an unsubscribe function. */
export function onErrorLogChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
}

export interface FocusRecommendation {
  type: ErrorType;
  /** Weighted share of the decayed total, 0–1. */
  share: number;
  /** Raw number of logged errors of this type. */
  count: number;
  /** Up to 2 most recent examples of this type. */
  examples: { span: string; correction: string }[];
}

/** 7-day half-life: an error from a week ago counts half as much as today's. */
const HALF_LIFE_DAYS = 7;
const MS_PER_DAY = 86_400_000;
const MIN_RECORDS = 3;

/**
 * The rule-based recommender (slice 2.5 v0). Deliberately NOT an LLM call.
 *
 *   weight(record) = exp(-ageDays / 7)
 *   score(type)    = Σ weight over records of that type
 *   focus          = argmax score,  share = score / Σ all scores
 *
 * Exponential recency decay with a 7-day half-life means a mistake you made
 * this morning outranks five you made last month, so the focus follows what
 * you are actually struggling with now rather than your all-time history.
 * The whole thing is deterministic and inspectable — that explainability is
 * the point, and it is the portfolio talking point: "asked the model what to
 * practice" is not an answer a learner can argue with, this is.
 *
 * Returns null below MIN_RECORDS, where any ranking would be noise.
 */
export function computeFocus(
  records: ErrorRecord[],
  now: number = Date.now(),
): FocusRecommendation | null {
  if (records.length < MIN_RECORDS) return null;

  const scores = new Map<ErrorType, number>();
  const counts = new Map<ErrorType, number>();
  let total = 0;

  for (const r of records) {
    const ageDays = Math.max(0, (now - r.ts) / MS_PER_DAY);
    const weight = Math.exp(-ageDays / HALF_LIFE_DAYS);
    scores.set(r.type, (scores.get(r.type) ?? 0) + weight);
    counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
    total += weight;
  }
  if (total <= 0) return null;

  let type: ErrorType | null = null;
  let best = -1;
  for (const [t, score] of scores) {
    if (score > best) {
      best = score;
      type = t;
    }
  }
  if (!type) return null;

  const examples = records
    .filter((r) => r.type === type)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 2)
    .map((r) => ({ span: r.span, correction: r.correction }));

  return { type, share: best / total, count: counts.get(type) ?? 0, examples };
}

/** Raw (undecayed) count per type — what the "Mistakes by type" bars show. */
export function countByType(records: ErrorRecord[]): Record<ErrorType, number> {
  const counts = { grammar: 0, vocabulary: 0, spelling: 0, "word-order": 0 };
  for (const r of records) counts[r.type] += 1;
  return counts;
}
