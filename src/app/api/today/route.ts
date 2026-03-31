import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const FAIRCHILD_COORDS = { lat: 25.677, lng: -80.273 };
const DEFAULT_HOURS = "Open 10:00 AM – 5:00 PM";
/** Shorter format for display so hours + weather fit on one line */
const DEFAULT_HOURS_DISPLAY = "10:00 AM – 5:00 PM";

type TodayResponse = {
  hours: string;
  hoursDisplay?: string; /* One-line display version */
  weather: string;
  dailyEvent: string;
};

async function fetchHours(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("garden_status")
    .select("is_closed, closure_reason, special_hours")
    .eq("date", today)
    .single();

  if (!data) return DEFAULT_HOURS;
  if (data.is_closed) {
    const closed = data.closure_reason?.trim() || "Closed today";
    return closed;
  }
  if (data.special_hours?.trim()) return data.special_hours.trim();
  return DEFAULT_HOURS;
}

function getHoursDisplay(hours: string): string {
  if (hours === DEFAULT_HOURS) return DEFAULT_HOURS_DISPLAY;
  if (hours === "Closed today") return "Closed";
  return hours;
}

async function fetchWeather(): Promise<string> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(FAIRCHILD_COORDS.lat));
    url.searchParams.set("longitude", String(FAIRCHILD_COORDS.lng));
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("timezone", "America/New_York");

    const res = await fetch(url.toString(), { next: { revalidate: 600 } });
    if (!res.ok) throw new Error("Weather fetch failed");

    const json = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const temp = json.current?.temperature_2m;
    const code = json.current?.weather_code ?? 0;

    const description = weatherCodeToDescription(code);
    if (temp != null) {
      return `${Math.round(temp)}°F ${description}`;
    }
    return description;
  } catch {
    return "—";
  }
}

function weatherCodeToDescription(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Rain Showers";
  if (code <= 99) return "Thunderstorms";
  return "—";
}

async function fetchNextEventToday(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const { data: events } = await supabase
    .from("events")
    .select("name, start_time, end_time")
    .eq("is_active", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .not("start_time", "is", null)
    .order("start_time", { ascending: true });

  if (!events?.length) return "No Upcoming Events Today";

  for (const ev of events) {
    const startTime = ev.start_time as string;
    const [h, m] = startTime.split(":").map(Number);
    const startMinutes = h * 60 + m;
    if (startMinutes >= nowMinutes) {
      const formatted = formatTime(startTime);
      return `${ev.name} at ${formatted}`;
    }
  }
  return "No Upcoming Events Today";
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export async function GET(): Promise<NextResponse<TodayResponse>> {
  const supabase = await createSupabaseServerClient();

  const [hours, weather, dailyEvent] = await Promise.all([
    fetchHours(supabase),
    fetchWeather(),
    fetchNextEventToday(supabase),
  ]);

  const hoursDisplay = getHoursDisplay(hours);
  return NextResponse.json({ hours, hoursDisplay, weather, dailyEvent });
}
