import { describe, expect, it } from "vitest";
import { isoWeek, mistakesPerWeek, startOfIsoWeek } from "./weekly";

// Local-time constructors, so the tests hold in any timezone.
const at = (y: number, m: number, d: number, h = 12) =>
  new Date(y, m - 1, d, h).getTime();

describe("isoWeek", () => {
  it("matches known ISO week numbers, including year boundaries", () => {
    expect(isoWeek(new Date(2026, 9, 5))).toBe(41); // Mon 5 Oct 2026
    expect(isoWeek(new Date(2026, 0, 1))).toBe(1); // Thu 1 Jan 2026
    expect(isoWeek(new Date(2021, 0, 3))).toBe(53); // Sun 3 Jan 2021 → 2020-W53
    expect(isoWeek(new Date(2024, 11, 30))).toBe(1); // Mon 30 Dec 2024 → 2025-W01
  });
});

describe("startOfIsoWeek", () => {
  it("returns local midnight of the Monday", () => {
    expect(startOfIsoWeek(at(2026, 10, 11, 23))).toBe(at(2026, 10, 5, 0));
    expect(startOfIsoWeek(at(2026, 10, 5, 0))).toBe(at(2026, 10, 5, 0));
  });
});

describe("mistakesPerWeek", () => {
  const now = at(2026, 10, 7); // Wed, ISO week 41

  it("returns the last N weeks oldest first, ending with this week", () => {
    const weeks = mistakesPerWeek([], now, 8);
    expect(weeks).toHaveLength(8);
    expect(weeks.map((w) => w.label)).toEqual([
      "W34",
      "W35",
      "W36",
      "W37",
      "W38",
      "W39",
      "W40",
      "W41",
    ]);
    expect(weeks[7].start).toBe(at(2026, 10, 5, 0));
    expect(weeks.every((w) => w.count === 0)).toBe(true);
  });

  it("buckets on Monday boundaries and ignores records outside the window", () => {
    const weeks = mistakesPerWeek(
      [
        { ts: at(2026, 10, 5, 0) }, // Monday 00:00 → this week
        { ts: at(2026, 10, 6) },
        { ts: at(2026, 10, 4, 23) }, // Sunday night → last week
        { ts: at(2026, 9, 17) }, // Thu of W38
        { ts: at(2026, 9, 13) }, // Sun of W37
        { ts: at(2026, 9, 1) }, // Tue of W36
        { ts: at(2026, 8, 16) }, // Sun of W33, the week before the window
        { ts: at(2026, 7, 1) }, // long before the window
        { ts: at(2026, 10, 20) }, // future week
      ],
      now,
      8,
    );
    const byLabel = Object.fromEntries(weeks.map((w) => [w.label, w.count]));
    expect(byLabel.W41).toBe(2);
    expect(byLabel.W40).toBe(1);
    expect(byLabel.W38).toBe(1);
    expect(byLabel.W37).toBe(1);
    expect(byLabel.W36).toBe(1);
    expect(weeks.reduce((n, w) => n + w.count, 0)).toBe(6);
  });
});
