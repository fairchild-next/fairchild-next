import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/ticket-types?event_id=...
 * Returns ticket types for a specific event (or all daily admission types if no event_id).
 */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event_id");

  const admin = createSupabaseAdminClient();
  const query = admin
    .from("ticket_types")
    .select("id, name, price, price_peak, is_active, event_id")
    .order("name");

  if (eventId) {
    query.eq("event_id", eventId);
  } else {
    query.is("event_id", null);
  }

  const { data, error } = await query;
  if (error) {
    console.error("ticket types fetch error:", error);
    return NextResponse.json({ error: "Failed to load ticket types" }, { status: 500 });
  }

  return NextResponse.json({ ticket_types: data ?? [] });
}

/**
 * POST /api/admin/ticket-types
 * Create a new ticket type. Body: { name, price, price_peak?, event_id? }
 */
export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as {
    name: string;
    price: number;
    price_peak?: number;
    event_id?: string | null;
  };

  if (!body.name?.trim() || body.price == null) {
    return NextResponse.json({ error: "name and price are required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("ticket_types")
    .insert({
      name: body.name.trim(),
      price: body.price,
      price_peak: body.price_peak ?? body.price,
      is_active: true,
      event_id: body.event_id ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("ticket type create error:", error);
    return NextResponse.json({ error: "Failed to create ticket type" }, { status: 500 });
  }

  return NextResponse.json({ ticket_type: data }, { status: 201 });
}
