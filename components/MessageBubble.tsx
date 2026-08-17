"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/llm/provider";
import type { CorrectionError } from "@/lib/corrector";
import { LogoMark } from "./LogoMark";

export function MessageBubble({
  message,
  corrections,
}: {
  message: ChatMessage;
  corrections?: CorrectionError[];
}) {
  const isUser = message.role === "user";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const segments =
    isUser && corrections?.length
      ? annotate(message.content, corrections)
      : null;
  const open = openIndex !== null ? corrections?.[openIndex] : undefined;

  return (
    <div
      className={`animate-message-in flex flex-col gap-1.5 ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`flex max-w-[80%] items-end gap-2 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isUser && <LogoMark className="h-7 w-7 text-[10px]" />}
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${
            isUser
              ? "rounded-br-sm bg-slate-800 text-white dark:bg-indigo-500 dark:text-white"
              : "rounded-bl-sm bg-stone-100 text-stone-900 dark:bg-gray-800 dark:text-gray-100"
          }`}
        >
          {segments
            ? segments.map((seg, i) =>
                seg.errorIndex === undefined ? (
                  <span key={i}>{seg.text}</span>
                ) : (
                  <button
                    key={i}
                    type="button"
                    aria-expanded={openIndex === seg.errorIndex}
                    onClick={() =>
                      setOpenIndex((prev) =>
                        prev === seg.errorIndex ? null : seg.errorIndex!,
                      )
                    }
                    className={`cursor-pointer underline decoration-red-300 decoration-wavy decoration-2 underline-offset-4 transition-colors hover:decoration-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                      openIndex === seg.errorIndex
                        ? "bg-red-300/25 decoration-red-200"
                        : ""
                    }`}
                  >
                    {seg.text}
                  </button>
                ),
              )
            : message.content}
        </div>
      </div>

      {open && (
        <div className="max-w-[80%] rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-red-700 line-through dark:text-red-300">
              {open.span}
            </span>
            <span aria-hidden="true" className="text-stone-400 dark:text-gray-500">
              →
            </span>
            <span className="font-medium text-green-700 dark:text-green-300">
              {open.correction}
            </span>
            <TypeChip type={open.type} />
          </div>
          <p className="mt-1 leading-relaxed text-stone-600 dark:text-gray-400">
            {open.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export function TypeChip({ type }: { type: CorrectionError["type"] }) {
  return (
    <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-500 dark:bg-gray-800 dark:text-gray-400">
      {type}
    </span>
  );
}

interface Segment {
  text: string;
  /** Index into the corrections array, or undefined for plain text. */
  errorIndex?: number;
}

/**
 * Split `content` into plain and highlighted segments.
 *
 * Left-to-right, non-overlapping, first-occurrence-after-the-last-match: each
 * error claims the first occurrence of its span at or after the previous
 * match's end. An error whose span no longer occurs there (duplicate spans,
 * spans the model listed out of order, spans already consumed by an earlier
 * error) is simply skipped — dropping a highlight is fine, mangling the
 * learner's text is not.
 */
function annotate(content: string, errors: CorrectionError[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  errors.forEach((error, errorIndex) => {
    if (!error.span) return;
    const start = content.indexOf(error.span, cursor);
    if (start === -1) return;
    if (start > cursor) segments.push({ text: content.slice(cursor, start) });
    segments.push({ text: error.span, errorIndex });
    cursor = start + error.span.length;
  });

  if (cursor < content.length) segments.push({ text: content.slice(cursor) });
  return segments;
}
