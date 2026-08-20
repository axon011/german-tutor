"use client";

import { useEffect } from "react";

/** Registers the service worker once on mount (production only). */
export function RegisterSW() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
