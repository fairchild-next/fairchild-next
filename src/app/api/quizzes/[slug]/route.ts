import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Quiz } from "@/lib/quiz/types";

/** GET /api/quizzes/[slug] — public quiz content (DB first) */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("quizzes")
    .select("slug, title, description, question_count, questions")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const quiz: Quiz = {
    id: slug,
    slug: data.slug,
    title: data.title,
    description: data.description ?? undefined,
    questionCount: data.question_count ?? undefined,
    questions: data.questions as Quiz["questions"],
  };

  return NextResponse.json({ quiz });
}
