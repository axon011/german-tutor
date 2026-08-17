"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TYPE_LABELS, type ErrorRecord } from "@/lib/error-log";
import { CheckMark } from "./CheckMark";
import { LogoMark } from "./LogoMark";
import { TypeChip } from "./MessageBubble";
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
        <LogoMark className="h-12 w-12 text-base" />
        <h2 className="text-base font-semibold">Nothing to practice yet</h2>
        <p className="max-w-sm text-sm text-stone-500 dark:text-gray-400">
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
        <p className="text-xs text-stone-500 dark:text-gray-400">
          Exercise {index + 1} of {queue.length} · {score} correct
        </p>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-gray-800">
          <div
            className="grow-bar-fast h-full rounded-full bg-amber-400 dark:bg-amber-500"
            style={{ width: `${(index / queue.length) * 100}%` }}
          />
        </div>

        <div key={`${round}-${index}`} className="animate-slide-in">
          <div className="mt-5 rounded-2xl border border-stone-200 px-4 py-4 dark:border-gray-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-stone-500 dark:text-gray-400">
                Your sentence
              </span>
              <TypeChip type={drill.type} />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
              {before}
              <span className="underline decoration-red-400 decoration-wavy decoration-2 underline-offset-4">
                {drill.span}
              </span>
              {after}
            </p>
          </div>

          <label
            htmlFor="drill-input"
            className="mt-5 block text-sm font-medium"
          >
            Rewrite the sentence correctly:
          </label>
          <form
            className={`mt-2 flex items-center gap-2 ${
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
              className={`flex-1 rounded-full border bg-white/70 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-300/50 disabled:opacity-60 dark:bg-gray-900/60 dark:placeholder:text-gray-500 dark:focus:border-amber-500 dark:focus:ring-amber-500/30 ${
                shakeAt
                  ? "border-red-400 ring-2 ring-red-300/60 dark:border-red-500 dark:ring-red-500/40"
                  : "border-stone-300 dark:border-gray-700"
              }`}
              placeholder="The corrected sentence…"
            />
            <button
              type="submit"
              disabled={status !== "revealed" && !answer.trim()}
              className="pressable focus-ring shrink-0 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 px-4 py-2.5 text-sm font-medium text-amber-950 hover:opacity-90 disabled:opacity-40"
            >
              {status === "revealed" ? "Next" : "Check"}
            </button>
          </form>

          <div aria-live="polite" className="mt-4">
            {status === "correct" && (
              <div className="flex items-start gap-2.5 rounded-xl border border-green-300 bg-green-50 px-3 py-2.5 text-sm dark:border-green-500/40 dark:bg-green-500/10">
                <CheckMark className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Correct!
                  </p>
                  <p className="mt-1 text-green-900 dark:text-green-100">
                    {drill.expected}
                  </p>
                </div>
              </div>
            )}
            {status === "wrong" && (
              <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                Not quite — look at the highlighted error.
              </p>
            )}
            {status === "revealed" && (
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs font-medium text-stone-500 dark:text-gray-400">
                  Solution
                </p>
                <p className="mt-1 leading-relaxed">{drill.expected}</p>
                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-red-700 line-through dark:text-red-300">
                    {drill.span}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-stone-400 dark:text-gray-500"
                  >
                    →
                  </span>
                  <span className="font-medium text-green-700 dark:text-green-300">
                    {drill.correction}
                  </span>
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-gray-400">
                  {drill.explanation || TYPE_LABELS[drill.type].tip}
                </p>
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
      {good ? (
        <CheckMark className="h-14 w-14" />
      ) : (
        <LogoMark className="h-12 w-12 text-base" />
      )}
      <h2 className="text-base font-semibold">Session complete</h2>
      <p className="text-sm text-stone-600 dark:text-gray-300">
        <span className="tabular-nums">{shown}</span> of {total} correct.{" "}
        {score === total
          ? "Perfect — all of it stuck!"
          : "Repetition helps: give it another go."}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="pressable focus-ring rounded-full bg-gradient-to-br from-amber-300 to-amber-500 px-4 py-2 text-sm font-medium text-amber-950 hover:opacity-90"
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
