import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";

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

    const supabase = staff.supabase;

    // 1️⃣ Find ticket
    const { data: ticket, error } = await supabase
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

    // 3️⃣ Mark as used
    await supabase
      .from("tickets")
      .update({ status: "used" })
      .eq("id", ticket.id);

    await supabase.from("visits").insert({
      user_id: ticket.user_id,
      ticket_id: ticket.id,
      visit_date: new Date().toISOString().split("T")[0],
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