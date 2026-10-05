import { describe, expect, it } from "vitest";
import { importSchema } from "../api/schemas";
import type { ErrorRecord } from "../error-log";
import { buildImportPayload, isEmptyImport } from "./import";
import type { SrsCard } from "./types";

const TS = Date.UTC(2026, 0, 1);

describe("buildImportPayload", () => {
  it("normalises legacy rows and drops malformed ones", () => {
    const legacy = {
      ts: TS,
      message: "Er hat kein Zeit.",
      span: "kein",
      type: "grammar",
      correction: "keine",
    } as unknown as ErrorRecord;
    const broken = { ...legacy, message: "" } as ErrorRecord;
    const card = {
      id: "local-1",
      sourceMessage: "Er hat kein Zeit.",
      span: "kein",
      correction: "keine",
      type: "grammar",
      ease: 2.5,
      intervalDays: 1,
      reps: 1,
      lapses: 0,
      dueAt: TS + 0.4,
    } as unknown as SrsCard;

    const payload = buildImportPayload(
      [legacy, broken],
      { "a1-greetings": { startedAt: TS, turns: 2 } },
      [card],
    );

    expect(payload.errors).toEqual([
      { ...legacy, level: "B1", explanation: "" },
    ]);
    expect(payload.srsCards).toHaveLength(1);
    expect(payload.srsCards[0]).toMatchObject({
      level: "B1",
      explanation: "",
      dueAt: TS,
      createdAt: TS,
    });
    expect(Object.keys(payload.lessons)).toEqual(["a1-greetings"]);
    expect(importSchema.safeParse(payload).success).toBe(true);
    expect(isEmptyImport(payload)).toBe(false);
  });

  it("an empty browser yields an empty payload", () => {
    expect(isEmptyImport(buildImportPayload([], {}, []))).toBe(true);
  });
});
