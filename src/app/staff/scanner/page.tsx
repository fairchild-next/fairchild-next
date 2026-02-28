"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function StaffScannerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [result, setResult] = useState<string | null>(null);

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
              setResult(res.getText());
            }
          }
        );
      } catch (error) {
        console.error("Camera error:", error);
      }
    };

    startScanner();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Staff Ticket Scanner</h1>

      <video
        ref={videoRef}
        className="w-full max-w-md rounded-lg border"
      />

      {result && (
        <div className="p-4 border rounded-lg bg-green-50">
          <p className="text-sm font-semibold">Scanned QR Code:</p>
          <p className="text-sm break-all">{result}</p>
        </div>
      )}
    </div>
  );
}