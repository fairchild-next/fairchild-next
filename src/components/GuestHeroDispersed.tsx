"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TodayData } from "@/components/TodayAtFairchild";

const REFETCH_MS = 5 * 60 * 1000;

function formatHoursPill(data: TodayData): string {
  const display = data.hoursDisplay ?? data.hours;
  if (/closed/i.test(data.hours) || display === "Closed") {
    return data.hours.includes("Closed") ? data.hours : "Closed today";
  }
  return `Open • ${display}`;
}

function formatWeatherDisplay(raw: string): string {
  if (!raw || raw === "…") return raw;
  if (raw.includes("•")) return raw;
  const i = raw.indexOf(" ");
  if (i === -1) return raw;
  return `${raw.slice(0, i)} • ${raw.slice(i + 1).trim()}`;
}

function formatEventLine(dailyEvent: string): string {
  return dailyEvent
    .replace(/No Upcoming Events Today/gi, "No events today")
    .replace(/No events scheduled today/gi, "No events today");
}

export default function GuestHeroDispersed({ hasSession }: { hasSession: boolean }) {
  const [data, setData] = useState<TodayData | null>(null);

  const load = useCallback(() => {
    void fetch("/api/today", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((d: TodayData & { hours?: string }) => {
        if (d?.hours) setData(d);
      })
      .catch(() => {
        setData({
          hours: "—",
          hoursDisplay: "—",
          weather: "—",
          dailyEvent: "No events today",
        });
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(load, REFETCH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const hoursLabel = data ? formatHoursPill(data) : "…";
  const weatherLabel = data ? formatWeatherDisplay(data.weather) : "…";
  const eventLabel = data ? formatEventLine(data.dailyEvent) : "…";

  return (
    <div className="relative z-0 min-h-[19.5rem] h-[min(36vh,22.5rem)] w-full overflow-hidden bg-[#152922]">
      <Image
        src="/hero-member.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-bottom"
        priority
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      {/* Readability over photo — lighter toward bottom so the lake reads through */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/32 via-black/10 to-black/16" />
      {/* Extra dim on upper sky so white type reads over bright clouds */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[min(52%,13rem)] bg-gradient-to-b from-black/26 via-black/10 to-transparent"
        aria-hidden
      />
      {/* Wash into events bar — shorter + softer so more water stays visible */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(40%,10.5rem)] bg-gradient-to-t from-[#1a2f26]/95 via-[#1a2f26]/45 to-transparent"
        aria-hidden
      />

      {hasSession && (
        <header className="absolute top-0 right-0 z-20 flex items-center justify-end px-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
          <Link
            href="/account"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/15 backdrop-blur-sm transition hover:bg-white/25"
            aria-label="Account"
          >
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>
        </header>
      )}

      <div className="absolute inset-0 z-10 flex flex-col pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 sm:px-5">
          <div className="min-h-0 flex-1" aria-hidden />
          <div className="mx-auto w-full max-w-md shrink-0 pb-1 text-center">
            <div className="-translate-y-2 sm:-translate-y-3 [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_3px_14px_rgba(0,0,0,0.65),0_8px_32px_rgba(0,0,0,0.35)]">
              <p className="font-serif text-sm font-medium text-white sm:text-base">Welcome to</p>
              <h1 className="mt-0.5 font-serif text-[1.75rem] font-bold leading-[1] tracking-tight text-white sm:text-[2.05rem] md:text-[2.25rem]">
                Fairchild
              </h1>
              <p className="font-system mt-0.5 text-[10px] font-bold uppercase leading-snug tracking-[0.16em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_2px_14px_rgba(0,0,0,0.75),0_0_1px_rgba(0,0,0,0.9)] sm:text-[11px] sm:tracking-[0.18em]">
                Tropical Botanical Garden
              </p>
              <p className="mt-1 font-serif text-[11px] font-medium italic leading-snug text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_2px_16px_rgba(0,0,0,0.8),0_0_1px_rgba(0,0,0,0.85)] sm:text-xs">
                Coral Gables, Florida — Est. 1938
              </p>
            </div>

            <div className="mt-5 flex w-full items-stretch gap-2 pb-2 font-system sm:mt-6">
              <div
                className="flex min-h-0 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/22 bg-black/32 px-2 py-1 backdrop-blur-[6px]"
                title={hoursLabel}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9dc88a]" aria-hidden />
                <span className="truncate text-[10px] font-medium leading-tight text-white">{hoursLabel}</span>
              </div>
              <div
                className="flex min-h-0 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/22 bg-black/32 px-2 py-1 backdrop-blur-[6px]"
                title={weatherLabel}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
                <span className="truncate text-[10px] font-medium leading-tight text-white">{weatherLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-white/[0.06] bg-[#1a2f26]/98 px-4 py-2.5 backdrop-blur-md font-system">
          <div className="flex w-full items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#9dc88a]" aria-hidden />
              <p className="truncate text-xs font-medium text-white/75" title={eventLabel}>
                {eventLabel}
              </p>
            </div>
            <span className="h-8 w-px shrink-0 bg-white/20" aria-hidden />
            <Link
              href="/tickets/events"
              className="shrink-0 text-xs font-semibold text-[#6A8468] transition hover:text-[#5a7360]"
            >
              See upcoming →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
