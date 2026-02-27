"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function StaffScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<any>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    if (!videoRef.current) return;

    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      async (res, err) => {
        if (res && scanning) {
          setScanning(false);

          const response = await fetch("/api/scan-ticket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qr_code: res.getText() }),
          });

          const data = await response.json();
          setResult(data);

          setTimeout(() => {
            setResult(null);
            setScanning(true);
          }, 3000);
        }
      }
    );

    return () => {
      codeReader.reset();
    };
  }, [scanning]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-black text-white">
      <h1 className="text-2xl font-semibold mb-6">Ticket Scanner</h1>

      <video
        ref={videoRef}
        className="w-full max-w-md rounded-lg border"
      />

      {result && (
        <div
          className={`mt-8 w-full max-w-md p-6 rounded-xl text-center text-2xl font-bold ${
            result.status === "valid"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {result.status === "valid" && "VALID ENTRY ✅"}
          {result.status === "already_used" && "ALREADY USED ❌"}
          {result.status === "not_found" && "INVALID TICKET ❌"}
        </div>
      )}
    </div>
  );
}