/**
 * CEFR levels are squares in one ink/gold system, not four hues: a level is a
 * position on a scale, and the only thing worth colouring is which one is
 * selected. `LEVEL_CHIP` is the resting badge, `LEVEL_CHIP_ON` the selected
 * state — gold fill, ink text, which clears AA in both themes.
 *
 * Padding and text size stay with the caller.
 */
export const LEVEL_CHIP =
  "font-display rounded-sm border-2 border-ink/40 text-ink font-semibold";

export const LEVEL_CHIP_ON =
  "font-display rounded-sm border-2 border-ink bg-gold text-gold-ink font-semibold";
