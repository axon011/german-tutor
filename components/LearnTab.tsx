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
 * The guided path: four level sections, eight lessons each, laid out as a grid
 * of catalogue plates. Every tile launches a focused conversation in the
 * Conversation tab — the Learn tab itself never talks to the model.
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

            {/* mt-4 rather than mt-3: the "Start here" chip hangs above its
                tile, and needs the extra clearance under the progress bar. */}
            <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {lessons.map((lesson, i) => (
                <LessonTile
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

/**
 * One lesson as a catalogue plate: the numeral is the hero, the title and the
 * one-line description sit under it, and a micro-label at the foot says what a
 * press will do. The whole tile is the button.
 */
function LessonTile({
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
  const status = done ? "Done" : started ? "Continue" : "Start";

  return (
    <li
      className="animate-message-in"
      style={{ animationDelay: `${Math.min(delayIndex, 12) * 25}ms` }}
    >
      {/* `btn-hard` carries the hard-offset press. It also sets the display
          font on everything inside, which is what the numeral, title and
          micro-label want — only the description opts back out. */}
      <button
        type="button"
        onClick={() => onStart(lesson)}
        aria-current={isActive ? "true" : undefined}
        aria-label={`Lesson ${number}: ${lesson.title} — ${
          done ? "done, review again" : started ? "continue" : "start"
        }`}
        className={`btn-hard focus-ring bg-surface relative flex h-full w-full flex-col rounded-sm border-2 p-3.5 text-left ${
          isBeacon ? "border-gold" : "border-line hover:border-ink/40"
        }`}
      >
        {isBeacon && (
          <span className="kicker bg-gold text-gold-ink absolute -top-2 left-3 rounded-sm px-1.5 py-px text-[9px]">
            Start here
          </span>
        )}

        <span className="flex w-full items-start justify-between gap-2">
          <span
            aria-hidden="true"
            className={`font-display text-3xl leading-none font-bold tabular-nums ${
              done || started ? "text-gold" : "text-ink/25"
            }`}
          >
            {index2(number)}
          </span>
          {done && <CheckMark className="h-5 w-5" tone="gold" />}
        </span>

        <span className="font-display mt-2 line-clamp-2 block text-sm leading-snug font-semibold">
          {lesson.title}
        </span>
        <span className="text-muted font-sans mt-1 line-clamp-2 block text-xs leading-relaxed font-normal tracking-normal">
          {lesson.description}
        </span>

        {/* Not a nested button — the whole tile is the click target, so the
            action reads as a caption rather than a second control. Gold is a
            fill in this system, never small text, so "Continue" is carried by
            full-strength ink against the muted grey of the other two. */}
        <span
          aria-hidden="true"
          className={`kicker mt-auto flex items-center gap-1 pt-2.5 text-[10px] ${
            started ? "text-ink" : "text-muted"
          }`}
        >
          {status}
          {!done && <span>→</span>}
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
