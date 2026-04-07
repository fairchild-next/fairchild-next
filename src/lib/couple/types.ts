/**
 * Shared types for the wedding couple portal.
 */

export type PortalRole = "couple" | "coordinator" | "none";

export type BookingStatus = "inquiry" | "contract_signed" | "planning" | "confirmed" | "complete";

export type WeddingBooking = {
  id: string;
  couple_user_id: string | null;
  coordinator_id: string | null;
  couple_name: string;
  partner_name: string;
  wedding_date: string | null;
  venue: string | null;
  package: string | null;
  status: BookingStatus;
  ceremony_time: string | null;
  cocktail_time: string | null;
  reception_time: string | null;
  guest_count: number | null;
  catering_notes: string | null;
  coordinator_notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type ChecklistItem = {
  id: string;
  booking_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  sort_order: number;
  created_at: string;
};

export type WeddingMessage = {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_role: "couple" | "coordinator";
  message: string;
  created_at: string;
};

export type WeddingDocument = {
  id: string;
  booking_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  category: "contract" | "floor_plan" | "menu" | "inspiration" | "other";
  created_at: string;
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  inquiry:          "Inquiry",
  contract_signed:  "Contract Signed",
  planning:         "Planning",
  confirmed:        "Confirmed",
  complete:         "Complete",
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  inquiry:          "bg-stone-100 text-stone-600",
  contract_signed:  "bg-amber-50 text-amber-700",
  planning:         "bg-sky-50 text-sky-700",
  confirmed:        "bg-emerald-50 text-emerald-700",
  complete:         "bg-slate-100 text-slate-500",
};

/** Days from today until a date string. Negative = past. */
export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export function formatTime(timeStr: string | null): string {
  if (!timeStr) return "TBD";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}
