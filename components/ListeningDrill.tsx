"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { playGerman, stopAudio } from "@/lib/audio/play";
import { ARTICLE, type VocabItem } from "@/lib/lessons";
import { expectedAnswer, gradeWord } from "@/lib/path/grade-word";

const MAX_WORDS = 10;

/** Same colour code as the LessonSheet word grid. */
const ARTICLE_COLOR = {
  m: "text-spot-prussian",
  f: "text-spot-brick",
  n: "text-spot-olive",
} as const;

/** Fisher–Yates on a copy. */
function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Listen & type: the learner hears a word (with its article, as a noun is
 * learned) and types it. Grading is gradeWord, so capitalisation and article
 * count exactly as in the word review. One retry, then the answer is shown.
 *
 * Purely client-side practice: no API calls and no SRS writes. A listening
 * drill is a warm-up on words the learner already met, not a review event.
 */
export function ListeningDrill({
  words,
  onDone,
  title = "Listening drill",
}: {
  words: VocabItem[];
  onDone: () => void;
  title?: string;
}) {
  // Shuffled once on mount (lazy initialiser): a parent re-render that hands
  // in a fresh array must not reshuffle the deck mid-drill.
  const [deck] = useState(() => shuffled(words).slice(0, MAX_WORDS));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [notQuite, setNotQuite] = useState(false);
  const [result, setResult] = useState<{ correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const word = deck[index];

  // Auto-play each word as it appears; silence everything on unmount.
  useEffect(() => {
    if (word) void playGerman(expectedAnswer(word));
  }, [word]);
  useEffect(() => stopAudio, []);

  function decide(correct: boolean) {
    setResult({ correct });
    if (correct) setScore((s) => s + 1);
  }

  function check(e?: FormEvent) {
    e?.preventDefault();
    if (result || !word || !answer.trim()) return;
    if (gradeWord(answer, word)) {
      decide(true);
    } else if (!retrying) {
      setRetrying(true);
      setNotQuite(true);
      setAnswer("");
      void playGerman(expectedAnswer(word));
      inputRef.current?.focus();
    } else {
      decide(false);
    }
  }

  function next() {
    setIndex((i) => i + 1);
    setAnswer("");
    setRetrying(false);
    setNotQuite(false);
    setResult(null);
  }

  if (deck.length === 0) {
    return (
      <div className="space-y-4">
        <p className="kicker text-muted">{title}</p>
        <p className="text-muted text-sm">No words to practise yet.</p>
        <button
          type="button"
          onClick={onDone}
          className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
        >
          Done
        </button>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="space-y-4">
        <p className="kicker text-muted">{title}</p>
        <p className="font-display animate-message-in text-lg font-bold tracking-tight tabular-nums">
          {score} / {deck.length} heard correctly
        </p>
        <button
          type="button"
          autoFocus
          onClick={onDone}
          className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
        >
          Done
        </button>
      </div>
    );
  }

  const target = expectedAnswer(word);

  return (
    <div className="space-y-4">
      <p className="kicker text-muted">
        {title} · Word {index + 1} / {deck.length}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void playGerman(target)}
          className="btn-hard focus-ring px-3 py-1.5 text-xs uppercase"
        >
          Play again
        </button>
        <button
          type="button"
          onClick={() => void playGerman(target, { rate: 0.75 })}
          className="btn-hard focus-ring px-3 py-1.5 text-xs uppercase"
        >
          Slow
        </button>
      </div>

      {result ? (
        <div className="animate-message-in space-y-3">
          <p className="font-display text-lg font-bold tracking-tight">
            {word.gender && (
              <span className={ARTICLE_COLOR[word.gender]}>
                {ARTICLE[word.gender]}{" "}
              </span>
            )}
            {word.de}{" "}
            <span
              aria-hidden="true"
              className={result.correct ? "text-success" : "text-danger"}
            >
              {result.correct ? "✓" : "✗"}
            </span>
          </p>
          <p className="text-muted text-xs">{word.en}</p>
          <button
            type="button"
            autoFocus
            onClick={next}
            className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
          >
            Next
          </button>
        </div>
      ) : (
        <form onSubmit={check} className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            autoFocus
            lang="de"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            aria-label="Type what you hear"
            placeholder="Type what you hear"
            className="focus-ring font-display border-line bg-background w-full rounded-sm border-2 px-3 py-2 text-base"
          />
          {notQuite && (
            <p role="status" className="text-muted text-xs">
              Not quite — listen again
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
            >
              Check
            </button>
            <button
              type="button"
              onClick={() => decide(false)}
              className="focus-ring text-muted hover:text-ink font-display text-xs font-semibold underline underline-offset-4"
            >
              Show answer
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
