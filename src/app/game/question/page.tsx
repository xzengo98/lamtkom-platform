import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import QuestionPageClient from "./question-page-client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  sessionId?: string;
  questionId?: string;
}>;

type GameSessionRow = {
  id: string;
  user_id: string;
  game_name: string;
  team_one_name: string;
  team_two_name: string;
  board_state: Record<string, unknown> | null;
};

type QuestionRow = {
  id: string;
  question_text: string;
  answer_text: string | null;
  points: number;
  category_id: string;
  year_tolerance_before?: number | null;
  year_tolerance_after?: number | null;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export default async function GameQuestionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = String(params.sessionId ?? "").trim();
  const questionId = String(params.questionId ?? "").trim();

  if (!sessionId || !questionId) {
    redirect("/game/start");
  }

  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from("game_sessions")
    .select("id, user_id, game_name, team_one_name, team_two_name, board_state")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !sessionData) {
    redirect("/game/start");
  }

  const session = sessionData as GameSessionRow;

  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .select(
      "id, question_text, answer_text, points, category_id, year_tolerance_before, year_tolerance_after",
    )
    .eq("id", questionId)
    .single();

  if (questionError || !questionData) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 text-white">
        <div className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-center">
          <h1 className="text-2xl font-black">تعذر تحميل السؤال</h1>
          <p className="mt-3 text-sm text-white/70">
            لم يتم العثور على السؤال المطلوب أو حدث خطأ أثناء التحميل.
          </p>
          <Link
            href={`/game/board?sessionId=${sessionId}`}
            className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
          >
            العودة إلى اللوحة
          </Link>
        </div>
      </div>
    );
  }

  const question = questionData as QuestionRow;

  const { data: categoryData } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("id", question.category_id)
    .single();

  const category = (categoryData as CategoryRow | null) ?? null;

  return (
    <QuestionPageClient
      sessionId={session.id}
      gameName={session.game_name}
      teamOne={session.team_one_name}
      teamTwo={session.team_two_name}
      initialBoardState={session.board_state}
      question={question}
      category={category}
    />
  );
}