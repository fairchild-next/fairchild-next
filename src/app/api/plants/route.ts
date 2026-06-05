import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { serverError } from "@/lib/api-error";

/**
 * GET /api/plants?search=&type=&location=
 * Returns plants with optional search and filter.
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";
  const location = searchParams.get("location") ?? "";

  let query = supabase
    .from("plants")
    .select("id, slug, common_name, scientific_name, description, did_you_know, image_url, plant_type, location, characteristics")
    .order("sort_order", { ascending: true });

  if (search.trim()) {
    query = query.or(`common_name.ilike.%${search}%,scientific_name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (type) {
    query = query.eq("plant_type", type);
  }
  if (location) {
    query = query.eq("location", location);
  }

  const { data, error } = await query;

  if (error) return serverError("plants GET", error);
  return NextResponse.json({ plants: data ?? [] });
}
