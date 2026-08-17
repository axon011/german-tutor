"use client";

import { useEffect, useState } from "react";
import {
  onLessonProgressChange,
  readLessonProgress,
  type LessonProgress,
} from "@/lib/lesson-progress";

const EMPTY: LessonProgress = {};

/**
 * Lesson progress as React state. Mirrors useErrorRecords: re-reads
 * localStorage when the tab becomes active and on every change event, so the
 * Learn tab stays live while the learner is talking in the Conversation tab.
 */
export function useLessonProgress(active: boolean): LessonProgress {
  const [progress, setProgress] = useState<LessonProgress>(EMPTY);

  useEffect(() => {
    if (!active) return;
    const read = () => setProgress(readLessonProgress());
    // Sync from an external store (localStorage); SSR forbids an initializer.
    read();
    return onLessonProgressChange(read);
  }, [active]);

  return progress;
}
