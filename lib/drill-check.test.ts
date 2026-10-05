import { describe, expect, it } from "vitest";
import { isCaseOnlyFix, isCorrect, type DrillTarget } from "./drill-check";

const article: DrillTarget = {
  expected: "Ich gehe in den Park.",
  span: "in der Park",
  correction: "in den Park",
};

const caseOnly: DrillTarget = {
  expected: "ich heiße Aravind.",
  span: "aravind",
  correction: "Aravind",
};

describe("isCaseOnlyFix", () => {
  it("is true when span and correction differ only in letter case", () => {
    expect(isCaseOnlyFix("aravind", "Aravind")).toBe(true);
    expect(isCaseOnlyFix("die frau ", "die Frau")).toBe(true);
  });

  it("is false for real changes and for identical strings", () => {
    expect(isCaseOnlyFix("in der Park", "in den Park")).toBe(false);
    expect(isCaseOnlyFix("Frau", "Frau")).toBe(false);
  });
});

describe("isCorrect — normal cards", () => {
  it("accepts the exact corrected sentence", () => {
    expect(isCorrect("Ich gehe in den Park.", article)).toBe(true);
  });

  it("tolerates surrounding whitespace, inner runs and final punctuation", () => {
    expect(isCorrect("  Ich gehe   in den Park  ", article)).toBe(true);
    expect(isCorrect("Ich gehe in den Park!!", article)).toBe(true);
  });

  it("ignores letter case", () => {
    expect(isCorrect("ich gehe IN DEN park", article)).toBe(true);
  });

  it("rejects the original mistake and empty answers", () => {
    expect(isCorrect("Ich gehe in der Park.", article)).toBe(false);
    expect(isCorrect("   ", article)).toBe(false);
  });

  it("gives partial credit for a rephrasing that contains the correction", () => {
    expect(isCorrect("Morgen gehe ich in den Park", article)).toBe(true);
  });

  it("denies partial credit while the wrong span is still there", () => {
    expect(isCorrect("Ich gehe in der Park, in den Park", article)).toBe(false);
  });
});

describe("isCorrect — case-only cards", () => {
  it("rejects the original sentence retyped unchanged", () => {
    expect(isCorrect("ich heiße aravind.", caseOnly)).toBe(false);
    expect(isCorrect("ich heiße aravind", caseOnly)).toBe(false);
  });

  it("accepts the capitalised answer, still forgiving spacing and punctuation", () => {
    expect(isCorrect("ich heiße Aravind.", caseOnly)).toBe(true);
    expect(isCorrect("  ich  heiße Aravind ", caseOnly)).toBe(true);
  });

  it("partial credit is case-sensitive too", () => {
    expect(isCorrect("Ich heiße Aravind", caseOnly)).toBe(true);
    expect(isCorrect("Hallo, ich bin Aravind!", caseOnly)).toBe(true);
    expect(isCorrect("Ich heiße aravind", caseOnly)).toBe(false);
    expect(isCorrect("Aravind, ich heiße aravind", caseOnly)).toBe(false);
  });
});
