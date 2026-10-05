/**
 * Signed-in store: the ProgressStore interface over fetch to /api/me/*.
 * After every write it fires the same window events the browser store fires,
 * so every hook and view refreshes exactly as it does for a guest.
 */

import type { ImportPayload } from "../api/schemas";
import { MAX_APPEND_ERRORS } from "../api/schemas";
import {
  ERROR_LOG_EVENT,
  onErrorLogChange,
  type ErrorRecord,
} from "../error-log";
import {
  LESSON_PROGRESS_EVENT,
  onLessonProgressChange,
  type LessonEntry,
} from "../lesson-progress";
import type { SrsQuality } from "../srs";
import { SRS_EVENT } from "./local";
import type { LessonProgressMap, ProgressStore, SrsCard } from "./types";

function notify(...events: string[]) {
  if (typeof window === "undefined") return;
  for (const e of events) window.dispatchEvent(new Event(e));
}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers:
      body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export class RemoteStore implements ProgressStore {
  async listErrors(): Promise<ErrorRecord[]> {
    const { records } = await call<{ records: ErrorRecord[] }>(
      "/api/me/errors",
    );
    return records;
  }

  async appendErrors(records: ErrorRecord[]): Promise<void> {
    if (records.length === 0) return;
    for (let i = 0; i < records.length; i += MAX_APPEND_ERRORS) {
      await call("/api/me/errors", {
        records: records.slice(i, i + MAX_APPEND_ERRORS),
      });
    }
    notify(ERROR_LOG_EVENT);
  }

  async getLessonProgress(): Promise<LessonProgressMap> {
    const { progress } = await call<{ progress: LessonProgressMap }>(
      "/api/me/lessons",
    );
    return progress;
  }

  async recordLessonTurn(lessonId: string): Promise<LessonEntry | undefined> {
    const { entry } = await call<{ entry: LessonEntry }>(
      "/api/me/lessons/turn",
      { lessonId },
    );
    notify(LESSON_PROGRESS_EVENT);
    return entry;
  }

  async startLesson(lessonId: string): Promise<void> {
    await call("/api/me/lessons/start", { lessonId });
    notify(LESSON_PROGRESS_EVENT);
  }

  /** Due-ness is decided by the server clock; `now` is the local store's. */
  async listDueCards(): Promise<SrsCard[]> {
    const { cards } = await call<{ cards: SrsCard[] }>("/api/me/srs/due");
    return cards;
  }

  async reviewCard(id: string, quality: SrsQuality): Promise<void> {
    await call("/api/me/srs/review", { id, quality });
    notify(SRS_EVENT);
  }

  subscribe(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};
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

export interface ImportCounts {
  errors: { imported: number; skipped: number };
  lessons: number;
  srsCards: { imported: number; skipped: number };
}

/** Send this browser's history to the account, then refresh every view. */
export async function importToAccount(
  payload: ImportPayload,
): Promise<ImportCounts> {
  const counts = await call<ImportCounts>("/api/me/import", payload);
  notify(ERROR_LOG_EVENT, LESSON_PROGRESS_EVENT, SRS_EVENT);
  return counts;
}
