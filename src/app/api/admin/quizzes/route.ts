import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loadDefaultQuizzes } from "@/lib/quiz/seedDefaults";

/**
 * GET /api/admin/quizzes
 * POST /api/admin/quizzes/seed — body: { seed: true } to import JSON defaults
 */
export async function GET(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("quizzes")
    .select("id, slug, title, description, question_count, is_active, updated_at")
    .order("slug");

  if (error) return NextResponse.json({ error: "Failed to load quizzes" }, { status: 500 });
  return NextResponse.json({ quizzes: data ?? [] });
}

export async function POST(req: Request) {
  const staff = await requireStaff(req);
  if (!staff.ok) return NextResponse.json({ error: staff.error }, { status: staff.status });

  const body = await req.json() as { seed?: boolean };
  if (!body.seed) {
    return NextResponse.json({ error: "Use seed: true to import defaults" }, { status: 400 });
  }

  const defaults = await loadDefaultQuizzes();
  const admin = createSupabaseAdminClient();

  for (const quiz of defaults) {
    const { error } = await admin.from("quizzes").upsert(
      {
        slug: quiz.slug,
        title: quiz.title,
        description: quiz.description ?? null,
        question_count: quiz.questionCount ?? null,
        questions: quiz.questions,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );
    if (error) {
      console.error("quiz seed error:", error);
      return NextResponse.json({ error: "Failed to seed quizzes" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, count: defaults.length });
}
