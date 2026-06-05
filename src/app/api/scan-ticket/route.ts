import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

    // 1️⃣ Find ticket
    const { data: ticket, error } = await admin
      .from("tickets")
      .select("*")
      .eq("qr_code", qr_code)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ status: "not_found" });
    }

    // 2️⃣ Check if already used
    if (ticket.status === "used") {
      return NextResponse.json({
        status: "already_used",
        ticket_id: ticket.id,
      });
    }

    // 3️⃣ Mark as used (service role — RLS blocks client writes)
    const { error: updateError } = await admin
      .from("tickets")
      .update({ status: "used" })
      .eq("id", ticket.id);

    if (updateError) {
      console.error("Ticket update failed:", updateError);
      return NextResponse.json({ status: "error" }, { status: 500 });
    }

    if (ticket.user_id) {
      const { error: visitError } = await admin.from("visits").insert({
        user_id: ticket.user_id,
        ticket_id: ticket.id,
        visit_date: new Date().toISOString().split("T")[0],
      });

      if (visitError) {
        console.error("Visit insert failed:", visitError);
      }
    }

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