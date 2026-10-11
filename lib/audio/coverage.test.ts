import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LESSON_CONTENT } from "../lessons";
import { audioKey, spokenTexts } from "./key";

const DIR = path.join(process.cwd(), "public/audio");

// Skipped until `npm run audio:build` has produced (and committed) the clips.
describe.skipIf(!fs.existsSync(DIR))("audio coverage", () => {
  it("every playable text has a generated clip", () => {
    const texts = new Set(
      Object.values(LESSON_CONTENT).flatMap((c) => spokenTexts(c)),
    );
    const missing = [...texts].filter(
      (t) => !fs.existsSync(path.join(DIR, `${audioKey(t)}.mp3`)),
    );
    // One assertion with a count, not a thousand separate ones.
    expect(
      missing.length,
      `${missing.length} of ${texts.size} clips missing, e.g. ${missing.slice(0, 5).join(" | ")}. Run npm run audio:build`,
    ).toBe(0);
  });
});
