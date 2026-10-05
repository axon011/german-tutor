/**
 * SM-2 spaced repetition, as pure functions over a plain state object — no
 * storage, no clock reads, so it runs identically in the browser store, the
 * Postgres store and the tests.
 *
 * Quality is collapsed to the three grades a drill can actually observe:
 *   5 — correct on the first try
 *   3 — correct after one wrong attempt
 *   0 — had to reveal the solution
 */

export interface SrsState {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
  /** Epoch ms. */
  dueAt: number;
}

export type SrsQuality = 0 | 3 | 5;

const MS_PER_DAY = 86_400_000;
const RELEARN_MS = 10 * 60_000;
const MIN_EASE = 1.3;
const START_EASE = 2.5;

export function newCardState(now: number): SrsState {
  return { ease: START_EASE, intervalDays: 0, reps: 0, lapses: 0, dueAt: now };
}

export function isDue(state: Pick<SrsState, "dueAt">, now: number): boolean {
  return state.dueAt <= now;
}

export function review(
  state: SrsState,
  quality: SrsQuality,
  now: number,
): SrsState {
  const q = quality;
  const ease = Math.max(
    MIN_EASE,
    state.ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02),
  );

  if (q < 3) {
    return {
      ease,
      intervalDays: 0,
      reps: 0,
      lapses: state.lapses + 1,
      dueAt: now + RELEARN_MS,
    };
  }

  const reps = state.reps + 1;
  const intervalDays =
    reps === 1 ? 1 : reps === 2 ? 6 : state.intervalDays * state.ease;

  return {
    ease,
    intervalDays,
    reps,
    lapses: state.lapses,
    dueAt: now + intervalDays * MS_PER_DAY,
  };
}
