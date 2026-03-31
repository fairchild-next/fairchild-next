"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't show on cart/checkout so it never blocks the checkout button
  const isCartOrCheckout = pathname === "/tickets/cart" || pathname === "/tickets/checkout";

  useEffect(() => {
    const key = "fairchild-install-dismissed";
    if (typeof window === "undefined") return;
    const wasDismissed = localStorage.getItem(key);
    if (wasDismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
    if (outcome === "accepted") {
      localStorage.setItem("fairchild-install-dismissed", "true");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("fairchild-install-dismissed", "true");
  };

  if (!showPrompt || dismissed || !deferredPrompt || isCartOrCheckout) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>🌿</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Add to Home Screen</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Install Fairchild for quick access and better experience in the garden.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-black"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg border border-[var(--surface-border)] px-3 py-1.5 text-sm text-[var(--text-muted)]"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
