"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BrowserMultiFormatReader } from "@zxing/browser";

type ScanStatus = "idle" | "valid" | "already_used" | "not_found" | "error" | "invalid_request";

const STATUS_CONFIG: Record<
  Exclude<ScanStatus, "idle">,
  { bg: string; border: string; textColor: string; label: string; sub?: string }
> = {
  valid: {
    bg: "#d4e8d0",
    border: "#6A8468",
    textColor: "#193521",
    label: "Valid — Entry Allowed",
    sub: "Ticket marked as used.",
  },
  already_used: {
    bg: "#fef9c3",
    border: "#ca8a04",
    textColor: "#713f12",
    label: "Already Used",
    sub: "This ticket was scanned earlier.",
  },
  not_found: {
    bg: "#fef2f2",
    border: "#ef4444",
    textColor: "#7f1d1d",
    label: "Ticket Not Found",
    sub: "QR code not in the system.",
  },
  error: {
    bg: "#fef2f2",
    border: "#ef4444",
    textColor: "#7f1d1d",
    label: "Error — Try Again",
    sub: "Something went wrong. Scan again.",
  },
  invalid_request: {
    bg: "#fef2f2",
    border: "#ef4444",
    textColor: "#7f1d1d",
    label: "Invalid Request",
    sub: "Could not read this QR code.",
  },
};

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconScan() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
    </svg>
  );
}

export default function StaffScannerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const lastSentRef = useRef<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const sendScan = useCallback(async (qrCode: string) => {
    if (lastSentRef.current === qrCode) return;
    lastSentRef.current = qrCode;
    setScanStatus("idle");
    setTicketId(null);

    try {
      const res = await fetch("/api/scan-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: qrCode }),
      });
      const data = await res.json() as { status: string; ticket_id?: string };

      setScanStatus((data.status as ScanStatus) ?? "error");
      setTicketId(data.ticket_id ?? null);
    } catch {
      setScanStatus("error");
    }

    setTimeout(() => {
      lastSentRef.current = null;
    }, 2500);
  }, []);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;
    let stream: MediaStream | null = null;

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        codeReader.decodeFromVideoElement(videoRef.current!, (res) => {
          if (res) sendScan(res.getText());
        });
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    void startScanner();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      readerRef.current = null;
    };
  }, [sendScan]);

  const statusConfig = scanStatus !== "idle" ? STATUS_CONFIG[scanStatus] : null;

  return (
    <div style={{ background: "var(--background)", minHeight: "100%" }} className="pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <Link href="/staff" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
          <IconBack />
        </Link>
        <div>
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Staff Portal</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">Ticket Scanner</p>
        </div>
      </div>

      <div className="px-5 space-y-4">

        {/* Camera feed */}
        <div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{ aspectRatio: "4/3", background: "#1a1a1a" }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
          />
          {/* Scan frame overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-48 h-48 relative"
              style={{ border: "2px solid rgba(255,255,255,0.35)", borderRadius: 16 }}
            >
              {/* Corner accents */}
              {[
                "top-0 left-0 border-t-2 border-l-2",
                "top-0 right-0 border-t-2 border-r-2",
                "bottom-0 left-0 border-b-2 border-l-2",
                "bottom-0 right-0 border-b-2 border-r-2",
              ].map((c, i) => (
                <div
                  key={i}
                  className={`absolute w-6 h-6 ${c}`}
                  style={{ borderColor: "#fff", borderRadius: 4 }}
                />
              ))}
            </div>
          </div>
          {/* Status tint overlay when scanned */}
          {statusConfig && (
            <div
              className="absolute inset-0 flex items-end justify-center pb-4 transition-opacity"
              style={{ background: `${statusConfig.bg}cc` }}
            />
          )}
        </div>

        {/* Scan status card */}
        {scanStatus === "idle" ? (
          <div
            className="rounded-2xl px-5 py-4 flex items-center gap-3"
            style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--background)", color: "var(--primary)" }}
            >
              <IconScan />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[var(--text-primary)]">Ready to Scan</p>
              <p className="text-xs text-[var(--text-muted)]">Point camera at a ticket QR code</p>
            </div>
          </div>
        ) : statusConfig ? (
          <div
            className="rounded-2xl px-5 py-4 space-y-1"
            style={{
              background: statusConfig.bg,
              border: `1px solid ${statusConfig.border}`,
            }}
          >
            <p className="text-[17px] font-bold" style={{ color: statusConfig.textColor }}>
              {statusConfig.label}
            </p>
            {statusConfig.sub && (
              <p className="text-xs font-medium opacity-80" style={{ color: statusConfig.textColor }}>
                {statusConfig.sub}
              </p>
            )}
            {ticketId && (
              <p className="text-xs font-mono opacity-60 pt-1" style={{ color: statusConfig.textColor }}>
                ID: {ticketId}
              </p>
            )}
          </div>
        ) : null}

        {/* Tap to reset */}
        {scanStatus !== "idle" && (
          <button
            onClick={() => { setScanStatus("idle"); setTicketId(null); lastSentRef.current = null; }}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-[var(--text-muted)] transition"
            style={{ background: "var(--surface)", border: "1px solid var(--surface-border)" }}
          >
            Scan Next Ticket
          </button>
        )}

      </div>
    </div>
  );
}
