"use client";

import { useEffect, useState } from "react";

const DEFAULT_DURATION_MS = 500;

/**
 * Animate a number from 0 up to `value` once `active` is true.
 *
 * The count-up communicates "this figure was just computed for you", so under
 * `prefers-reduced-motion` it does not degrade to a slower count — it jumps
 * straight to the final value. Returns 0 until the first frame runs, which is
 * also what SSR renders, so hydration matches.
 */
export function useCountUp(
  value: number,
  active: boolean = true,
  duration: number = DEFAULT_DURATION_MS,
): number {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || duration <= 0 || value <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic: fast arrival, gentle settle
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, active, duration]);

  return display;
}
