"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import TicketSelector from "@/components/TicketSelector";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";
import { useMember } from "@/lib/memberContext";
import { getMemberEventDisplay } from "@/lib/memberEventDisplay";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

type Event = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  image_url: string | null;
};

type TicketType = {
  id: string;
  name: string;
  price: number;
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (h === 0) return `12:${String(m).padStart(2, "0")} AM`;
  if (h === 12) return `12:${String(m).padStart(2, "0")} PM`;
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { member } = useMember();
  const supabase = useSupabaseBrowserClient();

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || !supabase) return;
    let cancelled = false;

    const load = async () => {
      const { data: ev, error: evErr } = await supabase
        .from("events")
        .select("id, name, slug, description, start_date, end_date, start_time, end_time, image_url")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (cancelled) return;
      if (evErr || !ev) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setEvent(ev as Event);

      const { data: types } = await supabase
        .from("ticket_types")
        .select("id, name, price")
        .eq("event_id", ev.id)
        .eq("is_active", true)
        .order("name");

      if (!cancelled && types) setTicketTypes(types as TicketType[]);
      setLoading(false);
    };

    void load();
    return () => { cancelled = true; };
  }, [slug, supabase]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="p-6 space-y-4">
        <Link href="/tickets/events" className="text-[var(--primary)] text-sm font-medium">
          ← Back to Events
        </Link>
        <p className="text-gray-500">Event not found.</p>
      </div>
    );
  }

  const memberDisplay = getMemberEventDisplay(event.slug, event.name, event.start_date, event.end_date, !!member);
  const displayName = memberDisplay.name;
  const dateStr =
    event.start_date === event.end_date
      ? formatDate(event.start_date)
      : `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`;
  const displayDateStr = member ? memberDisplay.dateStr : dateStr;
  const timeStr =
    event.start_time && event.end_time
      ? `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`
      : "";

  const tickets = ticketTypes.map((t) => ({
    id: t.id,
    label: t.name,
    price: member ? 0 : t.price,
  }));

  return (
    <div className="pb-24">
      {/* Banner – taller ratio (16:9) shows more of the image, object-cover fills without black bars */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
        {event.image_url ? (
          <img
            src={resolveImageUrl(event.image_url)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-teal-900/40 to-emerald-800/60" />
        )}
        <Link
          href="/tickets/events"
          className="absolute top-4 left-4 text-white/95 text-sm font-medium drop-shadow-md hover:text-white z-10"
        >
          ← Back to Events
        </Link>
      </div>

      {/* Name, date, time under banner */}
      <div className="px-6 pt-4 pb-2">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">{dateStr}</p>
        {timeStr ? (
          <p className="text-[var(--text-muted)] text-sm">{timeStr}</p>
        ) : null}
      </div>

      <div className="px-6 py-6 space-y-6">
        {event.description ? (
          <div className="prose prose-invert max-w-none">
            <p className="text-[var(--text-muted)] whitespace-pre-line text-sm leading-relaxed">
              {event.description}
            </p>
          </div>
        ) : null}

        <div className="border-t border-gray-700 pt-6">
          <h2 className="text-lg font-semibold mb-4">Select Tickets</h2>
          <TicketSelector
            title=""
            tickets={tickets}
            productType="special-event"
            eventId={event.id}
            inlineSummary
            onContinue={() => router.push("/tickets/cart")}
          />
        </div>
      </div>
    </div>
  );
}
