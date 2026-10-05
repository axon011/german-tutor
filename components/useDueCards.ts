"use client";

import { useEffect, useState } from "react";
import { getStore, type SrsCard } from "@/lib/store";

/**
 * SRS cards due right now, as React state. Mirrors useErrorRecords: re-lists
 * when the tab becomes active and on every store change (a new mistake
 * creates a card, a review moves one out of the due set).
 */
export function useDueCards(active: boolean): SrsCard[] {
  const [cards, setCards] = useState<SrsCard[]>([]);

  useEffect(() => {
    if (!active) return;
    const store = getStore();
    let stale = false;
    const read = () => {
      store.listDueCards(Date.now()).then(
        (due) => {
          if (!stale) setCards(due);
        },
        () => {},
      );
    };
    read();
    const off = store.subscribe(read);
    return () => {
      stale = true;
      off();
    };
  }, [active]);

  return cards;
}
