import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MemberInfo = {
  id: string;
  member_id: string;
  membership_type: string;
  display_name: string | null;
  expires_at: string;
};

/**
 * GET /api/members/me
 * Returns current user's membership if they are an active member.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ member: null });
  }

  const { data: member, error } = await supabase
    .from("members")
    .select("id, member_id, membership_type, display_name, expires_at")
    .eq("user_id", user.id)
    .gte("expires_at", new Date().toISOString().split("T")[0])
    .single();

  if (error || !member) {
    return NextResponse.json({ member: null });
  }

  return NextResponse.json({
    member: member as MemberInfo,
  });
}
