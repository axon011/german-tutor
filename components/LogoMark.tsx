/**
 * The "DT" gold mark. Pure CSS/text — no image assets.
 * Size and text size come from the caller via className.
 * The amber gradient pans slowly (`.logo-shimmer`); it is decoration, so it
 * stops entirely under `prefers-reduced-motion`.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`logo-shimmer inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold tracking-tight text-amber-950 shadow-sm ${className}`}
    >
      DT
    </span>
  );
}
