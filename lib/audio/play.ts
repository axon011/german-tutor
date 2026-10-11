/**
 * Client-side German playback. One shared <audio> element so two clips can
 * never overlap; the pre-generated mp3 (lib/audio/key.ts) is tried first and
 * the browser's own speech synthesis takes over when the file is missing or
 * will not decode — a lesson edited after the last `npm run audio:build`
 * still speaks, just with a worse voice.
 *
 * Browser-only: every entry point is a no-op on the server.
 */

import { audioUrl, normalizeSpoken } from "./key";

let el: HTMLAudioElement | null = null;
/** Resolves the call currently in flight; cancelling = calling it early. */
let settle: (() => void) | null = null;
/** Bumped by every play/stop so a stale clip's late events are ignored. */
let generation = 0;
/** Listeners told which text is playing (null = nothing). */
const listeners = new Set<(text: string | null) => void>();
let current: string | null = null;

function setCurrent(text: string | null) {
  current = text;
  listeners.forEach((l) => l(text));
}

/** Subscribe to "which text is playing now"; returns an unsubscribe. */
export function onPlayingChange(fn: (text: string | null) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function currentlyPlaying(): string | null {
  return current;
}

function speechAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

export function stopAudio(): void {
  if (typeof window === "undefined") return;
  generation++;
  if (el) {
    el.onended = null;
    el.onerror = null;
    el.pause();
    // Detach the source so a half-loaded file stops downloading.
    el.removeAttribute("src");
    el.load();
  }
  if (speechAvailable()) window.speechSynthesis.cancel();
  setCurrent(null);
  const done = settle;
  settle = null;
  done?.();
}

function speak(text: string, rate: number, finish: () => void): void {
  if (!speechAvailable()) {
    finish();
    return;
  }
  const u = new SpeechSynthesisUtterance(normalizeSpoken(text));
  u.lang = "de-DE";
  u.rate = rate;
  const voice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith("de"));
  if (voice) u.voice = voice;
  u.onend = finish;
  u.onerror = finish;
  window.speechSynthesis.speak(u);
}

/**
 * Play `text` and resolve when it has finished (or was cancelled by a newer
 * call / stopAudio). Never rejects.
 */
export function playGerman(
  text: string,
  opts?: { rate?: number },
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  stopAudio();
  const mine = ++generation;
  const rate = opts?.rate ?? 1;

  return new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (mine === generation) {
        settle = null;
        setCurrent(null);
      }
      resolve();
    };
    settle = finish;
    setCurrent(text);

    if (!el) el = new Audio();
    const audio = el;
    audio.onended = () => {
      if (mine === generation) finish();
    };
    audio.onerror = () => {
      if (mine !== generation) return;
      // Missing file or undecodable: fall back to the browser voice.
      speak(text, rate, finish);
    };
    audio.src = audioUrl(text);
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    audio.play().catch(() => {
      // `error` handles a failed load; a play() blocked by autoplay policy
      // must not leave the promise hanging.
      if (mine === generation && audio.error === null) finish();
    });
  });
}
