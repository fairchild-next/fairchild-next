"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  is_festival: boolean;
  is_members_only: boolean;
};

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (start === end) {
    return s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function EventCard({ ev, isMember }: { ev: Event; isMember: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const { name: displayName, dateStr: displayDate } = getMemberEventDisplay(
    ev.slug, ev.name, ev.start_date, ev.end_date, isMember
  );
  return (
    <Link
      href={isMember ? `/tickets/events/${ev.slug}?member=1` : `/tickets/events/${ev.slug}`}
      className="block mx-6"
    >
      <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl overflow-hidden hover:border-[var(--primary)] transition">
        <div className="aspect-[2/1] relative bg-gradient-to-br from-emerald-900/60 to-teal-800/40 flex items-center justify-center overflow-hidden">
          {ev.image_url && !imgFailed ? (
            <img
              src={resolveImageUrl(ev.image_url)}
              alt={displayName}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <svg className="w-10 h-10 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg">{displayName}</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {displayDate}
            {ev.is_festival ? " · Festival day — general admission unavailable" : ""}
          </p>
          <span className="inline-block mt-2 text-sm font-medium text-[var(--primary)]">
            Learn more &amp; get tickets →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const supabase = useSupabaseBrowserClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { member } = useMember();

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    void supabase
      .from("events")
      .select("id, name, slug, description, start_date, end_date, start_time, end_time, image_url, is_festival, is_members_only")
      .eq("is_active", true)
      .order("start_date", { ascending: true })
      .then(({ data, error }: { data: Event[] | null; error: unknown }) => {
        if (cancelled) return;
        if (!error && data) {
          const filtered = member ? data : data.filter((e) => !e.is_members_only);
          setEvents(filtered);
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [member, supabase]);

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

      <div className="px-6 pt-4 pb-6">
        <h2 className="text-2xl font-semibold mb-2">All Special Events</h2>
        <p className="text-[var(--text-muted)]">
          Yoga, concerts, workshops, and seasonal experiences.
        </p>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-[var(--text-muted)]">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
          <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-medium text-[var(--text-primary)]">No upcoming events</p>
          <p className="text-sm text-[var(--text-muted)]">Check back soon — new programs and events are added regularly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <EventCard key={ev.id} ev={ev} isMember={!!member} />
          ))}
        </div>
      )}
    </div>
  );
}
