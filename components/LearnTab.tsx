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
import { LEVEL_CHIP } from "./levelStyles";
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
        <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-emerald-500"
          />
          Your learning path
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-zinc-400">
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
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${LEVEL_CHIP[l]}`}
              >
                {l}
              </span>
              <h3 className="flex-1 text-sm font-bold">{LEVEL_NAMES[l]}</h3>
              <span className="text-xs font-semibold tabular-nums text-stone-500 dark:text-zinc-400">
                {done}/{lessons.length}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
              <div
                className="grow-bar h-full rounded-full bg-emerald-500"
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
        className={`animate-message-in pressable focus-ring flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-3 py-3 text-left dark:bg-zinc-800/60 ${
          isBeacon
            ? "border-emerald-300 bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-500/10"
            : "border-stone-200 hover:border-emerald-300 dark:border-zinc-700 dark:hover:border-emerald-500/60"
        }`}
        style={{ animationDelay: `${Math.min(delayIndex, 12) * 25}ms` }}
      >
        {done ? (
          <CheckMark className="h-8 w-8" tone="gold" />
        ) : (
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
              started
                ? "ring-2 ring-emerald-500 text-emerald-700 dark:text-emerald-300"
                : "border-2 border-stone-200 text-stone-500 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {number}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold">{lesson.title}</span>
            {isBeacon && (
              <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-emerald-500 dark:text-emerald-950">
                Start here
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-stone-500 dark:text-zinc-400">
            {lesson.description}
          </span>
        </span>

        {/* Not a nested button — the whole row is the click target, so this is
            styled as the action rather than being one. */}
        <span
          className={`shrink-0 rounded-2xl px-3.5 py-1.5 text-xs font-semibold ${
            done
              ? "border-2 border-stone-200 text-stone-600 dark:border-zinc-700 dark:text-zinc-300"
              : "btn-3d btn-3d-primary"
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
