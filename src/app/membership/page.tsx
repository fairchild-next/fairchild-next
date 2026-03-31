"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { useMember } from "@/lib/memberContext";

function formatExpiry(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function MembershipPage() {
  const { member, loading } = useMember();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!member) return;
    const value = `FAIRCHILD-MEMBER-${member.member_id}`;
    QRCode.toDataURL(value, {
      width: 256,
      margin: 1,
      color: { dark: "#FFFFFF", light: "#00000000" },
    }).then(setQrDataUrl);
  }, [member]);

  if (loading) {
    return (
      <div className="px-6 py-12 text-[var(--text-muted)]">Loading…</div>
    );
  }

  if (!member) {
    return (
      <div className="px-6 pt-6 pb-24">
        <h2 className="text-3xl font-semibold mb-8 border-b border-[var(--surface-border)] pb-4">
          Membership
        </h2>
        <p className="text-[var(--text-muted)] mb-6">
          Sign in with your member account to view your digital membership card
          and exclusive benefits.
        </p>
        <Link
          href={"/login?redirect=" + encodeURIComponent("/membership")}
          className="inline-block py-3 px-6 rounded-xl bg-[var(--primary)] text-black font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const displayName = member.display_name || "Member";

  return (
    <div className="px-6 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/member/profile"
          className="flex items-center gap-1 text-[var(--primary)] text-sm font-medium hover:opacity-90"
          aria-label="Back to profile"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>
      <h2 className="text-3xl font-semibold mb-6 border-b border-[var(--surface-border)] pb-4">
        Digital Membership Card
      </h2>

      {/* Card */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--surface-border)] aspect-[1.6] max-w-sm mx-auto">
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

      <p className="text-center text-sm text-[var(--text-muted)] mt-4">
        Add card to Apple Wallet
      </p>

      <div className="mt-8 space-y-4">
        <Link
          href="/tickets/member"
          className="block p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <span className="font-medium">Reserve Member Tickets →</span>
        </Link>
        <Link
          href="/tickets/my"
          className="block p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition"
        >
          <span className="font-medium">View All Tickets →</span>
        </Link>
      </div>
    </div>
  );
}
