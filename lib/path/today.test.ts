import { describe, expect, it } from "vitest";
import { LESSONS } from "../curriculum";
import { computeStreak, isMastered, nextLesson } from "./today";
import type { PathLessonState } from "./types";

const base: Omit<PathLessonState, "mastered"> = {
  lessonId: "x",
  turns: 6,
  completed: true,
  checkBest: 2,
  wordsTotal: 5,
  wordsReviewed: 5,
};

function state(lessonId: string, mastered: boolean): PathLessonState {
  return { ...base, lessonId, mastered };
}

describe("isMastered", () => {
  it("is true when every condition holds", () => {
    expect(isMastered(base)).toBe(true);
  });
  it("needs a check score of at least 2", () => {
    expect(isMastered({ ...base, checkBest: 1 })).toBe(false);
    expect(isMastered({ ...base, checkBest: 3 })).toBe(true);
    expect(isMastered({ ...base, checkBest: null })).toBe(false);
  });
  it("needs every word reviewed", () => {
    expect(isMastered({ ...base, wordsReviewed: 4 })).toBe(false);
  });
  it("is false when no words were seeded", () => {
    expect(isMastered({ ...base, wordsTotal: 0, wordsReviewed: 0 })).toBe(
      false,
    );
  });
  it("needs the conversation completed", () => {
    expect(isMastered({ ...base, completed: false })).toBe(false);
  });
});

describe("nextLesson", () => {
  it("starts at the first A1 lesson", () => {
    const next = nextLesson({});
    expect(next?.lessonId).toBe(LESSONS[0].id);
    expect(next?.position).toEqual({ level: "A1", index: 1, total: 20 });
  });
  it("skips mastered lessons", () => {
    const next = nextLesson({
      [LESSONS[0].id]: state(LESSONS[0].id, true),
      [LESSONS[1].id]: state(LESSONS[1].id, true),
    });
    expect(next?.lessonId).toBe(LESSONS[2].id);
    expect(next?.position.index).toBe(3);
  });
  it("is null when everything is mastered", () => {
    const all = Object.fromEntries(
      LESSONS.map((l) => [l.id, state(l.id, true)]),
    );
    expect(nextLesson(all)).toBeNull();
  });
});

describe("computeStreak", () => {
  it("counts consecutive days ending today", () => {
    expect(
      computeStreak(["2026-10-09", "2026-10-10", "2026-10-11"], "2026-10-11"),
    ).toBe(3);
  });
  it("ends yesterday when today is still empty", () => {
    expect(computeStreak(["2026-10-09", "2026-10-10"], "2026-10-11")).toBe(2);
  });
  it("breaks on a gap", () => {
    expect(
      computeStreak(["2026-10-08", "2026-10-10", "2026-10-11"], "2026-10-11"),
    ).toBe(2);
    expect(computeStreak(["2026-10-08"], "2026-10-11")).toBe(0);
  });
  it("crosses a month boundary", () => {
    expect(computeStreak(["2026-09-30", "2026-10-01"], "2026-10-01")).toBe(2);
  });
  it("is 0 with no activity", () => {
    expect(computeStreak([], "2026-10-11")).toBe(0);
  });
});
