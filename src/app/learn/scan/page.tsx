"use client";

import Link from "next/link";
import LearnScanner from "@/components/LearnScanner";
import { useKidsMode } from "@/lib/kidsModeContext";

export default function ScanQRPage() {
  const { isKidsMode } = useKidsMode();

  if (isKidsMode) {
    return (
      <div className="min-h-screen bg-[#F3EFEE] pb-28">

        {/* Header banner */}
        <div className="bg-[#193521] px-6 pt-10 pb-8 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h1 className="text-3xl font-bold text-white drop-shadow">
            Scan a Plant!
          </h1>
          <p className="text-green-200 mt-2 text-sm font-medium">
            Find the secret code on a plant sign
          </p>
        </div>

        {/* Scanner — on top so kids can start immediately */}
        <div className="px-6 pt-5">
          <LearnScanner kidsMode />
        </div>

        {/* How it works steps */}
        <div className="px-6 pt-5 pb-4 space-y-3">
          <h2 className="text-[#193521] font-bold text-base mb-3">
            Here&apos;s how to do it:
          </h2>

          {[
            { emoji: "📱", step: "1", text: "Tap the big green button above" },
            { emoji: "🎯", step: "2", text: "Point your camera at the QR code on a plant sign" },
            { emoji: "✅", step: "3", text: "Hold still for a second..." },
            { emoji: "🌿", step: "4", text: "Meet your plant friend!" },
          ].map(({ emoji, step, text }) => (
            <div
              key={step}
              className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3 border-2 border-[#193521]/10 shadow-sm"
            >
              <span className="text-2xl shrink-0">{emoji}</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#193521] text-white text-xs font-bold flex items-center justify-center">
                  {step}
                </span>
                <p className="text-[#193521] font-semibold text-sm leading-snug">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Browse link */}
        <div className="px-6 pb-4 text-center">
          <Link
            href="/learn/plants"
            className="text-[#193521] font-semibold text-sm underline"
          >
            Browse plants instead →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-6 pb-24">
      <Link
        href="/learn"
        className="text-sm text-[var(--primary)] font-medium mb-6 inline-block"
      >
        ← Back to Learn
      </Link>
      <h2 className="text-2xl font-semibold mb-2">Scan QR Code</h2>
      <p className="text-[var(--text-muted)] mb-6">
        Point your camera at QR codes on plant signs throughout the garden to
        instantly learn about each species.
      </p>

      <LearnScanner />

      <div className="mt-8 space-y-2 text-sm text-[var(--text-muted)]">
        <p className="font-medium text-[var(--text-primary)]">How it works</p>
        <ol className="list-decimal list-inside space-y-1.5 pl-1">
          <li>Tap &quot;Start scanning&quot; and allow camera access</li>
          <li>Point your camera at the QR code on the sign</li>
          <li>Center the code in the frame — we&apos;ll open the plant page</li>
        </ol>
      </div>

      <div className="mt-6">
        <Link
          href="/learn/plants"
          className="text-sm font-medium text-[var(--primary)]"
        >
          Or browse plants →
        </Link>
      </div>
    </div>
  );
}
