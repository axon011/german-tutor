"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { startLesson } from "@/lib/lesson-progress";
import { Chat } from "./Chat";
import { GrammarTab } from "./GrammarTab";
import { LearnTab } from "./LearnTab";
import { LogoMark } from "./LogoMark";
import { PracticeTab } from "./PracticeTab";
import { ProgressTab } from "./ProgressTab";

export type Tab = "learn" | "chat" | "practice" | "progress" | "grammar";

/** Stroke-only line icons, sized by the caller. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<Tab, ReactNode> = {
  // Graduation cap.
  learn: (
    <Icon>
      <path d="M12 4 2.5 8.5 12 13l9.5-4.5z" />
      <path d="M6 10.6v4.6c0 1.5 2.7 2.8 6 2.8s6-1.3 6-2.8v-4.6" />
      <path d="M21.5 8.5v5" />
    </Icon>
  ),
  // Chat bubble.
  chat: (
    <Icon>
      <path d="M20.5 11.5a7.5 7.5 0 0 1-10.9 6.7L4 19.5l1.4-4.4A7.5 7.5 0 1 1 20.5 11.5z" />
    </Icon>
  ),
  // Target.
  practice: (
    <Icon>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </Icon>
  ),
  // Bar chart.
  progress: (
    <Icon>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8.5 20v-6" />
      <path d="M13 20V8" />
      <path d="M17.5 20v-9" />
    </Icon>
  ),
  // Open book.
  grammar: (
    <Icon>
      <path d="M12 6.5C10.5 5 8.4 4.4 4 4.5v13c4.4-.1 6.5.5 8 2 1.5-1.5 3.6-2.1 8-2v-13c-4.4-.1-6.5.5-8 2z" />
      <path d="M12 6.5v12" />
    </Icon>
  ),
};

// Five labels have to survive a 375px viewport without the row wrapping, which
// is why the conversation tab is called "Chat" here.
const TABS: { id: Tab; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "chat", label: "Chat" },
  { id: "practice", label: "Practice" },
  { id: "progress", label: "Progress" },
  { id: "grammar", label: "Grammar" },
];

/** Every tab panel is a centred column that owns the remaining height. */
const PANEL = "relative mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col";

/**
 * The app shell: brand header, one body per tab, and navigation that changes
 * shape with the viewport — a bottom tab bar on phones, a pill row in the
 * header from `sm` up.
 *
 * Chat stays MOUNTED when you switch away (hidden with CSS, never unmounted)
 * because an in-flight SSE stream and the conversation itself must survive a
 * tab switch. Learn, Practice and Progress mount lazily on first visit and
 * re-read localStorage on every activation.
 *
 * The active focus — a curriculum lesson or a grammar rule — lives here rather
 * than in Chat, because Learn and Grammar start it and Chat consumes it.
 */
export function AppShell() {
  const [tab, setTab] = useState<Tab>("chat");
  const [visited, setVisited] = useState<Set<Tab>>(
    () => new Set<Tab>(["chat"]),
  );
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const tablistRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<Tab, HTMLButtonElement>());
  /** Geometry of the emerald pill, measured from the active tab button. */
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
    // The row is display:none below sm, so widths also have to be re-read when
    // the breakpoint is crossed — not only when a font finishes loading.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [tab]);

  function select(next: Tab) {
    setTab(next);
    setVisited((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
  }

  /**
   * Arm a lesson or a grammar rule and drop the learner straight into the
   * conversation. Both kinds share the same id space and progress map, so the
   * Grammar tab reuses this untouched.
   */
  function beginFocus(id: string) {
    startLesson(id);
    setActiveLesson(id);
    select("chat");
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b-2 border-stone-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9 text-sm" />
            <div>
              <h1 className="text-base font-bold leading-tight tracking-tight">
                Deutsch-Tutor
              </h1>
              <p className="hidden text-xs leading-tight text-stone-500 sm:block dark:text-zinc-400">
                A1 → B2, ein Gespräch nach dem anderen
              </p>
            </div>
          </div>

          {/* Wide viewports keep the sliding-pill row; phones get the bottom
              bar below instead. */}
          <div
            ref={tablistRef}
            role="tablist"
            aria-label="Sections"
            className="relative hidden items-center gap-0.5 rounded-full bg-stone-100 p-1 sm:flex dark:bg-zinc-800"
          >
            <span
              aria-hidden="true"
              className="tab-pill absolute left-0 top-1 bottom-1 rounded-full bg-emerald-700 shadow-sm dark:bg-emerald-500"
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
                  className={`pressable focus-ring relative z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                    active
                      ? "text-white dark:text-emerald-950"
                      : "text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {visited.has("learn") && (
        <div
          role="tabpanel"
          id="panel-learn"
          aria-labelledby="tab-learn"
          className={tab === "learn" ? PANEL : "hidden"}
        >
          <LearnTab
            active={tab === "learn"}
            activeLesson={activeLesson}
            onStart={(lesson) => beginFocus(lesson.id)}
          />
        </div>
      )}

      <div
        role="tabpanel"
        id="panel-chat"
        aria-labelledby="tab-chat"
        className={tab === "chat" ? PANEL : "hidden"}
      >
        <Chat
          activeLesson={activeLesson}
          onStartLesson={(lesson) => beginFocus(lesson.id)}
          onEndLesson={() => setActiveLesson(null)}
        />
      </div>

      {visited.has("practice") && (
        <div
          role="tabpanel"
          id="panel-practice"
          aria-labelledby="tab-practice"
          className={tab === "practice" ? PANEL : "hidden"}
        >
          <PracticeTab active={tab === "practice"} />
        </div>
      )}

      {visited.has("progress") && (
        <div
          role="tabpanel"
          id="panel-progress"
          aria-labelledby="tab-progress"
          className={tab === "progress" ? PANEL : "hidden"}
        >
          <ProgressTab active={tab === "progress"} />
        </div>
      )}

      {visited.has("grammar") && (
        <div
          role="tabpanel"
          id="panel-grammar"
          aria-labelledby="tab-grammar"
          className={tab === "grammar" ? PANEL : "hidden"}
        >
          <GrammarTab
            active={tab === "grammar"}
            activeFocus={activeLesson}
            onPractice={beginFocus}
          />
        </div>
      )}

      {/* Phone navigation. It is the last flex item of a full-height column
          rather than `position: fixed`, which gets the same anchored-to-the-
          bottom result without the content ever sliding underneath it. */}
      <nav
        aria-label="Sections"
        className="shrink-0 border-t-2 border-stone-200 bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] sm:hidden dark:border-zinc-800 dark:bg-[var(--background)]"
      >
        <div className="mx-auto flex w-full max-w-2xl items-stretch">
          {TABS.map(({ id, label }) => {
            const active = id === tab;
            return (
              <button
                key={id}
                type="button"
                aria-current={active ? "page" : undefined}
                aria-controls={`panel-${id}`}
                onClick={() => select(id)}
                className={`focus-ring relative flex flex-1 flex-col items-center gap-0.5 px-1 pt-2.5 pb-2 text-[10px] font-semibold transition-colors ${
                  active
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-stone-500 dark:text-zinc-400"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-0 h-1 w-8 rounded-b-full transition-opacity ${
                    active
                      ? "bg-emerald-600 opacity-100 dark:bg-emerald-400"
                      : "opacity-0"
                  }`}
                />
                {ICONS[id]}
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
