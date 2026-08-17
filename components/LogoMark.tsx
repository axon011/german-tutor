/**
 * The "DT" gold mark. Pure CSS/text — no image assets.
 * Size and text size come from the caller via className.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 font-bold tracking-tight text-amber-950 shadow-sm ${className}`}
    >
      DT
    </span>
  );
}
