/**
 * Mistakes per ISO week (Monday start, local time) — the Progress tab's trend
 * chart. Pure, so the bucket boundaries are testable.
 */

export interface WeekBucket {
  /** Local midnight of the week's Monday, epoch ms. */
  start: number;
  /** ISO week number, e.g. "W40". */
  label: string;
  count: number;
}

/** ISO 8601 week number of the week containing `date` (local time). */
export function isoWeek(date: Date): number {
  // The ISO week belongs to whichever year holds its Thursday.
  const thursday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  thursday.setDate(thursday.getDate() + 3 - ((thursday.getDay() + 6) % 7));
  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  const jan4Monday = new Date(jan4);
  jan4Monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const days = Math.round(
    (thursday.getTime() - jan4Monday.getTime()) / 86_400_000,
  );
  return Math.floor(days / 7) + 1;
}

/** Local midnight of the Monday that starts the ISO week holding `ts`. */
export function startOfIsoWeek(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

/**
 * One bucket per ISO week for the last `weeks` weeks, oldest first, ending
 * with the current week. Records outside the window are ignored.
 */
export function mistakesPerWeek(
  records: { ts: number }[],
  now: number,
  weeks = 8,
): WeekBucket[] {
  const thisWeek = new Date(startOfIsoWeek(now));
  const buckets: WeekBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    // Rebuilt from a Date so DST shifts don't drift the boundary.
    const date = new Date(thisWeek);
    date.setDate(date.getDate() - 7 * i);
    buckets.push({
      start: date.getTime(),
      label: `W${isoWeek(date)}`,
      count: 0,
    });
  }
  if (buckets.length === 0) return buckets;

  const index = new Map(buckets.map((b, i) => [b.start, i]));
  const first = buckets[0].start;
  for (const r of records) {
    if (r.ts < first) continue;
    const i = index.get(startOfIsoWeek(r.ts));
    if (i !== undefined) buckets[i].count += 1;
  }
  return buckets;
}
