"use client";

import { useEffect, useState } from "react";
import type { SrsCard } from "@/lib/store";
import { useStore } from "./useStore";

/**
 * SRS cards due right now, as React state. Mirrors useErrorRecords: re-lists
 * when the tab becomes active, on every store change (a new mistake creates a
 * card, a review moves one out of the due set) and on a store swap.
 */
export function useDueCards(active: boolean): SrsCard[] {
  const [cards, setCards] = useState<SrsCard[]>([]);
  const store = useStore();

  useEffect(() => {
    if (!active) return;
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
  }, [active, store]);

  return cards;
}
