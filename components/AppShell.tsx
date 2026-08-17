"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Lesson } from "@/lib/curriculum";
import { startLesson } from "@/lib/lesson-progress";
import { Chat } from "./Chat";
import { LearnTab } from "./LearnTab";
import { LogoMark } from "./LogoMark";
import { PracticeTab } from "./PracticeTab";
import { ProgressTab } from "./ProgressTab";

export type Tab = "learn" | "chat" | "practice" | "progress";

const TABS: { id: Tab; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "chat", label: "Conversation" },
  { id: "practice", label: "Practice" },
  { id: "progress", label: "Progress" },
];

/**
 * The card shell: shared brand header + tab bar, one body per tab.
 *
 * Chat stays MOUNTED when you switch away (hidden with CSS, never unmounted)
 * because an in-flight SSE stream and the conversation itself must survive a
 * tab switch. Learn, Practice and Progress mount lazily on first visit and
 * re-read localStorage on every activation.
 *
 * The active lesson lives here rather than in Chat, because Learn starts it
 * and Chat consumes it.
 */
export function AppShell() {
  const [tab, setTab] = useState<Tab>("chat");
  const [visited, setVisited] = useState<Set<Tab>>(
    () => new Set<Tab>(["chat"]),
  );
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const tablistRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<Tab, HTMLButtonElement>());
  /** Geometry of the amber pill, measured from the active tab button. */
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null,
  );

  // The pill is one absolutely-positioned element that slides between buttons,
  // so its geometry has to be read from the DOM. useLayoutEffect (not useEffect)
  // keeps the very first paint from showing it in the wrong place.
  useLayoutEffect(() => {
    const list = tablistRef.current;
    const measure = () => {
      const button = tabRefs.current.get(tab);
      if (!button) return;
      setPill({ left: button.offsetLeft, width: button.offsetWidth });
    };
    measure();
    if (!list) return;
    // Label widths shift with the sm: breakpoint and with font loading.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [tab]);

  function select(next: Tab) {
    setTab(next);
    setVisited((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
  }

  /** Arm the lesson and drop the learner straight into the conversation. */
  function beginLesson(lesson: Lesson) {
    startLesson(lesson.id);
    setActiveLesson(lesson.id);
    select("chat");
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-stone-200 px-3 py-3 sm:px-4 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 text-xs" />
          <div>
            <h1 className="text-sm font-semibold leading-tight">
              Deutsch-Tutor
            </h1>
            <p className="hidden text-xs leading-tight text-stone-500 sm:block dark:text-gray-400">
              A1 → B2, ein Gespräch nach dem anderen
            </p>
          </div>
        </div>
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Sections"
          className="relative flex items-center gap-0.5 rounded-full bg-stone-100 p-0.5 dark:bg-gray-800"
        >
          <span
            aria-hidden="true"
            className="tab-pill absolute left-0 top-0.5 bottom-0.5 rounded-full bg-amber-400 shadow-sm"
            style={{
              width: pill?.width ?? 0,
              transform: `translateX(${pill?.left ?? 0}px)`,
              opacity: pill ? 1 : 0,
            }}
          />
          {TABS.map(({ id, label }) => {
            const active = id === tab;
            return (
              <button
                key={id}
                ref={(node) => {
                  if (node) tabRefs.current.set(id, node);
                  else tabRefs.current.delete(id);
                }}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={active}
                aria-controls={`panel-${id}`}
                onClick={() => select(id)}
                className={`pressable focus-ring relative z-10 rounded-full px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:text-xs ${
                  active
                    ? "text-amber-950"
                    : "text-stone-600 hover:text-stone-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {visited.has("learn") && (
        <div
          role="tabpanel"
          id="panel-learn"
          aria-labelledby="tab-learn"
          className={
            tab === "learn" ? "flex min-h-0 flex-1 flex-col" : "hidden"
          }
        >
          <LearnTab
            active={tab === "learn"}
            activeLesson={activeLesson}
            onStart={beginLesson}
          />
        </div>
      )}

      <div
        role="tabpanel"
        id="panel-chat"
        aria-labelledby="tab-chat"
        className={tab === "chat" ? "flex min-h-0 flex-1 flex-col" : "hidden"}
      >
        <Chat
          activeLesson={activeLesson}
          onStartLesson={beginLesson}
          onEndLesson={() => setActiveLesson(null)}
        />
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
