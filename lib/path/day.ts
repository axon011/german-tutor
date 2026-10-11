/**
 * The learner's LOCAL calendar day as YYYY-MM-DD. Built from local date
 * parts on purpose: toISOString() is UTC and would roll the day over at the
 * wrong hour for anyone away from UTC, breaking streaks near midnight.
 */
export function localDay(d: Date = new Date()): string {
  const y = String(d.getFullYear()).padStart(4, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
