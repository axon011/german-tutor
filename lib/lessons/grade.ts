import type { CheckItem } from "./types";

/**
 * Tidy a typed answer for comparison: trim, collapse inner whitespace, drop
 * trailing sentence punctuation. Case is deliberately kept — German nouns are
 * capitalised, so "bin" vs "Bin" is a real mistake.
 */
function tidy(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "")
    .trim();
}

/** Grade one gap-fill answer against the item's answer and accepted variants. */
export function gradeGap(given: string, item: CheckItem): boolean {
  const g = tidy(given);
  if (!g) return false;
  return [item.answer, ...(item.accept ?? [])].some((a) => tidy(a) === g);
}
