import { describe, expect, it } from "vitest";
import { LESSONS } from "../curriculum";
import {
  appendErrorsSchema,
  importSchema,
  lessonActionSchema,
  MAX_APPEND_ERRORS,
  MAX_IMPORT_ERRORS,
  reviewSchema,
} from "./schemas";

const record = {
  ts: Date.UTC(2026, 0, 1),
  level: "B1",
  message: "Ich gehe mit mein Bruder.",
  span: "mein",
  type: "grammar",
  correction: "meinem",
  explanation: "mit + Dativ",
};

const card = {
  sourceMessage: record.message,
  span: "mein",
  correction: "meinem",
  explanation: "",
  type: "grammar",
  level: "B1",
  ease: 2.5,
  intervalDays: 0,
  reps: 0,
  lapses: 0,
  dueAt: record.ts,
  createdAt: record.ts,
};

describe("appendErrorsSchema", () => {
  it("accepts a valid batch", () => {
    expect(appendErrorsSchema.safeParse({ records: [record] }).success).toBe(
      true,
    );
  });

  it("rejects an empty or oversized batch", () => {
    expect(appendErrorsSchema.safeParse({ records: [] }).success).toBe(false);
    const tooMany = Array.from({ length: MAX_APPEND_ERRORS + 1 }, () => record);
    expect(appendErrorsSchema.safeParse({ records: tooMany }).success).toBe(
      false,
    );
  });

  it("rejects bad fields and over-long text", () => {
    const bad = [
      { ...record, type: "punctuation" },
      { ...record, level: "C2" },
      { ...record, ts: -1 },
      { ...record, ts: 1.5 },
      { ...record, message: "" },
      { ...record, message: "x".repeat(4001) },
      { ...record, explanation: "x".repeat(2001) },
    ];
    for (const r of bad) {
      expect(appendErrorsSchema.safeParse({ records: [r] }).success).toBe(
        false,
      );
    }
  });
});

describe("lessonActionSchema", () => {
  it("accepts a curriculum lesson id", () => {
    expect(
      lessonActionSchema.safeParse({ lessonId: LESSONS[0].id }).success,
    ).toBe(true);
  });

  it("rejects unknown, empty and over-long ids", () => {
    for (const lessonId of ["no-such-lesson", "", "a".repeat(81)]) {
      expect(lessonActionSchema.safeParse({ lessonId }).success).toBe(false);
    }
  });
});

describe("reviewSchema", () => {
  const id = "3f1c2a4e-8b7d-4c6e-9a1b-2d3e4f5a6b7c";

  it("accepts the three observable grades", () => {
    for (const quality of [0, 3, 5]) {
      expect(reviewSchema.safeParse({ id, quality }).success).toBe(true);
    }
  });

  it("rejects other grades and non-uuid ids", () => {
    expect(reviewSchema.safeParse({ id, quality: 4 }).success).toBe(false);
    expect(reviewSchema.safeParse({ id: "abc", quality: 5 }).success).toBe(
      false,
    );
  });
});

describe("importSchema", () => {
  const valid = {
    errors: [record],
    lessons: { [LESSONS[0].id]: { startedAt: record.ts, turns: 3 } },
    srsCards: [card],
  };

  it("accepts a valid payload, including an empty one", () => {
    expect(importSchema.safeParse(valid).success).toBe(true);
    expect(
      importSchema.safeParse({ errors: [], lessons: {}, srsCards: [] }).success,
    ).toBe(true);
  });

  it("rejects more than the error cap", () => {
    const errors = Array.from({ length: MAX_IMPORT_ERRORS + 1 }, () => record);
    expect(importSchema.safeParse({ ...valid, errors }).success).toBe(false);
  });

  it("rejects an invalid card or lesson entry", () => {
    expect(
      importSchema.safeParse({ ...valid, srsCards: [{ ...card, ease: 0.5 }] })
        .success,
    ).toBe(false);
    expect(
      importSchema.safeParse({
        ...valid,
        lessons: { x: { startedAt: record.ts, turns: -1 } },
      }).success,
    ).toBe(false);
  });
});
