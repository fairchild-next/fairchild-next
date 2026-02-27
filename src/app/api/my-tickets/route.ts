import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // Replace with real auth later
  const userId = "TEMP_USER_ID";

  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("user_id", userId);

  return NextResponse.json({ tickets: data });
}