import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "ticket.scan"
  | "ticket.scan_failed"
  | "payment.completed"
  | "member.reserve"
  | "staff.action";

type AuditPayload = {
  action: AuditAction;
  userId?: string | null;
  resourceType?: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
};

/**
 * Write an audit log entry. Best-effort — never throws so a logging
 * failure never breaks the calling request.
 */
export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("audit_log").insert({
      action: payload.action,
      user_id: payload.userId ?? null,
      resource_type: payload.resourceType ?? null,
      resource_id: payload.resourceId ?? null,
      metadata: payload.metadata ?? null,
      ip_address: payload.ipAddress ?? null,
    });
  } catch (err) {
    console.error("[audit] Failed to write audit log:", err);
  }
}
