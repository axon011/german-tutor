import { describe, expect, it } from "vitest";
import { isDue, newCardState, review, type SrsState } from "./srs";

const NOW = Date.UTC(2026, 0, 1);
const DAY = 86_400_000;

describe("newCardState", () => {
  it("starts at ease 2.5 and is due immediately", () => {
    const s = newCardState(NOW);
    expect(s).toEqual({ ease: 2.5, intervalDays: 0, reps: 0, lapses: 0, dueAt: NOW });
    expect(isDue(s, NOW)).toBe(true);
  });
});

describe("review — first intervals", () => {
  it("rep 1 → 1 day, rep 2 → 6 days, rep 3 → interval × ease", () => {
    let s = review(newCardState(NOW), 5, NOW);
    expect(s.reps).toBe(1);
    expect(s.intervalDays).toBe(1);
    expect(s.dueAt).toBe(NOW + DAY);

    s = review(s, 5, s.dueAt);
    expect(s.reps).toBe(2);
    expect(s.intervalDays).toBe(6);

    const easeBefore = s.ease;
    const at = s.dueAt;
    s = review(s, 5, at);
    expect(s.reps).toBe(3);
    expect(s.intervalDays).toBeCloseTo(6 * easeBefore);
    expect(s.dueAt).toBe(at + s.intervalDays * DAY);
  });

  it("quality 5 raises ease by 0.1, quality 3 lowers it by 0.14", () => {
    expect(review(newCardState(NOW), 5, NOW).ease).toBeCloseTo(2.6);
    expect(review(newCardState(NOW), 3, NOW).ease).toBeCloseTo(2.36);
  });

  it("quality 3 still advances the schedule", () => {
    const s = review(newCardState(NOW), 3, NOW);
    expect(s.reps).toBe(1);
    expect(s.intervalDays).toBe(1);
    expect(s.lapses).toBe(0);
  });
});

describe("review — lapse", () => {
  it("quality 0 resets reps, counts a lapse and re-queues in 10 minutes", () => {
    let s = review(newCardState(NOW), 5, NOW);
    s = review(s, 5, s.dueAt);
    const at = s.dueAt;
    s = review(s, 0, at);
    expect(s.reps).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.intervalDays).toBe(0);
    expect(s.dueAt).toBe(at + 10 * 60_000);
  });

  it("after a lapse the card relearns from a 1-day interval", () => {
    const lapsed = review(review(newCardState(NOW), 5, NOW), 0, NOW + DAY);
    const s = review(lapsed, 5, lapsed.dueAt);
    expect(s.reps).toBe(1);
    expect(s.intervalDays).toBe(1);
    expect(s.lapses).toBe(1);
  });
});

describe("review — ease floor", () => {
  it("never drops below 1.3 however many lapses", () => {
    let s = newCardState(NOW);
    for (let i = 0; i < 20; i++) s = review(s, 0, NOW);
    expect(s.ease).toBe(1.3);
    expect(review(s, 3, NOW).ease).toBe(1.3);
  });
});

describe("due ordering", () => {
  it("isDue respects dueAt and sorting by dueAt orders the queue", () => {
    const fresh = newCardState(NOW);
    const lapsed = review(fresh, 0, NOW);
    const learned = review(fresh, 5, NOW);
    expect(isDue(fresh, NOW)).toBe(true);
    expect(isDue(lapsed, NOW)).toBe(false);
    expect(isDue(lapsed, NOW + 10 * 60_000)).toBe(true);
    expect(isDue(learned, NOW + DAY - 1)).toBe(false);

    const cards: (SrsState & { id: string })[] = [
      { id: "learned", ...learned },
      { id: "fresh", ...fresh },
      { id: "lapsed", ...lapsed },
    ];
    const order = [...cards].sort((a, b) => a.dueAt - b.dueAt).map((c) => c.id);
    expect(order).toEqual(["fresh", "lapsed", "learned"]);
    expect(cards.filter((c) => isDue(c, NOW + DAY)).length).toBe(3);
  });
});
