import { LocalStore } from "./local";
import type { ProgressStore } from "./types";

export type { LessonProgressMap, ProgressStore, SrsCard } from "./types";

let store: ProgressStore | undefined;

/**
 * The learner's store. Guest mode only for now.
 * TODO(slice 3, phase 2): return a RemoteStore (fetch → API routes → getDb())
 * when there is a signed-in session, and import guest data on first sign-in.
 */
export function getStore(): ProgressStore {
  store ??= new LocalStore();
  return store;
}
