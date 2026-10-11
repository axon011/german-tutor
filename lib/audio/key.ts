/**
 * How a German text becomes an audio file name — shared by the build script
 * that generates the clips (scripts/audio/) and the browser that plays them,
 * so the client derives `/audio/<key>.mp3` from the text alone, no manifest.
 *
 * The key is a content hash: change the text and it points at a new file, so
 * a clip can never go stale and the service worker may cache it forever.
 */

import { expectedAnswer } from "../path/grade-word";
import type { LessonContent } from "../lessons/types";

/** What is actually spoken: NFC, «marks» stripped, whitespace collapsed. */
export function normalizeSpoken(text: string): string {
  return text.normalize("NFC").replace(/[«»]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * cyrb53 (public domain, bryc) — a fast sync 53-bit hash. Sync matters: the
 * ▶ button computes the file name during render. 53 bits makes a collision
 * across ~1,000 clips vanishingly unlikely.
 */
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function audioKey(text: string): string {
  return cyrb53(normalizeSpoken(text)).toString(36);
}

export function audioUrl(text: string): string {
  return `/audio/${audioKey(text)}.mp3`;
}

/**
 * Every text a study sheet can play, in the exact form it is spoken: nouns
 * with their article ("der Bruder"), phrases without «», dialogue as written.
 * The generator and the coverage test both walk this, so whatever the UI can
 * play is guaranteed to have been generated.
 */
export function spokenTexts(content: LessonContent): string[] {
  return [
    ...content.vocab.map((v) => expectedAnswer(v)),
    ...content.phrases.map((p) => p.de),
    ...content.dialogue.map((d) => d.de),
  ].map(normalizeSpoken);
}
