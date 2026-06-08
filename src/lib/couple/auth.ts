import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns true if the given userId has an active row in wedding_coordinators.
 * Being in the `staff` table alone is no longer sufficient for coordinator access —
 * a coordinator entry must be explicitly created (staff or external).
 */
export async function isCoordinator(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("wedding_coordinators")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();
  return !!data;
}

/**
 * Server-side guard: verifies the request is from an authenticated coordinator.
 * Returns the user + coordinator row, or an error response shape.
 */
export async function requireCoordinator(req?: Request): Promise<
  | { ok: true; userId: string; supabase: SupabaseClient }
  | { ok: false; status: number; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, status: 401, error: "Not authenticated" };
  }

  const coordinator = await isCoordinator(supabase, user.id);
  if (!coordinator) {
    return { ok: false, status: 403, error: "Coordinator access required" };
  }

  return { ok: true, userId: user.id, supabase };
}
