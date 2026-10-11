"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ARTICLE } from "@/lib/lessons";
import { expectedAnswer, gradeWord } from "@/lib/path/grade-word";
import { fetchDueWords, localDay, postWordReview } from "@/lib/path/client";
import type { WordCard, WordReviewQuality } from "@/lib/path/types";
import { Kicker } from "./Kicker";

/** Same colour code as the lesson sheet's word grid. */
const ARTICLE_COLOR = {
  m: "text-spot-prussian",
  f: "text-spot-brick",
  n: "text-spot-olive",
} as const;

/**
 * The word-card drill: the English is the prompt, the learner types the German
 * (nouns with their article). Grading is forgiving about punctuation and
 * strict about capitalisation and articles — see gradeWord.
 *
 * Quality maps straight onto the SM-2 scale the rest of the app uses:
 * right first time 5, right on the one retry 3, shown or missed twice 0.
 * The review is POSTed the moment the result is decided, not on "Next", so
 * closing the tab mid-card never loses an answer.
 */
export function WordReview({ onDone }: { onDone: () => void }) {
  const [cards, setCards] = useState<WordCard[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  /** True after one wrong attempt on the current card. */
  const [retrying, setRetrying] = useState(false);
  /** Set once the card is decided; null while the learner is still answering. */
  const [result, setResult] = useState<{ correct: boolean } | null>(null);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchDueWords(20)
      .then((c) => {
        if (!cancelled) setCards(c);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <div className="flex-1 space-y-3 px-4 py-6">
        <p className="text-muted text-sm">Couldn’t load your words.</p>
        <button
          type="button"
          onClick={onDone}
          className="btn-hard focus-ring px-4 py-2 text-xs uppercase"
        >
          Back to Today
        </button>
      </div>
    );
  }
  if (!cards) {
    return <p className="text-muted px-4 py-6 text-sm">Loading words…</p>;
  }

  const card = cards[index];
  if (!card) {
    return (
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        <Kicker index="00" label="Word review" />
        <p className="font-display animate-message-in text-lg font-bold tracking-tight">
          {cards.length === 0
            ? "All caught up — no words due"
            : `All caught up — ${cards.length} ${cards.length === 1 ? "word" : "words"} reviewed`}
        </p>
        <button
          type="button"
          onClick={onDone}
          className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
        >
          Back to Today
        </button>
      </div>
    );
  }

  function decide(current: WordCard, quality: WordReviewQuality) {
    setResult({ correct: quality !== 0 });
    postWordReview(current.id, quality, localDay()).catch(() =>
      setSaveError(true),
    );
  }

  function check(e?: FormEvent) {
    e?.preventDefault();
    if (result || !answer.trim()) return;
    if (gradeWord(answer, card)) {
      decide(card, retrying ? 3 : 5);
    } else if (retrying) {
      decide(card, 0);
    } else {
      setRetrying(true);
    }
  }

  function next() {
    setIndex((i) => i + 1);
    setAnswer("");
    setRetrying(false);
    setResult(null);
  }

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6">
      <Kicker index="00" label={`Word ${index + 1} / ${cards.length}`} />

      {/* Keyed by card so each new word gets the entrance animation. */}
      <form
        key={card.id}
        onSubmit={check}
        className="animate-message-in space-y-4"
      >
        <div>
          <p className="font-display text-3xl leading-tight font-bold tracking-tight">
            {card.en}
          </p>
          {card.gender && (
            <p className="text-muted mt-1 text-xs">
              noun — type it with der, die or das
            </p>
          )}
        </div>

        {!result && (
          <>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              autoFocus
              lang="de"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Your answer in German"
              maxLength={80}
              className="field w-full px-4 py-3 text-base"
            />
            {retrying && (
              <p role="status" className="text-danger text-xs font-medium">
                Not quite — try once more
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
              >
                Check
              </button>
              <button
                type="button"
                onClick={() => decide(card, 0)}
                className="btn-hard focus-ring px-4 py-2 text-xs uppercase"
              >
                Show answer
              </button>
            </div>
          </>
        )}

        {result && (
          <div className="space-y-3">
            <p
              role="status"
              aria-label={`${result.correct ? "Correct" : "Answer"}: ${expectedAnswer(card)}`}
              className="border-line bg-surface rounded-sm border-2 px-4 py-3 text-lg"
            >
              {card.gender && (
                <span className={`font-medium ${ARTICLE_COLOR[card.gender]}`}>
                  {ARTICLE[card.gender]}{" "}
                </span>
              )}
              {card.de}
              {card.gender && card.plural && (
                <span className="text-muted ml-2 text-xs">
                  pl. {card.plural}
                </span>
              )}
            </p>
            {/* autoFocus lands Enter on "Next" without a window key handler. */}
            <button
              type="button"
              onClick={next}
              autoFocus
              className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
            >
              Next
            </button>
          </div>
        )}
      </form>

      {saveError && (
        <p role="alert" className="text-danger text-xs">
          Couldn’t save a review — check your connection.
        </p>
      )}
    </div>
  );
}
