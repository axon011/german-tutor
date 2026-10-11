"use client";

import { useEffect, useState } from "react";
import { normalizeSpoken } from "@/lib/audio/key";
import {
  currentlyPlaying,
  onPlayingChange,
  playGerman,
  stopAudio,
} from "@/lib/audio/play";

/**
 * A small speaker icon next to a German text. Gold while its own clip plays;
 * a second press stops it. Comparing normalised text means two buttons for the
 * same words light up together, which is accurate: it is the same clip.
 */
export function SpeakButton({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const spoken = normalizeSpoken(text);

  useEffect(() => {
    const sync = (t: string | null) =>
      setPlaying(t !== null && normalizeSpoken(t) === spoken);
    sync(currentlyPlaying());
    return onPlayingChange(sync);
  }, [spoken]);

  return (
    <button
      type="button"
      aria-label={`Listen: ${text}`}
      onClick={() => {
        if (playing) stopAudio();
        else void playGerman(text);
      }}
      className={`pressable focus-ring hover:text-ink inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm ${
        playing ? "text-gold" : "text-muted"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
        <path d="M15.5 9a4 4 0 0 1 0 6" />
        <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
      </svg>
    </button>
  );
}
