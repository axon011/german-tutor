/**
 * The "DT" mark: a gold square carrying ink letterforms in the display face.
 * Pure CSS/text — no image assets. Size and text size come from the caller.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`font-display text-gold-ink bg-gold inline-flex shrink-0 items-center justify-center rounded-sm font-bold tracking-tight select-none ${className}`}
    >
      DT
    </span>
  );
}
