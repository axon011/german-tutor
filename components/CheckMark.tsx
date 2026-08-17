/**
 * A tick that draws itself inside a disc.
 *
 * `success` (emerald) is the correct-answer signal; `gold` is the brand
 * celebration used when a lesson or a rule is finished. Both clear AA as
 * graphical objects.
 */
export function CheckMark({
  className = "h-6 w-6",
  tone = "success",
}: {
  className?: string;
  tone?: "success" | "gold";
}) {
  const disc =
    tone === "gold"
      ? "bg-amber-400 text-amber-950"
      : "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950";

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${disc} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[55%] w-[55%]"
      >
        <path d="M5 12.5 10 17.5 19 7" pathLength={1} className="check-draw" />
      </svg>
    </span>
  );
}
