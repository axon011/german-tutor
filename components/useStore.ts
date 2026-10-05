"use client";

import { useSyncExternalStore } from "react";
import {
  getLocalStore,
  getStore,
  onStoreSwap,
  type ProgressStore,
} from "@/lib/store";

/**
 * The current ProgressStore as React state. Effects that read through it
 * list it as a dependency, so signing in or out re-reads every view from the
 * store that now owns the learner's data.
 */
export function useStore(): ProgressStore {
  return useSyncExternalStore(onStoreSwap, getStore, getLocalStore);
}
