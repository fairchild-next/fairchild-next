import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getScheduledAdmissionConfig } from "@/lib/admission/config";

/**
 * GET /api/admission/settings
 * Public read — whether scheduled tickets require time slot selection.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const config = await getScheduledAdmissionConfig(supabase);
  return NextResponse.json(config);
}
