import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/vendors
 * POST /api/admin/vendors
 */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("wedding_vendors")
    .select("*")
    .order("category_slug")
    .order("sort_order");

  if (error) return NextResponse.json({ error: "Failed to load vendors" }, { status: 500 });
  return NextResponse.json({ vendors: data ?? [] });
}

export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as {
    category_slug?: string;
    category_label?: string;
    category_emoji?: string;
    name?: string;
    description?: string;
    website?: string;
    phone?: string;
    email?: string;
    note?: string;
    sort_order?: number;
  };

  if (!body.category_slug || !body.category_label || !body.name?.trim()) {
    return NextResponse.json({ error: "category_slug, category_label, and name are required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("wedding_vendors")
    .insert({
      category_slug: body.category_slug,
      category_label: body.category_label,
      category_emoji: body.category_emoji ?? null,
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
      website: body.website?.trim() || null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      note: body.note?.trim() || null,
      sort_order: body.sort_order ?? 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  return NextResponse.json({ vendor: data }, { status: 201 });
}
