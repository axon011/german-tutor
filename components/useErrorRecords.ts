"use client";

import { useEffect, useState } from "react";
import type { ErrorRecord } from "@/lib/error-log";
import { useStore } from "./useStore";

interface LogSnapshot {
  records: ErrorRecord[];
  /** When the snapshot was taken — the clock for all recency math downstream,
   *  so render itself stays pure. */
  readAt: number;
}

const EMPTY: LogSnapshot = { records: [], readAt: 0 };

/**
 * The error log as React state. Re-reads the current store when the tab
 * becomes active, whenever another part of the app appends to the log, and
 * when the store itself is swapped (sign-in / sign-out), so an open Practice
 * or Progress view never shows stale data. A failed read keeps the last
 * snapshot rather than flashing an empty state.
 */
export function useErrorRecords(active: boolean): LogSnapshot {
  const [snapshot, setSnapshot] = useState<LogSnapshot>(EMPTY);
  const store = useStore();

  useEffect(() => {
    if (!active) return;
    let stale = false;
    const read = () => {
      store.listErrors().then(
        (records) => {
          if (!stale) setSnapshot({ records, readAt: Date.now() });
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

  return snapshot;
}
