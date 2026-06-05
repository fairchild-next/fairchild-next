"use client";

import Link from "next/link";
import { Tag } from "@phosphor-icons/react";

export default function MemberDiscountsPage() {
  return (
    <div className="min-h-screen bg-[#F3EFEE] pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6A8468] hover:text-[#5a7360] transition"
        >
          ← Home
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#d4e8d0] flex items-center justify-center mb-5">
          <Tag size={28} weight="duotone" className="text-[#193521]" />
        </div>

        <h1 className="font-serif text-2xl font-semibold text-[#193521] mb-3">
          Member Discounts
        </h1>
        <p className="text-[#4a4a4a] text-base leading-relaxed max-w-xs mb-6">
          Exclusive member perks and partner discounts are coming soon.
          As a Fairchild member, you&apos;ll unlock savings at the garden shop,
          special events, and select local partners.
        </p>

        <div className="w-full max-w-xs rounded-2xl border border-[#6A8468]/30 bg-white px-5 py-4 text-left">
          <p className="text-xs font-semibold text-[#6A8468] uppercase tracking-wide mb-2">
            Coming soon
          </p>
          <ul className="space-y-2">
            {[
              "Garden shop discount",
              "Special event early access",
              "Guest pass benefits",
              "Partner garden reciprocal entry",
            ].map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm text-[#193521]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6A8468] shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#193521] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
