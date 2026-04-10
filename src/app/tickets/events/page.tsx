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
        <div className="px-6 py-8 text-[var(--text-muted)]">
          No events available at the moment.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => {
            const { name: displayName, dateStr: displayDate } = getMemberEventDisplay(
              ev.slug,
              ev.name,
              ev.start_date,
              ev.end_date,
              !!member
            );
            return (
            <Link
              key={ev.id}
              href={member ? `/tickets/events/${ev.slug}?member=1` : `/tickets/events/${ev.slug}`}
              className="block"
            >
              <div className="mx-6 bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl overflow-hidden hover:border-[var(--primary)] transition">
                <div className="aspect-[2/1] relative bg-gradient-to-br from-emerald-900/40 to-transparent">
                  {ev.image_url ? (
                    <img
                      src={resolveImageUrl(ev.image_url)}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{displayName}</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {displayDate}
                    {ev.is_festival ? " · Festival (GA blocked)" : ""}
                  </p>
                  <span className="inline-block mt-2 text-sm font-medium text-[var(--primary)]">
                    Learn more & get tickets →
                  </span>
                </div>
              </div>
            </Link>
          );
          })}
        </div>
      )}
    </div>
  );
}
