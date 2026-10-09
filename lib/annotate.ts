import type { CorrectionError } from "./corrector";

export interface Segment {
  text: string;
  /** Index into the corrections array, or undefined for plain text. */
  errorIndex?: number;
}

/**
 * Split `content` into plain and highlighted segments.
 *
 * Left-to-right, non-overlapping, first-occurrence-after-the-last-match: each
 * error claims the first occurrence of its span at or after the previous
 * match's end. An error whose span no longer occurs there (duplicate spans,
 * spans the model listed out of order, spans already consumed by an earlier
 * error) is simply skipped — dropping a highlight is fine, mangling the
 * learner's text is not.
 */
export function annotate(content: string, errors: CorrectionError[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  errors.forEach((error, errorIndex) => {
    if (!error.span) return;
    const start = content.indexOf(error.span, cursor);
    if (start === -1) return;
    if (start > cursor) segments.push({ text: content.slice(cursor, start) });
    segments.push({ text: error.span, errorIndex });
    cursor = start + error.span.length;
  });

  if (cursor < content.length) segments.push({ text: content.slice(cursor) });
  return segments;
}

/**
 * The learner's message with every highlighted error replaced by its
 * correction. Built from the same segments `annotate` produces, so the
 * corrected sentence always agrees with the underlines — an error that
 * annotate skipped is not applied here either. No LLM call.
 * Returns null when nothing would change.
 */
export function applyCorrections(
  content: string,
  errors: CorrectionError[],
): string | null {
  const segments = annotate(content, errors);
  const joined = segments
    .map((seg) =>
      seg.errorIndex === undefined ? seg.text : errors[seg.errorIndex].correction,
    )
    .join("")
    .replace(/ {2,}/g, " ")
    .replace(/ +([.,!?;:])/g, "$1")
    .trim();
  const applied = segments.some((seg) => seg.errorIndex !== undefined);
  if (!applied || joined === content.trim()) return null;
  return joined;
}
