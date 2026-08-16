"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/llm/provider";
import { CEFR_LEVELS, isCefrLevel, type CefrLevel } from "@/lib/tutor-prompt";
import { MessageBubble } from "./MessageBubble";

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<CefrLevel>("B1");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cefr-level");
    if (isCefrLevel(saved)) setLevel(saved);
  }, []);

  function changeLevel(next: CefrLevel) {
    setLevel(next);
    localStorage.setItem("cefr-level", next);
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

  return (
    <div className="flex h-full w-full max-w-2xl flex-col">
      <div className="flex items-center justify-end gap-2 px-4 pt-2">
        <label htmlFor="level" className="text-xs text-gray-500">
          Mein Niveau
        </label>
        <select
          id="level"
          value={level}
          onChange={(e) => changeLevel(e.target.value as CefrLevel)}
          className="rounded-md border border-gray-300 bg-transparent px-2 py-1 text-xs dark:border-gray-700"
        >
          {CEFR_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <p className="pt-16 text-center text-sm text-gray-400">
            Schreib etwas auf Deutsch — der Tutor passt sich deinem Niveau
            ({level}) an und hilft dir, das nächste zu erreichen.
          </p>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>
      <form
        className="flex gap-2 border-t border-gray-200 p-4 dark:border-gray-800"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          className="flex-1 rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Schreib auf Deutsch…"
          maxLength={4000}
          autoFocus
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? "…" : "Senden"}
        </button>
      </form>
    </div>
  );
}
