/** What a drill answer is graded against. */
export interface DrillTarget {
  /** The learner's sentence with the error fixed. */
  expected: string;
  /** The erroneous span as the learner wrote it. */
  span: string;
  /** What the span should have been. */
  correction: string;
}

function normalize(text: string, keepCase: boolean): string {
  const tidy = text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?…,;:]+$/u, "")
    .trim();
  return keepCase ? tidy : tidy.toLowerCase();
}

/**
 * True when the only thing wrong was letter case ("frau" → "Frau"). German
 * noun capitalisation is a real error class, so for these drills case is
 * exactly what is being tested.
 */
export function isCaseOnlyFix(span: string, correction: string): boolean {
  const a = normalize(span, true);
  const b = normalize(correction, true);
  return a !== b && a.toLowerCase() === b.toLowerCase();
}

/**
 * Accept the exact corrected sentence, or — partial credit for rephrasing —
 * any answer that contains the correction and no longer contains the wrong
 * span. Spacing and final punctuation never count; casing counts only when
 * the fix itself is a case fix.
 */
export function isCorrect(answer: string, drill: DrillTarget): boolean {
  const keepCase = isCaseOnlyFix(drill.span, drill.correction);
  const given = normalize(answer, keepCase);
  if (!given) return false;
  if (given === normalize(drill.expected, keepCase)) return true;
  const correction = normalize(drill.correction, keepCase);
  const wrong = normalize(drill.span, keepCase);
  if (!correction) return false;
  return given.includes(correction) && (!wrong || !given.includes(wrong));
}
