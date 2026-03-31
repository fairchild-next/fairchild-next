"use client";

/**
 * LearnScanner – Guest-facing QR scanner for garden plant signs.
 *
 * AR INTEGRATION POINT:
 * - videoRef: Raw <video> element with camera stream. MindAR/AR.js can attach
 *   to this element or use the stream for AR overlay. Pass videoRef.current
 *   when initializing AR.
 * - streamRef: The MediaStream instance. AR libraries may need this to avoid
 *   requesting a second camera. Do not call stream.getTracks().forEach(t => t.stop())
 *   until both scanner and AR session have ended.
 * - To add AR: Add a toggle/state for "AR mode". When true, ignore ZXing
 *   decode callbacks (guard in handleScannedCode) and render AR overlay/canvas
 *   on top of the video. The camera stream stays active for AR to use.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/browser";

type ScanStatus = "idle" | "scanning" | "loading" | "success" | "not_found" | "invalid" | "error" | "permission_denied";

/** Extract plant slug from scanned text: URL path, relative path, or bare slug */
function extractPlantSlug(text: string): string | null {
  const t = text.trim();
  if (!t) return null;

  // Full or relative URL: .../learn/plants/slug or .../plants/slug
  const urlMatch = t.match(/\/(?:learn\/)?plants\/([a-zA-Z0-9-]+)/);
  if (urlMatch) return urlMatch[1].toLowerCase();

  // Bare slug: lowercase alphanumeric + hyphens
  if (/^[a-z0-9-]+$/i.test(t)) return t.toLowerCase();
  return null;
}

export default function LearnScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const [status, setStatus] = useState<ScanStatus>("idle");

  const handleScannedCode = useCallback(
    async (rawText: string) => {
      if (lastScannedRef.current === rawText) return;
      lastScannedRef.current = rawText;

      const slug = extractPlantSlug(rawText);
      if (!slug) {
        setStatus("invalid");
        setTimeout(() => {
          lastScannedRef.current = null;
        }, 2500);
        return;
      }

      setStatus("loading");

      try {
        const res = await fetch(`/api/plants/${encodeURIComponent(slug)}`, {
          credentials: "include",
        });
        if (!res.ok) {
          setStatus("not_found");
        } else {
          setStatus("success");
          router.push(`/learn/plants/${slug}`);
          return;
        }
      } catch {
        setStatus("error");
      }

      setTimeout(() => {
        lastScannedRef.current = null;
      }, 2500);
    },
    [router]
  );

  const startScanning = useCallback(async () => {
    setStatus("scanning");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      codeReader.decodeFromVideoElement(videoRef.current!, (result) => {
        if (result) {
          const text = result.getText();
          handleScannedCode(text);
        }
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setStatus("permission_denied");
      } else {
        setStatus("error");
      }
      console.error("Camera error:", err);
    }
  }, [handleScannedCode]);

  const stopScanning = useCallback(() => {
    codeReaderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      codeReaderRef.current = null;
    };
  }, []);

  if (status === "idle") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl overflow-hidden bg-black/5 aspect-[4/3] flex items-center justify-center border border-[var(--surface-border)]">
          <div className="text-center px-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[var(--primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-2v2m0-2v-2m-2 0h2M4 7a2 2 0 012-2h2V3h4v2h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
                />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Point your camera at QR codes on plant signs to discover species.
            </p>
            <button
              type="button"
              onClick={startScanning}
              className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm active:opacity-90"
            >
              Start scanning
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "permission_denied") {
    return (
      <div className="rounded-2xl p-6 bg-amber-50 border border-amber-200 text-center">
        <p className="text-[var(--text-primary)] font-medium mb-2">Camera access needed</p>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Allow camera access to scan QR codes. You can enable it in your browser settings.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-sm font-medium text-[var(--primary)]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl p-6 bg-red-50 border border-red-200 text-center">
        <p className="text-[var(--text-primary)] font-medium mb-2">Camera unavailable</p>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          We couldn&apos;t access your camera. Try again or use Browse Plants.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-sm font-medium text-[var(--primary)]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          aria-label="Camera feed for QR scanning"
        />
        {/* Viewfinder overlay – AR INTEGRATION: AR canvas/overlay would render here, above video */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-2xl border-2 border-white/60 bg-transparent" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={stopScanning}
          className="text-sm font-medium text-[var(--text-muted)]"
        >
          Stop scanning
        </button>
        {status === "loading" && (
          <span className="text-sm text-[var(--text-muted)]">Looking up plant…</span>
        )}
      </div>

      {status === "invalid" && (
        <div className="rounded-xl p-4 bg-amber-50 border border-amber-200">
          <p className="text-sm font-medium text-amber-800">Not a garden code</p>
          <p className="text-xs text-amber-700 mt-1">Scan a QR code from a plant sign.</p>
        </div>
      )}
      {status === "not_found" && (
        <div className="rounded-xl p-4 bg-amber-50 border border-amber-200">
          <p className="text-sm font-medium text-amber-800">Plant not found</p>
          <p className="text-xs text-amber-700 mt-1">This code may be outdated. Try Browse Plants.</p>
        </div>
      )}
    </div>
  );
}
