/**
 * At A1/A2 the tutor ends every reply with one line `EN: <full English
 * translation>` (see tutor-prompt.ts). This splits a reply into its German
 * body and that translation so the UI can set them apart, and so the
 * Corrector's context only ever sees the German.
 *
 * Pure and streaming-tolerant: it runs on every chunk while a reply streams
 * in. Until the `EN:` marker has fully arrived there is nothing to split, so
 * a half-received "EN" briefly renders as German — harmless, and it resolves
 * on the next chunk. An `EN:` line with nothing after it yet yields
 * `english: ""` (present but empty); callers render nothing for that.
 */

/** A line that starts with optional spaces/tabs, then `EN:`. */
const MARKER = /^[ \t]*EN:/gm;

export interface SplitReply {
  german: string;
  /** null = no translation marker at all (B1/B2, or not streamed in yet). */
  english: string | null;
}

export function splitTranslation(text: string): SplitReply {
  // The LAST marker wins: should the German itself ever contain a line
  // starting with "EN:", the translation is still the final one.
  let start = -1;
  let end = -1;
  for (const m of text.matchAll(MARKER)) {
    start = m.index;
    end = m.index + m[0].length;
  }
  if (start === -1) return { german: text, english: null };
  return {
    german: text.slice(0, start).trimEnd(),
    english: text.slice(end).trim(),
  };
}
