import type { TodayState, WordCard, WordReviewQuality } from "./types";

// One implementation of the learner-local day, shared with the store.
export { localDay } from "./day";

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
