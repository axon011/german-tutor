import type { ReactNode } from "react";

/**
 * The editorial section head: an optional two-digit index, an em-dash, the
 * uppercase label — and a short gold rule underneath. It is the one heading
 * shape the whole app uses, so every screen opens the same way.
 *
 * `trailing` sits flush right on the kicker line (counters like "3/6").
 */
export function Kicker({
  index,
  label,
  trailing,
  className = "",
}: {
  index?: string;
  label: string;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="kicker text-muted flex items-baseline gap-1.5">
        {index && <span className="text-ink">{index}</span>}
        {index && <span aria-hidden="true">—</span>}
        <span className="min-w-0 flex-1">{label}</span>
        {trailing && <span className="text-ink shrink-0">{trailing}</span>}
      </p>
      <span aria-hidden="true" className="gold-rule mt-1.5" />
    </div>
  );
}
