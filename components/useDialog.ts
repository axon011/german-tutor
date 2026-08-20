"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * The three things every overlay in this app owes the keyboard: the close
 * button takes focus on open, focus goes back where it came from on close, and
 * Escape closes. Tab is held inside the dialog, because both overlays sit over
 * a shell whose navigation would otherwise still be reachable behind them.
 *
 * Attach `containerRef` to the element carrying role="dialog" and `closeRef` to
 * its close button.
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>(
  onClose: () => void,
) {
  const containerRef = useRef<T>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Whatever opened the overlay gets the focus back when it goes away.
    const opener = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const root = containerRef.current;
      if (!root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((node) => node.offsetParent !== null);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const inside = root.contains(document.activeElement);

      if (e.shiftKey) {
        if (!inside || document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return { containerRef, closeRef };
}
