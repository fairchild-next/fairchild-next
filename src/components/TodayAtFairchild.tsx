"use client";

import { useEffect, useState } from "react";

export type TodayData = {
  hours: string;
  hoursDisplay?: string;
  weather: string;
  dailyEvent: string;
};

type Props = {
  showMembershipLine?: boolean;
  membershipLabel?: string;
  expiresAt?: string;
};

export default function TodayAtFairchild({
  showMembershipLine = false,
  membershipLabel,
  expiresAt,
}: Props) {
  const [data, setData] = useState<TodayData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/today", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => {
        if (!cancelled && d?.hours) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData({ hours: "—", weather: "—", dailyEvent: "No Upcoming Events Today" });
      });
    return () => { cancelled = true; };
  }, []);

  if (!data) {
    return (
    <div className="rounded-2xl border border-[#e5e0d8] bg-[#f8f5ef] px-4 py-3 font-system">
      <h2 className="text-sm font-semibold text-[#1a1a1a] mb-2">Today at Fairchild</h2>
      <p className="text-sm text-[#4a4a4a]">Loading…</p>
    </div>
    );
  }

  const formatExpiry = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="rounded-2xl border border-[#e5e0d8] bg-[#f8f5ef] px-4 py-3 font-system">
      <h2 className="text-sm font-semibold text-[#1a1a1a] mb-2">Today at Fairchild</h2>
      <div className="flex items-center gap-2 flex-nowrap text-sm text-[#4a4a4a] min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          <span aria-hidden className="shrink-0">☀️</span>
          <span className="whitespace-nowrap truncate" title={data.hours}>
            {data.hoursDisplay ?? data.hours}
          </span>
        </div>
        <span className="text-[#c4bfb5] shrink-0" aria-hidden>|</span>
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          <span aria-hidden className="shrink-0">🌤️</span>
          <span className="whitespace-nowrap truncate">{data.weather}</span>
        </div>
      </div>
      {showMembershipLine && membershipLabel && expiresAt && (
        <div className="border-t border-[#e5e0d8] mt-2 pt-2 flex items-center justify-center gap-2 text-sm text-[#4a4a4a]">
          <span>{membershipLabel} • Valid through {formatExpiry(expiresAt)}</span>
        </div>
      )}
      <div className="border-t border-[#e5e0d8] mt-2 pt-2 flex items-center justify-center gap-2 text-sm text-[#4a4a4a]">
        <span aria-hidden>📅</span>
        <span>{data.dailyEvent}</span>
      </div>
    </div>
  );
}
