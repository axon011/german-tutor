import type { TodayState, WordCard, WordReviewQuality } from "./types";

/**
 * The learner's LOCAL calendar day as YYYY-MM-DD. Built from local date parts
 * on purpose: `toISOString()` is UTC and would roll the "day" over at the
 * wrong hour for anyone away from Greenwich, breaking the streak.
 */
export function localDay(d = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${url} failed (${res.status})`);
  return (await res.json()) as T;
}

function postJson<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function fetchToday(day: string): Promise<TodayState> {
  return request<TodayState>(
    `/api/me/path/today?day=${encodeURIComponent(day)}`,
  );
}

export function postCheck(
  lessonId: string,
  correct: number,
  total: number,
  day: string,
): Promise<TodayState> {
  return postJson<TodayState>("/api/me/path/check", {
    lessonId,
    correct,
    total,
    day,
  });
}

export async function fetchDueWords(limit = 20): Promise<WordCard[]> {
  const data = await request<{ cards: WordCard[] }>(
    `/api/me/path/words/due?limit=${limit}`,
  );
  return data.cards;
}

export async function postWordReview(
  id: string,
  quality: WordReviewQuality,
  day: string,
): Promise<void> {
  await postJson<{ ok: true }>("/api/me/path/words/review", {
    id,
    quality,
    day,
  });
}
