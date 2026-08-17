import type { CefrLevel } from "@/lib/tutor-prompt";

/**
 * One hue per CEFR level, so a level reads as an identity rather than as a
 * position on a scale. Tinted chip + darker text clears AA in both themes.
 */
export const LEVEL_CHIP: Record<CefrLevel, string> = {
  A1: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  A2: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  B1: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  B2: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};
