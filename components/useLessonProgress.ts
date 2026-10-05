"use client";

import { useEffect, useState } from "react";
import type { LessonProgress } from "@/lib/lesson-progress";
import { useStore } from "./useStore";

const EMPTY: LessonProgress = {};

/**
 * Lesson progress as React state. Mirrors useErrorRecords: re-reads the
 * current store when the tab becomes active, on every change event and on a
 * store swap, so the Learn tab stays live while the learner is talking in the
 * Conversation tab.
 */
export function useLessonProgress(active: boolean): LessonProgress {
  const [progress, setProgress] = useState<LessonProgress>(EMPTY);
  const store = useStore();

  useEffect(() => {
    if (!active) return;
    let stale = false;
    const read = () => {
      store.getLessonProgress().then(
        (next) => {
          if (!stale) setProgress(next);
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

  return progress;
}
