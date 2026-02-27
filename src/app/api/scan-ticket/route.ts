import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { qr_code } = await req.json();

    if (!qr_code) {
      return NextResponse.json(
        { status: "invalid_request" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

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