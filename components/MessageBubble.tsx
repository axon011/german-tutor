"use client";

import { useState } from "react";
import type { ChatMessage } from "@/lib/llm/provider";
import type { CorrectionError } from "@/lib/corrector";

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
      {/* No bubbles. The tutor is set as body copy behind a gold rule with a
          printed byline; the learner's own words are the solid ink block. */}
      <div className={isUser ? "flex max-w-[82%] justify-end" : "w-full"}>
        <div
          className={
            isUser
              ? "bg-ink text-on-ink rounded-sm px-3.5 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap"
              : "border-gold text-ink border-l-[3px] pl-3 text-[15px] leading-relaxed whitespace-pre-wrap"
          }
        >
          {!isUser && (
            <span className="kicker text-muted mb-1 block">Tutor</span>
          )}
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
                    // The spans mount when the corrector's answer lands, a
                    // second or two after the message — the pulse is what
                    // tells the learner something just changed.
                    className={`correction-pulse focus-ring decoration-danger-on-ink cursor-pointer rounded-sm underline decoration-wavy decoration-2 underline-offset-4 transition-colors ${
                      openIndex === seg.errorIndex ? "bg-danger-on-ink/30" : ""
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
        <div className="border-line border-l-danger bg-surface max-w-[86%] rounded-sm border-2 border-l-[3px] px-3 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-danger line-through">{open.span}</span>
            <span aria-hidden="true" className="text-muted">
              →
            </span>
            <span className="text-success font-semibold">
              {open.correction}
            </span>
            <TypeChip type={open.type} />
          </div>
          <p className="text-muted mt-1 leading-relaxed">{open.explanation}</p>
        </div>
      )}
    </div>
  );
}

export function TypeChip({ type }: { type: CorrectionError["type"] }) {
  return (
    <span className="font-display border-line text-muted rounded-sm border-2 px-1.5 py-px text-[9px] font-semibold tracking-[0.12em] uppercase">
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
