"use client";

import Image from "next/image";
import Link from "next/link";
import { Ticket, Calendar, CreditCard, Tag, MapPin } from "@phosphor-icons/react";
import type { MemberInfo } from "@/lib/memberContext";
import TodayAtFairchild from "@/components/TodayAtFairchild";

export default function MemberHome({ member }: { member: MemberInfo }) {
  if (!member) return null;
  const displayName = member.display_name || "Fairchild Member";
  const membershipLabel = member.membership_type?.endsWith("Membership")
    ? member.membership_type
    : `${member.membership_type || "Member"} Membership`;

  return (
    <div className="min-h-screen">
      {/* Hero – photo stops at card midpoint, half card on photo / half on dark bg */}
      <div className="relative">
        <div className="relative h-[16.25rem] min-h-[var(--hero-min-h)] z-0 overflow-hidden">
          <Image
            src="/hero-member.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        <header className="absolute top-0 right-0 z-20 flex items-center justify-end px-4 py-3">
          <Link
            href="/member/profile"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition"
            aria-label="Member profile"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </header>

        <div className="absolute top-0 left-0 right-0 z-10 pt-[calc(6rem+env(safe-area-inset-top,0px))] px-6 text-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">
            Welcome back, {displayName.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-sm text-white/95 drop-shadow-sm">
            Enjoy exclusive perks and benefits designed just for you.
          </p>
        </div>

        {/* Today at Fairchild card – dynamic hours, weather, events */}
        <div className="relative z-10 px-6 -mt-18 pb-2">
        <TodayAtFairchild
          showMembershipLine
          membershipLabel={
            member.membership_type?.endsWith("Membership") ? member.membership_type : `${member.membership_type ?? "Member"} Membership`
          }
          expiresAt={member.expires_at}
        />
        </div>
      </div>

      {/* Square buttons grid – shifted up, no huge gap */}
      <div className="px-6 mt-5">
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/tickets/member"
            className="flex flex-col items-center justify-center py-5 rounded-2xl bg-[var(--primary)] border border-[var(--primary)] hover:opacity-90 transition min-h-[var(--tap-target-min)]"
          >
            <Ticket size={28} weight="regular" className="mb-2 text-white" />
            <span className="text-sm font-semibold text-center text-white">Reserve Tickets</span>
          </Link>
          <Link
            href="/tickets/events"
            className="flex flex-col items-center justify-center py-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] transition min-h-[var(--tap-target-min)]"
          >
            <Calendar size={28} weight="regular" className="mb-2 text-[var(--primary)]" />
            <span className="text-sm font-medium text-center text-[var(--text-primary)]">All Special Events</span>
          </Link>
          <Link
            href="/tickets/my"
            className="flex flex-col items-center justify-center py-5 rounded-2xl bg-[var(--primary)] border border-[var(--primary)] hover:opacity-90 transition min-h-[var(--tap-target-min)] px-3"
          >
            <CreditCard size={26} weight="regular" className="mb-2 text-white shrink-0" />
            <span className="text-sm font-semibold text-center text-white leading-tight">Member Card & Tickets</span>
          </Link>
          <Link
            href="#"
            className="flex flex-col items-center justify-center py-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--primary)] opacity-90 transition min-h-[var(--tap-target-min)]"
          >
            <Tag size={28} weight="regular" className="mb-2 text-[var(--primary)]" />
            <span className="text-sm font-medium text-center text-[var(--text-primary)]">Member Discounts</span>
          </Link>
          <Link
            href="/map"
            className="flex flex-col items-center justify-center py-5 rounded-2xl bg-[var(--primary)] border border-[var(--primary)] hover:opacity-90 transition min-h-[var(--tap-target-min)]"
          >
            <MapPin size={28} weight="regular" className="mb-2 text-white" />
            <span className="text-sm font-semibold text-center text-white">Garden Map</span>
          </Link>
        </div>
      </div>

      {/* Member Exclusive – Don't Miss This (no buttons under) */}
      <div className="px-6 mt-8 pb-8">
        <h2 className="text-lg font-semibold mb-4">Don&apos;t Miss This</h2>
        <Link
          href="/tickets/events/sunrise-tea-ceremony?member=1"
          className="block rounded-2xl overflow-hidden border border-[var(--primary)] bg-[var(--surface)] hover:border-[var(--primary-hover)] transition"
        >
          <div className="aspect-[3/1] relative overflow-hidden bg-gradient-to-br from-[var(--primary)]/30 to-transparent">
            <Image
              src="/events/sunrise-tea-ceremony.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="inline-block px-2 py-0.5 rounded bg-amber-500/90 text-black text-xs font-bold uppercase tracking-wide mb-2">
                Members Only
              </span>
              <h3 className="font-semibold text-white text-lg">MEMBERS ONLY Sunrise Tea Ceremony</h3>
              <p className="text-white/90 text-sm mt-0.5">Jun 16, 2026</p>
              <span className="inline-block mt-2 text-sm font-medium text-[var(--primary)]">
                Reserve free tickets →
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
