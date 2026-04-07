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
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

type ScanStatus = "idle" | "scanning" | "loading" | "ar_reveal" | "success" | "not_found" | "invalid" | "error" | "permission_denied";

/** Extract plant slug from scanned text: URL path, relative path, or bare slug */
function extractPlantSlug(text: string): string | null {
  const t = text.trim();
  if (!t) return null;

  // Full or relative URL: .../learn/plants/slug or .../plants/slug
  const urlMatch = t.match(/\/(?:learn\/)?plants\/([a-zA-Z0-9-]+)/);
  if (urlMatch) return urlMatch[1].toLowerCase();

  // Bare slug: lowercase alphanumeric + hyphens only
  if (/^[a-z0-9-]+$/i.test(t)) return t.toLowerCase();
  return null;
}

export default function LearnScanner({ kidsMode = false }: { kidsMode?: boolean }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [debugText, setDebugText] = useState<string | null>(null);
  const [foundPlant, setFoundPlant] = useState<{ slug: string; name: string } | null>(null);

  const handleScannedCode = useCallback(
    async (rawText: string) => {
      if (lastScannedRef.current === rawText) return;
      lastScannedRef.current = rawText;

      setDebugText(rawText);

      // Try to extract slug directly; if it's a shortened/redirect URL, resolve it first
      let slug = extractPlantSlug(rawText);

      if (!slug && /^https?:\/\//i.test(rawText)) {
        try {
          const res = await fetch(`/api/resolve-url?url=${encodeURIComponent(rawText)}`);
          const data = await res.json();
          if (data.finalUrl) {
            setDebugText(`→ ${data.finalUrl}`);
            slug = extractPlantSlug(data.finalUrl);
          }
        } catch {
          // fall through to invalid state
        }
      }

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
        } else if (kidsMode) {
          // Stop the scanner before showing the AR reveal so it doesn't
          // keep firing handleScannedCode while the overlay is visible.
          controlsRef.current?.stop();
          controlsRef.current = null;
          const plant = await res.json();
          setFoundPlant({ slug, name: plant.common_name ?? slug });
          setStatus("ar_reveal");
          setTimeout(() => {
            router.push(`/kids/plants/${slug}`);
          }, 2800);
          return;
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
    [router, kidsMode]
  );

  const startScanning = useCallback(async () => {
    setStatus("scanning");
    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // decodeFromConstraints handles getUserMedia + video attachment internally.
      // It returns IScannerControls so we can cleanly stop the loop later.
      const controls = await codeReader.decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current!,
        (result) => {
          // ZXing calls this on every frame — result is undefined when no code found
          if (result) {
            handleScannedCode(result.getText());
          }
        }
      );
      controlsRef.current = controls;
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setStatus("permission_denied");
      } else {
        setStatus("error");
      }
      console.error("Scanner error:", err);
    }
  }, [handleScannedCode]);

  const stopScanning = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    codeReaderRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      codeReaderRef.current = null;
    };
  }, []);

  const isActive = status !== "idle" && status !== "permission_denied" && status !== "error";

  return (
    <div className="space-y-4">

      {/* ── Video element is ALWAYS in the DOM so videoRef.current is never null
           when startScanning runs. Visibility is toggled with CSS only. ── */}
      <div className={`relative rounded-2xl overflow-hidden bg-black aspect-[4/3] ${isActive ? "block" : "hidden"}`}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          aria-label="Camera feed for QR scanning"
        />
        {/* Viewfinder – AR INTEGRATION: AR canvas/overlay would render here, above video */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-2xl border-2 border-white/60 bg-transparent" />
        </div>

        {status === "loading" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
            <span className="text-sm text-white">
              {kidsMode ? "🔍 Finding your plant..." : "Looking up plant…"}
            </span>
          </div>
        )}

        {kidsMode && status === "scanning" && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#193521]/80 backdrop-blur-sm">
            <span className="text-xs text-white font-semibold">Point at the QR code 🎯</span>
          </div>
        )}

        {/* DEBUG: shows last raw text ZXing read — remove once scanning is confirmed working */}
        {debugText && status !== "ar_reveal" && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-1">
            <p className="text-[10px] text-green-300 break-all font-mono">Read: {debugText}</p>
          </div>
        )}

        {/* ── AR reveal overlay — camera feed stays live underneath ── */}
        {kidsMode && status === "ar_reveal" && foundPlant && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/55">
            <style>{`
              @keyframes butterflySwoop {
                0%   { transform: translate(120px, 40px) scale(0.4) rotate(20deg); opacity: 0; }
                30%  { opacity: 1; }
                60%  { transform: translate(-10px, -20px) scale(1.1) rotate(-8deg); }
                80%  { transform: translate(5px, 5px) scale(1) rotate(4deg); }
                100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
              }
              @keyframes arWingFlapLeft {
                from { transform: scaleX(1); }
                to   { transform: scaleX(0.45); }
              }
              @keyframes arWingFlapRight {
                from { transform: scaleX(1); }
                to   { transform: scaleX(0.45); }
              }
              @keyframes arFloat {
                0%, 100% { transform: translateY(0px); }
                50%      { transform: translateY(-8px); }
              }
              @keyframes revealText {
                0%   { opacity: 0; transform: translateY(16px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              @keyframes shimmer {
                0%, 100% { opacity: 1; }
                50%      { opacity: 0.6; }
              }
            `}</style>

            {/* Butterfly */}
            <div style={{ animation: "butterflySwoop 1s cubic-bezier(0.22,1,0.36,1) forwards" }}>
              <div style={{ animation: "arFloat 2.5s ease-in-out 1s infinite" }}>
                <svg viewBox="0 0 120 100" width="180" height="148" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="42" cy="38" rx="34" ry="26" fill="#7ED957"
                    style={{ transformOrigin: "60px 55px", animation: "arWingFlapLeft 0.6s ease-in-out infinite alternate" }} />
                  <ellipse cx="46" cy="68" rx="22" ry="16" fill="#5DBF3E"
                    style={{ transformOrigin: "60px 55px", animation: "arWingFlapLeft 0.6s ease-in-out infinite alternate" }} />
                  <ellipse cx="78" cy="38" rx="34" ry="26" fill="#7ED957"
                    style={{ transformOrigin: "60px 55px", animation: "arWingFlapRight 0.6s ease-in-out infinite alternate" }} />
                  <ellipse cx="74" cy="68" rx="22" ry="16" fill="#5DBF3E"
                    style={{ transformOrigin: "60px 55px", animation: "arWingFlapRight 0.6s ease-in-out infinite alternate" }} />
                  <circle cx="38" cy="34" r="6" fill="#FFFDE7" opacity="0.75" />
                  <circle cx="82" cy="34" r="6" fill="#FFFDE7" opacity="0.75" />
                  <circle cx="44" cy="66" r="4" fill="#FFFDE7" opacity="0.6" />
                  <circle cx="76" cy="66" r="4" fill="#FFFDE7" opacity="0.6" />
                  <ellipse cx="60" cy="55" rx="6" ry="20" fill="#193521" />
                  <circle cx="60" cy="33" r="8" fill="#193521" />
                  <circle cx="57" cy="31" r="2" fill="white" />
                  <circle cx="63" cy="31" r="2" fill="white" />
                  <circle cx="57.5" cy="31.5" r="1" fill="#193521" />
                  <circle cx="63.5" cy="31.5" r="1" fill="#193521" />
                  <path d="M56 36 Q60 39 64 36" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M57 26 Q50 16 44 12" stroke="#193521" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <circle cx="44" cy="11" r="3" fill="#7ED957" />
                  <path d="M63 26 Q70 16 76 12" stroke="#193521" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <circle cx="76" cy="11" r="3" fill="#7ED957" />
                </svg>
              </div>
            </div>

            {/* Plant name reveal */}
            <div
              className="mt-4 text-center px-6"
              style={{ animation: "revealText 0.6s ease-out 0.9s both" }}
            >
              <p className="text-white text-lg font-bold drop-shadow-lg" style={{ animation: "shimmer 2s ease-in-out infinite" }}>
                🌿 You found a plant!
              </p>
              <p className="text-green-300 text-2xl font-extrabold mt-1 drop-shadow-lg leading-tight">
                {foundPlant.name}
              </p>
              <p className="text-white/60 text-xs mt-3">Loading your plant page…</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Idle state ── */}
      {status === "idle" && (
        kidsMode ? (
          <button
            type="button"
            onClick={startScanning}
            className="w-full py-5 rounded-2xl bg-[#193521] text-white font-bold text-xl active:opacity-90 shadow-lg flex items-center justify-center gap-3"
          >
            <span className="text-3xl">📷</span>
            Start Scanning!
          </button>
        ) : (
          <div className="rounded-2xl overflow-hidden bg-black/5 aspect-[4/3] flex items-center justify-center border border-[var(--surface-border)]">
            <div className="text-center px-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-2v2m0-2v-2m-2 0h2M4 7a2 2 0 012-2h2V3h4v2h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
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
        )
      )}

      {/* ── Permission denied ── */}
      {status === "permission_denied" && (
        kidsMode ? (
          <div className="rounded-2xl p-6 bg-amber-50 border-2 border-amber-300 text-center space-y-3">
            <div className="text-4xl">😬</div>
            <p className="text-[#193521] font-bold text-lg">We need your camera!</p>
            <p className="text-amber-800 text-sm">Ask a grown-up to allow camera access in the browser settings.</p>
            <button type="button" onClick={() => setStatus("idle")} className="mt-2 px-6 py-3 rounded-2xl bg-[#193521] text-white font-bold text-sm active:opacity-90">
              Try Again
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-6 bg-amber-50 border border-amber-200 text-center">
            <p className="text-[var(--text-primary)] font-medium mb-2">Camera access needed</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">Allow camera access to scan QR codes. You can enable it in your browser settings.</p>
            <button type="button" onClick={() => setStatus("idle")} className="text-sm font-medium text-[var(--primary)]">Try again</button>
          </div>
        )
      )}

      {/* ── Camera error ── */}
      {status === "error" && (
        kidsMode ? (
          <div className="rounded-2xl p-6 bg-red-50 border-2 border-red-200 text-center space-y-3">
            <div className="text-4xl">😕</div>
            <p className="text-[#193521] font-bold text-lg">Camera didn&apos;t open</p>
            <p className="text-red-700 text-sm">Ask a grown-up to check the camera. Or try Browse Plants instead!</p>
            <button type="button" onClick={() => setStatus("idle")} className="mt-2 px-6 py-3 rounded-2xl bg-[#193521] text-white font-bold text-sm active:opacity-90">
              Try Again
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-6 bg-red-50 border border-red-200 text-center">
            <p className="text-[var(--text-primary)] font-medium mb-2">Camera unavailable</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">We couldn&apos;t access your camera. Try again or use Browse Plants.</p>
            <button type="button" onClick={() => setStatus("idle")} className="text-sm font-medium text-[var(--primary)]">Try again</button>
          </div>
        )
      )}

      {/* ── Scan result messages (shown below active video) ── */}
      {status === "invalid" && (
        <div className={`rounded-xl p-4 ${kidsMode ? "bg-amber-50 border-2 border-amber-300 text-center" : "bg-amber-50 border border-amber-200"}`}>
          {kidsMode ? (
            <><p className="text-2xl mb-1">🤔</p><p className="text-sm font-bold text-amber-800">That&apos;s not a plant code!</p><p className="text-xs text-amber-700 mt-1">Look for the QR code on a green plant sign and try again.</p></>
          ) : (
            <><p className="text-sm font-medium text-amber-800">Not a garden code</p><p className="text-xs text-amber-700 mt-1">Scan a QR code from a Fairchild plant sign.</p></>
          )}
          {debugText && (
            <p className="mt-2 text-xs text-gray-500 break-all">
              <span className="font-semibold">Scanned:</span> {debugText}
            </p>
          )}
        </div>
      )}
      {status === "not_found" && (
        <div className={`rounded-xl p-4 ${kidsMode ? "bg-amber-50 border-2 border-amber-300 text-center" : "bg-amber-50 border border-amber-200"}`}>
          {kidsMode ? (
            <><p className="text-2xl mb-1">🌱</p><p className="text-sm font-bold text-amber-800">We can&apos;t find this plant yet!</p><p className="text-xs text-amber-700 mt-1">Try scanning a different sign.</p></>
          ) : (
            <><p className="text-sm font-medium text-amber-800">Plant not found</p><p className="text-xs text-amber-700 mt-1">This code may be outdated. Try Browse Plants.</p></>
          )}
        </div>
      )}

      {/* ── Stop button — hidden during AR reveal so kids don't interrupt it ── */}
      {isActive && status !== "ar_reveal" && (
        <button
          type="button"
          onClick={stopScanning}
          className={
            kidsMode
              ? "w-full py-4 rounded-2xl border-2 border-[#193521] bg-white text-[#193521] font-bold text-base active:opacity-80 transition"
              : "w-full py-3.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] text-[var(--text-primary)] font-medium text-sm active:opacity-80 transition"
          }
        >
          {kidsMode ? "✋ Done Scanning" : "Stop scanning"}
        </button>
      )}
    </div>
  );
}
