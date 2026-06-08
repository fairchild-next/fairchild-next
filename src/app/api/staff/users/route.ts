import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type StaffRow = {
  id: string;
  user_id: string;
  created_at: string;
  email: string | null;
};

/**
 * GET /api/staff/users
 * Returns all staff members with their email addresses.
 * Requires existing staff auth.
 */
export async function GET(req: Request) {
  const caller = await requireStaff(req);
  if (!caller.ok) return NextResponse.json({ error: caller.error }, { status: caller.status });

  const admin = createSupabaseAdminClient();

  const { data: staffRows, error } = await admin
    .from("staff")
    .select("id, user_id, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("staff list error:", error);
    return NextResponse.json({ error: "Failed to load staff" }, { status: 500 });
  }

  // Hydrate emails from auth.users via admin API
  const userIds = (staffRows ?? []).map((s: { user_id: string }) => s.user_id);
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

  const members: StaffRow[] = (staffRows ?? []).map((s: { id: string; user_id: string; created_at: string }) => ({
    id: s.id,
    user_id: s.user_id,
    created_at: s.created_at,
    email: emailMap[s.user_id] ?? null,
  }));

  return NextResponse.json({ members });
}

/**
 * POST /api/staff/users
 * Add a staff member by email.
 * Body: { email }
 */
export async function POST(req: Request) {
  const caller = await requireStaff(req);
  if (!caller.ok) return NextResponse.json({ error: caller.error }, { status: caller.status });

  const body = await req.json() as { email?: string };
  const email = (body.email ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // Find the user by email
  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const user = usersData?.users?.find((u) => u.email?.toLowerCase() === email);

  if (!user) {
    return NextResponse.json(
      { error: `No account found for ${email}. They must sign up first.` },
      { status: 404 }
    );
  }

  // Upsert staff row
  const { data, error } = await admin
    .from("staff")
    .upsert({ user_id: user.id }, { onConflict: "user_id" })
    .select("id, user_id, created_at")
    .single();

  if (error) {
    console.error("staff insert error:", error);
    return NextResponse.json({ error: "Failed to add staff member" }, { status: 500 });
  }

  return NextResponse.json({
    member: { id: data.id, user_id: data.user_id, created_at: data.created_at, email },
  }, { status: 201 });
}
