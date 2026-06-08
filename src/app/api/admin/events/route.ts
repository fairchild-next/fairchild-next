import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/events
 * Returns all events ordered by sort_order then start_date.
 */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("events")
    .select("id, name, slug, description, start_date, end_date, start_time, end_time, image_url, is_festival, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: false });

  if (error) {
    console.error("admin events list error:", error);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}

/**
 * POST /api/admin/events
 * Create a new event.
 */
export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as {
    name: string;
    slug?: string;
    description?: string;
    start_date: string;
    end_date: string;
    start_time?: string;
    end_time?: string;
    image_url?: string;
    is_festival?: boolean;
    sort_order?: number;
  };

  if (!body.name?.trim() || !body.start_date || !body.end_date) {
    return NextResponse.json({ error: "name, start_date, and end_date are required" }, { status: 400 });
  }

  // Auto-generate slug from name if not provided
  const slug = (body.slug?.trim() || body.name.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  );

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("events")
    .insert({
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || null,
      start_date: body.start_date,
      end_date: body.end_date,
      start_time: body.start_time || null,
      end_time: body.end_time || null,
      image_url: body.image_url?.trim() || null,
      is_festival: body.is_festival ?? false,
      is_active: false, // New events start inactive
      sort_order: body.sort_order ?? 99,
    })
    .select()
    .single();

  if (error) {
    console.error("admin event create error:", error);
    if (error.code === "23505") {
      return NextResponse.json({ error: "An event with that slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 201 });
}
