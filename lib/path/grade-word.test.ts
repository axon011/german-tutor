import { describe, expect, it } from "vitest";
import { expectedAnswer, gradeWord } from "./grade-word";

const bruder = { de: "Bruder", gender: "m" as const };
const kochen = { de: "kochen" };

describe("gradeWord", () => {
  it("wants the article for nouns", () => {
    expect(expectedAnswer(bruder)).toBe("der Bruder");
    expect(gradeWord("der Bruder", bruder)).toBe(true);
    expect(gradeWord("Bruder", bruder)).toBe(false);
    expect(gradeWord("die Bruder", bruder)).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(gradeWord("der bruder", bruder)).toBe(false);
    expect(gradeWord("Kochen", kochen)).toBe(false);
  });

  it("forgives spacing and final punctuation", () => {
    expect(gradeWord("  der   Bruder. ", bruder)).toBe(true);
    expect(gradeWord("kochen!", kochen)).toBe(true);
  });

  it("rejects an empty answer", () => {
    expect(gradeWord("   ", kochen)).toBe(false);
  });
});
