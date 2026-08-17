"use client";

import { useEffect, useRef, useState } from "react";
import { LEVEL_NAMES } from "@/lib/curriculum";
import {
  GRAMMAR_TOPICS,
  grammarForLevel,
  type GrammarTopic,
} from "@/lib/grammar";
import { isCompleted, type LessonProgress } from "@/lib/lesson-progress";
import { CEFR_LEVELS, isCefrLevel, type CefrLevel } from "@/lib/tutor-prompt";
import { CheckMark } from "./CheckMark";
import { useLessonProgress } from "./useLessonProgress";

type Filter = "All" | CefrLevel;

const FILTERS: Filter[] = ["All", ...CEFR_LEVELS];

/**
 * The rulebook: a browsable A1 → B2 grammar reference. Like the Learn tab it
 * never talks to the model itself — each rule can hand itself to the tutor as
 * a focused conversation, which is what "Practice in chat" does.
 */
export function GrammarTab({
  active,
  activeFocus,
  onPractice,
}: {
  active: boolean;
  activeFocus: string | null;
  onPractice: (topicId: string) => void;
}) {
  const progress = useLessonProgress(active);
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  /** Accordion: at most one card open, so the list stays scannable. */
  const [expanded, setExpanded] = useState<string | null>(null);

  // Open on the learner's own level the first time the tab is visited, then
  // leave the filter alone — after that it is the learner's choice, not ours.
  const seeded = useRef(false);
  useEffect(() => {
    if (!active || seeded.current) return;
    seeded.current = true;
    const saved = localStorage.getItem("cefr-level");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isCefrLevel(saved)) setFilter(saved);
  }, [active]);

  const needle = query.trim().toLowerCase();
  const matches = (t: GrammarTopic) =>
    !needle ||
    t.title.toLowerCase().includes(needle) ||
    t.summary.toLowerCase().includes(needle);

  const sections = CEFR_LEVELS.filter(
    (l) => filter === "All" || filter === l,
  ).map((level) => ({ level, topics: grammarForLevel(level).filter(matches) }));
  const total = sections.reduce((n, s) => n + s.topics.length, 0);

  // One running index across sections so the entrance stagger reads as a
  // single list unrolling.
  let row = 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 px-3 py-2 sm:px-4 dark:border-gray-800">
        <div
          role="group"
          aria-label="Filter by level"
          className="flex items-center gap-0.5 rounded-full bg-stone-100 p-0.5 dark:bg-gray-800"
        >
          {FILTERS.map((f) => {
            const on = f === filter;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f)}
                className={`pressable focus-ring rounded-full px-2.5 py-1 text-xs font-medium ${
                  on
                    ? "bg-amber-400 text-amber-950 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rules…"
          aria-label="Search grammar rules"
          className="min-w-0 flex-1 rounded-full border border-stone-300 bg-white/70 px-3.5 py-1.5 text-xs outline-none transition-colors placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-300/50 dark:border-gray-700 dark:bg-gray-900/60 dark:placeholder:text-gray-500 dark:focus:border-amber-500 dark:focus:ring-amber-500/30"
        />
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
        <header>
          <h2 className="text-sm font-semibold">Grammar rulebook</h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500 dark:text-gray-400">
            {GRAMMAR_TOPICS.length} rules from A1 to B2, explained in English
            with German examples. Open a rule to read it, or practise it in a
            real conversation.
          </p>
        </header>

        {total === 0 ? (
          <p className="pt-6 text-center text-sm text-stone-500 dark:text-gray-400">
            No rule matches “{query.trim()}”. Try a shorter word, or a German
            term like “Perfekt” or “Dativ”.
          </p>
        ) : (
          sections.map(({ level, topics }) =>
            topics.length === 0 ? null : (
              <section key={level}>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-medium text-amber-950 shadow-sm">
                    {level}
                  </span>
                  <h3 className="flex-1 text-sm font-semibold">
                    {LEVEL_NAMES[level]}
                  </h3>
                  <span className="text-xs tabular-nums text-stone-500 dark:text-gray-400">
                    {topics.length}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {topics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      progress={progress}
                      isOpen={expanded === topic.id}
                      isActive={topic.id === activeFocus}
                      delayIndex={row++}
                      onToggle={() =>
                        setExpanded((cur) =>
                          cur === topic.id ? null : topic.id,
                        )
                      }
                      onPractice={onPractice}
                    />
                  ))}
                </ul>
              </section>
            ),
          )
        )}
      </div>
    </div>
  );
}

function TopicCard({
  topic,
  progress,
  isOpen,
  isActive,
  delayIndex,
  onToggle,
  onPractice,
}: {
  topic: GrammarTopic;
  progress: LessonProgress;
  isOpen: boolean;
  isActive: boolean;
  delayIndex: number;
  onToggle: () => void;
  onPractice: (topicId: string) => void;
}) {
  const done = isCompleted(progress[topic.id]);
  const panelId = `${topic.id}-panel`;

  return (
    <li
      className={`animate-message-in overflow-hidden rounded-xl border ${
        isActive || isOpen
          ? "border-amber-400 dark:border-amber-500/60"
          : "border-stone-200 dark:border-gray-800"
      }`}
      style={{ animationDelay: `${Math.min(delayIndex, 12) * 25}ms` }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="pressable focus-ring flex w-full items-start gap-3 px-3 py-2.5 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-medium">{topic.title}</span>
            {done && <CheckMark className="h-4 w-4" />}
          </span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-stone-500 dark:text-gray-400">
            {topic.summary}
          </span>
        </span>
        <Chevron open={isOpen} />
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="animate-message-in space-y-4 border-t border-stone-200 px-3 py-3 dark:border-gray-800"
        >
          <div className="space-y-2">
            {topic.explanation.map((paragraph, i) => (
              <p
                key={i}
                className="text-xs leading-relaxed text-stone-600 dark:text-gray-300"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <ul className="space-y-2">
            {topic.examples.map((ex, i) => (
              <li
                key={i}
                className="rounded-lg bg-stone-50 px-3 py-2 dark:bg-gray-900/60"
              >
                <p className="text-sm leading-relaxed">
                  <MarkedGerman text={ex.de} />
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500 dark:text-gray-400">
                  {ex.en}
                </p>
              </li>
            ))}
          </ul>

          {topic.table && <RuleTable table={topic.table} />}

          {topic.focus && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onPractice(topic.id)}
                className="pressable focus-ring rounded-full bg-gradient-to-br from-amber-300 to-amber-500 px-3.5 py-1.5 text-xs font-semibold text-amber-950 shadow-sm hover:opacity-90"
              >
                Practice in chat
              </button>
              <span className="text-[11px] text-stone-500 dark:text-gray-400">
                The tutor steers the conversation to this rule.
              </span>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * German example text with its rule-carrying words highlighted. The content
 * module marks them with «guillemets»; the odd indices of the split are the
 * marked chunks.
 */
function MarkedGerman({ text }: { text: string }) {
  return (
    <>
      {text.split(/«([^»]*)»/g).map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded bg-amber-200/60 px-1 font-medium text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function RuleTable({
  table,
}: {
  table: NonNullable<GrammarTopic["table"]>;
}) {
  return (
    <figure className="space-y-1.5">
      <figcaption className="text-[11px] font-medium text-stone-500 dark:text-gray-400">
        {table.caption}
      </figcaption>
      <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-gray-800">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-stone-50 dark:bg-gray-900/60">
              {table.headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="whitespace-nowrap px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-stone-500 dark:text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr
                key={r}
                className="border-t border-stone-200 dark:border-gray-800"
              >
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={`px-2.5 py-1.5 align-top ${
                      c === 0
                        ? "whitespace-nowrap font-medium text-stone-500 dark:text-gray-400"
                        : "text-stone-700 dark:text-gray-200"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`mt-0.5 h-4 w-4 shrink-0 text-stone-400 dark:text-gray-500 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
