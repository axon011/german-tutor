"use client";

import { useEffect, useState } from "react";
import {
  onErrorLogChange,
  readErrorLog,
  type ErrorRecord,
} from "@/lib/error-log";

interface LogSnapshot {
  records: ErrorRecord[];
  /** When the snapshot was taken — the clock for all recency math downstream,
   *  so render itself stays pure. */
  readAt: number;
}

const EMPTY: LogSnapshot = { records: [], readAt: 0 };

/**
 * The error log as React state. Re-reads localStorage when the tab becomes
 * active and whenever another part of the app appends to the log, so an
 * open Practice or Progress view never shows stale data.
 */
export function useErrorRecords(active: boolean): LogSnapshot {
  const [snapshot, setSnapshot] = useState<LogSnapshot>(EMPTY);

  useEffect(() => {
    if (!active) return;
    const read = () => setSnapshot({ records: readErrorLog(), readAt: Date.now() });
    // Sync from an external store (localStorage); SSR forbids an initializer.
    read();
    return onErrorLogChange(read);
  }, [active]);

  return snapshot;
}
