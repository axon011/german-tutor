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
import { isDue, review, type SrsQuality } from "../srs";
import { cardKey, deriveCardDrafts } from "../srs-cards";
import type { LessonProgressMap, ProgressStore, SrsCard } from "./types";

const SRS_KEY = "srs-cards";
export const SRS_EVENT = "srs-cards-changed";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
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

/** This browser's SRS deck. Exported for the one-time import on sign-in. */
export function readCards(): SrsCard[] {
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
  const drafts = deriveCardDrafts(readErrorLog(), known, now);
  if (drafts.length === 0) return cards;
  for (const d of drafts) cards.push({ id: newId(), ...d });
  writeCards(cards, false);
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

  async reviewCard(
    id: string,
    quality: SrsQuality,
    now: number,
  ): Promise<void> {
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
