import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type VendorRow = {
  id: string;
  category_slug: string;
  category_label: string;
  category_emoji: string | null;
  name: string;
  description: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
  sort_order: number;
  is_active: boolean;
};

/** GET /api/couple/vendors — public read for couple portal */
export async function GET() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("wedding_vendors")
    .select("*")
    .eq("is_active", true)
    .order("category_slug")
    .order("sort_order");

  if (error) {
    console.error("vendors public read error:", error);
    return NextResponse.json({ categories: [] });
  }

  const rows = (data ?? []) as VendorRow[];
  const categoryMap = new Map<string, {
    id: string;
    label: string;
    emoji: string;
    vendors: Omit<VendorRow, "category_slug" | "category_label" | "category_emoji">[];
  }>();

  for (const row of rows) {
    if (!categoryMap.has(row.category_slug)) {
      categoryMap.set(row.category_slug, {
        id: row.category_slug,
        label: row.category_label,
        emoji: row.category_emoji ?? "",
        vendors: [],
      });
    }
    categoryMap.get(row.category_slug)!.vendors.push({
      id: row.id,
      name: row.name,
      description: row.description,
      website: row.website,
      phone: row.phone,
      email: row.email,
      note: row.note,
      sort_order: row.sort_order,
      is_active: row.is_active,
    });
  }

  return NextResponse.json({ categories: [...categoryMap.values()] });
}
