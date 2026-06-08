import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** GET /api/admin/quest-items — list all quest items */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("garden_quest_items")
    .select("id, name, hint, image_url, quest_type, zone, name_color, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("quest items list error:", error);
    return NextResponse.json({ error: "Failed to load quest items" }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

/** POST /api/admin/quest-items — create a new quest item */
export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as {
    name: string;
    hint?: string;
    image_url?: string;
    quest_type?: string;
    zone?: string;
    name_color?: string;
    sort_order?: number;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("garden_quest_items")
    .insert({
      name: body.name.trim(),
      hint: body.hint?.trim() || "",
      image_url: body.image_url?.trim() || null,
      quest_type: body.quest_type?.trim() || null,
      zone: body.zone?.trim() || null,
      name_color: body.name_color?.trim() || null,
      sort_order: body.sort_order ?? 99,
      is_active: false,
    })
    .select()
    .single();

  if (error) {
    console.error("quest item create error:", error);
    return NextResponse.json({ error: "Failed to create quest item" }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
