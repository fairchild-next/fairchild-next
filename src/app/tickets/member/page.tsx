"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TicketSelector from "@/components/TicketSelector";
import { siteConfig } from "@/lib/siteConfig";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";
import { useMember } from "@/lib/memberContext";
import { getMemberEventDisplay, isMembersOnlyEvent } from "@/lib/memberEventDisplay";

type TicketType = {
  id: string;
  name: string;
  price: number;
  price_peak: number | null;
};

type EventType = {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  image_url: string | null;
};

export default function MemberTicketsPage() {
  const router = useRouter();
  const supabase = useSupabaseBrowserClient();
  const { member, loading: memberLoading } = useMember();
  const [mode, setMode] = useState<"daily" | "exclusive">("daily");
  const [dailyTypes, setDailyTypes] = useState<TicketType[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member || !supabase) return;
    let cancelled = false;

    Promise.all([
      supabase
        .from("ticket_types")
        .select("id, name, price, price_peak")
        .eq("is_active", true)
        .is("event_id", null),
      supabase
        .from("events")
        .select("id, name, slug, start_date, end_date, image_url")
        .eq("is_active", true)
        .order("start_date", { ascending: true }),
    ]).then(([dailyRes, eventsRes]) => {
      if (cancelled) return;
      if (dailyRes.data) setDailyTypes(dailyRes.data as TicketType[]);
      if (eventsRes.data) setEvents(eventsRes.data as EventType[]);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [member, supabase]);

  // All free for members
  const dailyTickets = dailyTypes.map((t) => ({
    id: t.id,
    label: t.name,
    price: 0,
  }));

  const exclusiveEvents = events.filter((ev) => isMembersOnlyEvent(ev.slug));

  if (!memberLoading && !member) {
    router.replace("/login?redirect=" + encodeURIComponent("/tickets/member"));
    return null;
  }

  if (memberLoading) {
    return (
      <div className="px-6 py-8 text-[var(--text-muted)]">Loading…</div>
    );
  }

  return (
    <div className="pb-24">
      <div className="px-6 pt-4">
        <button
          onClick={() => router.push("/tickets")}
          className="text-[var(--primary)] text-sm font-medium"
        >
          ← Back to Tickets
        </button>
      </div>

      <div className="px-6 pt-4 pb-3">
        <h2 className="text-2xl font-semibold">Member Tickets</h2>
      </div>

      {/* Toggle: General Admission | Exclusive Special Events */}
      <div className="flex gap-2 px-6 pb-4">
        <button
          onClick={() => setMode("daily")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition ${
            mode === "daily"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)]"
          }`}
        >
          General Admission
        </button>
        <button
          onClick={() => setMode("exclusive")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition ${
            mode === "exclusive"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--text-muted)]"
          }`}
        >
          Exclusive Special Events
        </button>
      </div>

      {mode === "daily" ? (
        <>
          <p className="text-[var(--text-muted)] text-sm px-6 pb-2">
            Visit the Garden any day. Select tickets for yourself and up to 3 guests.
          </p>
          {loading ? (
            <div className="px-6 py-8 text-[var(--text-muted)]">Loading ticket types…</div>
          ) : dailyTickets.length === 0 ? (
            <div className="px-6 py-8 text-[var(--text-muted)]">No ticket types available.</div>
          ) : (
            <TicketSelector
              title=""
              tickets={dailyTickets}
              productType="general-daily"
              inlineSummary
              maxTotalItems={siteConfig.memberTicketMaxPerReservation ?? undefined}
              onContinue={() => router.push("/tickets/cart")}
            />
          )}
        </>
      ) : (
        <div className="px-6 space-y-4">
          <p className="text-[var(--text-muted)] text-sm">
            Events reserved for members—what you get that guests don&apos;t.
          </p>
          {loading ? (
            <div className="py-8 text-[var(--text-muted)]">Loading events…</div>
          ) : exclusiveEvents.length === 0 ? (
            <div className="py-8 text-[var(--text-muted)]">
              No exclusive member events at the moment.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {exclusiveEvents.map((ev) => {
                  const memberDisplay = getMemberEventDisplay(ev.slug, ev.name, ev.start_date, ev.end_date, true);
                  return (
                    <Link
                      key={ev.id}
                      href={`/tickets/events/${ev.slug}?member=1`}
                      className="block p-4 rounded-2xl bg-[var(--surface)] border border-[var(--primary)] hover:border-[var(--primary-hover)] transition"
                    >
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wide mb-2">
                        Members Only
                      </span>
                      <div className="font-medium">{memberDisplay.name}</div>
                      <div className="text-sm text-[var(--text-muted)] mt-0.5">
                        {memberDisplay.dateStr}
                      </div>
                      <span className="inline-block mt-2 text-sm font-medium text-[var(--primary)]">
                        Reserve free tickets →
                      </span>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/tickets/events"
                className="block mt-6 py-4 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] text-center font-medium text-[var(--primary)] hover:border-[var(--primary)] transition"
              >
                View All Special Events →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
