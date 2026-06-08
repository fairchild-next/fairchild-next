import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/staff";

/**
 * GET /api/admin/app-config?key=...
 * Public read — returns one or all config values.
 * Used by both staff portal and public homepage.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  const supabase = await createSupabaseServerClient();
  const query = supabase.from("app_config").select("key, value");
  if (key) query.eq("key", key);

  const { data, error } = await query;
  if (error) {
    console.error("app_config read error:", error);
    return NextResponse.json({ error: "Failed to read config" }, { status: 500 });
  }

  if (key) {
    const row = data?.[0];
    return NextResponse.json({ value: row?.value ?? null });
  }

  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return NextResponse.json({ config: map });
}

/**
 * POST /api/admin/app-config
 * Staff write — upsert a config value.
 * Body: { key: string, value: any }
 */
export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as { key?: string; value?: unknown };
  if (!body.key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("app_config")
    .upsert(
      { key: body.key, value: body.value, updated_at: new Date().toISOString(), updated_by: staff.userId },
      { onConflict: "key" }
    )
    .select()
    .single();

  if (error) {
    console.error("app_config write error:", error);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}
