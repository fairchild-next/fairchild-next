"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";

type Ticket = {
  id: string;
  slot_id: string | null;
  order_id?: string;
  ticket_type_name?: string;
  slot_date?: string;
  slot_start_time?: string;
  slot_end_time?: string;
  visit_date?: string;
  order_total?: number;
  [key: string]: unknown;
};

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  if (h === 0) return `12:${String(m).padStart(2, "0")} AM`;
  if (h === 12) return `12:${String(m).padStart(2, "0")} PM`;
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatGuaranteedDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function PastTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = useSupabaseBrowserClient();
  const groupKey = params.id as string;

  const [group, setGroup] = useState<Ticket[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login?redirect=" + encodeURIComponent(`/tickets/my/${groupKey}`));
        return;
      }

      const res = await fetch("/api/my-tickets", { credentials: "include" });
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const json = await res.json();
      const pastTickets: Ticket[] = json.pastTickets ?? [];
      const groups = new Map<string, Ticket[]>();
      for (const t of pastTickets) {
        const key = `${t.order_id ?? "?"}_${t.slot_id ?? "flex"}`;
        const arr = groups.get(key) ?? [];
        arr.push(t);
        groups.set(key, arr);
      }

      const decodedKey = decodeURIComponent(groupKey);
      const found = groups.get(decodedKey);
      if (!found) {
        setNotFound(true);
      } else {
        setGroup(found);
      }
      setLoading(false);
    };

    void load();
  }, [router, groupKey, supabase]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (notFound || !group?.length) {
    return (
      <div className="p-6 space-y-4">
        <Link
          href="/tickets/my"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to tickets
        </Link>
        <p className="text-gray-500">Ticket not found.</p>
      </div>
    );
  }

  const first = group[0];
  const isScheduled = !!first.slot_id;
  const admissionLabel = isScheduled ? "Scheduled Date of Admission" : "Flexible Admission";

  const dateTimeStr = (() => {
    if (isScheduled && first.slot_date && first.slot_start_time && first.slot_end_time) {
      return `${formatDate(first.slot_date)}, ${formatTime(first.slot_start_time)} - ${formatTime(first.slot_end_time)}`;
    }
    if (first.visit_date) return formatDate(first.visit_date);
    if (isScheduled && first.slot_date) return formatDate(first.slot_date);
    return "";
  })();

  const breakdown = (() => {
    const counts = new Map<string, number>();
    for (const t of group) {
      const name = t.ticket_type_name ?? "Ticket";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, n]) => `${n} ${name}`)
      .join(", ");
  })();

  const totalStr = first.order_total != null ? `Total $${first.order_total.toFixed(2)}` : null;

  return (
    <div className="p-6 space-y-4 pb-24">
      <Link
        href="/tickets/my"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tickets
      </Link>

      <div className="border border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="aspect-[2/1] bg-gradient-to-br from-emerald-900/80 via-teal-900/60 to-emerald-800/80 relative overflow-hidden">
          <img
            src="/scheduled-admission-hero.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          {(first.slot_id && first.slot_date) ? (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-2 text-white">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">
                  Guaranteed entry for {formatGuaranteedDate(first.slot_date)}
                </span>
              </div>
            </div>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-2 text-white">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <span className="text-sm font-medium">Valid any day</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          {dateTimeStr ? (
            <p className="text-base font-semibold text-[var(--text-primary)]">
              {dateTimeStr}
            </p>
          ) : null}
          <p className="text-xs text-gray-500 uppercase tracking-wide">{admissionLabel}</p>
          <div className="w-full py-2.5 px-3 rounded-lg bg-gray-600 text-gray-300 text-center text-sm font-bold uppercase tracking-wide">
            Used
          </div>
          <p className="text-sm text-gray-400">{breakdown}</p>
          {totalStr && (
            <p className="text-sm font-medium text-green-600">{totalStr}</p>
          )}
        </div>
      </div>
    </div>
  );
}
