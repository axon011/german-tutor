"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { playGerman, stopAudio } from "@/lib/audio/play";
import type { Lesson } from "@/lib/curriculum";
import { CATEGORY_META, GRAMMAR_TOPICS } from "@/lib/grammar";
import {
  ARTICLE,
  getLessonContent,
  type CheckItem,
  type Gender,
  type LessonContent,
  type VocabItem,
} from "@/lib/lessons";
import { gradeGap } from "@/lib/lessons/grade";
import { expectedAnswer } from "@/lib/path/grade-word";
import { CheckMark } from "./CheckMark";
import { ListeningDrill } from "./ListeningDrill";
import { SpeakButton } from "./SpeakButton";
import { LEVEL_CHIP } from "./levelStyles";
import { MarkedGerman, RuleTable, SheetFrame } from "./StudySheet";

/** Neutral highlight for phrase chunks — phrases belong to no grammar category. */
const PHRASE_MARK = "bg-gold/25 text-ink";

/** The classic learner colour code: der blue, die red, das green. */
const ARTICLE_COLOR: Record<Gender, string> = {
  m: "text-spot-prussian",
  f: "text-spot-brick",
  n: "text-spot-olive",
};

/**
 * The study sheet behind a Learn tile: goals, words, phrases, the grammar the
 * lesson leans on, a model dialogue and a quick check — read and drilled
 * BEFORE the tutor conversation. Like the Grammar sheet it never talks to the
 * model; "Start conversation" hands the lesson to the existing `onStart`.
 *
 * A lesson without authored content still opens, with just header and footer.
 *
 * `audio` (beta) adds playback: a speaker on every word, phrase and dialogue
 * line, "Play dialogue", and a "Listen & type" drill that takes over the sheet
 * body. Left false, the sheet renders exactly as it did before audio existed.
 */
export function LessonSheet({
  lesson,
  number,
  done,
  onClose,
  onStart,
  onChecked,
  audio = false,
}: {
  lesson: Lesson;
  number: number;
  done: boolean;
  onClose: () => void;
  onStart: (lesson: Lesson) => void;
  /** Fired on every "Check answers" press with the score after grading. */
  onChecked?: (correct: number, total: number) => void;
  /** Beta: show playback controls and the listening drill. */
  audio?: boolean;
}) {
  const content = getLessonContent(lesson.id);
  const [drilling, setDrilling] = useState(false);
  const titleId = `${lesson.id}-sheet-title`;

  return (
    <SheetFrame
      titleId={titleId}
      closeLabel="Close lesson"
      onClose={onClose}
      header={
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`font-display text-3xl leading-none font-bold tabular-nums ${
              done ? "text-gold" : "text-ink/25"
            }`}
          >
            {String(number).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <h3
              id={titleId}
              className="font-display flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-bold tracking-tight"
            >
              {lesson.title}
              {done && <CheckMark className="h-4 w-4" tone="gold" />}
            </h3>
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className={`${LEVEL_CHIP} px-2 py-px text-[10px]`}>
                {lesson.level}
              </span>
            </p>
            <p className="text-muted mt-1.5 text-xs leading-relaxed">
              {lesson.description}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="border-line shrink-0 border-t-2 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onStart(lesson);
                onClose();
              }}
              className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
            >
              Start conversation
            </button>
            <span className="text-muted text-[11px]">
              The tutor steers the chat to this topic.
            </span>
          </div>
          {lesson.starter && (
            <p className="text-muted mt-1.5 text-[11px]">
              Try: „{lesson.starter}“
            </p>
          )}
        </div>
      }
    >
      {content &&
        (audio && drilling ? (
          // Same frame and footer, body swapped: the drill is a task of its own.
          <ListeningDrill
            words={content.vocab}
            title={`${lesson.title} · Listen & type`}
            onDone={() => setDrilling(false)}
          />
        ) : (
          <LessonBody
            lesson={lesson}
            content={content}
            onChecked={onChecked}
            audio={audio}
            onListen={() => setDrilling(true)}
          />
        ))}
    </SheetFrame>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  /** Optional control on the right of the header row. */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      {action ? (
        <div className="flex items-center justify-between gap-2">
          <p className="kicker text-muted">{title}</p>
          {action}
        </div>
      ) : (
        <p className="kicker text-muted">{title}</p>
      )}
      {children}
    </section>
  );
}

function LessonBody({
  lesson,
  content,
  onChecked,
  audio,
  onListen,
}: {
  lesson: Lesson;
  content: LessonContent;
  onChecked?: (correct: number, total: number) => void;
  audio: boolean;
  onListen: () => void;
}) {
  // Sections number themselves by render order, so a lesson that skips one
  // (e.g. no grammar ids) still reads 1 · 2 · 3 without a gap. The counter
  // must live in THIS render: kept in the parent, it kept counting whenever
  // LessonBody re-rendered on its own (and twice under StrictMode).
  let n = 0;
  const label = (name: string) => `${++n} · ${name}`;

  // Unknown ids are skipped silently — a typo in content must not blank the sheet.
  const topics = content.grammarIds.flatMap((id) => {
    const t = GRAMMAR_TOPICS.find((x) => x.id === id);
    return t ? [t] : [];
  });

  return (
    <>
      {content.goals.length > 0 && (
        <Section title={label("Goals")}>
          <ul className="space-y-1.5">
            {content.goals.map((g, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[13px] leading-relaxed"
              >
                <span
                  aria-hidden="true"
                  className="bg-gold mt-[7px] h-1.5 w-1.5 shrink-0"
                />
                {g}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {content.vocab.length > 0 && (
        <Section
          title={label("Words")}
          action={
            audio ? (
              <button
                type="button"
                onClick={onListen}
                className="btn-hard focus-ring px-2.5 py-1 text-[10px] uppercase"
              >
                Listen &amp; type
              </button>
            ) : undefined
          }
        >
          <p className="font-display flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
            <span className="text-muted font-sans text-[11px] font-normal">
              Article colours
            </span>
            <span>
              <span className={ARTICLE_COLOR.m}>der</span>
              <span className="text-muted"> · </span>
              <span className={ARTICLE_COLOR.f}>die</span>
              <span className="text-muted"> · </span>
              <span className={ARTICLE_COLOR.n}>das</span>
            </span>
          </p>
          <ul className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
            {content.vocab.map((v, i) => (
              <VocabCell key={i} item={v} audio={audio} />
            ))}
          </ul>
        </Section>
      )}

      {content.phrases.length > 0 && (
        <Section title={label("Phrases")}>
          <ul className="space-y-2">
            {content.phrases.map((p, i) => (
              <li
                key={i}
                className="border-line bg-background flex items-start gap-1 rounded-sm border-2 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-relaxed">
                    <MarkedGerman text={p.de} markClass={PHRASE_MARK} />
                  </p>
                  <p className="text-muted mt-0.5 text-[11px] leading-relaxed">
                    {p.en}
                  </p>
                </div>
                {audio && <SpeakButton text={p.de} />}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {topics.length > 0 && (
        <Section title={label("Grammar")}>
          <ul className="space-y-2">
            {topics.map((t) => {
              const meta = CATEGORY_META[t.category];
              return (
                <li
                  key={t.id}
                  className="border-line bg-background rounded-sm border-2 px-3 py-2.5"
                >
                  <p
                    className={`font-display text-lg leading-tight font-bold break-words ${meta.accent}`}
                  >
                    {t.glyph}
                  </p>
                  <p className="font-display mt-1 text-sm font-bold">
                    {t.title}
                  </p>
                  <p className="text-muted mt-0.5 text-xs leading-relaxed">
                    {t.summary}
                  </p>
                  <details className="group mt-2">
                    <summary className="kicker text-ink focus-ring cursor-pointer list-none">
                      <span className="group-open:hidden">Show rule</span>
                      <span className="hidden group-open:inline">
                        Hide rule
                      </span>
                    </summary>
                    <div className="mt-2 space-y-3">
                      <div className="max-w-prose space-y-2">
                        {t.explanation.map((para, i) => (
                          <p
                            key={i}
                            className="text-muted text-[13px] leading-relaxed"
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                      <ul className="space-y-2">
                        {t.examples.slice(0, 2).map((ex, i) => (
                          <li
                            key={i}
                            className="border-line bg-surface rounded-sm border-2 px-3 py-2"
                          >
                            <p className="text-[15px] leading-relaxed">
                              <MarkedGerman
                                text={ex.de}
                                markClass={meta.mark}
                              />
                            </p>
                            <p className="text-muted mt-0.5 text-[11px] leading-relaxed">
                              {ex.en}
                            </p>
                          </li>
                        ))}
                      </ul>
                      {t.table && <RuleTable table={t.table} />}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {content.dialogue.length > 0 && (
        <Section title={label("Dialogue")}>
          <DialogueScript
            audio={audio}
            lines={content.dialogue}
            defaultEnglish={lesson.level === "A1" || lesson.level === "A2"}
          />
        </Section>
      )}

      {content.check.length > 0 && (
        <Section title={label("Quick check")}>
          <QuickCheck items={content.check} onChecked={onChecked} />
        </Section>
      )}
    </>
  );
}

function VocabCell({ item, audio }: { item: VocabItem; audio: boolean }) {
  return (
    <li className="border-line min-w-0 border-b pb-1.5">
      <div className="flex items-start justify-between gap-1">
      <p className="text-[15px] leading-snug">
        {item.gender && (
          <span className={`font-medium ${ARTICLE_COLOR[item.gender]}`}>
            {ARTICLE[item.gender]}{" "}
          </span>
        )}
        {item.de}
        {item.gender && item.plural && (
          <span className="text-muted ml-1.5 text-[11px]">
            pl. {item.plural}
          </span>
        )}
      </p>
      {audio && <SpeakButton text={expectedAnswer(item)} className="-mt-1" />}
      </div>
      <p className="text-muted text-[11px] leading-relaxed">{item.en}</p>
    </li>
  );
}

/**
 * The model dialogue as a script. The first speaker is set plain and the
 * second behind a gold rule, so who is talking reads without labels having to
 * be hunted for. English starts on for A1/A2, where the German is still
 * effortful, and off from B1 up, where reading it cold is the exercise.
 */
function DialogueScript({
  lines,
  defaultEnglish,
  audio,
}: {
  lines: LessonContent["dialogue"];
  defaultEnglish: boolean;
  audio: boolean;
}) {
  const [english, setEnglish] = useState(defaultEnglish);
  /** Index of the line being played; null when the dialogue is not playing. */
  const [current, setCurrent] = useState<number | null>(null);
  /** Bumped to cancel a running "Play dialogue" loop. */
  const run = useRef(0);
  const first = lines[0]?.speaker;

  function stop() {
    run.current++;
    stopAudio();
    setCurrent(null);
  }

  async function playAll() {
    const mine = ++run.current;
    for (let i = 0; i < lines.length; i++) {
      if (run.current !== mine) return;
      setCurrent(i);
      // playGerman also resolves when something else cancels it; the run
      // check then ends the loop instead of ploughing on to the next line.
      await playGerman(lines[i].de);
    }
    if (run.current === mine) setCurrent(null);
  }

  // Closing the sheet (or swapping in the drill) must silence the dialogue.
  useEffect(() => {
    const token = run;
    return () => {
      token.current++;
      stopAudio();
    };
  }, []);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={english}
          onClick={() => setEnglish((v) => !v)}
          className="pressable focus-ring font-display border-line text-muted hover:border-ink hover:text-ink rounded-sm border-2 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase"
        >
          {english ? "Hide English" : "Show English"}
        </button>
        {audio && (
          <button
            type="button"
            onClick={current === null ? () => void playAll() : stop}
            className="btn-hard focus-ring px-2.5 py-1 text-[10px] uppercase"
          >
            {current === null ? "Play dialogue" : "Stop"}
          </button>
        )}
      </div>
      <ul className="space-y-2.5">
        {lines.map((l, i) => (
          <li
            key={i}
            className={`${
              l.speaker === first ? "" : "border-gold border-l-[3px] pl-3"
            } ${audio ? "flex items-start gap-1 rounded-sm" : ""} ${
              audio && current === i ? "bg-gold/15" : ""
            }`}
          >
            {audio ? (
              <>
                <div className="min-w-0 flex-1">
                  <DialogueLineText line={l} english={english} />
                </div>
                <SpeakButton text={l.de} />
              </>
            ) : (
              <DialogueLineText line={l} english={english} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DialogueLineText({
  line,
  english,
}: {
  line: LessonContent["dialogue"][number];
  english: boolean;
}) {
  return (
    <>
      <p className="font-display text-xs font-semibold">{line.speaker}</p>
      <p className="text-[15px] leading-relaxed">{line.de}</p>
      {english && (
        <p className="text-muted text-[11px] leading-relaxed">{line.en}</p>
      )}
    </>
  );
}

/**
 * Three gap-fills graded together. A wrong item shows its English hint; a
 * second wrong check on the same item also gives the answer away, so a
 * learner who is stuck is never left guessing.
 */
function QuickCheck({
  items,
  onChecked,
}: {
  items: CheckItem[];
  onChecked?: (correct: number, total: number) => void;
}) {
  const [values, setValues] = useState<string[]>(() => items.map(() => ""));
  /** null = not yet checked. */
  const [results, setResults] = useState<(boolean | null)[]>(() =>
    items.map(() => null),
  );
  const [misses, setMisses] = useState<number[]>(() => items.map(() => 0));

  const checked = results.some((r) => r !== null);
  const score = results.filter((r) => r === true).length;

  function check() {
    const next = items.map((item, i) => gradeGap(values[i], item));
    setResults(next);
    setMisses((m) => m.map((c, i) => (next[i] ? c : c + 1)));
    onChecked?.(next.filter(Boolean).length, items.length);
  }

  return (
    <div className="space-y-3">
      <ol className="space-y-3">
        {items.map((item, i) => {
          const [before, ...rest] = item.prompt.split("___");
          const after = rest.join("___");
          const r = results[i];
          return (
            <li key={i}>
              <p className="text-[15px] leading-loose">
                {before}
                <input
                  type="text"
                  value={values[i]}
                  onChange={(e) =>
                    setValues((v) =>
                      v.map((x, j) => (j === i ? e.target.value : x)),
                    )
                  }
                  aria-label={`Gap ${i + 1}`}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  style={{ width: `${item.answer.length + 2}ch` }}
                  className={`focus-ring font-display mx-1 min-w-[5ch] border-b-2 bg-transparent px-1 text-center text-[15px] ${
                    r === true
                      ? "border-success text-success"
                      : r === false
                        ? "border-danger text-danger"
                        : "border-ink"
                  }`}
                />
                {after}
                {r === true && (
                  <span aria-hidden="true" className="text-success ml-1.5">
                    ✓
                  </span>
                )}
              </p>
              {r === false && (
                <p className="text-muted mt-0.5 text-[11px] leading-relaxed">
                  {item.hint}
                  {misses[i] >= 2 && (
                    <>
                      {" "}
                      <span className="text-ink font-medium">
                        Answer: {item.answer}
                      </span>
                    </>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={check}
          className="btn-hard focus-ring px-4 py-2 text-xs uppercase"
        >
          Check answers
        </button>
        {checked && (
          <p
            role="status"
            className="font-display text-xs font-semibold tabular-nums"
          >
            {score} / {items.length} correct
          </p>
        )}
      </div>
    </div>
  );
}
