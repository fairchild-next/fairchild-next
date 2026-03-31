import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseClientForRoute, extractBearerToken } from "@/lib/supabase/server";

/**
 * Check the request is from an authenticated staff user and return a Supabase client
 * that carries that session (cookies or Authorization: Bearer from the client).
 */
export async function requireStaff(
  req: Request
): Promise<{ ok: true; userId: string; supabase: SupabaseClient } | { ok: false; status: number; error: string }> {
  const supabase = await createSupabaseClientForRoute(req);
  const bearer = extractBearerToken(req);

  const { data: { user }, error: authError } = bearer
    ? await supabase.auth.getUser(bearer)
    : await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, status: 401, error: "Not authenticated" };
  }

  const { data: staff, error: staffErr } = await supabase
    .from("staff")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (staffErr || !staff) {
    return { ok: false, status: 403, error: "Staff access required" };
  }

  return { ok: true, userId: user.id, supabase };
}

/**
 * Insert a staff member by email. Use from admin/scripts only.
 */
export async function addStaffByEmail(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createSupabaseAdminClient();
  const { data: users } = await admin.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { ok: false, error: `No user found with email ${email}` };
  }

  const { error } = await admin
    .from("staff")
    .upsert({ user_id: user.id }, { onConflict: "user_id" });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
