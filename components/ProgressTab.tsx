"use client";

import { useMemo } from "react";
import {
  computeFocus,
  countByType,
  ERROR_TYPES,
  TYPE_LABELS,
} from "@/lib/error-log";
import { LogoMark } from "./LogoMark";
import { TypeChip } from "./MessageBubble";
import { useErrorRecords } from "./useErrorRecords";

const WEEK_MS = 7 * 86_400_000;
const RECENT_COUNT = 8;

/** Dashboard over the local error log: today's focus, stats, trends, history. */
export function ProgressTab({ active }: { active: boolean }) {
  const { records, readAt } = useErrorRecords(active);
  const focus = useMemo(() => computeFocus(records, readAt), [records, readAt]);
  const counts = useMemo(() => countByType(records), [records]);

  const thisWeek = records.filter((r) => readAt - r.ts < WEEK_MS).length;
  const max = Math.max(1, ...ERROR_TYPES.map((t) => counts[t]));
  const top = ERROR_TYPES.reduce((a, b) => (counts[b] > counts[a] ? b : a));
  const recent = [...records].reverse().slice(0, RECENT_COUNT);

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
      <FocusCard focus={focus} />

      <div className="grid grid-cols-3 gap-2">
        <Tile label="Total mistakes" value={String(records.length)} />
        <Tile label="This week" value={String(thisWeek)} />
        <Tile
          label="Most common type"
          value={records.length ? TYPE_LABELS[top].label : "—"}
        />
      </div>

      <section>
        <h2 className="text-sm font-semibold">Mistakes by type</h2>
        <div className="mt-3 space-y-2.5">
          {ERROR_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs text-stone-600 dark:text-gray-300">
                {TYPE_LABELS[type].label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-amber-400 dark:bg-amber-500"
                  style={{ width: `${(counts[type] / max) * 100}%` }}
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
                  <span aria-hidden="true" className="text-stone-400 dark:text-gray-500">
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
    <section className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 dark:border-amber-500/40 dark:bg-amber-500/10">
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
                <li key={i} className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-red-700 line-through dark:text-red-300">
                    {e.span}
                  </span>
                  <span aria-hidden="true" className="text-stone-500 dark:text-gray-400">
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
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 px-3 py-2.5 text-center dark:border-gray-800">
      <p className="text-base font-semibold leading-tight">{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-stone-500 dark:text-gray-400">
        {label}
      </p>
    </div>
  );
}
