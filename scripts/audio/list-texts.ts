/**
 * Lists every German text the study sheets can play, for scripts/audio/
 * generate.py. Run with tsx (`npm run audio:build` does).
 *
 * The FILE KEY is always audioKey(original text), because that is what the
 * browser computes from the page. SPOKEN_OVERRIDES only changes what Piper is
 * asked to SAY for that file — e.g. spelling out a number or an abbreviation
 * the voice mispronounces — so overriding never breaks the lookup.
 */

import fs from "node:fs";
import path from "node:path";
import { audioKey, spokenTexts } from "../../lib/audio/key";
import { LESSON_CONTENT } from "../../lib/lessons";

/** key = normalized original text, value = what Piper should actually say. */
export const SPOKEN_OVERRIDES: Record<string, string> = {};

const texts = new Set<string>();
for (const content of Object.values(LESSON_CONTENT)) {
  for (const t of spokenTexts(content)) texts.add(t);
}

const entries = [...texts]
  .map((original) => ({
    key: audioKey(original),
    text: SPOKEN_OVERRIDES[original] ?? original,
  }))
  .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

const out = path.join(__dirname, "texts.json");
fs.writeFileSync(out, JSON.stringify(entries, null, 2) + "\n", "utf8");
console.log(`${entries.length} texts -> ${path.relative(process.cwd(), out)}`);
