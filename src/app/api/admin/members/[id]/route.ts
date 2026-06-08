import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/admin/members/[id]
 * Staff may only update display_name.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { id } = await params;
  const body = await req.json() as { display_name?: string | null };

  if (!("display_name" in body)) {
    return NextResponse.json({ error: "display_name is required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("members")
    .update({
      display_name: body.display_name?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, user_id, member_id, membership_type, display_name, expires_at")
    .single();

  if (error) {
    console.error("member update error:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }

  return NextResponse.json({ member: data });
}
