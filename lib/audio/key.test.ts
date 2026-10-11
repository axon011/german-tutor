import { describe, expect, it } from "vitest";
import { audioKey, audioUrl, normalizeSpoken, spokenTexts } from "./key";
import { LESSON_CONTENT } from "../lessons";

describe("normalizeSpoken", () => {
  it("strips marks and collapses whitespace", () => {
    expect(normalizeSpoken("  Ich «heiße»   Aravind. ")).toBe("Ich heiße Aravind.");
  });
  it("composes umlauts (NFC)", () => {
    expect(normalizeSpoken("Müller")).toBe("Müller");
  });
});

describe("audioKey", () => {
  it("is stable and ignores formatting-only differences", () => {
    expect(audioKey("der Bruder")).toBe(audioKey("  der   Bruder "));
    expect(audioKey("Ich «heiße» Anna.")).toBe(audioKey("Ich heiße Anna."));
  });
  it("differs when the text differs (case included)", () => {
    expect(audioKey("der Bruder")).not.toBe(audioKey("der bruder"));
  });
  it("builds a URL", () => {
    expect(audioUrl("der Bruder")).toMatch(/^\/audio\/[0-9a-z]+\.mp3$/);
  });
  it("has no collisions across all lesson texts", () => {
    const texts = new Set(Object.values(LESSON_CONTENT).flatMap(spokenTexts));
    const keys = new Set([...texts].map(audioKey));
    expect(keys.size).toBe(texts.size);
  });
});

describe("spokenTexts", () => {
  it("speaks nouns with their article and phrases without marks", () => {
    const t = spokenTexts({
      goals: [],
      vocab: [
        { de: "Bruder", en: "brother", gender: "m", plural: "Brüder" },
        { de: "kochen", en: "to cook" },
      ],
      phrases: [{ de: "Ich habe «zwei Brüder».", en: "" }],
      grammarIds: [],
      dialogue: [{ speaker: "A", de: "Hallo!", en: "" }],
      check: [],
    });
    expect(t).toEqual(["der Bruder", "kochen", "Ich habe zwei Brüder.", "Hallo!"]);
  });
});
