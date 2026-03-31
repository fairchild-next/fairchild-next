"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { siteConfig } from "@/lib/siteConfig";
import { useMember } from "@/lib/memberContext";
import MembershipCard from "@/components/MembershipCard";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

type Ticket = {
  id: string;
  qr_code: string;
  status: string;
  slot_id: string | null;
  order_id?: string;
  ticket_type_id?: string;
  ticket_type_name?: string;
  slot_date?: string;
  slot_start_time?: string;
  slot_end_time?: string;
  visit_date?: string;
  order_total?: number;
  created_at?: string;
  /** Flex only: true = weekend, false = weekday */
  is_peak?: boolean | null;
  /** Event tickets */
  event_id?: string | null;
  event_name?: string;
  event_slug?: string;
  event_image_url?: string | null;
  event_start_date?: string;
  event_end_date?: string;
  event_start_time?: string | null;
  event_end_time?: string | null;
  [key: string]: unknown;
};

type MyTicketsData = {
  currentTickets: Ticket[];
  pastTickets: Ticket[];
  visitCount: number;
};

export default function MyTicketsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { member } = useMember();

  const [data, setData] = useState<MyTicketsData | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [tab, setTab] = useState<"current" | "past">("current");
  const [membershipExpanded, setMembershipExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login?redirect=" + encodeURIComponent("/tickets/my"));
        return;
      }

      setUser(session.user);

      const res = await fetch("/api/my-tickets", { credentials: "include" });
      if (!res.ok) {
        setData({
          currentTickets: [],
          pastTickets: [],
          visitCount: 0,
        });
        return;
      }
      const json = await res.json();
      setData({
        currentTickets: json.currentTickets ?? [],
        pastTickets: json.pastTickets ?? [],
        visitCount: json.visitCount ?? 0,
      });
    };

    void load();
  }, [router]);

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  const currentTickets = data?.currentTickets ?? [];
  const pastTickets = data?.pastTickets ?? [];
  const visitCount = data?.visitCount ?? 0;

  const groupTickets = (list: Ticket[]) => {
    const groups = new Map<string, Ticket[]>();
    for (const t of list) {
      const key = t.event_id
        ? `${t.order_id ?? "?"}_event_${t.event_id}`
        : `${t.order_id ?? "?"}_${t.slot_id ?? "flex"}`;
      const arr = groups.get(key) ?? [];
      arr.push(t);
      groups.set(key, arr);
    }
    return Array.from(groups.values());
  };

  const currentGroups = groupTickets(currentTickets);
  const pastGroups = groupTickets(pastTickets);

  return (
    <div className="p-6 space-y-6 pb-24">
      <h1 className="text-xl font-semibold">Your Tickets</h1>

      <div className="flex border border-[var(--surface-border)] rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setTab("current")}
          className={`flex-1 py-3 text-sm font-medium transition ${
            tab === "current"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--surface)] text-[var(--text-muted)] [@media(hover:hover)]:hover:bg-[var(--surface-border)]/50"
          }`}
        >
          Current
        </button>
        <button
          type="button"
          onClick={() => setTab("past")}
          className={`flex-1 py-3 text-sm font-medium transition ${
            tab === "past"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--surface)] text-[var(--text-muted)] [@media(hover:hover)]:hover:bg-[var(--surface-border)]/50"
          }`}
        >
          Past
        </button>
      </div>

      {tab === "current" && (
        <div className="space-y-6">
          {member && (
            <>
              <button
                type="button"
                onClick={() => setMembershipExpanded((e) => !e)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] transition [@media(hover:hover)]:hover:border-[var(--primary)]"
              >
                <span className="font-medium">View Membership Card</span>
                <svg
                  className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${membershipExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {membershipExpanded && (
                <div className="py-2">
                  <MembershipCard member={member} />
                </div>
              )}
            </>
          )}
          {currentGroups.length === 0 && !member ? (
            <p className="text-gray-500">No current tickets.</p>
          ) : currentGroups.length > 0 ? (
            <div className="space-y-6">
              {currentGroups.map((group) => (
                <TicketGroupCard
                  key={group[0]?.order_id + "_" + (group[0]?.slot_id ?? "flex")}
                  tickets={group}
                  showQr
                />
              ))}
            </div>
          ) : null}
        </div>
      )}

      {tab === "past" && (
        <>
          {visitCount > 0 && (
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Wow! You visited the garden {visitCount} time
                {visitCount === 1 ? "" : "s"} this year.
              </p>
            </div>
          )}
          <h2 className="text-lg font-medium">Past Tickets</h2>
          {pastGroups.length === 0 ? (
            <p className="text-[var(--text-muted)]">No past tickets yet.</p>
          ) : (
            <PastTicketsList groups={pastGroups} />
          )}
        </>
      )}
    </div>
  );
}

function PastTicketsList({ groups }: { groups: Ticket[][] }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const key = `${group[0]?.order_id ?? "?"}_${group[0]?.slot_id ?? "flex"}`;
        return (
          <Link key={key} href={`/tickets/my/${encodeURIComponent(key)}`}>
            <TicketGroupCard tickets={group} showQr={false} isPast />
          </Link>
        );
      })}
    </div>
  );
}

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

function TicketGroupCard({
  tickets,
  showQr,
  isPast,
}: {
  tickets: Ticket[];
  showQr: boolean;
  isPast?: boolean;
}) {
  const first = tickets[0];
  if (!first) return null;

  const isEvent = !!first.event_id;
  const isScheduled = !!first.slot_id && !isEvent;
  const isFlex = !isScheduled && !isEvent;
  const flexWeekend = isFlex && first.is_peak === true;
  const flexWeekday = isFlex && first.is_peak === false;
  const typeLabel = isEvent
    ? (first.event_name ?? "Event Ticket")
    : isScheduled
      ? "Scheduled Ticket"
      : flexWeekend
        ? "WEEKEND TICKET"
        : flexWeekday
          ? "WEEKDAY TICKET"
          : "Flex Ticket";
  const admissionLabel = isEvent ? "Special Event" : isScheduled ? "Scheduled Date of Admission" : "Flexible Admission";

  const dateTimeStr = (() => {
    if (isEvent && first.event_start_date) {
      const end = first.event_end_date;
      if (end && end !== first.event_start_date) {
        return `${formatDate(first.event_start_date)} – ${formatDate(end)}`;
      }
      return formatDate(first.event_start_date);
    }
    if (isScheduled && first.slot_date && first.slot_start_time && first.slot_end_time) {
      return `${formatDate(first.slot_date)}, ${formatTime(first.slot_start_time)} - ${formatTime(first.slot_end_time)}`;
    }
    if (first.visit_date) return formatDate(first.visit_date);
    if (isScheduled && first.slot_date) return formatDate(first.slot_date);
    return "";
  })();

  const breakdown = (() => {
    const counts = new Map<string, number>();
    for (const t of tickets) {
      const name = t.ticket_type_name ?? "Ticket";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, n]) => `${n} ${name}`)
      .join(", ");
  })();

  const orderTotal = first.order_total;
  const totalStr = orderTotal != null ? `Total $${orderTotal.toFixed(2)}` : null;

  const guaranteedEntryText = isEvent && first.event_name
    ? first.event_name
    : isScheduled && first.slot_date
      ? `Guaranteed entry for ${formatGuaranteedDate(first.slot_date)}`
      : isFlex
        ? flexWeekend
          ? "Valid any Saturday or Sunday"
          : flexWeekday
            ? "Valid any Monday–Friday"
            : "Valid any day"
        : "Valid any day";

  const flexLegalText = isFlex
    ? flexWeekend
      ? "Valid on weekends (Sat–Sun) only. Not valid for entry on festival days when the garden is closed to general admission."
      : flexWeekday
        ? "Valid on weekdays (Mon–Fri) only. Not valid for entry on festival days when the garden is closed to general admission."
        : "Valid any day. Not valid for entry on festival days when the garden is closed to general admission."
    : null;

  const eventDetailHref = isEvent && first.event_slug ? `/tickets/events/${first.event_slug}` : null;

  if (showQr) {
    return (
      <div className="border border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <div
            className={`relative overflow-hidden ${
              isScheduled || isEvent ? "aspect-[2/1]" : ""
            }`}
          >
            {isEvent && first.event_image_url ? (
              eventDetailHref ? (
                <Link href={eventDetailHref} className="block aspect-[2/1] relative overflow-hidden">
                  <img
                    src={resolveImageUrl(first.event_image_url)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-sm font-medium">{guaranteedEntryText}</span>
                      <span className="text-xs opacity-90">Tap for details →</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="aspect-[2/1] relative overflow-hidden">
                  <img
                    src={resolveImageUrl(first.event_image_url)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-sm font-medium text-white">{guaranteedEntryText}</span>
                  </div>
                </div>
              )
            ) : isScheduled ? (
              <div className="aspect-[2/1] bg-gradient-to-br from-emerald-900/80 via-teal-900/60 to-emerald-800/80 relative overflow-hidden">
                <img
                  src="/scheduled-admission-hero.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-2 text-white">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">{guaranteedEntryText}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-br from-emerald-900/60 via-teal-900/40 to-emerald-800/60">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span className="text-sm font-medium text-white">{guaranteedEntryText}</span>
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
          {isScheduled && (
            <p className="text-xs text-amber-400/90">
              Enter at your scheduled time. 30-min grace after slot end.
            </p>
          )}
          {flexLegalText && (
            <p className="text-xs text-gray-500">{flexLegalText}</p>
          )}
          {eventDetailHref && (
            <Link href={eventDetailHref} className="inline-block text-sm font-medium text-[var(--primary)]">
              View event details →
            </Link>
          )}
          {siteConfig.ticketRequiresActivation && (
            <div className="w-full py-2.5 px-3 rounded-lg bg-green-700 text-white text-center text-sm font-bold uppercase tracking-wide">
              Activated
            </div>
          )}
          <p className="text-sm text-gray-400">{breakdown}</p>
          {totalStr && (
            <p className="text-sm font-medium text-green-600">{totalStr}</p>
          )}
          <div className="space-y-3 pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500">Show QR at entry</p>
            <TicketQrCarousel tickets={tickets} />
          </div>
        </div>
      </div>
    );
  }

  if (isPast) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] hover:bg-[var(--surface-border)]/30 transition-colors">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--surface-border)] flex items-center justify-center">
          {isScheduled ? (
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">{typeLabel}</p>
          <p className="text-sm text-[var(--text-muted)]">
            USED{dateTimeStr ? ` ${dateTimeStr}` : ""}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{breakdown}</p>
        </div>
        <svg className="w-5 h-5 text-[var(--text-muted)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    );
  }

  return null;
}

function TicketQrCarousel({ tickets }: { tickets: Ticket[] }) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) =>
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  const onTouchMove = (e: React.TouchEvent) =>
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diffX = touchStart.x - touchEnd.x;
    const diffY = touchStart.y - touchEnd.y;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) setIndex((i) => Math.min(i + 1, tickets.length - 1));
      else setIndex((i) => Math.max(i - 1, 0));
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const ticket = tickets[index];
  if (!ticket || tickets.length === 0) return null;

  return (
    <div
      className="overflow-hidden select-none"
      style={{ touchAction: "pan-y" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-500">
          Ticket {index + 1} of {tickets.length}
        </span>
        <TicketQr ticket={ticket} />
      </div>
      {tickets.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {tickets.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to ticket ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition ${
                i === index ? "bg-green-500" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TicketQr({ ticket }: { ticket: Ticket }) {
  const [qrImage, setQrImage] = useState<string>("");
  useEffect(() => {
    if (!ticket.qr_code) return;
    QRCode.toDataURL(ticket.qr_code).then(setQrImage);
  }, [ticket.qr_code]);

  if (!qrImage) return null;
  return (
    <img
      src={qrImage}
      alt="Ticket QR Code"
      className="w-36 h-36"
    />
  );
}
