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
import { Kicker } from "./Kicker";
import { LEVEL_CHIP, LEVEL_CHIP_ON } from "./levelStyles";
import { useLessonProgress } from "./useLessonProgress";

/** Lesson indices are set as two-digit editorial numerals: 01, 02, … */
function index2(n: number): string {
  return String(n).padStart(2, "0");
}

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
        <Kicker index="01" label="Learn" />
        <h2 className="font-display mt-2.5 text-base font-bold tracking-tight">
          Your learning path
        </h2>
        <p className="text-muted mt-1 text-xs leading-relaxed">
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
                className={`px-2.5 py-1 text-xs ${
                  done === lessons.length ? LEVEL_CHIP_ON : LEVEL_CHIP
                }`}
              >
                {l}
              </span>
              <h3 className="font-display flex-1 text-sm font-bold">
                {LEVEL_NAMES[l]}
              </h3>
              <span className="font-display text-muted text-xs font-semibold tabular-nums">
                {done}/{lessons.length}
              </span>
            </div>
            <div className="bg-ink/10 mt-2 h-2 overflow-hidden">
              <div
                className="grow-bar bg-gold h-full"
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
        className={`animate-message-in pressable focus-ring bg-surface flex w-full items-center gap-3 rounded-sm border-2 px-3 py-3 text-left ${
          isBeacon ? "border-gold" : "border-line hover:border-ink/40"
        }`}
        style={{ animationDelay: `${Math.min(delayIndex, 12) * 25}ms` }}
      >
        {done ? (
          <CheckMark className="h-8 w-8" tone="gold" />
        ) : (
          <span
            aria-hidden="true"
            className={`font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-2 text-xs font-bold tabular-nums ${
              started
                ? "border-gold bg-gold text-gold-ink"
                : "border-line text-muted"
            }`}
          >
            {index2(number)}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-display text-sm font-bold">
              {lesson.title}
            </span>
            {isBeacon && (
              <span className="kicker bg-gold text-gold-ink rounded-sm px-1.5 py-px text-[9px]">
                Start here
              </span>
            )}
          </span>
          <span className="text-muted mt-0.5 block text-[11px] leading-relaxed">
            {lesson.description}
          </span>
        </span>

        {/* Not a nested button — the whole row is the click target, so this is
            styled as the action rather than being one. */}
        <span
          className={`btn-hard shrink-0 px-3.5 py-1.5 text-xs uppercase ${
            done ? "btn-hard-ghost" : "btn-hard-primary"
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
