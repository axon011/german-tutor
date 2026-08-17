"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/llm/provider";
import type { CorrectionError } from "@/lib/corrector";
import { CEFR_LEVELS, isCefrLevel, type CefrLevel } from "@/lib/tutor-prompt";
import { appendErrorLog } from "@/lib/error-log";
import { getLesson, lessonsForLevel, type Lesson } from "@/lib/curriculum";
import {
  COMPLETE_TURNS,
  readLessonProgress,
  recordLessonTurn,
} from "@/lib/lesson-progress";
import { CheckMark } from "./CheckMark";
import { LogoMark } from "./LogoMark";
import { MessageBubble, TypeChip } from "./MessageBubble";

const SUGGESTIONS = [
  "Ich möchte über mein Wochenende sprechen",
  "Stell mir Fragen über Hobbys",
  "Lass uns über Essen reden",
];

/** How long the chip stays in its green "complete" state. */
const CELEBRATE_MS = 4000;

export function Chat({
  activeLesson = null,
  onStartLesson,
  onEndLesson,
}: {
  activeLesson?: string | null;
  onStartLesson?: (lesson: Lesson) => void;
  onEndLesson?: () => void;
} = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<CefrLevel>("B1");
  /** Corrections keyed by the user message's index in `messages`. */
  const [corrections, setCorrections] = useState<
    Record<number, CorrectionError[]>
  >({});
  const [panelOpen, setPanelOpen] = useState(false);
  /** User turns already spent on the active lesson — the chip's "3/6". */
  const [lessonTurns, setLessonTurns] = useState(0);
  /** True for a few seconds right after the active lesson hits its target. */
  const [celebrating, setCelebrating] = useState(false);
  /** Has the learner ever finished a lesson? Gates the new-user CTA. */
  const [everCompleted, setEverCompleted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lesson = activeLesson ? getLesson(activeLesson) : undefined;

  useEffect(() => {
    const saved = localStorage.getItem("cefr-level");
    // One-time mount sync from an external store (localStorage) — the
    // cascading-render concern doesn't apply and SSR forbids an initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isCefrLevel(saved)) setLevel(saved);
  }, []);

  // Adopt the stored turn count when a lesson is armed, so "Continue" picks up
  // where the learner left off instead of restarting the counter at 0.
  useEffect(() => {
    const progress = readLessonProgress();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEverCompleted(Object.values(progress).some((e) => e.completedAt));
    setCelebrating(false);
    setLessonTurns(activeLesson ? (progress[activeLesson]?.turns ?? 0) : 0);
  }, [activeLesson]);

  useEffect(() => {
    if (!celebrating) return;
    const t = setTimeout(() => setCelebrating(false), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [celebrating]);

  function changeLevel(next: CefrLevel) {
    setLevel(next);
    localStorage.setItem("cefr-level", next);
    // A lesson is level-specific; rather than silently mismatching the prompt
    // to the new level, end it.
    if (activeLesson) onEndLesson?.();
  }

  /** Empty-state CTA: first lesson of the level the learner has not finished. */
  function startFirstLesson() {
    const progress = readLessonProgress();
    const lessons = lessonsForLevel(level);
    const next = lessons.find((l) => !progress[l.id]?.completedAt) ?? lessons[0];
    onStartLesson?.(next);
  }

  function applySuggestion(text: string) {
    setInput(text);
    inputRef.current?.focus();
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content || busy) return;
    setInput("");
    setError(null);
    setBusy(true);

    // Count the turn as soon as it is sent — lesson progress measures effort
    // spoken, not whether the tutor's reply arrived.
    if (activeLesson) {
      const entry = recordLessonTurn(activeLesson);
      if (entry) {
        setLessonTurns(entry.turns);
        if (entry.turns === COMPLETE_TURNS) {
          setCelebrating(true);
          setEverCompleted(true);
        }
      }
    }

    const history = [...messages, { role: "user" as const, content }];
    // Placeholder assistant message; streamed chunks are appended to it.
    setMessages([...history, { role: "assistant", content: "" }]);

    // Corrector agent: fire-and-forget, deliberately NOT awaited. The tutor's
    // reply must start streaming immediately; corrections annotate the message
    // a second or two later, and a corrector failure is a non-event.
    const userIndex = history.length - 1;
    fetch("/api/correct", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: content, level }),
    })
      .then((res) => res.json())
      .then(({ errors }: { errors?: CorrectionError[] }) => {
        if (!errors?.length) return;
        setCorrections((prev) => ({ ...prev, [userIndex]: errors }));
        appendErrorLog(errors, content, level);
      })
      .catch(() => {});

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: history,
          level,
          ...(activeLesson ? { lessonId: activeLesson } : {}),
        }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffered = "";
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffered += decoder.decode(value, { stream: true });
        const events = buffered.split("\n\n");
        buffered = events.pop() ?? "";
        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          const data = event.slice(6);
          if (data === "[DONE]") continue;
          const parsed = JSON.parse(data);
          if (parsed.error) throw new Error(parsed.error);
          reply += parsed.text ?? "";
          setMessages([...history, { role: "assistant", content: reply }]);
        }
      }
      if (!reply) throw new Error("Empty response from the tutor.");
    } catch (err) {
      setMessages(history); // drop the empty/partial assistant bubble
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setBusy(false);
    }
  }

  const allErrors = Object.keys(corrections)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((i) => corrections[i]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 px-3 py-2 sm:px-4 dark:border-gray-800">
        <div
          role="group"
          aria-label="My level"
          className="flex items-center gap-0.5 rounded-full bg-stone-100 p-0.5 dark:bg-gray-800"
        >
          {CEFR_LEVELS.map((l) => {
            const active = l === level;
            return (
              <button
                key={l}
                type="button"
                aria-pressed={active}
                onClick={() => changeLevel(l)}
                className={`pressable focus-ring rounded-full px-2.5 py-1 text-xs font-medium ${
                  active
                    ? "bg-amber-400 text-amber-950 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>
        {allErrors.length > 0 && (
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            className="pressable focus-ring flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 hover:border-amber-400 hover:text-stone-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-amber-500 dark:hover:text-gray-50"
          >
            Mistakes
            {/* Keying on the count remounts the span, which is what restarts
                the bounce every time a new mistake is logged. */}
            <span
              key={allErrors.length}
              className="animate-badge-bounce inline-block rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-500/20 dark:text-red-300"
            >
              {allErrors.length}
            </span>
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 pt-10 text-center">
            <LogoMark className="h-12 w-12 text-base" />
            <h2 className="text-base font-semibold">
              Hello! Let&apos;s speak German.
            </h2>
            <p className="max-w-md text-sm text-stone-500 dark:text-gray-400">
              {level === "A1"
                ? "Complete beginner? No problem — write in English or German. The tutor answers in very simple German and translates new words for you."
                : `Write something in German — the tutor adapts to your level (${level}) and helps you reach the next one.`}
            </p>
            {!lesson && !everCompleted && onStartLesson && (
              <button
                type="button"
                onClick={startFirstLesson}
                className="pressable focus-ring rounded-full bg-gradient-to-br from-amber-300 to-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 shadow-sm hover:opacity-90"
              >
                Start Lesson 1: {lessonsForLevel(level)[0].title}
              </button>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {lesson?.starter && (
                <button
                  type="button"
                  onClick={() => applySuggestion(lesson.starter as string)}
                  className="pressable focus-ring rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 hover:shadow-sm dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-200"
                >
                  {lesson.starter}
                </button>
              )}
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="pressable focus-ring rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-600 hover:border-amber-400 hover:text-stone-900 hover:shadow-sm dark:border-gray-700 dark:text-gray-300 dark:hover:border-amber-500 dark:hover:text-gray-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "assistant" && m.content === "" ? (
            <TypingIndicator key={i} />
          ) : (
            <MessageBubble key={i} message={m} corrections={corrections[i]} />
          ),
        )}
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {lesson && (
        <LessonChip
          lesson={lesson}
          turns={lessonTurns}
          celebrating={celebrating}
          onEnd={() => onEndLesson?.()}
        />
      )}

      <form
        className="flex items-center gap-2 border-t border-stone-200 px-4 py-3 dark:border-gray-800"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          ref={inputRef}
          className="flex-1 rounded-full border border-stone-300 bg-white/70 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-300/50 dark:border-gray-700 dark:bg-gray-900/60 dark:placeholder:text-gray-500 dark:focus:border-amber-500 dark:focus:ring-amber-500/30"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write in German…"
          maxLength={4000}
          autoFocus
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="pressable focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 hover:opacity-90 disabled:opacity-40"
        >
          {busy ? (
            <span className="animate-button-spin h-4 w-4 rounded-full border-2 border-amber-950/30 border-t-amber-950" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10.1 15.6 12 3.4 13.9z" />
            </svg>
          )}
        </button>
      </form>

      {panelOpen && (
        <ErrorPanel errors={allErrors} onClose={() => setPanelOpen(false)} />
      )}
    </div>
  );
}

/**
 * The "you are inside a lesson" bar. Completion turns it green for a few
 * seconds but never ends the lesson — the learner may well keep talking, and
 * yanking the focus prompt mid-conversation would be the wrong reward.
 */
function LessonChip({
  lesson,
  turns,
  celebrating,
  onEnd,
}: {
  lesson: Lesson;
  turns: number;
  celebrating: boolean;
  onEnd: () => void;
}) {
  return (
    <div
      className={`animate-message-in flex items-center gap-2 border-t px-4 py-2 text-xs ${
        celebrating
          ? "border-green-300 bg-green-50 text-green-900 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-200"
          : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
      }`}
    >
      {celebrating ? (
        <CheckMark className="h-5 w-5" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        >
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5z" />
          <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5z" />
        </svg>
      )}
      <span className="min-w-0 flex-1 truncate font-medium">
        {celebrating ? "Lesson complete!" : `Lesson: ${lesson.title}`}
      </span>
      <span className="shrink-0 tabular-nums opacity-80">
        {Math.min(turns, COMPLETE_TURNS)}/{COMPLETE_TURNS}
      </span>
      <button
        type="button"
        onClick={onEnd}
        aria-label="End lesson"
        title="End lesson"
        className="pressable focus-ring flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"
      >
        ×
      </button>
    </div>
  );
}

function ErrorPanel({
  errors,
  onClose,
}: {
  errors: CorrectionError[];
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close the mistake list"
        onClick={onClose}
        className="absolute inset-0 z-20 cursor-default bg-stone-900/20 dark:bg-black/40"
      />
      <aside
        aria-label="Your mistakes"
        className="animate-message-in absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l border-stone-200 bg-white shadow-xl sm:w-80 dark:border-gray-800 dark:bg-gray-950"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-gray-800">
          <h2 className="text-sm font-semibold">Your mistakes</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="pressable focus-ring flex h-7 w-7 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            ×
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {errors.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-gray-400">
              No mistakes yet — keep it up!
            </p>
          ) : (
            errors.map((e, i) => (
              <div
                key={i}
                className="rounded-xl border border-stone-200 px-3 py-2 dark:border-gray-800"
              >
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-red-700 line-through dark:text-red-300">
                    {e.span}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-stone-400 dark:text-gray-500"
                  >
                    →
                  </span>
                  <span className="font-medium text-green-700 dark:text-green-300">
                    {e.correction}
                  </span>
                  <TypeChip type={e.type} />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-gray-400">
                  {e.explanation}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

function TypingIndicator() {
  return (
    <div className="animate-message-in flex items-end gap-2">
      <LogoMark className="h-7 w-7 text-[10px]" />
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-stone-100 px-4 py-3 dark:bg-gray-800"
        role="status"
        aria-label="The tutor is typing…"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-stone-400 dark:bg-gray-500"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
