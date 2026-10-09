import { describe, expect, it } from "vitest";
import { gradeGap } from "./grade";
import type { CheckItem } from "./types";

const item: CheckItem = {
  prompt: "Ich ___ Aravind.",
  answer: "Bin",
  accept: ["heiße"],
  hint: "Think of the verb sein.",
};

describe("gradeGap", () => {
  it("accepts an exact match", () => {
    expect(gradeGap("Bin", item)).toBe(true);
  });
  it("ignores extra spaces", () => {
    expect(gradeGap("  Bin  ", item)).toBe(true);
    expect(
      gradeGap("zu  Hause", { ...item, answer: "zu Hause", accept: [] }),
    ).toBe(true);
  });
  it("ignores trailing punctuation", () => {
    expect(gradeGap("Bin.", item)).toBe(true);
    expect(gradeGap("Bin!?", item)).toBe(true);
  });
  it("is case-sensitive", () => {
    expect(gradeGap("bin", item)).toBe(false);
  });
  it("accepts listed alternatives", () => {
    expect(gradeGap("heiße", item)).toBe(true);
  });
  it("rejects the empty string", () => {
    expect(gradeGap("", item)).toBe(false);
    expect(gradeGap("  .", item)).toBe(false);
  });
});
