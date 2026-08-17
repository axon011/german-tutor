"use client";

import { useEffect, useState } from "react";
import {
  LESSONS,
  LEVEL_NAMES,
  lessonsForLevel,
  type Lesson,
} from "@/lib/curriculum";
import { isCompleted, type LessonProgress } from "@/lib/lesson-progress";
import { CEFR_LEVELS, isCefrLevel, type CefrLevel } from "@/lib/tutor-prompt";
import { CheckMark } from "./CheckMark";
import { useLessonProgress } from "./useLessonProgress";

/**
 * The guided path: four level sections, eight lessons each. Every row launches
 * a focused conversation in the Conversation tab — the Learn tab itself never
 * talks to the model.
 */
export function LearnTab({
  active,
  activeLesson,
  onStart,
}: {
  active: boolean;
  activeLesson: string | null;
  onStart: (lesson: Lesson) => void;
}) {
  const progress = useLessonProgress(active);
  const [level, setLevel] = useState<CefrLevel>("B1");

  // The learner's own level decides where the "Start here" beacon sits. Read
  // on activation, because the Chat tab may have changed it since last visit.
  useEffect(() => {
    if (!active) return;
    const saved = localStorage.getItem("cefr-level");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLevel(isCefrLevel(saved) ? saved : "B1");
  }, [active]);

  // Bars start at 0 and grow once the tab is on screen — same treatment as the
  // Progress tab, so a level's completion reads as something just measured.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGrown(false);
      return;
    }
    const t = setTimeout(() => setGrown(true), 30);
    return () => clearTimeout(t);
  }, [active]);

  const beaconId = firstUnfinished(level, progress);
  // One running index across all sections so the entrance stagger reads as a
  // single list unrolling rather than four that restart.
  let row = 0;

  return (
    <div className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
      <header>
        <h2 className="text-sm font-semibold">Your learning path</h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500 dark:text-gray-400">
          Pick a lesson and the tutor steers the conversation to that topic and
          its grammar. {LESSONS.length} lessons, A1 to B2.
        </p>
      </header>

      {CEFR_LEVELS.map((l) => {
        const lessons = lessonsForLevel(l);
        const done = lessons.filter((x) => isCompleted(progress[x.id])).length;
        return (
          <section key={l}>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-medium text-amber-950 shadow-sm">
                {l}
              </span>
              <h3 className="flex-1 text-sm font-semibold">{LEVEL_NAMES[l]}</h3>
              <span className="text-xs tabular-nums text-stone-500 dark:text-gray-400">
                {done}/{lessons.length}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-gray-800">
              <div
                className="grow-bar h-full rounded-full bg-amber-400 dark:bg-amber-500"
                style={{
                  width: grown ? `${(done / lessons.length) * 100}%` : "0%",
                }}
              />
            </div>

            <ol className="mt-3 space-y-2">
              {lessons.map((lesson, i) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  number={i + 1}
                  progress={progress}
                  isBeacon={lesson.id === beaconId}
                  isActive={lesson.id === activeLesson}
                  delayIndex={row++}
                  onStart={onStart}
                />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function LessonRow({
  lesson,
  number,
  progress,
  isBeacon,
  isActive,
  delayIndex,
  onStart,
}: {
  lesson: Lesson;
  number: number;
  progress: LessonProgress;
  isBeacon: boolean;
  isActive: boolean;
  delayIndex: number;
  onStart: (lesson: Lesson) => void;
}) {
  const entry = progress[lesson.id];
  const done = isCompleted(entry);
  const started = Boolean(entry) && !done;
  const action = done ? "Review" : started ? "Continue" : "Start";

  return (
    <li>
      {/* The whole row is the button — the pill on the right is a visual
          affordance inside it, not a second click target. */}
      <button
        type="button"
        onClick={() => onStart(lesson)}
        aria-current={isActive ? "true" : undefined}
        className={`animate-message-in pressable focus-ring flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${
          isBeacon
            ? "border-amber-400 bg-amber-50 dark:border-amber-500/60 dark:bg-amber-500/10"
            : "border-stone-200 hover:border-amber-400 dark:border-gray-800 dark:hover:border-amber-500"
        }`}
        style={{ animationDelay: `${Math.min(delayIndex, 12) * 25}ms` }}
      >
        {done ? (
          <CheckMark className="h-7 w-7" />
        ) : (
          <span
            aria-hidden="true"
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
              started
                ? "ring-2 ring-amber-400 text-amber-700 dark:text-amber-300 dark:ring-amber-500"
                : "border border-stone-300 text-stone-500 dark:border-gray-700 dark:text-gray-400"
            }`}
          >
            {number}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-medium">{lesson.title}</span>
            {isBeacon && (
              <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-950">
                Start here
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-stone-500 dark:text-gray-400">
            {lesson.description}
          </span>
        </span>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            done
              ? "border border-stone-300 text-stone-600 dark:border-gray-700 dark:text-gray-300"
              : "bg-amber-400 text-amber-950 shadow-sm"
          }`}
        >
          {action}
        </span>
      </button>
    </li>
  );
}

/** The beacon target: first lesson of `level` the learner has not finished. */
function firstUnfinished(
  level: CefrLevel,
  progress: LessonProgress,
): string | null {
  const next = lessonsForLevel(level).find((l) => !isCompleted(progress[l.id]));
  return next?.id ?? null;
}
