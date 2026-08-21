"use client";

import { useEffect, useMemo, useState } from "react";
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

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
      <Kicker index="04" label="Progress" />
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
          <Kicker label="Mistake activity" />
          <p className="text-muted mt-2 text-[11px]">
            Mistakes logged on each of the last {ACTIVITY_DAYS} days.
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            {activity.map((day, i) => (
              <span
                key={day.start}
                title={`${day.label}: ${day.count} ${
                  day.count === 1 ? "mistake" : "mistakes"
                }`}
                className={`animate-cell-in h-6 flex-1 ${
                  INTENSITY[intensityStep(day.count)]
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <Kicker label="Mistakes by type" />
        <div className="mt-3 space-y-2.5">
          {ERROR_TYPES.map((type, i) => (
            <div key={type} className="flex items-center gap-3">
              <span className="text-muted w-28 shrink-0 text-xs font-medium">
                {TYPE_LABELS[type].label}
              </span>
              <div className="bg-ink/10 h-2.5 flex-1 overflow-hidden">
                <div
                  className="grow-bar bg-gold h-full"
                  style={{
                    width: grown ? `${(counts[type] / max) * 100}%` : "0%",
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              <span className="font-display text-muted w-6 shrink-0 text-right text-xs font-semibold tabular-nums">
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
          <div className="mt-3 space-y-2">
            {recent.map((r, i) => (
              <div
                key={`${r.ts}-${i}`}
                className="border-line border-l-danger bg-surface rounded-sm border-2 border-l-[3px] px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-danger line-through">{r.span}</span>
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                  <span className="text-success font-semibold">
                    {r.correction}
                  </span>
                  <TypeChip type={r.type} />
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
    // The card of the day: a surface panel behind a gold rule, which is the
    // same "this is the active thing" signal the tab bar and the lesson chip
    // use.
    <section className="border-line border-l-gold bg-surface rounded-sm border-2 border-l-[3px] px-4 py-4">
      <div className="flex items-center gap-2.5">
        <LogoMark className="h-9 w-9 text-sm" />
        <div>
          <p className="kicker text-muted">Practice today</p>
          <h2 className="font-display mt-0.5 text-sm font-bold">
            {focus
              ? `Your focus today: ${TYPE_LABELS[focus.type].label}`
              : "Your focus is coming soon"}
          </h2>
        </div>
      </div>

      {focus ? (
        <>
          <p className="text-ink mt-3 text-sm">
            <strong className="font-display text-xl font-bold">
              {Math.round(focus.share * 100)}%
            </strong>{" "}
            of your recent errors ({focus.count} in total).
          </p>
          <p className="text-muted mt-1.5 text-sm leading-relaxed">
            {TYPE_LABELS[focus.type].tip}
          </p>
          {focus.examples.length > 0 && (
            <ul className="mt-3 space-y-1">
              {focus.examples.map((e, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center gap-1.5 text-xs"
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
        <p className="text-muted mt-3 text-sm leading-relaxed">
          Not enough data yet — after a few conversations your personal focus
          appears here.
        </p>
      )}
    </section>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="pressable border-line bg-surface hover:border-ink/40 rounded-sm border-2 px-3 py-3 text-center">
      <p className="font-display text-xl leading-tight font-bold tabular-nums">
        {value}
      </p>
      <p className="kicker text-muted mt-1 text-[9px]">{label}</p>
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
