import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type MemberRow = {
  id: string;
  user_id: string;
  member_id: string;
  membership_type: string;
  display_name: string | null;
  expires_at: string;
  created_at: string;
  email: string | null;
};

/**
 * GET /api/admin/members
 * List all members with email (read-only except display_name via PATCH).
 */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { data: rows, error } = await admin
    .from("members")
    .select("id, user_id, member_id, membership_type, display_name, expires_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("members list error:", error);
    return NextResponse.json({ error: "Failed to load members" }, { status: 500 });
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

  const members: MemberRow[] = (rows ?? []).map(
    (r: { id: string; user_id: string; member_id: string; membership_type: string; display_name: string | null; expires_at: string; created_at: string }) => ({
      ...r,
      email: emailMap[r.user_id] ?? null,
    })
  );

  return NextResponse.json({ members });
}
