"use client";

import { useState } from "react";
import { Chat } from "./Chat";
import { LogoMark } from "./LogoMark";
import { PracticeTab } from "./PracticeTab";
import { ProgressTab } from "./ProgressTab";

export type Tab = "chat" | "practice" | "progress";

const TABS: { id: Tab; label: string }[] = [
  { id: "chat", label: "Conversation" },
  { id: "practice", label: "Practice" },
  { id: "progress", label: "Progress" },
];

/**
 * The card shell: shared brand header + tab bar, one body per tab.
 *
 * Chat stays MOUNTED when you switch away (hidden with CSS, never unmounted)
 * because an in-flight SSE stream and the conversation itself must survive a
 * tab switch. Practice and Progress mount lazily on first visit and re-read
 * localStorage on every activation.
 */
export function AppShell() {
  const [tab, setTab] = useState<Tab>("chat");
  const [visited, setVisited] = useState<Set<Tab>>(() => new Set<Tab>(["chat"]));

  function select(next: Tab) {
    setTab(next);
    setVisited((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-stone-200 px-3 py-3 sm:px-4 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 text-xs" />
          <div>
            <h1 className="text-sm font-semibold leading-tight">Deutsch-Tutor</h1>
            <p className="hidden text-xs leading-tight text-stone-500 sm:block dark:text-gray-400">
              A1 → B2, ein Gespräch nach dem anderen
            </p>
          </div>
        </div>
        <div
          role="tablist"
          aria-label="Sections"
          className="flex items-center gap-0.5 rounded-full bg-stone-100 p-0.5 dark:bg-gray-800"
        >
          {TABS.map(({ id, label }) => {
            const active = id === tab;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={active}
                aria-controls={`panel-${id}`}
                onClick={() => select(id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:px-3 sm:text-xs ${
                  active
                    ? "bg-amber-400 text-amber-950 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      <div
        role="tabpanel"
        id="panel-chat"
        aria-labelledby="tab-chat"
        className={tab === "chat" ? "flex min-h-0 flex-1 flex-col" : "hidden"}
      >
        <Chat />
      </div>

      {visited.has("practice") && (
        <div
          role="tabpanel"
          id="panel-practice"
          aria-labelledby="tab-practice"
          className={
            tab === "practice" ? "flex min-h-0 flex-1 flex-col" : "hidden"
          }
        >
          <PracticeTab active={tab === "practice"} />
        </div>
      )}

      {visited.has("progress") && (
        <div
          role="tabpanel"
          id="panel-progress"
          aria-labelledby="tab-progress"
          className={
            tab === "progress" ? "flex min-h-0 flex-1 flex-col" : "hidden"
          }
        >
          <ProgressTab active={tab === "progress"} />
        </div>
      )}
    </div>
  );
}
