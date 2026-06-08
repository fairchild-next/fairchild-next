import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CoordinatorRow = {
  id: string;
  user_id: string;
  name: string | null;
  is_active: boolean;
  created_at: string;
  email: string | null;
};

/**
 * GET /api/admin/coordinators
 * Returns all wedding coordinators with their email addresses.
 * Requires staff auth.
 */
export async function GET(req: Request) {
  const caller = await requireStaff(req);
  if (!caller.ok) return NextResponse.json({ error: caller.error }, { status: caller.status });

  const admin = createSupabaseAdminClient();

  const { data: rows, error } = await admin
    .from("wedding_coordinators")
    .select("id, user_id, name, is_active, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("coordinator list error:", error);
    return NextResponse.json({ error: "Failed to load coordinators" }, { status: 500 });
  }

  const userIds = (rows ?? []).map((r: { user_id: string }) => r.user_id);
  let emailMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (usersData?.users) {
      emailMap = Object.fromEntries(
        usersData.users
          .filter((u) => userIds.includes(u.id))
          .map((u) => [u.id, u.email ?? ""])
      );
    }
  }

  const coordinators: CoordinatorRow[] = (rows ?? []).map(
    (r: { id: string; user_id: string; name: string | null; is_active: boolean; created_at: string }) => ({
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      is_active: r.is_active,
      created_at: r.created_at,
      email: emailMap[r.user_id] ?? null,
    })
  );

  return NextResponse.json({ coordinators });
}

/**
 * POST /api/admin/coordinators
 * Add a wedding coordinator by email.
 * Body: { email, name? }
 * Requires staff auth.
 */
export async function POST(req: Request) {
  const caller = await requireStaff(req);
  if (!caller.ok) return NextResponse.json({ error: caller.error }, { status: caller.status });

  const body = await req.json() as { email?: string; name?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim() || null;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const user = usersData?.users?.find((u) => u.email?.toLowerCase() === email);

  if (!user) {
    return NextResponse.json(
      { error: `No account found for ${email}. They must sign up first at /login.` },
      { status: 404 }
    );
  }

  const { data, error } = await admin
    .from("wedding_coordinators")
    .upsert({ user_id: user.id, name, is_active: true }, { onConflict: "user_id" })
    .select("id, user_id, name, is_active, created_at")
    .single();

  if (error) {
    console.error("coordinator insert error:", error);
    return NextResponse.json({ error: "Failed to add coordinator" }, { status: 500 });
  }

  return NextResponse.json({
    coordinator: { id: data.id, user_id: data.user_id, name: data.name, is_active: data.is_active, created_at: data.created_at, email },
  }, { status: 201 });
}
