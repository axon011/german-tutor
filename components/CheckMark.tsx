/**
 * A tick that draws itself inside a green disc — the success signal for a
 * correct drill answer. White on green-600 / green-500 clears AA.
 */
export function CheckMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-green-600 text-white dark:bg-green-500 dark:text-green-950 ${className}`}
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
