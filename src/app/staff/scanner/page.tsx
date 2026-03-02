"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

type ScanStatus = "idle" | "valid" | "already_used" | "not_found" | "error" | "invalid_request";

export default function StaffScannerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const lastSentRef = useRef<string | null>(null);

  const sendScan = useCallback(async (qrCode: string) => {
    if (lastSentRef.current === qrCode) return;
    lastSentRef.current = qrCode;
    setScanStatus(null);

    try {
      const res = await fetch("/api/scan-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: qrCode }),
      });
      const data = await res.json();

      if (data.status === "valid") {
        setScanStatus("valid");
        setTicketId(data.ticket_id ?? null);
      } else if (data.status === "already_used") {
        setScanStatus("already_used");
        setTicketId(data.ticket_id ?? null);
      } else if (data.status === "not_found") {
        setScanStatus("not_found");
        setTicketId(null);
      } else if (data.status === "invalid_request") {
        setScanStatus("invalid_request");
        setTicketId(null);
      } else {
        setScanStatus("error");
        setTicketId(null);
      }
    } catch {
      setScanStatus("error");
      setTicketId(null);
    }

    // Allow rescanning same code after a delay
    setTimeout(() => {
      lastSentRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
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

        codeReader.decodeFromVideoElement(
          videoRef.current!,
          (res) => {
            if (res) {
              const text = res.getText();
              setDecodedText(text);
              sendScan(text);
            }
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startScanner();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [sendScan]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Staff Ticket Scanner</h1>

      <video
        ref={videoRef}
        className="w-full max-w-md rounded-lg border"
        muted
        playsInline
      />

      {decodedText && (
        <div className="p-3 border rounded-lg bg-gray-100">
          <p className="text-xs text-gray-500">Scanned:</p>
          <p className="text-sm font-mono break-all">{decodedText}</p>
        </div>
      )}

      {scanStatus === "valid" && (
        <div className="p-4 border rounded-lg bg-green-100 border-green-300">
          <p className="text-sm font-semibold text-green-800">Valid — entry allowed</p>
          {ticketId && <p className="text-xs font-mono text-green-700">{ticketId}</p>}
        </div>
      )}
      {scanStatus === "already_used" && (
        <div className="p-4 border rounded-lg bg-amber-100 border-amber-300">
          <p className="text-sm font-semibold text-amber-800">Already used</p>
          {ticketId && <p className="text-xs font-mono text-amber-700">{ticketId}</p>}
        </div>
      )}
      {scanStatus === "not_found" && (
        <div className="p-4 border rounded-lg bg-red-100 border-red-300">
          <p className="text-sm font-semibold text-red-800">Ticket not found</p>
        </div>
      )}
      {(scanStatus === "error" || scanStatus === "invalid_request") && (
        <div className="p-4 border rounded-lg bg-red-100 border-red-300">
          <p className="text-sm font-semibold text-red-800">
            {scanStatus === "invalid_request" ? "Invalid request" : "Error — try again"}
          </p>
        </div>
      )}
    </div>
  );
}
