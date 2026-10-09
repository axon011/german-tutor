import { describe, expect, it } from "vitest";
import { splitTranslation } from "./translation";

describe("splitTranslation", () => {
  it("returns the text untouched and english null when there is no marker", () => {
    const text = "Hallo! Wie heißt du?";
    expect(splitTranslation(text)).toEqual({ german: text, english: null });
  });

  it("splits off the final EN: line", () => {
    expect(
      splitTranslation("Hallo! Wie heißt du?\nEN: Hello! What is your name?"),
    ).toEqual({
      german: "Hallo! Wie heißt du?",
      english: "Hello! What is your name?",
    });
  });

  it("keeps multiline German intact and tolerates leading whitespace", () => {
    expect(
      splitTranslation(
        "Ich heiße Anna.\nUnd du?\n\n  EN:   My name is Anna. And you?  ",
      ),
    ).toEqual({
      german: "Ich heiße Anna.\nUnd du?",
      english: "My name is Anna. And you?",
    });
  });

  it("uses the last marker when there are several", () => {
    expect(splitTranslation("EN: eins\nZwei.\nEN: Two.")).toEqual({
      german: "EN: eins\nZwei.",
      english: "Two.",
    });
  });

  it("does not split on a partially streamed marker without the colon", () => {
    const text = "Hallo! Wie geht's?\nEN";
    expect(splitTranslation(text)).toEqual({ german: text, english: null });
  });

  it("does not split on EN: in the middle of a line", () => {
    const text = "Das Wort EN: ist kein Marker.";
    expect(splitTranslation(text)).toEqual({ german: text, english: null });
  });

  it("returns an empty english string while the translation is still streaming", () => {
    expect(splitTranslation("Hallo!\nEN:")).toEqual({
      german: "Hallo!",
      english: "",
    });
  });
});
