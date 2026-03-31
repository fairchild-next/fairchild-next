"use client";

import { useEffect } from "react";

/**
 * Registers the Service Worker for PWA caching.
 * Caches images and static assets so the app works in low-signal areas (garden).
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        reg.update();
      })
      .catch(() => {});
  }, []);

  return null;
}
