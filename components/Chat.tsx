"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/llm/provider";
import type { CorrectionError } from "@/lib/corrector";
import { CEFR_LEVELS, isCefrLevel, type CefrLevel } from "@/lib/tutor-prompt";
import { appendErrorLog } from "@/lib/error-log";
import { lessonsForLevel, type Lesson } from "@/lib/curriculum";
import { getFocusEntry, type FocusEntry } from "@/lib/focus";
import {
  COMPLETE_TURNS,
  readLessonProgress,
  recordLessonTurn,
} from "@/lib/lesson-progress";
import { CheckMark } from "./CheckMark";
import { LEVEL_CHIP, LEVEL_CHIP_ON } from "./levelStyles";
import { LogoMark } from "./LogoMark";
import { MessageBubble, TypeChip } from "./MessageBubble";
import { useDialog } from "./useDialog";

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

  // A curriculum lesson or a grammar rule — the chip renders both, and only
  // the label differs.
  const focus = activeLesson ? getFocusEntry(activeLesson) : undefined;

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
    // `min-h-0 flex-1`, not `h-full`: the tab panel is an auto-height flex item,
    // so a percentage height here would resolve to auto and let the message
    // list push the composer off the bottom of the viewport.
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className="border-line flex flex-wrap items-center justify-between gap-2 border-b-2 px-4 py-2">
        <div
          role="group"
          aria-label="My level"
          className="flex items-center gap-1.5"
        >
          {CEFR_LEVELS.map((l) => {
            const active = l === level;
            return (
              <button
                key={l}
                type="button"
                aria-pressed={active}
                onClick={() => changeLevel(l)}
                className={`pressable focus-ring px-2.5 py-1 text-xs ${
                  active
                    ? LEVEL_CHIP_ON
                    : `${LEVEL_CHIP} hover:border-ink hover:bg-gold/15`
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
            className="pressable focus-ring font-display border-line text-muted hover:border-ink hover:text-ink flex items-center gap-1.5 rounded-sm border-2 px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase"
          >
            Mistakes
            {/* Keying on the count remounts the span, which is what restarts
                the bounce every time a new mistake is logged. */}
            <span
              key={allErrors.length}
              className="animate-badge-bounce bg-danger/15 text-danger inline-block rounded-sm px-1.5 py-px text-[10px] font-bold"
            >
              {allErrors.length}
            </span>
          </button>
        )}
      </div>

      {/* Empty, the welcome block sits in the middle of the free space rather
          than hugging the top; once there are messages the column goes back to
          normal top-down flow. */}
      <div
        className={`min-h-0 flex-1 overflow-y-auto px-4 py-6 ${
          messages.length === 0 ? "flex flex-col" : "space-y-5"
        }`}
      >
        {messages.length === 0 && (
          <div className="my-auto flex flex-col items-center gap-4 text-center">
            <LogoMark className="h-14 w-14 text-lg" />
            <h2 className="font-display text-lg font-bold tracking-tight">
              Hello! Let&apos;s speak German.
            </h2>
            <p className="text-muted max-w-md text-sm leading-relaxed">
              {level === "A1"
                ? "Complete beginner? No problem — write in English or German. The tutor answers in very simple German and translates new words for you."
                : `Write something in German — the tutor adapts to your level (${level}) and helps you reach the next one.`}
            </p>
            {!focus && !everCompleted && onStartLesson && (
              <button
                type="button"
                onClick={startFirstLesson}
                className="btn-hard btn-hard-primary focus-ring max-w-full px-5 py-2.5"
              >
                {/* Two deliberate lines rather than one long one: a 30-character
                    lesson title wraps unpredictably at 375px when it is glued
                    to the verb. */}
                <span className="block text-sm leading-snug">
                  Start Lesson 1
                </span>
                <span className="mt-0.5 block text-xs leading-snug font-medium text-balance opacity-90">
                  {lessonsForLevel(level)[0].title}
                </span>
              </button>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {focus?.starter && (
                <button
                  type="button"
                  onClick={() => applySuggestion(focus.starter as string)}
                  className="pressable focus-ring border-gold bg-gold/20 text-ink rounded-sm border-2 px-3 py-2 text-xs font-medium"
                >
                  {focus.starter}
                </button>
              )}
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="pressable focus-ring border-line bg-surface text-muted hover:border-ink hover:text-ink rounded-sm border-2 px-3 py-2 text-xs font-medium"
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
        {error && <p className="text-danger text-center text-sm">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {focus && (
        <FocusChip
          focus={focus}
          turns={lessonTurns}
          celebrating={celebrating}
          onEnd={() => onEndLesson?.()}
        />
      )}

      <form
        className="border-line flex items-center gap-2 border-t-2 px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          ref={inputRef}
          className="field flex-1 px-4 py-3 text-[15px]"
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
          className="btn-hard btn-hard-primary focus-ring flex h-12 w-12 shrink-0 items-center justify-center"
        >
          {busy ? (
            <span className="animate-button-spin h-4 w-4 border-2 border-current border-t-transparent opacity-80" />
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
 * The "you are inside a lesson or a grammar rule" bar. Completion turns it
 * green for a few seconds but never ends the focus — the learner may well keep
 * talking, and yanking the focus prompt mid-conversation would be the wrong
 * reward.
 */
function FocusChip({
  focus,
  turns,
  celebrating,
  onEnd,
}: {
  focus: FocusEntry;
  turns: number;
  celebrating: boolean;
  onEnd: () => void;
}) {
  const grammar = focus.kind === "grammar";
  return (
    <div
      className={`animate-message-in border-line text-ink flex items-center gap-2 border-t-2 border-l-[3px] px-4 py-2.5 text-xs ${
        celebrating ? "border-l-gold bg-gold/20" : "border-l-gold bg-surface"
      }`}
    >
      {celebrating ? (
        <CheckMark className="h-5 w-5" tone="gold" />
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
      <span className="font-display min-w-0 flex-1 truncate font-semibold">
        {celebrating
          ? grammar
            ? "Rule practised!"
            : "Lesson complete!"
          : `${grammar ? "Rule" : "Lesson"}: ${focus.title}`}
      </span>
      <span className="font-display text-muted shrink-0 font-semibold tabular-nums">
        {Math.min(turns, COMPLETE_TURNS)}/{COMPLETE_TURNS}
      </span>
      <button
        type="button"
        onClick={onEnd}
        aria-label={grammar ? "End rule practice" : "End lesson"}
        title={grammar ? "End rule practice" : "End lesson"}
        className="pressable focus-ring text-muted hover:bg-ink hover:text-on-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-sm"
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
  const { containerRef, closeRef } = useDialog<HTMLElement>(onClose);
  const titleId = "mistakes-panel-title";

  return (
    <>
      {/* The backdrop is a click target, not a tab stop: the dialog's own close
          button and Escape are the keyboard routes out. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 z-20 cursor-default bg-[rgba(22,20,15,0.35)] dark:bg-[rgba(0,0,0,0.6)]"
      />
      <aside
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-message-in border-line bg-surface shadow-hard-lg absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l-2 sm:w-80"
      >
        <div className="border-line flex items-center justify-between border-b-2 px-4 py-3">
          <h2 id={titleId} className="kicker text-ink">
            Your mistakes
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close the mistake list"
            className="pressable focus-ring text-muted hover:bg-ink hover:text-on-ink flex h-8 w-8 items-center justify-center rounded-sm"
          >
            ×
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {errors.length === 0 ? (
            <p className="text-muted text-sm">No mistakes yet — keep it up!</p>
          ) : (
            errors.map((e, i) => (
              <div
                key={i}
                className="border-line border-l-danger rounded-sm border-2 border-l-[3px] px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-danger line-through">{e.span}</span>
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                  <span className="text-success font-semibold">
                    {e.correction}
                  </span>
                  <TypeChip type={e.type} />
                </div>
                <p className="text-muted mt-1 text-xs leading-relaxed">
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

/** The waiting tutor turn: the same gold rule and byline as a real reply, with
 *  three squares stepping where the sentence will be. */
function TypingIndicator() {
  return (
    <div className="animate-message-in border-gold w-full border-l-[3px] pl-3">
      <span className="kicker text-muted mb-1 block">Tutor</span>
      <div
        className="flex items-center gap-1.5 py-1"
        role="status"
        aria-label="The tutor is typing…"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-typing-square bg-muted h-2 w-2"
            style={{ animationDelay: `${i * 175}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
