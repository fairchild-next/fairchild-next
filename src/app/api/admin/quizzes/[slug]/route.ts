import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { QuizQuestion } from "@/lib/quiz/types";

/**
 * GET /api/admin/quizzes/[slug]
 * PATCH /api/admin/quizzes/[slug] — update title, description, questions, is_active
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { slug } = await params;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("quizzes").select("*").eq("slug", slug).single();

  if (error || !data) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  return NextResponse.json({ quiz: data });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const { slug } = await params;
  const body = await req.json() as {
    title?: string;
    description?: string;
    questions?: QuizQuestion[];
    is_active?: boolean;
  };

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.questions !== undefined) {
    updates.questions = body.questions;
    updates.question_count = body.questions.length;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("quizzes")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  return NextResponse.json({ quiz: data });
}
