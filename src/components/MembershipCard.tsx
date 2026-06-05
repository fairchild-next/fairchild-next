"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import type { MemberInfo } from "@/lib/memberContext";

function formatExpiry(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function MembershipQrModal({ qrDataUrl, memberId, onClose }: { qrDataUrl: string; memberId: string; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="flex flex-col items-center gap-5 px-8">
        <p className="text-white/60 text-sm font-medium tracking-wide uppercase">Membership QR</p>
        <div className="bg-white p-5 rounded-2xl shadow-2xl">
          <img src={qrDataUrl} alt="Membership QR Code" className="w-72 h-72" />
        </div>
        <p className="text-white/70 text-sm font-medium">ID #{memberId}</p>
        <p className="text-white/40 text-xs">Tap anywhere to close</p>
        <button
          onClick={onClose}
          className="mt-1 px-6 py-2.5 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 active:bg-white/15 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/** Reusable membership card for inline display (e.g. My Tickets) or full page */
export default function MembershipCard({ member }: { member: MemberInfo }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const value = `FAIRCHILD-MEMBER-${member.member_id}`;
    QRCode.toDataURL(value, {
      width: 512,
      margin: 1,
      color: { dark: "#FFFFFF", light: "#00000000" },
    }).then(setQrDataUrl);
  }, [member.member_id]);

  const displayName = member.display_name || "Member";
  const isExpired = member.expires_at && new Date(member.expires_at + "T00:00:00") < new Date();

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden border border-[var(--surface-border)] aspect-[1.6] max-w-sm mx-auto w-full min-h-[180px]">
        <Image
          src="/membership-card-bg.png"
          alt=""
          fill
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{displayName}</h3>
            <p className="text-white/95 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{member.membership_type} Membership</p>
          </div>

          {qrDataUrl ? (
            <button
              type="button"
              aria-label="Tap to enlarge membership QR code"
              onClick={() => setExpanded(true)}
              className="absolute right-6 bottom-16 w-28 h-28 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group"
            >
              <img src={qrDataUrl} alt="Membership QR" className="w-full h-full object-contain" />
              <div className="absolute inset-0 rounded flex items-center justify-center bg-black/0 group-hover:bg-black/15 group-active:bg-black/20 transition">
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-70 drop-shadow transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </div>
            </button>
          ) : (
            <div className="absolute right-6 bottom-16 w-28 h-28 rounded bg-white/10 animate-pulse" />
          )}

          <div className="text-white/95 text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            <p>ID #{member.member_id}</p>
            <p className={isExpired ? "text-red-400 font-semibold" : ""}>
              {isExpired ? "Expired" : "Expires"}: {formatExpiry(member.expires_at)}
            </p>
          </div>
        </div>
      </div>

      {expanded && qrDataUrl && (
        <MembershipQrModal
          qrDataUrl={qrDataUrl}
          memberId={member.member_id}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}
