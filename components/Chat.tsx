"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/llm/provider";
import type { CorrectionError } from "@/lib/corrector";
import { CEFR_LEVELS, isCefrLevel, type CefrLevel } from "@/lib/tutor-prompt";
import { LogoMark } from "./LogoMark";
import { MessageBubble, TypeChip } from "./MessageBubble";

const SUGGESTIONS = [
  "Ich möchte über mein Wochenende sprechen",
  "Stell mir Fragen über Hobbys",
  "Lass uns über Essen reden",
];

export function Chat() {
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cefr-level");
    // One-time mount sync from an external store (localStorage) — the
    // cascading-render concern doesn't apply and SSR forbids an initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isCefrLevel(saved)) setLevel(saved);
  }, []);

  function changeLevel(next: CefrLevel) {
    setLevel(next);
    localStorage.setItem("cefr-level", next);
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
        body: JSON.stringify({ messages: history, level }),
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
      if (!reply) throw new Error("Leere Antwort vom Tutor.");
    } catch (err) {
      setMessages(history); // drop the empty/partial assistant bubble
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
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
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 text-xs" />
          <div>
            <h1 className="text-sm font-semibold leading-tight">Deutsch-Tutor</h1>
            <p className="text-xs leading-tight text-stone-500 dark:text-gray-400">
              A1 → B2, ein Gespräch nach dem anderen
            </p>
          </div>
        </div>
        {allErrors.length > 0 && (
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            className="order-last flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-amber-400 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:order-none dark:border-gray-700 dark:text-gray-300 dark:hover:border-amber-500 dark:hover:text-gray-50"
          >
            Fehler
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-500/20 dark:text-red-300">
              {allErrors.length}
            </span>
          </button>
        )}
        <div
          role="group"
          aria-label="Mein Niveau"
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
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
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
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 pt-10 text-center">
            <LogoMark className="h-12 w-12 text-base" />
            <h2 className="text-base font-semibold">
              Hallo! Lass uns Deutsch sprechen.
            </h2>
            <p className="max-w-md text-sm text-stone-500 dark:text-gray-400">
              {level === "A1"
                ? "Complete beginner? No problem — write in English or German. The tutor answers in very simple German and translates new words for you."
                : `Schreib etwas auf Deutsch — der Tutor passt sich deinem Niveau (${level}) an und hilft dir, das nächste zu erreichen.`}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-600 transition-colors hover:border-amber-400 hover:text-stone-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-amber-500 dark:hover:text-gray-50"
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
          placeholder="Schreib auf Deutsch…"
          maxLength={4000}
          autoFocus
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Senden"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
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
        aria-label="Fehlerliste schließen"
        onClick={onClose}
        className="absolute inset-0 z-20 cursor-default bg-stone-900/20 dark:bg-black/40"
      />
      <aside
        aria-label="Deine Fehler"
        className="animate-message-in absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l border-stone-200 bg-white shadow-xl sm:w-80 dark:border-gray-800 dark:bg-gray-950"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-gray-800">
          <h2 className="text-sm font-semibold">Deine Fehler</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            ×
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {errors.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-gray-400">
              Noch keine Fehler — weiter so!
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

/**
 * Append this turn's corrections to the local error log. This is the data feed
 * a future recommender / SRS deck reads, so the shape stays flat and boring:
 * one row per error, newest last, capped so localStorage can't grow unbounded.
 */
function appendErrorLog(
  errors: CorrectionError[],
  message: string,
  level: CefrLevel,
) {
  try {
    const ts = Date.now();
    const existing = JSON.parse(localStorage.getItem("error-log") ?? "[]");
    const log = Array.isArray(existing) ? existing : [];
    for (const e of errors) {
      log.push({
        ts,
        level,
        message,
        span: e.span,
        type: e.type,
        correction: e.correction,
        explanation: e.explanation,
      });
    }
    localStorage.setItem("error-log", JSON.stringify(log.slice(-500)));
  } catch {
    // Private mode / quota exceeded — the log is a nice-to-have.
  }
}

function TypingIndicator() {
  return (
    <div className="animate-message-in flex items-end gap-2">
      <LogoMark className="h-7 w-7 text-[10px]" />
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-stone-100 px-4 py-3 dark:bg-gray-800"
        role="status"
        aria-label="Der Tutor schreibt…"
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
