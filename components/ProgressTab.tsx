"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeFocus,
  countByType,
  ERROR_TYPES,
  TYPE_LABELS,
  type ErrorRecord,
} from "@/lib/error-log";
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

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
      <FocusCard focus={focus} />

      <div className="grid grid-cols-3 gap-2">
        <CountTile
          label="Total mistakes"
          value={records.length}
          active={active}
        />
        <CountTile label="This week" value={thisWeek} active={active} />
        <Tile
          label="Most common type"
          value={records.length ? TYPE_LABELS[top].label : "—"}
        />
      </div>

      {activity.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold">Mistake activity</h2>
          <p className="mt-0.5 text-[11px] text-stone-500 dark:text-gray-400">
            Mistakes logged on each of the last {ACTIVITY_DAYS} days.
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            {activity.map((day, i) => (
              <span
                key={day.start}
                title={`${day.label}: ${day.count} ${
                  day.count === 1 ? "mistake" : "mistakes"
                }`}
                className={`animate-cell-in h-5 flex-1 rounded-[4px] ${
                  INTENSITY[intensityStep(day.count)]
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold">Mistakes by type</h2>
        <div className="mt-3 space-y-2.5">
          {ERROR_TYPES.map((type, i) => (
            <div key={type} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs text-stone-600 dark:text-gray-300">
                {TYPE_LABELS[type].label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-gray-800">
                <div
                  className="grow-bar h-full rounded-full bg-amber-400 dark:bg-amber-500"
                  style={{
                    width: grown ? `${(counts[type] / max) * 100}%` : "0%",
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs tabular-nums text-stone-500 dark:text-gray-400">
                {counts[type]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Recent mistakes</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500 dark:text-gray-400">
            No mistakes recorded yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {recent.map((r, i) => (
              <div
                key={`${r.ts}-${i}`}
                className="rounded-xl border border-stone-200 px-3 py-2 dark:border-gray-800"
              >
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-red-700 line-through dark:text-red-300">
                    {r.span}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-stone-400 dark:text-gray-500"
                  >
                    →
                  </span>
                  <span className="font-medium text-green-700 dark:text-green-300">
                    {r.correction}
                  </span>
                  <TypeChip type={r.type} />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-gray-400">
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
    // The 1px gradient wrapper IS the border — a plain border can't animate a
    // travelling highlight. Purely decorative, so it stops under reduced motion.
    <div className="shimmer-border rounded-2xl p-px">
      {/* Opaque in both themes: a translucent fill would let the panning
        gradient wash the whole card instead of just its edge. */}
      <section className="rounded-[15px] bg-amber-50 px-4 py-4 dark:bg-[#1a1611]">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 text-xs" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
              Practice today
            </p>
            <h2 className="text-sm font-semibold">
              {focus
                ? `Your focus today: ${TYPE_LABELS[focus.type].label}`
                : "Your focus is coming soon"}
            </h2>
          </div>
        </div>

        {focus ? (
          <>
            <p className="mt-3 text-sm text-stone-700 dark:text-gray-200">
              <strong className="font-semibold">
                {Math.round(focus.share * 100)}%
              </strong>{" "}
              of your recent errors ({focus.count} in total).
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-700 dark:text-gray-200">
              {TYPE_LABELS[focus.type].tip}
            </p>
            {focus.examples.length > 0 && (
              <ul className="mt-3 space-y-1">
                {focus.examples.map((e, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-center gap-1.5 text-xs"
                  >
                    <span className="text-red-700 line-through dark:text-red-300">
                      {e.span}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-stone-500 dark:text-gray-400"
                    >
                      →
                    </span>
                    <span className="font-medium text-green-700 dark:text-green-300">
                      {e.correction}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-gray-200">
            Not enough data yet — after a few conversations your personal focus
            appears here.
          </p>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 px-3 py-2.5 text-center dark:border-gray-800">
      <p className="text-base font-semibold leading-tight tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] leading-tight text-stone-500 dark:text-gray-400">
        {label}
      </p>
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
  return <Tile label={label} value={String(shown)} />;
}

/** Muted track, then three amber steps. Dark variants stay legible on #0b0b0d. */
const INTENSITY = [
  "bg-stone-200 dark:bg-gray-800",
  "bg-amber-200 dark:bg-amber-900",
  "bg-amber-400 dark:bg-amber-600",
  "bg-amber-600 dark:bg-amber-400",
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
