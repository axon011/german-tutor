import { LocalStore } from "./local";
import type { ProgressStore } from "./types";

export type { LessonProgressMap, ProgressStore, SrsCard } from "./types";

const local = new LocalStore();
let store: ProgressStore = local;
const swapListeners = new Set<() => void>();

/**
 * The learner's store: LocalStore for guests, RemoteStore once a session is
 * resolved (StoreProvider swaps it). Read it at the moment of use — callers
 * that hold on to a store across renders should go through useStore() so a
 * sign-in or sign-out re-reads from the right place.
 */
export function getStore(): ProgressStore {
  return store;
}

/** The browser store, whatever the current store is (import, sign-out). */
export function getLocalStore(): ProgressStore {
  return local;
}

export function setStore(next: ProgressStore): void {
  if (next === store) return;
  store = next;
  for (const cb of swapListeners) cb();
}

/** Fires when the current store is replaced. Returns unsubscribe. */
export function onStoreSwap(cb: () => void): () => void {
  swapListeners.add(cb);
  return () => {
    swapListeners.delete(cb);
  };
}
