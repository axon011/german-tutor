import { describe, expect, it } from "vitest";
import type { ErrorRecord } from "./error-log";
import { cardKey, deriveCardDrafts, isDrillable } from "./srs-cards";

const NOW = Date.UTC(2026, 0, 1);

function rec(
  message: string,
  span: string,
  correction: string,
  ts = NOW,
): ErrorRecord {
  return {
    ts,
    level: "B1",
    message,
    span,
    type: "grammar",
    correction,
    explanation: "",
  };
}

describe("isDrillable", () => {
  it("needs a span that occurs in the message and a different correction", () => {
    expect(isDrillable(rec("Er hat kein Zeit.", "kein", "keine"))).toBe(true);
    expect(isDrillable(rec("Er hat kein Zeit.", "kein", "kein"))).toBe(false);
    expect(isDrillable(rec("Er hat kein Zeit.", "", "keine"))).toBe(false);
    expect(isDrillable(rec("Er hat kein Zeit.", "kein", ""))).toBe(false);
    expect(isDrillable(rec("Er hat keine Zeit.", "keinn", "keine"))).toBe(
      false,
    );
  });
});

describe("deriveCardDrafts", () => {
  it("one fresh card per distinct drillable (message, span)", () => {
    const drafts = deriveCardDrafts(
      [
        rec("Ich gehe mit mein Bruder.", "mein", "meinem"),
        rec("Ich gehe mit mein Bruder.", "mein", "meinem"),
        rec("Er hat kein Zeit.", "kein", "keine"),
        rec("Unchanged.", "x", "x"),
      ],
      new Set(),
      NOW,
    );
    expect(drafts.map((d) => d.span).sort()).toEqual(["kein", "mein"]);
    for (const d of drafts) {
      expect(d).toMatchObject({ reps: 0, lapses: 0, dueAt: NOW, createdAt: NOW });
    }
  });

  it("the newest record wins the correction text", () => {
    const [draft] = deriveCardDrafts(
      [
        rec("Er hat kein Zeit.", "kein", "keinen", NOW - 1000),
        rec("Er hat kein Zeit.", "kein", "keine", NOW),
      ],
      new Set(),
      NOW,
    );
    expect(draft.correction).toBe("keine");
  });

  it("skips mistakes that already have a card and leaves `known` untouched", () => {
    const known = new Set([cardKey("Er hat kein Zeit.", "kein")]);
    const drafts = deriveCardDrafts(
      [rec("Er hat kein Zeit.", "kein", "keine")],
      known,
      NOW,
    );
    expect(drafts).toHaveLength(0);
    expect(known.size).toBe(1);
  });
});
