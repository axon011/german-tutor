/**
 * Guest-mode store: the existing localStorage modules behind the
 * ProgressStore interface, plus SRS cards under their own key. The wrapped
 * modules still dispatch their window events, so hooks built on them stay
 * live unchanged.
 */

import {
  appendErrorRecords,
  onErrorLogChange,
  readErrorLog,
  type ErrorRecord,
} from "../error-log";
import {
  onLessonProgressChange,
  readLessonProgress,
  recordLessonTurn,
  startLesson,
} from "../lesson-progress";
import { isDue, newCardState, review, type SrsQuality } from "../srs";
import type { LessonProgressMap, ProgressStore, SrsCard } from "./types";

const SRS_KEY = "srs-cards";
const SRS_EVENT = "srs-cards-changed";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function cardKey(message: string, span: string): string {
  return `${message}\u0000${span}`;
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

/** A record can become a card only if it can be drilled: same rule as the
 *  Practice queue — the span must still occur and the correction must differ. */
function isDrillable(r: ErrorRecord): boolean {
  return (
    Boolean(r.span) &&
    Boolean(r.correction) &&
    r.span !== r.correction &&
    r.message.includes(r.span)
  );
}

function isSrsCard(v: unknown): v is SrsCard {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.sourceMessage === "string" &&
    typeof c.span === "string" &&
    typeof c.correction === "string" &&
    typeof c.ease === "number" &&
    typeof c.intervalDays === "number" &&
    typeof c.reps === "number" &&
    typeof c.lapses === "number" &&
    typeof c.dueAt === "number"
  );
}

function readCards(): SrsCard[] {
  if (!hasWindow()) return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(SRS_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? parsed.filter(isSrsCard) : [];
  } catch {
    return [];
  }
}

function writeCards(cards: SrsCard[], notify: boolean) {
  try {
    window.localStorage.setItem(SRS_KEY, JSON.stringify(cards));
  } catch {
    // Quota / private mode — the review still happened in this session.
  }
  if (notify) window.dispatchEvent(new Event(SRS_EVENT));
}

/**
 * Ensure every distinct drillable (message, span) in the error log has a
 * card. Newest record wins the correction text for a new card. Persisting the
 * derived cards is silent: derivation is not a change anyone needs to react
 * to, and notifying here would loop any subscriber that re-lists on change.
 */
function syncCards(now: number): SrsCard[] {
  const cards = readCards();
  const known = new Set(cards.map((c) => cardKey(c.sourceMessage, c.span)));
  const log = readErrorLog();
  let added = false;
  for (let i = log.length - 1; i >= 0; i--) {
    const r = log[i];
    if (!isDrillable(r)) continue;
    const key = cardKey(r.message, r.span);
    if (known.has(key)) continue;
    known.add(key);
    cards.push({
      id: newId(),
      sourceMessage: r.message,
      span: r.span,
      correction: r.correction,
      explanation: r.explanation,
      type: r.type,
      level: r.level,
      createdAt: now,
      ...newCardState(now),
    });
    added = true;
  }
  if (added) writeCards(cards, false);
  return cards;
}

export class LocalStore implements ProgressStore {
  async listErrors(): Promise<ErrorRecord[]> {
    return readErrorLog();
  }

  async appendErrors(records: ErrorRecord[]): Promise<void> {
    appendErrorRecords(records);
  }

  async getLessonProgress(): Promise<LessonProgressMap> {
    return readLessonProgress();
  }

  async recordLessonTurn(lessonId: string) {
    return recordLessonTurn(lessonId);
  }

  async startLesson(lessonId: string): Promise<void> {
    startLesson(lessonId);
  }

  async listDueCards(now: number): Promise<SrsCard[]> {
    if (!hasWindow()) return [];
    return syncCards(now)
      .filter((c) => isDue(c, now))
      .sort((a, b) => a.dueAt - b.dueAt);
  }

  async reviewCard(id: string, quality: SrsQuality, now: number): Promise<void> {
    if (!hasWindow()) return;
    const cards = readCards();
    const i = cards.findIndex((c) => c.id === id);
    if (i === -1) return;
    cards[i] = { ...cards[i], ...review(cards[i], quality, now) };
    writeCards(cards, true);
  }

  subscribe(cb: () => void): () => void {
    if (!hasWindow()) return () => {};
    const offErrors = onErrorLogChange(cb);
    const offLessons = onLessonProgressChange(cb);
    window.addEventListener(SRS_EVENT, cb);
    return () => {
      offErrors();
      offLessons();
      window.removeEventListener(SRS_EVENT, cb);
    };
  }
}
