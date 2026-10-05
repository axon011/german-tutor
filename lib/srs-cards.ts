/**
 * The rule that turns the error log into SRS cards, shared by the browser
 * store and the Postgres store so a guest and a signed-in learner get exactly
 * the same deck from the same mistakes. Pure: no storage, no clock reads.
 */

import type { ErrorRecord } from "./error-log";
import { newCardState } from "./srs";
import type { SrsCard } from "./store/types";

/** A card before storage has given it an id. */
export type CardDraft = Omit<SrsCard, "id">;

/** Identity of a card: one per distinct (message, span). */
export function cardKey(message: string, span: string): string {
  return `${message}\u0000${span}`;
}

/** A record can become a card only if it can be drilled: same rule as the
 *  Practice queue — the span must still occur and the correction must differ. */
export function isDrillable(r: ErrorRecord): boolean {
  return (
    Boolean(r.span) &&
    Boolean(r.correction) &&
    r.span !== r.correction &&
    r.message.includes(r.span)
  );
}

/**
 * Drafts for every distinct drillable (message, span) in `log` that is not in
 * `known`. The log is oldest first, so it is walked backwards: the newest
 * record wins the correction text for a new card. `known` is not mutated.
 */
export function deriveCardDrafts(
  log: ErrorRecord[],
  known: ReadonlySet<string>,
  now: number,
): CardDraft[] {
  const seen = new Set(known);
  const drafts: CardDraft[] = [];
  for (let i = log.length - 1; i >= 0; i--) {
    const r = log[i];
    if (!isDrillable(r)) continue;
    const key = cardKey(r.message, r.span);
    if (seen.has(key)) continue;
    seen.add(key);
    drafts.push({
      sourceMessage: r.message,
      span: r.span,
      correction: r.correction,
      explanation: r.explanation,
      type: r.type,
      level: r.level,
      createdAt: now,
      ...newCardState(now),
    });
  }
  return drafts;
}
