"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  computeFocus,
  countByType,
  ERROR_TYPES,
  TYPE_LABELS,
  type ErrorRecord,
} from "@/lib/error-log";
import { Kicker } from "./Kicker";
import { LogoMark } from "./LogoMark";
import { TypeChip } from "./MessageBubble";
import { useCountUp } from "./useCountUp";
import { useErrorRecords } from "./useErrorRecords";

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const RECENT_COUNT = 8;
const ACTIVITY_DAYS = 14;

/** Dashboard over the local error log: today's focus, stats, trends, history. */
export function ProgressTab({ active }: { active: boolean }) {
  const { records, readAt } = useErrorRecords(active);
  const focus = useMemo(() => computeFocus(records, readAt), [records, readAt]);
  const counts = useMemo(() => countByType(records), [records]);

  const thisWeek = records.filter((r) => readAt - r.ts < WEEK_MS).length;
  const max = Math.max(1, ...ERROR_TYPES.map((t) => counts[t]));
  const top = ERROR_TYPES.reduce((a, b) => (counts[b] > counts[a] ? b : a));
  const recent = [...records].reverse().slice(0, RECENT_COUNT);
  const activity = useMemo(
    () => buildActivity(records, readAt),
    [records, readAt],
  );

  // Bars start at width 0 and grow once the tab is on screen, so the shape of
  // the data reads as something that was just measured.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGrown(false);
      return;
    }
    const t = setTimeout(() => setGrown(true), 30);
    return () => clearTimeout(t);
  }, [active]);

  // Only once the log has actually been read: before that the ledger renders
  // with zeros, so the bars are mounted at width 0 and still get to grow.
  if (readAt && records.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <LogoMark className="h-14 w-14 text-lg" />
        <Kicker
          index="04"
          label="Progress"
          className="flex flex-col items-center"
        />
        <h2 className="font-display text-lg font-bold tracking-tight">
          Nothing measured yet
        </h2>
        <p className="text-muted max-w-sm text-sm leading-relaxed">
          Have a conversation first — every mistake the tutor catches is logged
          here, and your focus for the day is built from them.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
      <Kicker index="04" label="Progress" />
      <FocusCard focus={focus} />

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <CountTile
          label="Total mistakes"
          value={records.length}
          active={active}
        />
        <CountTile label="This week" value={thisWeek} active={active} />
        <Tile label="Most common type">
          {/* A word, not a numeral: set smaller so "Vocabulary" still fits a
              third of a 375px screen, but in the same face as the counts. */}
          <span className="font-display block text-sm leading-tight font-bold [overflow-wrap:anywhere] sm:text-lg">
            {records.length ? TYPE_LABELS[top].label : "—"}
          </span>
        </Tile>
      </div>

      {activity.length > 0 && (
        <section>
          <Kicker label="Mistake activity" />
          <p className="text-muted mt-2 text-xs">
            Mistakes logged on each of the last {ACTIVITY_DAYS} days.
          </p>
          {/* Capped so the cells stay small squares on a wide panel. */}
          <div className="mt-3 max-w-md">
            <div className="flex items-center gap-1.5">
              {activity.map((day, i) => (
                <span
                  key={day.start}
                  title={`${day.label}: ${day.count} ${
                    day.count === 1 ? "mistake" : "mistakes"
                  }`}
                  className={`animate-cell-in aspect-square flex-1 rounded-sm ${
                    INTENSITY[intensityStep(day.count)]
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="kicker text-muted mt-1.5 flex justify-between text-[9px]"
            >
              <span>{activity[0].label}</span>
              <span>Today</span>
            </div>
          </div>
        </section>
      )}

      <section>
        <Kicker label="Mistakes by type" />
        <div className="mt-4 space-y-3">
          {ERROR_TYPES.map((type, i) => (
            <div key={type} className="flex items-center gap-3">
              <span className="kicker text-muted w-24 shrink-0 text-[10px]">
                {TYPE_LABELS[type].label}
              </span>
              <div className="bg-ink/10 h-3 flex-1 overflow-hidden">
                <div
                  className="grow-bar bg-gold h-full"
                  style={{
                    width: grown ? `${(counts[type] / max) * 100}%` : "0%",
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              <span className="font-display text-ink w-7 shrink-0 text-right text-sm font-bold tabular-nums">
                {counts[type]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Kicker label="Recent mistakes" />
        {recent.length === 0 ? (
          <p className="text-muted mt-3 text-sm">No mistakes recorded yet.</p>
        ) : (
          // A ledger, not a stack of cards: one ruled line per entry.
          <div className="mt-2">
            {recent.map((r, i) => (
              <div key={`${r.ts}-${i}`} className="border-line border-b py-3">
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="text-danger line-through">{r.span}</span>
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                  <span className="text-success font-semibold">
                    {r.correction}
                  </span>
                  <span className="ml-auto">
                    <TypeChip type={r.type} />
                  </span>
                </div>
                <p className="text-muted mt-1 text-xs leading-relaxed">
                  {r.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FocusCard({ focus }: { focus: ReturnType<typeof computeFocus> }) {
  return (
    // The hero plate: a surface panel behind a gold rule, the same "this is the
    // active thing" signal the tab bar and the lesson bar use.
    <section className="border-ink/15 border-l-gold bg-surface rounded-sm border-2 border-l-[3px] px-5 py-5">
      <p className="kicker text-muted">Practice today</p>

      {focus ? (
        <>
          <div className="mt-2.5 flex items-end justify-between gap-4">
            <h2 className="font-display min-w-0 text-3xl leading-none font-bold tracking-tight sm:text-4xl">
              {TYPE_LABELS[focus.type].label}
            </h2>
            <p className="shrink-0 text-right">
              <span className="font-display block text-4xl leading-none font-bold tabular-nums">
                {Math.round(focus.share * 100)}%
              </span>
              <span className="kicker text-muted mt-1 block text-[9px]">
                Of recent errors
              </span>
            </p>
          </div>
          <p className="text-muted mt-2 text-xs">
            {focus.count} logged in total.
          </p>
          <p className="text-ink mt-4 text-sm leading-relaxed">
            {TYPE_LABELS[focus.type].tip}
          </p>
          {focus.examples.length > 0 && (
            <ul className="border-line mt-4 space-y-1.5 border-t pt-3">
              {focus.examples.map((e, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center gap-1.5 text-sm"
                >
                  <span className="text-danger line-through">{e.span}</span>
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                  <span className="text-success font-semibold">
                    {e.correction}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <h2 className="font-display text-muted mt-2.5 text-2xl leading-tight font-bold tracking-tight">
            Your focus is coming soon
          </h2>
          <p className="text-muted mt-3 text-sm leading-relaxed">
            Not enough data yet — after a few conversations your personal focus
            appears here.
          </p>
        </>
      )}
    </section>
  );
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pressable border-line bg-surface hover:border-ink/40 flex flex-col rounded-sm border-2 px-2 py-3.5 text-center sm:px-3">
      <div className="flex min-h-9 flex-1 items-center justify-center">
        {children}
      </div>
      <p className="kicker text-muted mt-1.5 text-[9px]">{label}</p>
    </div>
  );
}

function CountTile({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  const shown = useCountUp(value, active);
  return (
    <Tile label={label}>
      <span className="font-display block text-3xl leading-none font-bold tabular-nums sm:text-4xl">
        {shown}
      </span>
    </Tile>
  );
}

/** An ink track, then three steps of gold — square cells, no rounding. */
const INTENSITY = [
  "bg-ink/10",
  "bg-gold/30",
  "bg-gold/60",
  "bg-gold",
];

function intensityStep(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

interface ActivityDay {
  /** Local midnight, used as the React key. */
  start: number;
  /** e.g. "Mon 12" — the tooltip's date half. */
  label: string;
  count: number;
}

/**
 * One cell per day for the last {@link ACTIVITY_DAYS} days, oldest first.
 *
 * This counts mistakes *logged*, not time studied — a quiet day and a flawless
 * day look identical here, and the heading says so. Returns [] before the log
 * has been read (readAt 0), so nothing renders with a bogus clock.
 */
function buildActivity(records: ErrorRecord[], readAt: number): ActivityDay[] {
  if (!readAt) return [];

  const counts = new Map<number, number>();
  for (const r of records) {
    const day = startOfDay(r.ts);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const today = startOfDay(readAt);
  const days: ActivityDay[] = [];
  for (let i = ACTIVITY_DAYS - 1; i >= 0; i--) {
    // Rebuild from a Date so DST shifts don't drift the boundary.
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const start = date.getTime();
    days.push({
      start,
      label: date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
      }),
      count: counts.get(start) ?? 0,
    });
  }
  return days;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
