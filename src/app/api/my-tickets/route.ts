import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isTicketPast(
  ticket: { status: string; slot_id: string | null },
  slotBySlotId: Map<string, { date: string; end_time: string }>
): boolean {
  if (ticket.status === "used") return true;
  if (!ticket.slot_id) return false; // flex: not past until used
  const slot = slotBySlotId.get(ticket.slot_id);
  if (!slot) return false;
  const endDt = new Date(`${slot.date}T${slot.end_time}`);
  const graceEnd = new Date(endDt.getTime() + 30 * 60 * 1000);
  return graceEnd < new Date();
}

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { currentTickets: [], pastTickets: [], visitCount: 0 },
      { status: 200 }
    );
  }

  const { data: tickets, error: ticketsError } = await supabase
    .from("tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (ticketsError) {
    console.error("my-tickets tickets fetch error:", ticketsError);
    return NextResponse.json(
      { error: "Failed to load tickets" },
      { status: 500 }
    );
  }

  const slotIds = [
    ...new Set(
      (tickets ?? [])
        .map((t: { slot_id: string | null }) => t.slot_id)
        .filter(Boolean)
    ),
  ] as string[];

  let slotBySlotId = new Map<string, { date: string; end_time: string }>();
  if (slotIds.length > 0) {
    const { data: slots } = await supabase
      .from("time_slots")
      .select("id, date, end_time")
      .in("id", slotIds);
    if (slots) {
      slotBySlotId = new Map(
        slots.map((s: { id: string; date: string; end_time: string }) => [
          s.id,
          { date: s.date, end_time: s.end_time },
        ])
      );
    }
  }

  const currentTickets = (tickets ?? []).filter(
    (t) => !isTicketPast(t, slotBySlotId)
  );
  const pastTickets = (tickets ?? []).filter((t) =>
    isTicketPast(t, slotBySlotId)
  );

  const { count: visitCount, error: visitError } = await supabase
    .from("visits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (visitError) {
    console.error("my-tickets visit count error:", visitError);
  }

  return NextResponse.json({
    currentTickets,
    pastTickets,
    visitCount: visitCount ?? 0,
  });
}
