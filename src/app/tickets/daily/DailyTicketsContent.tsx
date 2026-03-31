"use client";

import { useEffect, useState, useMemo } from "react";
import { useSupabaseBrowserClient } from "@/lib/supabase/SupabaseBrowserProvider";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity_remaining: number;
  is_active: boolean;
}

const normalizeDate = (date: Date) =>
  date.toISOString().split("T")[0];

export default function DailyTicketsContent() {
  const supabase = useSupabaseBrowserClient();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [festivalDates, setFestivalDates] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const availableDatesSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  );

  const festivalDatesSet = useMemo(
    () => new Set(festivalDates),
    [festivalDates]
  );

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    const fetchAvailableDates = async () => {
      const { data } = await supabase
        .from("time_slots")
        .select("date")
        .eq("is_active", true)
        .gt("capacity_remaining", 0);

      if (!cancelled && data) {
        const unique: string[] = Array.from(new Set(data.map((slot: { date: string }) => slot.date)));
        setAvailableDates(unique);
      }
    };
    fetchAvailableDates();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    const fetchFestivalDates = async () => {
      const { data } = await supabase
        .from("events")
        .select("start_date, end_date")
        .eq("is_festival", true)
        .eq("is_active", true);

      if (!cancelled && data) {
        const dates: string[] = [];
        for (const ev of data as { start_date: string; end_date: string }[]) {
          const start = new Date(ev.start_date + "T00:00:00");
          const end = new Date(ev.end_date + "T00:00:00");
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split("T")[0]);
          }
        }
        setFestivalDates(dates);
      }
    };
    fetchFestivalDates();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!selectedDate || !supabase) return;

    let cancelled = false;
    setLoadingSlots(true);

    const formattedDate = normalizeDate(selectedDate);
    void supabase
      .from("time_slots")
      .select("*")
      .eq("date", formattedDate)
      .eq("is_active", true)
      .gt("capacity_remaining", 0)
      .order("start_time", { ascending: true })
      .then(({ data }: { data: Slot[] | null }) => {
        if (!cancelled) {
          setSlots(data ?? []);
          setLoadingSlots(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, supabase]);

  const formatTime = (time: string) => time.slice(0, 5);

  return (
    <div className="p-6 space-y-8 bg-[var(--background)]">

      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
        Select Your Visit Date
      </h1>

      <div className="w-full min-w-0 overflow-x-auto">
        <div className="flex justify-center min-w-[280px] mx-auto">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            fromDate={new Date()}
            disabled={(date) => {
              const d = normalizeDate(date);
              return !availableDatesSet.has(d) || festivalDatesSet.has(d);
            }}
          />
        </div>
      </div>

      {selectedDate && (
        <div className="space-y-4">
          {loadingSlots ? (
            <p>Loading available times...</p>
          ) : slots.length === 0 ? (
            <p className="text-[var(--text-muted)]">
              No available times for this date.
            </p>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-[var(--text-primary)]">
                  <p className="font-medium">You must enter at your scheduled time.</p>
                  <p className="text-[var(--text-muted)] mt-0.5">A 30-minute grace period applies after your slot ends.</p>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Select Your Time
              </h2>

              <div className="space-y-3">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() =>
                      router.push(
                        `/tickets/daily/scheduled/${slot.id}`
                      )
                    }
                    className="w-full border border-[var(--surface-border)] rounded-xl p-4 text-left hover:bg-[var(--surface-border)]/50 transition text-[var(--text-primary)]"
                  >
                    {formatTime(slot.start_time)} –{" "}
                    {formatTime(slot.end_time)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}