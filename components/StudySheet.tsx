"use client";

import type { ReactNode } from "react";
import type { GrammarTopic } from "@/lib/grammar";
import { useDialog } from "./useDialog";

/**
 * The bottom-sheet chrome shared by the Grammar rule sheet and the Learn
 * lesson sheet: a sheet that rises over its tab and owns its own scroll. It
 * stays inside the app card rather than the viewport, so the brand header and
 * tab bar remain visible behind it. The parent tab must be `relative`.
 */
export function SheetFrame({
  titleId,
  header,
  footer,
  onClose,
  closeLabel,
  children,
}: {
  titleId: string;
  header: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}) {
  const { containerRef, closeRef } = useDialog(onClose);

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
          <div className="min-w-0 flex-1">{header}</div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
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
          {children}
        </div>

        {footer}
      </div>
    </div>
  );
}

/**
 * German example text with its rule-carrying words highlighted in the hue of
 * the rule's category. The content module marks them with «guillemets»; the
 * odd indices of the split are the marked chunks.
 */
export function MarkedGerman({
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

export function RuleTable({
  table,
}: {
  table: NonNullable<GrammarTopic["table"]>;
}) {
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
              <tr key={r} className="border-line border-t-2">
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
