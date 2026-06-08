import type { SupabaseClient } from "@supabase/supabase-js";
import { getScheduledAdmissionConfig } from "@/lib/admission/config";

/** Flex tickets = scheduled price + this upcharge (matches flex/page.tsx). */
export const FLEX_UPCHARGE = 5;

const MAX_LINE_QUANTITY = 25;
export const MAX_DONATION_DOLLARS = 500;

export type CartItemInput = {
  productType: string;
  productId: string;
  name?: string;
  price?: number;
  quantity: number;
  slotId?: string;
  /** Date-only scheduled admission (when time slots are disabled) */
  visitDate?: string;
  eventId?: string;
  isPeak?: boolean;
};

export type ValidatedCartItem = {
  productType: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  slotId: string | null;
  scheduledDate: string | null;
  eventId: string | null;
  isPeak: boolean | null;
  unitPriceCents: number;
};

type TicketTypeRow = {
  id: string;
  name: string;
  price: number;
  price_peak: number | null;
  is_active: boolean;
  event_id: string | null;
};

type AdmissionDateRow = {
  date: string;
  capacity_remaining: number;
  is_active: boolean;
};

type SlotRow = {
  id: string;
  date: string;
  capacity_remaining: number;
  is_active: boolean;
};

export class CartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartValidationError";
  }
}

export function isSlotPeak(dateStr: string): boolean {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function baseTicketPrice(
  ticket: Pick<TicketTypeRow, "price" | "price_peak">,
  isPeak: boolean
): number {
  if (isPeak && ticket.price_peak != null) {
    return Number(ticket.price_peak);
  }
  return Number(ticket.price);
}

function parseQuantity(quantity: unknown): number {
  const q = Number(quantity);
  if (!Number.isInteger(q) || q < 1 || q > MAX_LINE_QUANTITY) {
    throw new CartValidationError(
      `Quantity must be an integer between 1 and ${MAX_LINE_QUANTITY}.`
    );
  }
  return q;
}

function parseVisitDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new CartValidationError("Invalid visit date.");
  }
  return value;
}

export function validateDonationAmount(donation: unknown): number {
  const amount = Number(donation ?? 0);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new CartValidationError("Invalid donation amount.");
  }
  if (amount > MAX_DONATION_DOLLARS) {
    throw new CartValidationError(
      `Donation cannot exceed $${MAX_DONATION_DOLLARS}.`
    );
  }
  return Math.round(amount * 100) / 100;
}

/**
 * Server-side cart validation: authoritative prices from DB, capacity checks for slots.
 */
export async function validateCheckoutCart(
  admin: SupabaseClient,
  items: CartItemInput[]
): Promise<ValidatedCartItem[]> {
  if (!items?.length) {
    throw new CartValidationError("No items provided.");
  }

  const admissionConfig = await getScheduledAdmissionConfig(admin);

  const ticketIds = [...new Set(items.map((i) => i.productId))];
  const { data: ticketRows, error: ticketErr } = await admin
    .from("ticket_types")
    .select("id, name, price, price_peak, is_active, event_id")
    .in("id", ticketIds);

  if (ticketErr || !ticketRows?.length) {
    throw new CartValidationError("Invalid ticket types.");
  }

  const ticketById = new Map(
    (ticketRows as TicketTypeRow[]).map((t) => [t.id, t])
  );

  const slotIds = [
    ...new Set(
      items
        .map((i) => i.slotId)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ];

  const slotById = new Map<string, SlotRow>();
  if (slotIds.length > 0) {
    const { data: slots, error: slotErr } = await admin
      .from("time_slots")
      .select("id, date, capacity_remaining, is_active")
      .in("id", slotIds);

    if (slotErr || !slots?.length) {
      throw new CartValidationError("Invalid time slot.");
    }

    for (const slot of slots as SlotRow[]) {
      slotById.set(slot.id, slot);
    }
  }

  const slotDemand = new Map<string, number>();
  const dateDemand = new Map<string, number>();
  const visitDates = [
    ...new Set(
      items
        .map((i) => i.visitDate)
        .filter((d): d is string => typeof d === "string" && d.length > 0)
    ),
  ];
  const dateByValue = new Map<string, AdmissionDateRow>();

  if (visitDates.length > 0) {
    const { data: dates, error: dateErr } = await admin
      .from("admission_dates")
      .select("date, capacity_remaining, is_active")
      .in("date", visitDates);

    if (dateErr || !dates?.length) {
      throw new CartValidationError("Invalid visit date.");
    }

    for (const row of dates as AdmissionDateRow[]) {
      dateByValue.set(row.date, row);
    }
  }

  const validated: ValidatedCartItem[] = [];

  for (const item of items) {
    const productType = item.productType;
    const quantity = parseQuantity(item.quantity);

    if (productType === "general-daily" || productType === "membership") {
      throw new CartValidationError(
        "Member reservations must use the member reserve flow."
      );
    }

    const ticket = ticketById.get(item.productId);
    if (!ticket || !ticket.is_active) {
      throw new CartValidationError(`Ticket type not available: ${item.productId}`);
    }

    let authoritativePrice: number;
    let isPeak: boolean | null = null;
    let slotId: string | null = null;
    let scheduledDate: string | null = null;
    let eventId: string | null = null;

    switch (productType) {
      case "scheduled-daily": {
        if (ticket.event_id != null) {
          throw new CartValidationError("Invalid ticket type for scheduled admission.");
        }

        if (admissionConfig.time_slots_enabled) {
          if (!item.slotId) {
            throw new CartValidationError("Scheduled tickets require a time slot.");
          }
          const slot = slotById.get(item.slotId);
          if (!slot || !slot.is_active) {
            throw new CartValidationError("Time slot is not available.");
          }
          isPeak = isSlotPeak(slot.date);
          authoritativePrice = baseTicketPrice(ticket, isPeak);
          slotId = item.slotId;
          slotDemand.set(
            item.slotId,
            (slotDemand.get(item.slotId) ?? 0) + quantity
          );
        } else {
          if (item.slotId) {
            throw new CartValidationError("Time slots are not required for this visit date.");
          }
          const visitDate = parseVisitDate(item.visitDate);
          const admissionDate = dateByValue.get(visitDate);
          if (!admissionDate || !admissionDate.is_active) {
            throw new CartValidationError("Visit date is not available.");
          }
          isPeak = isSlotPeak(visitDate);
          authoritativePrice = baseTicketPrice(ticket, isPeak);
          scheduledDate = visitDate;
          dateDemand.set(
            visitDate,
            (dateDemand.get(visitDate) ?? 0) + quantity
          );
        }
        break;
      }

      case "flex": {
        if (item.isPeak !== true && item.isPeak !== false) {
          throw new CartValidationError("Flex tickets require peak or off-peak selection.");
        }
        if (ticket.event_id != null) {
          throw new CartValidationError("Invalid ticket type for flex admission.");
        }
        isPeak = item.isPeak;
        authoritativePrice =
          baseTicketPrice(ticket, isPeak) + FLEX_UPCHARGE;
        break;
      }

      case "special-event": {
        if (!item.eventId) {
          throw new CartValidationError("Event tickets require an event.");
        }
        if (ticket.event_id !== item.eventId) {
          throw new CartValidationError("Ticket type does not match this event.");
        }
        const { data: event, error: eventErr } = await admin
          .from("events")
          .select("id, is_active")
          .eq("id", item.eventId)
          .single();

        if (eventErr || !event?.is_active) {
          throw new CartValidationError("Event is not available.");
        }
        authoritativePrice = Number(ticket.price);
        eventId = item.eventId;
        break;
      }

      default:
        throw new CartValidationError(`Unsupported product type: ${productType}`);
    }

    validated.push({
      productType,
      productId: item.productId,
      name: ticket.name,
      price: authoritativePrice,
      quantity,
      slotId,
      scheduledDate,
      eventId,
      isPeak,
      unitPriceCents: Math.round(authoritativePrice * 100),
    });
  }

  for (const [slotId, demand] of slotDemand) {
    const slot = slotById.get(slotId);
    if (!slot) continue;
    if (slot.capacity_remaining < demand) {
      throw new CartValidationError(
        "Not enough capacity remaining for the selected time slot."
      );
    }
  }

  for (const [date, demand] of dateDemand) {
    const admissionDate = dateByValue.get(date);
    if (!admissionDate) continue;
    if (admissionDate.capacity_remaining < demand) {
      throw new CartValidationError(
        "Not enough capacity remaining for the selected visit date."
      );
    }
  }

  return validated;
}

/**
 * Member $0 reserve: validate ticket types and quantities (prices forced to $0).
 */
export async function validateMemberReserveCart(
  admin: SupabaseClient,
  items: CartItemInput[]
): Promise<ValidatedCartItem[]> {
  if (!items?.length) {
    throw new CartValidationError("No items provided.");
  }

  const ticketIds = [...new Set(items.map((i) => i.productId))];
  const { data: ticketRows, error: ticketErr } = await admin
    .from("ticket_types")
    .select("id, name, price, price_peak, is_active, event_id")
    .in("id", ticketIds);

  if (ticketErr || !ticketRows?.length) {
    throw new CartValidationError("Invalid ticket types.");
  }

  const ticketById = new Map(
    (ticketRows as TicketTypeRow[]).map((t) => [t.id, t])
  );

  const validated: ValidatedCartItem[] = [];

  for (const item of items) {
    const quantity = parseQuantity(item.quantity);
    const ticket = ticketById.get(item.productId);

    if (!ticket || !ticket.is_active) {
      throw new CartValidationError(`Ticket type not available: ${item.productId}`);
    }

    if (item.productType === "special-event") {
      if (!item.eventId || ticket.event_id !== item.eventId) {
        throw new CartValidationError("Ticket type does not match this event.");
      }
    } else if (item.productType !== "general-daily") {
      throw new CartValidationError(
        "Member reserve supports general-daily and special-event tickets only."
      );
    }

    if (ticket.event_id != null && item.eventId !== ticket.event_id) {
      throw new CartValidationError("Ticket type does not match this event.");
    }

    validated.push({
      productType: item.productType,
      productId: item.productId,
      name: ticket.name,
      price: 0,
      quantity,
      slotId: item.slotId ?? null,
      scheduledDate: null,
      eventId: item.eventId ?? ticket.event_id ?? null,
      isPeak: item.isPeak ?? null,
      unitPriceCents: 0,
    });
  }

  return validated;
}

/** Decrement slot or date capacity after successful payment (webhook). */
export async function decrementSlotCapacity(
  admin: SupabaseClient,
  orderItems: Array<{
    slot_id: string | null;
    scheduled_date?: string | null;
    quantity: number;
  }>
): Promise<void> {
  const demandBySlot = new Map<string, number>();
  const demandByDate = new Map<string, number>();

  for (const item of orderItems) {
    if (item.slot_id) {
      demandBySlot.set(
        item.slot_id,
        (demandBySlot.get(item.slot_id) ?? 0) + item.quantity
      );
    } else if (item.scheduled_date) {
      demandByDate.set(
        item.scheduled_date,
        (demandByDate.get(item.scheduled_date) ?? 0) + item.quantity
      );
    }
  }

  for (const [slotId, demand] of demandBySlot) {
    const { data: slot, error: fetchErr } = await admin
      .from("time_slots")
      .select("id, capacity_remaining")
      .eq("id", slotId)
      .single();

    if (fetchErr || !slot) {
      throw new Error(`Slot not found: ${slotId}`);
    }

    if (slot.capacity_remaining < demand) {
      throw new Error(
        `Insufficient capacity for slot ${slotId}: need ${demand}, have ${slot.capacity_remaining}`
      );
    }

    const { error: updateErr } = await admin
      .from("time_slots")
      .update({ capacity_remaining: slot.capacity_remaining - demand })
      .eq("id", slotId)
      .gte("capacity_remaining", demand);

    if (updateErr) {
      throw new Error(`Failed to decrement capacity for slot ${slotId}`);
    }
  }

  for (const [date, demand] of demandByDate) {
    const { data: admissionDate, error: fetchErr } = await admin
      .from("admission_dates")
      .select("date, capacity_remaining")
      .eq("date", date)
      .single();

    if (fetchErr || !admissionDate) {
      throw new Error(`Admission date not found: ${date}`);
    }

    if (admissionDate.capacity_remaining < demand) {
      throw new Error(
        `Insufficient capacity for date ${date}: need ${demand}, have ${admissionDate.capacity_remaining}`
      );
    }

    const { error: updateErr } = await admin
      .from("admission_dates")
      .update({ capacity_remaining: admissionDate.capacity_remaining - demand })
      .eq("date", date)
      .gte("capacity_remaining", demand);

    if (updateErr) {
      throw new Error(`Failed to decrement capacity for date ${date}`);
    }
  }
}
