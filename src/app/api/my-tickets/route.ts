import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function isTicketPast(
  ticket: { status: string; slot_id: string | null; event_id: string | null },
  slotBySlotId: Map<string, { date: string; end_time: string }>,
  eventByEventId: Map<string, { end_date: string; end_time: string | null }>
): boolean {
  if (ticket.status === "used") return true;
  if (ticket.event_id) {
    const ev = eventByEventId.get(ticket.event_id);
    if (ev) {
      const endDt = ev.end_time
        ? new Date(`${ev.end_date}T${ev.end_time}`)
        : new Date(`${ev.end_date}T23:59:59`);
      return endDt < new Date();
    }
    return false;
  }
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

  let { data: tickets, error: ticketsError } = await supabase
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

  // Fallback: recover orphan tickets OR generate missing tickets for paid orders with 0 tickets
  if (!tickets || tickets.length === 0) {
    const admin = createSupabaseAdminClient();
    const filters = user.email
      ? [
          { customer_email: user.email },
          { user_id: user.id },
        ]
      : [{ user_id: user.id }];
    for (const filter of filters) {
      const { data: orders } = await admin
        .from("orders")
        .select("id")
        .eq("status", "paid")
        .match(filter);
      if (orders?.length) {
        const orderIds = orders.map((o: { id: string }) => o.id);
        // 1) Recover orphan tickets (user_id null)
        const { data: orphanTickets } = await admin
          .from("tickets")
          .select("*")
          .in("order_id", orderIds)
          .is("user_id", null)
          .order("created_at", { ascending: false });
        if (orphanTickets?.length) {
          await admin
            .from("tickets")
            .update({ user_id: user.id })
            .in("order_id", orderIds)
            .is("user_id", null);
          tickets = orphanTickets;
          break;
        }
        // 2) Generate tickets for orders that have 0 tickets (webhook never ran)
        const generated: Record<string, unknown>[] = [];
        for (const order of orders) {
          const { count } = await admin
            .from("tickets")
            .select("*", { count: "exact", head: true })
            .eq("order_id", order.id);
          if (count === 0) {
            const { data: orderData } = await admin
              .from("orders")
              .select("user_id")
              .eq("id", order.id)
              .single();
            const { data: items } = await admin
              .from("order_items")
              .select("*")
              .eq("order_id", order.id);
            if (items?.length) {
              const toInsert = items.flatMap(
                (item: { id: string; ticket_type_id: string; slot_id: string | null; event_id: string | null; quantity: number }) =>
                  Array.from({ length: item.quantity }, () => ({
                    order_id: order.id,
                    order_item_id: item.id,
                    ticket_type_id: item.ticket_type_id,
                    slot_id: item.slot_id,
                    event_id: item.event_id ?? null,
                    qr_code: crypto.randomUUID(),
                    status: "unused",
                    user_id: orderData?.user_id ?? user.id,
                  }))
              );
              const { data: inserted } = await admin.from("tickets").insert(toInsert).select("*");
              if (inserted) generated.push(...inserted);
            }
          }
        }
        if (generated.length > 0) {
          tickets = generated.sort(
            (a, b) => new Date((b as { created_at: string }).created_at).getTime() - new Date((a as { created_at: string }).created_at).getTime()
          );
          break;
        }
      }
    }
  }

  const slotIds = [
    ...new Set(
      (tickets ?? [])
        .map((t: { slot_id: string | null }) => t.slot_id)
        .filter(Boolean)
    ),
  ] as string[];

  let slotBySlotId = new Map<
    string,
    { date: string; start_time: string; end_time: string }
  >();
  if (slotIds.length > 0) {
    const { data: slots } = await supabase
      .from("time_slots")
      .select("id, date, start_time, end_time")
      .in("id", slotIds);
    if (slots) {
      slotBySlotId = new Map(
        slots.map(
          (s: { id: string; date: string; start_time: string; end_time: string }) => [
            s.id,
            { date: s.date, start_time: s.start_time, end_time: s.end_time },
          ]
        )
      );
    }
  }

  const ticketTypeIds = [
    ...new Set(
      (tickets ?? [])
        .map((t: { ticket_type_id?: string }) => t.ticket_type_id)
        .filter(Boolean)
    ),
  ] as string[];

  const eventIds = [
    ...new Set(
      (tickets ?? [])
        .map((t: { event_id?: string | null }) => t.event_id)
        .filter(Boolean)
    ),
  ] as string[];

  let ticketTypeById = new Map<string, string>();
  if (ticketTypeIds.length > 0) {
    const { data: types } = await supabase
      .from("ticket_types")
      .select("id, name")
      .in("id", ticketTypeIds);
    if (types) {
      ticketTypeById = new Map(
        (types as { id: string; name: string }[]).map((t) => [t.id, t.name])
      );
    }
  }

  let eventById = new Map<string, { name: string; slug: string; image_url: string | null; start_date: string; end_date: string; start_time: string | null; end_time: string | null }>();
  if (eventIds.length > 0) {
    const { data: evs } = await supabase
      .from("events")
      .select("id, name, slug, image_url, start_date, end_date, start_time, end_time")
      .in("id", eventIds);
    if (evs) {
      eventById = new Map(
        (evs as { id: string; name: string; slug: string; image_url: string | null; start_date: string; end_date: string; start_time: string | null; end_time: string | null }[]).map((e) => [
          e.id,
          { name: e.name, slug: e.slug, image_url: e.image_url, start_date: e.start_date, end_date: e.end_date, start_time: e.start_time, end_time: e.end_time },
        ])
      );
    }
  }

  const eventByEventId = new Map(
    Array.from(eventById.entries()).map(([id, e]) => [id, { end_date: e.end_date, end_time: e.end_time }])
  );

  const usedTicketIds = (tickets ?? [])
    .filter((t: { status: string }) => t.status === "used")
    .map((t: { id: string }) => t.id);
  let visitByTicketId = new Map<string, string>();
  if (usedTicketIds.length > 0) {
    const { data: visits } = await supabase
      .from("visits")
      .select("ticket_id, visit_date")
      .in("ticket_id", usedTicketIds);
    if (visits) {
      visitByTicketId = new Map(
        (visits as { ticket_id: string; visit_date: string }[]).map((v) => [
          v.ticket_id,
          v.visit_date,
        ])
      );
    }
  }

  const enrich = (t: Record<string, unknown>) => {
    const slot = t.slot_id
      ? slotBySlotId.get(t.slot_id as string)
      : undefined;
    const visitDate = visitByTicketId.get(t.id as string);
    const ev = t.event_id ? eventById.get(t.event_id as string) : undefined;
    return {
      ...t,
      ticket_type_name: ticketTypeById.get(t.ticket_type_id as string) ?? "Ticket",
      slot_date: slot?.date,
      slot_start_time: slot?.start_time,
      slot_end_time: slot?.end_time,
      visit_date: visitDate,
      event_name: ev?.name,
      event_slug: ev?.slug,
      event_image_url: ev?.image_url,
      event_start_date: ev?.start_date,
      event_end_date: ev?.end_date,
      event_start_time: ev?.start_time,
      event_end_time: ev?.end_time,
    };
  };

  type EnrichedTicket = Record<string, unknown>;
  const enrichedTickets: EnrichedTicket[] = (tickets ?? []).map((t) =>
    enrich(t as Record<string, unknown>)
  );

  const currentTickets = enrichedTickets.filter(
    (t) => !isTicketPast(
      t as { status: string; slot_id: string | null; event_id: string | null },
      slotBySlotId,
      eventByEventId
    )
  );
  const pastTickets = enrichedTickets.filter((t) =>
    isTicketPast(
      t as { status: string; slot_id: string | null; event_id: string | null },
      slotBySlotId,
      eventByEventId
    )
  );

  const thisYear = new Date().getFullYear().toString();
  const { count: visitCountFromDb, error: visitError } = await supabase
    .from("visits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("visit_date", `${thisYear}-01-01`)
    .lte("visit_date", `${thisYear}-12-31`);

  if (visitError) {
    console.error("my-tickets visit count error:", visitError);
  }

  const visitCount =
    (visitCountFromDb ?? 0) > 0
      ? visitCountFromDb ?? 0
      : pastTickets.length;

  const orderIds = [...new Set(pastTickets.map((t) => t.order_id as string).filter(Boolean))];
  const orderIdsCurrent = [...new Set(currentTickets.map((t) => t.order_id as string).filter(Boolean))];
  const allOrderIds = [...new Set([...orderIds, ...orderIdsCurrent])];

  const orderItemIds = [
    ...new Set(
      (tickets ?? [])
        .map((t: { order_item_id?: string }) => t.order_item_id)
        .filter(Boolean)
    ),
  ] as string[];

  let orderItemById = new Map<
    string,
    { is_peak: boolean | null; order_id: string; quantity: number; unit_price: number }
  >();
  if (orderItemIds.length > 0) {
    const { data: oi } = await supabase
      .from("order_items")
      .select("id, is_peak, order_id, quantity, unit_price")
      .in("id", orderItemIds);
    if (oi) {
      orderItemById = new Map(
        (oi as { id: string; is_peak: boolean | null; order_id: string; quantity: number; unit_price: number }[]).map(
          (item) => [item.id, { is_peak: item.is_peak, order_id: item.order_id, quantity: item.quantity, unit_price: item.unit_price }]
        )
      );
    }
  }

  let orderTotalById = new Map<string, number>();
  if (allOrderIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, quantity, unit_price")
      .in("order_id", allOrderIds);
    if (items) {
      const totals = new Map<string, number>();
      for (const item of items as { order_id: string; quantity: number; unit_price: number }[]) {
        const total = (totals.get(item.order_id) ?? 0) + item.quantity * item.unit_price;
        totals.set(item.order_id, total);
      }
      orderTotalById = new Map(
        Array.from(totals.entries()).map(([id, cents]) => [id, cents / 100])
      );
    }
  }

  const enrichWithTotalAndPeak = (t: Record<string, unknown>) => {
    const orderId = t.order_id as string;
    const orderItemId = t.order_item_id as string | undefined;
    const total = orderId ? orderTotalById.get(orderId) : undefined;
    const oi = orderItemId ? orderItemById.get(orderItemId) : undefined;
    return {
      ...t,
      order_total: total,
      is_peak: oi?.is_peak ?? null,
    };
  };

  return NextResponse.json({
    currentTickets: currentTickets.map(enrichWithTotalAndPeak),
    pastTickets: pastTickets.map(enrichWithTotalAndPeak),
    visitCount,
  });
}
