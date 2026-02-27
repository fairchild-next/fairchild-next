"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch all available dates (for disabling calendar)
  useEffect(() => {
    const fetchAvailableDates = async () => {
      const { data } = await supabase
        .from("time_slots")
        .select("date")
        .eq("is_active", true)
        .gt("capacity_remaining", 0);

      if (data) {
        const unique = Array.from(
          new Set(data.map((slot) => slot.date))
        );
        setAvailableDates(unique);
      }
    };

    fetchAvailableDates();
  }, [supabase]);

  // Fetch slots when date selected
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);

      const formattedDate = normalizeDate(selectedDate);

      const { data } = await supabase
        .from("time_slots")
        .select("*")
        .eq("date", formattedDate)
        .eq("is_active", true)
        .gt("capacity_remaining", 0)
        .order("start_time", { ascending: true });

      setSlots(data || []);
      setLoadingSlots(false);
    };

    fetchSlots();
  }, [selectedDate, supabase]);

  const formatTime = (time: string) => time.slice(0, 5);

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-semibold">
        Select Your Visit Date
      </h1>

      <div className="flex justify-center">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          fromDate={new Date()}
          disabled={(date) =>
            !availableDates.includes(normalizeDate(date))
          }
        />
      </div>

      {selectedDate && (
        <div className="space-y-4">
          {loadingSlots ? (
            <p>Loading available times...</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-500">
              No available times for this date.
            </p>
          ) : (
            <>
              <h2 className="text-lg font-semibold">
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
                    className="w-full border rounded-lg p-4 text-left hover:bg-gray-50"
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