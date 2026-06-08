import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * DELETE /api/staff/users/[id]
 * Removes a staff member by their staff row ID.
 * A staff member cannot remove themselves.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const caller = await requireStaff(_req);
  if (!caller.ok) return NextResponse.json({ error: caller.error }, { status: caller.status });

  const admin = createSupabaseAdminClient();

  // Fetch the row to check it's not the caller
  const { data: row } = await admin
    .from("staff")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!row) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });

  if (row.user_id === caller.userId) {
    return NextResponse.json({ error: "You cannot remove yourself" }, { status: 422 });
  }

  const { error } = await admin.from("staff").delete().eq("id", id);

  if (error) {
    console.error("staff delete error:", error);
    return NextResponse.json({ error: "Failed to remove staff member" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
