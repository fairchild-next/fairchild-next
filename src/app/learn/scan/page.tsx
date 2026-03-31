"use client";

import Link from "next/link";
import LearnScanner from "@/components/LearnScanner";

export default function ScanQRPage() {
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
