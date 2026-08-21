"use client";

import { useEffect, useRef, useState } from "react";
import {
  CATEGORY_META,
  GRAMMAR_CATEGORIES,
  GRAMMAR_TOPICS,
  type GrammarCategory,
  type GrammarTopic,
} from "@/lib/grammar";
import { isCompleted, type LessonProgress } from "@/lib/lesson-progress";
import { CEFR_LEVELS, isCefrLevel, type CefrLevel } from "@/lib/tutor-prompt";
import { CheckMark } from "./CheckMark";
import { Kicker } from "./Kicker";
import { LEVEL_CHIP, LEVEL_CHIP_ON } from "./levelStyles";
import { useDialog } from "./useDialog";
import { useLessonProgress } from "./useLessonProgress";

type LevelFilter = "All" | CefrLevel;
type CategoryFilter = "All" | GrammarCategory;

const LEVEL_FILTERS: LevelFilter[] = ["All", ...CEFR_LEVELS];
const CATEGORY_FILTERS: CategoryFilter[] = ["All", ...GRAMMAR_CATEGORIES];

/**
 * The rulebook: a browsable A1 → B2 grammar reference, laid out as a deck of
 * cards rather than a list. Each card leads with a glyph — the shortest piece
 * of German that IS the rule — so the grid is scannable without reading.
 *
 * Like the Learn tab it never talks to the model itself; a rule hands itself
 * to the tutor as a focused conversation, which is what "Practice in chat"
 * does.
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
  const [level, setLevel] = useState<LevelFilter>("All");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [query, setQuery] = useState("");
  /** The rule whose detail sheet is open, if any. */
  const [openId, setOpenId] = useState<string | null>(null);

  // Open on the learner's own level the first time the tab is visited, then
  // leave the filter alone — after that it is the learner's choice, not ours.
  const seeded = useRef(false);
  useEffect(() => {
    if (!active || seeded.current) return;
    seeded.current = true;
    const saved = localStorage.getItem("cefr-level");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isCefrLevel(saved)) setLevel(saved);
  }, [active]);

  const needle = query.trim().toLowerCase();
  // GRAMMAR_TOPICS is already ordered A1 → B2, so the grid is one pool and the
  // level chip on each card carries what the old section headings did.
  const topics = GRAMMAR_TOPICS.filter(
    (t) =>
      (level === "All" || t.level === level) &&
      (category === "All" || t.category === category) &&
      (!needle ||
        t.title.toLowerCase().includes(needle) ||
        t.summary.toLowerCase().includes(needle) ||
        t.glyph.toLowerCase().includes(needle)),
  );

  const open = openId
    ? GRAMMAR_TOPICS.find((t) => t.id === openId)
    : undefined;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="border-line flex flex-wrap items-center gap-2 border-b-2 px-4 py-2">
        <div
          role="group"
          aria-label="Filter by level"
          className="flex items-center gap-1.5"
        >
          {LEVEL_FILTERS.map((f) => {
            const on = f === level;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setLevel(f)}
                className={`pressable focus-ring px-2.5 py-1 text-xs ${
                  on
                    ? LEVEL_CHIP_ON
                    : `${LEVEL_CHIP} hover:border-ink hover:bg-gold/15`
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
          className="field min-w-0 flex-1 px-3.5 py-2 text-xs"
        />
        <div
          role="group"
          aria-label="Filter by category"
          className="flex w-full flex-wrap items-center gap-1.5"
        >
          {CATEGORY_FILTERS.map((c) => {
            const on = c === category;
            const meta = c === "All" ? null : CATEGORY_META[c];
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCategory(c)}
                className={`pressable focus-ring font-display flex items-center gap-1.5 rounded-sm border-2 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase ${
                  on
                    ? "border-ink bg-gold text-gold-ink"
                    : "border-line text-muted hover:border-ink hover:text-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 ${meta ? meta.dot : "bg-muted"}`}
                />
                {meta ? meta.label : "All"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <header>
          <Kicker index="05" label="Grammar" />
          <h2 className="font-display mt-2.5 text-base font-bold tracking-tight">
            Grammar rulebook
          </h2>
          <p className="text-muted mt-1 text-xs leading-relaxed">
            {GRAMMAR_TOPICS.length} rules from A1 to B2, explained in English
            with German examples. Open a rule to read it, or practise it in a
            real conversation.
          </p>
        </header>

        {topics.length === 0 ? (
          <p className="text-muted pt-10 text-center text-sm">
            {needle ? (
              <>
                No rule matches “{query.trim()}”. Try a shorter word, or a
                German term like “Perfekt” or “Dativ”.
              </>
            ) : (
              <>No rule matches this level and category.</>
            )}
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {topics.map((topic, i) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                progress={progress}
                isActive={topic.id === activeFocus}
                delayIndex={i}
                onOpen={() => setOpenId(topic.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {open && (
        <DetailSheet
          topic={open}
          done={isCompleted(progress[open.id])}
          onClose={() => setOpenId(null)}
          onPractice={onPractice}
        />
      )}
    </div>
  );
}

function TopicCard({
  topic,
  progress,
  isActive,
  delayIndex,
  onOpen,
}: {
  topic: GrammarTopic;
  progress: LessonProgress;
  isActive: boolean;
  delayIndex: number;
  onOpen: () => void;
}) {
  const meta = CATEGORY_META[topic.category];
  const done = isCompleted(progress[topic.id]);

  return (
    <li
      className="animate-message-in"
      style={{ animationDelay: `${Math.min(delayIndex, 14) * 25}ms` }}
    >
      <button
        type="button"
        onClick={onOpen}
        className={`pressable focus-ring flex h-full w-full flex-col gap-3 rounded-sm border-2 p-3 text-left ${meta.card} ${
          isActive ? "ring-gold ring-2" : "hover:border-ink/40"
        }`}
      >
        <span className="flex w-full items-start justify-between gap-2">
          <span
            className={`font-display min-w-0 text-xl leading-tight font-bold break-words sm:text-2xl ${meta.accent}`}
          >
            {topic.glyph}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {done && <CheckMark className="h-4 w-4" tone="gold" />}
            <span className={`${LEVEL_CHIP} px-1.5 py-px text-[10px]`}>
              {topic.level}
            </span>
          </span>
        </span>
        <span className="mt-auto block min-w-0">
          <span className="font-display block text-sm leading-snug font-bold">
            {topic.title}
          </span>
          <span className="text-muted mt-0.5 line-clamp-2 block text-xs leading-relaxed">
            {topic.summary}
          </span>
        </span>
      </button>
    </li>
  );
}

/**
 * The rule itself, as a sheet that rises over the grid and owns its own
 * scroll. It stays inside the app card rather than the viewport, so the brand
 * header and tab bar remain visible behind it.
 */
function DetailSheet({
  topic,
  done,
  onClose,
  onPractice,
}: {
  topic: GrammarTopic;
  done: boolean;
  onClose: () => void;
  onPractice: (topicId: string) => void;
}) {
  const meta = CATEGORY_META[topic.category];
  const { containerRef, closeRef } = useDialog(onClose);
  const titleId = `${topic.id}-sheet-title`;

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end">
      {/* Click target only — Escape and the close button are the keyboard
          routes out, and the trap keeps Tab inside the sheet. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="animate-message-in absolute inset-0 cursor-default bg-[rgba(22,20,15,0.4)] dark:bg-[rgba(0,0,0,0.6)]"
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-sheet-up border-line bg-surface relative flex max-h-[94%] min-h-0 flex-col rounded-t-sm border-t-2"
      >
        <div className="border-line flex shrink-0 items-start gap-3 border-b-2 px-4 pt-4 pb-3">
          <div className="min-w-0 flex-1">
            <p
              className={`font-display text-2xl leading-tight font-bold break-words ${meta.accent}`}
            >
              {topic.glyph}
            </p>
            <h3
              id={titleId}
              className="font-display mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-bold tracking-tight"
            >
              {topic.title}
              {done && <CheckMark className="h-4 w-4" tone="gold" />}
            </h3>
            <p className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={`${LEVEL_CHIP} px-2 py-px text-[10px]`}>
                {topic.level}
              </span>
              <span
                className={`font-display rounded-sm px-2 py-px text-[10px] font-semibold tracking-[0.08em] uppercase ${meta.chip}`}
              >
                {meta.label}
              </span>
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close rule"
            className="pressable focus-ring text-muted hover:bg-ink hover:text-on-ink -mt-1 -mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M6 6 18 18M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="max-w-prose space-y-2">
            {topic.explanation.map((paragraph, i) => (
              <p
                key={i}
                className="text-muted text-[13px] leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <ul className="space-y-2">
            {topic.examples.map((ex, i) => (
              <li
                key={i}
                className="border-line bg-background rounded-sm border-2 px-3 py-2"
              >
                <p className="text-[15px] leading-relaxed">
                  <MarkedGerman text={ex.de} markClass={meta.mark} />
                </p>
                <p className="text-muted mt-0.5 text-[11px] leading-relaxed">
                  {ex.en}
                </p>
              </li>
            ))}
          </ul>

          {topic.table && <RuleTable table={topic.table} />}
        </div>

        {topic.focus && (
          <div className="border-line flex shrink-0 flex-wrap items-center gap-2 border-t-2 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                onPractice(topic.id);
                onClose();
              }}
              className="btn-hard btn-hard-primary focus-ring px-4 py-2 text-xs uppercase"
            >
              Practice in chat
            </button>
            <span className="text-muted text-[11px]">
              The tutor steers the conversation to this rule.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * German example text with its rule-carrying words highlighted in the hue of
 * the rule's category. The content module marks them with «guillemets»; the
 * odd indices of the split are the marked chunks.
 */
function MarkedGerman({
  text,
  markClass,
}: {
  text: string;
  markClass: string;
}) {
  return (
    <>
      {text.split(/«([^»]*)»/g).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className={`rounded-sm px-1 font-medium ${markClass}`}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function RuleTable({ table }: { table: NonNullable<GrammarTopic["table"]> }) {
  return (
    <figure className="space-y-1.5">
      <figcaption className="kicker text-muted">{table.caption}</figcaption>
      <div className="border-line overflow-x-auto rounded-sm border-2">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-background">
              {table.headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="font-display text-muted px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase"
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
                className="border-line border-t-2"
              >
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={`px-2.5 py-1.5 align-top ${
                      c === 0
                        ? "font-display text-muted font-semibold whitespace-nowrap"
                        : "text-ink"
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
