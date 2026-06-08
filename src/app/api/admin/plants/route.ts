import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** GET /api/admin/plants — list all plants ordered by sort_order */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("plants")
    .select("id, slug, common_name, scientific_name, description, did_you_know, image_url, plant_type, location, characteristics, sort_order")
    .order("sort_order", { ascending: true })
    .order("common_name", { ascending: true });

  if (error) {
    console.error("admin plants list error:", error);
    return NextResponse.json({ error: "Failed to load plants" }, { status: 500 });
  }

  return NextResponse.json({ plants: data ?? [] });
}

/** POST /api/admin/plants — create a new plant */
export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as {
    common_name: string;
    scientific_name: string;
    slug?: string;
    description?: string;
    did_you_know?: string;
    image_url?: string;
    plant_type?: string;
    location?: string;
    characteristics?: string[];
    sort_order?: number;
  };

  if (!body.common_name?.trim() || !body.scientific_name?.trim()) {
    return NextResponse.json({ error: "common_name and scientific_name are required" }, { status: 400 });
  }

  const slug = (body.slug?.trim() || body.common_name.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  );

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("plants")
    .insert({
      slug,
      common_name: body.common_name.trim(),
      scientific_name: body.scientific_name.trim(),
      description: body.description?.trim() || null,
      did_you_know: body.did_you_know?.trim() || null,
      image_url: body.image_url?.trim() || null,
      plant_type: body.plant_type?.trim() || null,
      location: body.location?.trim() || null,
      characteristics: body.characteristics ?? [],
      sort_order: body.sort_order ?? 99,
    })
    .select()
    .single();

  if (error) {
    console.error("admin plant create error:", error);
    if (error.code === "23505") {
      return NextResponse.json({ error: "A plant with that slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create plant" }, { status: 500 });
  }

  return NextResponse.json({ plant: data }, { status: 201 });
}
