"use client";

import { useCallback, useEffect, useState } from "react";
import { getLesson, lessonsForLevel } from "@/lib/curriculum";
import { getLessonContent, type VocabItem } from "@/lib/lessons";
import { COMPLETE_TURNS } from "@/lib/lesson-progress";
import { fetchToday, localDay, postCheck } from "@/lib/path/client";
import type { TodayState } from "@/lib/path/types";
import { CheckMark } from "./CheckMark";
import { Kicker } from "./Kicker";
import { LessonSheet } from "./LessonSheet";
import { ListeningDrill } from "./ListeningDrill";
import { WordReview } from "./WordReview";

/**
 * The learning path's daily session (beta): review due words, study the next
 * lesson, speak about it. Everything shown comes from one TodayState fetched
 * from the server, so the tab holds no progress of its own — it refetches on
 * activation and after every action instead.
 *
 * The word drill replaces the card list inline (rather than opening a sheet)
 * because it is a full-screen task with its own end screen.
 */
export function TodayTab({
  active,
  onStart,
  onOpenPractice,
}: {
  active: boolean;
  onStart: (lessonId: string) => void;
  onOpenPractice: () => void;
}) {
  const [state, setState] = useState<TodayState | null>(null);
  const [error, setError] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  /** Words for an open listening drill; null when it is closed. */
  const [listenWords, setListenWords] = useState<VocabItem[] | null>(null);

  const load = useCallback(() => {
    setError(false);
    fetchToday(localDay())
      .then(setState)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (active) load();
  }, [active, load]);

  const nextId = state?.nextLessonId ?? null;
  const lesson = nextId ? getLesson(nextId) : undefined;
  const pathState = nextId && state ? state.lessons[nextId] : undefined;

  const reviewDone =
    !!state &&
    state.dueWords === 0 &&
    (state.today.reviews > 0 || state.dueMistakes === 0);
  const learnDone = !!state && state.today.checks > 0;
  const speakDone = !!state && state.today.turns >= COMPLETE_TURNS;
  const allDone =
    !!state && reviewDone && (nextId === null || (learnDone && speakDone));

  /**
   * Words from lessons the learner has actually studied (a quick check was
   * taken); the drill shuffles and caps them itself.
   */
  function studiedWords(): VocabItem[] {
    if (!state) return [];
    return Object.entries(state.lessons)
      .filter(([, l]) => l.checkBest !== null)
      .flatMap(([id]) => getLessonContent(id)?.vocab ?? []);
  }
  const canListen =
    !!state && Object.values(state.lessons).some((l) => l.checkBest !== null);

  if (listenWords) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <ListeningDrill
            words={listenWords}
            title="Listening drill"
            onDone={() => setListenWords(null)}
          />
        </div>
      </div>
    );
  }

  if (reviewing) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <WordReview
          onDone={() => {
            setReviewing(false);
            load();
          }}
        />
      </div>
    );
  }

  return (
    // `relative` anchors the study sheet to this tab, like LearnTab.
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        <header>
          <Kicker index="00" label="Today" />
          <h2 className="font-display mt-2.5 text-base font-bold tracking-tight">
            Your daily session
          </h2>
          {state && (
            <>
              <p className="text-muted mt-1 text-xs leading-relaxed">
                {state.position && lesson
                  ? `${state.position.level} · lesson ${state.position.index} of ${state.position.total} — ${lesson.title}`
                  : "Every lesson mastered"}
              </p>
              <p className="mt-3 flex flex-wrap gap-2">
                {[
                  `${state.streak}-day streak`,
                  `${state.wordsLearned} words learned`,
                ].map((chip) => (
                  <span
                    key={chip}
                    className="font-display border-line rounded-sm border-2 px-2 py-1 text-xs font-semibold tabular-nums"
                  >
                    {chip}
                  </span>
                ))}
              </p>
            </>
          )}
        </header>

        {!state && !error && (
          <p className="text-muted text-sm">Loading today’s session…</p>
        )}
        {error && (
          <div className="flex items-center gap-3">
            <p className="text-muted text-sm">Couldn’t load today’s session.</p>
            <button
              type="button"
              onClick={load}
              className="btn-hard focus-ring px-3 py-1.5 text-xs uppercase"
            >
              Retry
            </button>
          </div>
        )}

        {state && (
          <ol className="space-y-3">
            <StepCard
              n={1}
              title="Review"
              done={reviewDone}
              status={`${state.dueWords} words due · ${state.dueMistakes} mistakes due`}
              delay={0}
            >
              <button
                type="button"
                disabled={state.dueWords === 0}
                onClick={() => setReviewing(true)}
                className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
              >
                Review words
              </button>
              {state.dueMistakes > 0 && (
                <button
                  type="button"
                  onClick={onOpenPractice}
                  className="focus-ring text-muted hover:text-ink font-display text-xs font-semibold underline underline-offset-4"
                >
                  Mistakes →
                </button>
              )}
              {canListen && (
                <button
                  type="button"
                  onClick={() => setListenWords(studiedWords())}
                  className="focus-ring text-muted hover:text-ink font-display text-xs font-semibold underline underline-offset-4"
                >
                  Listening drill
                </button>
              )}
            </StepCard>

            {nextId && lesson ? (
              <>
                <StepCard
                  n={2}
                  title="Learn"
                  done={learnDone}
                  status={`${lesson.title} · ${
                    pathState?.checkBest != null
                      ? `Quick check: best ${pathState.checkBest}/3`
                      : "Not studied yet"
                  }`}
                  delay={1}
                >
                  <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
                  >
                    Open lesson
                  </button>
                </StepCard>
                <StepCard
                  n={3}
                  title="Speak"
                  done={speakDone}
                  status={`${Math.min(state.today.turns, COMPLETE_TURNS)}/${COMPLETE_TURNS} turns today about ${lesson.title}`}
                  delay={2}
                >
                  <button
                    type="button"
                    onClick={() => onStart(nextId)}
                    className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
                  >
                    Start conversation
                  </button>
                </StepCard>
              </>
            ) : (
              <li className="font-display text-sm font-semibold">
                You’ve mastered every lesson from A1 to B2.
              </li>
            )}
          </ol>
        )}

        {allDone && (
          <p className="border-gold font-display animate-message-in border-t-2 pt-3 text-sm font-bold">
            Done for today. Come back tomorrow.
          </p>
        )}

        <p className="text-muted text-[11px] leading-relaxed">
          A lesson counts as mastered after a quick check of 2/3 or better,{" "}
          {COMPLETE_TURNS} conversation turns, and one review of each of its
          words.
        </p>
      </div>

      {sheetOpen && nextId && lesson && (
        <LessonSheet
          lesson={lesson}
          number={lessonsForLevel(lesson.level).indexOf(lesson) + 1}
          done={!!pathState?.mastered}
          onClose={() => setSheetOpen(false)}
          onStart={(l) => onStart(l.id)}
          audio
          onChecked={(c, t) =>
            postCheck(nextId, c, t, localDay())
              .then(setState)
              .catch(() => setError(true))
          }
        />
      )}
    </div>
  );
}

/** One numbered step: numeral, title, status line, then its actions. */
function StepCard({
  n,
  title,
  done,
  status,
  delay,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  status: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <li
      className="bg-surface border-line animate-message-in flex gap-4 rounded-sm border-2 p-4"
      style={{ animationDelay: `${delay * 40}ms` }}
    >
      <span
        aria-hidden="true"
        className={`font-display text-2xl leading-none font-bold tabular-nums ${
          done ? "text-gold" : "text-ink/25"
        }`}
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-sm font-bold tracking-tight">
            {title}
          </h3>
          {done && <CheckMark className="h-5 w-5" tone="gold" />}
        </div>
        <p className="text-muted mt-1 text-xs leading-relaxed">{status}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">{children}</div>
      </div>
    </li>
  );
}
