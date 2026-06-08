import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

// If someone opens the scan URL in a browser (e.g. from an old QR), redirect to home
export async function GET(req: Request) {
  const url = new URL(req.url);
  const base =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${base}/`);
}

export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) {
    return NextResponse.json({ status: "error" }, { status: staff.status });
  }

  try {
    const { qr_code } = await req.json();

    if (!qr_code) {
      return NextResponse.json(
        { status: "invalid_request" },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdminClient();

    // Atomic optimistic lock: the UPDATE only succeeds if status is currently
    // 'unused'. Two concurrent scan requests cannot both pass — only the first
    // one to reach Postgres will match the WHERE clause; the second gets 0 rows.
    const { data: ticket, error: updateError } = await admin
      .from("tickets")
      .update({ status: "used" })
      .eq("qr_code", qr_code)
      .eq("status", "unused")
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Ticket scan update error:", updateError);
      return NextResponse.json({ status: "error" }, { status: 500 });
    }

    if (!ticket) {
      // 0 rows matched — either the QR doesn't exist or was already scanned.
      // Do a quick read to distinguish the two cases.
      const { data: existing } = await admin
        .from("tickets")
        .select("id, status")
        .eq("qr_code", qr_code)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json({ status: "not_found" });
      }

      void logAudit({
        action: "ticket.scan_failed",
        userId: staff.ok ? staff.userId : null,
        resourceType: "ticket",
        resourceId: existing.id,
        metadata: { reason: "already_used", qr_code },
      });
      return NextResponse.json({
        status: "already_used",
        ticket_id: existing.id,
      });
    }

    // Ticket was atomically marked used — log the visit and audit trail.
    if (ticket.user_id) {
      const { error: visitError } = await admin.from("visits").insert({
        user_id: ticket.user_id,
        ticket_id: ticket.id,
        visit_date: new Date().toISOString().split("T")[0],
      });
      if (visitError) console.error("Visit insert failed:", visitError);
    }

    void logAudit({
      action: "ticket.scan",
      userId: staff.ok ? staff.userId : null,
      resourceType: "ticket",
      resourceId: ticket.id,
      metadata: { ticket_type_id: ticket.ticket_type_id, order_id: ticket.order_id },
    });

    return NextResponse.json({
      status: "valid",
      ticket_id: ticket.id,
    });

  } catch (err) {
    console.error("SCAN ERROR:", err);
    return NextResponse.json(
      { status: "error" },
      { status: 500 }
    );
  }
}
