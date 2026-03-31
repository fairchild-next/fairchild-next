"use client";

import { useEffect, useState } from "react";
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

/** Reusable membership card for inline display (e.g. My Tickets) or full page */
export default function MembershipCard({ member }: { member: MemberInfo }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const value = `FAIRCHILD-MEMBER-${member.member_id}`;
    QRCode.toDataURL(value, {
      width: 256,
      margin: 1,
      color: { dark: "#FFFFFF", light: "#00000000" },
    }).then(setQrDataUrl);
  }, [member.member_id]);

  const displayName = member.display_name || "Member";

  return (
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
        {qrDataUrl && (
          <div className="absolute right-6 bottom-16 w-28 h-28 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            <img src={qrDataUrl} alt="Membership QR" className="w-full h-full object-contain" />
          </div>
        )}
        <div className="text-white/95 text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          <p>ID #{member.member_id}</p>
          <p>Expires: {formatExpiry(member.expires_at)}</p>
        </div>
      </div>
    </div>
  );
}
