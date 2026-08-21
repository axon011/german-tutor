"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TYPE_LABELS, type ErrorRecord } from "@/lib/error-log";
import { CheckMark } from "./CheckMark";
import { LogoMark } from "./LogoMark";
import { useCountUp } from "./useCountUp";
import { useErrorRecords } from "./useErrorRecords";

const MAX_DRILLS = 20;
const ADVANCE_DELAY_MS = 1200;
const SHAKE_MS = 300;
/** Score at or above which the summary earns the big tick. */
const GOOD_SCORE = 0.8;

interface Drill extends ErrorRecord {
  /** The learner's sentence with the error fixed — the target answer. */
  expected: string;
}

/** Counters are set as two-digit editorial numerals: 01, 02, … */
function index2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Drill mode: the learner rewrites their own past mistakes correctly.
 * Everything here is local — no LLM call, the material is the error log.
 */
export function PracticeTab({ active }: { active: boolean }) {
  const { records } = useErrorRecords(active);
  const queue = useMemo(() => buildQueue(records), [records]);

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<
    "open" | "wrong" | "revealed" | "correct"
  >("open");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  /** Non-zero while the answer row is shaking. Toggling the class off and back
   *  on is what restarts the keyframes; a `key` would remount the input and
   *  steal the learner's focus mid-drill. */
  const [shakeAt, setShakeAt] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const drill: Drill | undefined = queue[index];

  // Auto-advance after a correct answer.
  useEffect(() => {
    if (status !== "correct") return;
    const t = setTimeout(() => next(), ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [status, index]);

  useEffect(() => {
    if (!shakeAt) return;
    const t = setTimeout(() => setShakeAt(0), SHAKE_MS);
    return () => clearTimeout(t);
  }, [shakeAt]);

  function next() {
    setIndex((i) => i + 1);
    setAnswer("");
    setAttempts(0);
    setStatus("open");
    inputRef.current?.focus();
  }

  function restart() {
    setIndex(0);
    setAnswer("");
    setAttempts(0);
    setStatus("open");
    setScore(0);
    setRound((r) => r + 1);
  }

  function check() {
    if (!drill || status === "correct") return;
    if (status === "revealed") {
      next();
      return;
    }
    if (isCorrect(answer, drill)) {
      setStatus("correct");
      setScore((s) => s + 1);
      return;
    }
    const used = attempts + 1;
    setAttempts(used);
    setStatus(used >= 2 ? "revealed" : "wrong");
    setShakeAt(Date.now());
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <LogoMark className="h-14 w-14 text-lg" />
        <h2 className="font-display text-lg font-bold tracking-tight">
          Nothing to practice yet
        </h2>
        <p className="text-muted max-w-sm text-sm leading-relaxed">
          Have a conversation first — your mistakes will show up here to
          practice.
        </p>
      </div>
    );
  }

  if (!drill) {
    return (
      <Summary
        score={score}
        total={queue.length}
        round={round}
        onRestart={restart}
      />
    );
  }

  const [before, after] = splitAtSpan(drill.message, drill.span);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-md">
        {/* The header and meter live OUTSIDE the keyed wrapper: they have to
            persist across exercises for the bar to animate rather than mount
            already-filled. */}
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Numerals only, the way a proof sheet numbers its frames — the
                sentence a screen reader gets is the sr-only line below. */}
            <p
              aria-hidden="true"
              className="kicker text-muted flex items-baseline gap-1.5"
            >
              <span className="text-ink">Exercise {index2(index + 1)}</span>
              <span>—</span>
              <span>{index2(queue.length)}</span>
            </p>
            <span aria-hidden="true" className="gold-rule mt-1.5" />
          </div>
          <p aria-hidden="true" className="shrink-0 text-right">
            <span className="font-display text-ink block text-2xl leading-none font-bold tabular-nums">
              {index2(score)}
            </span>
            <span className="kicker text-muted mt-1 block text-[9px]">
              Correct
            </span>
          </p>
          <span className="sr-only">
            Exercise {index + 1} of {queue.length}, {score} correct so far.
          </span>
        </header>
        <div className="bg-ink/10 mt-3 h-2 w-full overflow-hidden">
          <div
            className="grow-bar-fast bg-gold h-full"
            style={{ width: `${(index / queue.length) * 100}%` }}
          />
        </div>

        <div key={`${round}-${index}`} className="animate-slide-in">
          <div className="border-line bg-surface mt-5 rounded-sm border-2 px-5 py-5">
            <div className="flex items-center justify-between gap-2">
              <span className="kicker text-muted">Your sentence</span>
              <span className="font-display border-ink/40 text-muted shrink-0 rounded-sm border-[1.5px] px-1.5 py-px text-[9px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase">
                {TYPE_LABELS[drill.type].label}
              </span>
            </div>
            {/* The hero of the screen: the learner's own sentence, set large. */}
            <p className="mt-3 text-lg leading-relaxed whitespace-pre-wrap sm:text-xl">
              {before}
              <span className="decoration-danger underline decoration-wavy decoration-2 underline-offset-4">
                {drill.span}
              </span>
              {after}
            </p>
          </div>

          <label htmlFor="drill-input" className="kicker text-muted mt-5 block">
            Rewrite it correctly
          </label>
          <form
            className={`mt-2 flex flex-col gap-2 sm:flex-row sm:items-center ${
              shakeAt ? "animate-shake" : ""
            }`}
            onSubmit={(e) => {
              e.preventDefault();
              check();
            }}
          >
            <input
              id="drill-input"
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={status === "correct"}
              maxLength={4000}
              className={`field min-w-0 flex-1 px-4 py-3 text-base ${
                shakeAt ? "border-danger! ring-danger/40 ring-2" : ""
              }`}
              placeholder="The corrected sentence…"
            />
            {status === "revealed" ? (
              // The visible advance is the NEXT block inside the solution
              // plate; this one only keeps Enter working from the field.
              <button
                type="submit"
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!answer.trim()}
                className="btn-hard btn-hard-primary focus-ring w-full shrink-0 px-5 py-3 text-sm uppercase sm:w-auto"
              >
                Check
              </button>
            )}
          </form>

          <div aria-live="polite" className="mt-4">
            {status === "correct" && (
              <div className="border-line border-l-success bg-surface flex items-start gap-2.5 rounded-sm border-2 border-l-[3px] px-4 py-3">
                <CheckMark className="mt-0.5 h-5 w-5" />
                <div className="min-w-0">
                  <p className="kicker text-success">Correct</p>
                  <p className="text-ink mt-1.5 leading-relaxed">
                    {drill.expected}
                  </p>
                </div>
              </div>
            )}
            {status === "wrong" && (
              <p className="border-line border-l-danger bg-surface text-danger kicker rounded-sm border-2 border-l-[3px] px-4 py-3">
                Not quite — look at the marked error.
              </p>
            )}
            {status === "revealed" && (
              <div className="border-line border-l-danger bg-surface rounded-sm border-2 border-l-[3px] px-4 py-3">
                <p className="kicker text-muted">Solution</p>
                <p className="mt-1.5 text-base leading-relaxed">
                  {drill.expected}
                </p>
                <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="text-danger line-through">{drill.span}</span>
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                  <span className="text-success font-semibold">
                    {drill.correction}
                  </span>
                </p>
                <p className="text-muted mt-2 text-xs leading-relaxed">
                  {drill.explanation || TYPE_LABELS[drill.type].tip}
                </p>
                <button
                  type="button"
                  onClick={next}
                  className="btn-hard btn-hard-primary focus-ring mt-3.5 px-4 py-2 text-xs uppercase"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** End-of-session score card. */
function Summary({
  score,
  total,
  round,
  onRestart,
}: {
  score: number;
  total: number;
  round: number;
  onRestart: () => void;
}) {
  // `round` re-arms the count-up so a repeat session animates again.
  const shown = useCountUp(score, true);
  const good = total > 0 && score / total >= GOOD_SCORE;

  return (
    <div
      key={round}
      className="animate-slide-in flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center"
    >
      <div className="flex flex-col items-center">
        <p className="kicker text-muted">Session complete</p>
        <span aria-hidden="true" className="gold-rule mt-1.5" />
      </div>

      {/* The score as a poster numeral: the tally the learner earned in gold,
          the total it was out of dropped back into faint ink. */}
      <p
        aria-hidden="true"
        className="font-display text-6xl leading-none font-bold tracking-tight tabular-nums sm:text-7xl"
      >
        <span className="text-gold">{index2(shown)}</span>
        <span className="text-ink/40">/{index2(total)}</span>
      </p>
      <span className="sr-only">
        {score} of {total} correct.
      </span>

      <div className="flex flex-col items-center gap-2.5">
        {good && <CheckMark className="h-12 w-12" tone="gold" />}
        <p className="kicker text-ink">
          {good ? "Strong work" : "Keep drilling"}
        </p>
      </div>

      <p className="text-muted max-w-xs text-sm leading-relaxed">
        {score === total
          ? "Perfect — all of it stuck!"
          : "Repetition helps: give it another go."}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="btn-hard btn-hard-primary focus-ring px-5 py-2.5 text-sm uppercase"
      >
        Practice again
      </button>
    </div>
  );
}

/**
 * Newest mistakes first, one drill per distinct (Satz, Fehler) pair, capped so
 * a session stays a session. Records whose span no longer occurs in the stored
 * sentence — or whose "correction" is not actually a change — are unusable as
 * a drill and are dropped.
 */
function buildQueue(records: ErrorRecord[]): Drill[] {
  const seen = new Set<string>();
  const drills: Drill[] = [];
  for (let i = records.length - 1; i >= 0 && drills.length < MAX_DRILLS; i--) {
    const r = records[i];
    if (!r.span || !r.correction || r.span === r.correction) continue;
    if (!r.message.includes(r.span)) continue;
    const key = `${r.message} ${r.span}`;
    if (seen.has(key)) continue;
    seen.add(key);
    drills.push({ ...r, expected: r.message.replace(r.span, r.correction) });
  }
  return drills;
}

/** Text before and after the first occurrence of the erroneous span. */
function splitAtSpan(message: string, span: string): [string, string] {
  const at = message.indexOf(span);
  if (at === -1) return [message, ""];
  return [message.slice(0, at), message.slice(at + span.length)];
}

function normalize(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?…,;:]+$/u, "")
    .trim()
    .toLowerCase();
}

/**
 * Accept the exact corrected sentence, or — partial credit for rephrasing —
 * any answer that contains the correction and no longer contains the wrong
 * span. Casing, spacing and final punctuation are never what we are drilling.
 */
export function isCorrect(
  answer: string,
  drill: Pick<Drill, "expected" | "span" | "correction">,
): boolean {
  const given = normalize(answer);
  if (!given) return false;
  if (given === normalize(drill.expected)) return true;
  const correction = normalize(drill.correction);
  const wrong = normalize(drill.span);
  if (!correction) return false;
  return given.includes(correction) && (!wrong || !given.includes(wrong));
}
