import { describe, expect, it } from "vitest";
import { annotate, applyCorrections } from "./annotate";
import type { CorrectionError } from "./corrector";

const err = (
  span: string,
  correction: string,
  type: CorrectionError["type"] = "grammar",
): CorrectionError => ({ span, type, correction, explanation: "x" });

describe("annotate", () => {
  it("splits a message into plain and highlighted segments", () => {
    expect(
      annotate("ich habe aravind", [err("ich", "Ich"), err("habe", "heiße")]),
    ).toEqual([
      { text: "ich", errorIndex: 0 },
      { text: " " },
      { text: "habe", errorIndex: 1 },
      { text: " aravind" },
    ]);
  });
});

describe("applyCorrections", () => {
  it("applies several corrections", () => {
    expect(
      applyCorrections("ich habe aravind", [
        err("ich", "Ich"),
        err("habe", "heiße"),
        err("aravind", "Aravind"),
      ]),
    ).toBe("Ich heiße Aravind");
  });

  it("fixes word order", () => {
    expect(
      applyCorrections("Gestern ich habe Pizza gegessen.", [
        err("ich habe", "habe ich", "word-order"),
      ]),
    ).toBe("Gestern habe ich Pizza gegessen.");
  });

  it("does not apply an error that annotate skips (out of order)", () => {
    const content = "ich habe aravind";
    const errors = [err("aravind", "Aravind"), err("ich", "Ich")];
    // "ich" sits before the cursor once "aravind" is consumed, so it is skipped.
    expect(
      annotate(content, errors).filter((s) => s.errorIndex !== undefined),
    ).toEqual([{ text: "aravind", errorIndex: 0 }]);
    expect(applyCorrections(content, errors)).toBe("ich habe Aravind");
  });

  it("returns null for no errors or an unmatched span", () => {
    expect(applyCorrections("Hallo Welt", [])).toBeNull();
    expect(applyCorrections("Hallo Welt", [err("Tschüss", "Ciao")])).toBeNull();
  });

  it("handles deletions without double spaces", () => {
    expect(
      applyCorrections("Ich bin sehr sehr müde.", [err("sehr ", "")]),
    ).toBe("Ich bin sehr müde.");
  });

  it("removes a space left before punctuation", () => {
    expect(applyCorrections("Das ist gut sehr.", [err(" sehr", "")])).toBe(
      "Das ist gut.",
    );
    expect(applyCorrections("Das ist guut .", [err("guut", "gut")])).toBe(
      "Das ist gut.",
    );
  });
});
