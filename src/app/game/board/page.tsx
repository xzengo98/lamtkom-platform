import Link from "next/link";
import { redirect } from "next/navigation";
import GameBoardClient from "./game-board-client";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  sessionId?: string;
}>;

type GameSessionRow = {
  id: string;
  user_id: string;
  game_name: string;
  team_one_name: string;
  team_two_name: string;
  selected_category_ids: string[] | null;
  board_state: Record<string, unknown> | null;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

type SessionQuestionRow = {
  category_id: string;
  question_id: string;
  points: number;
  slot_index: number;
};

type QuestionRow = {
  id: string;
  question_text: string;
  answer_text: string | null;
  points: number;
  is_active: boolean;
  is_used: boolean;
  category_id: string;
  year_tolerance_before?: number | null;
  year_tolerance_after?: number | null;
};

export default async function GameBoardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = params.sessionId;

  if (!sessionId) {
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
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !sessionData) {
    redirect("/game/start");
  }

  const session = sessionData as GameSessionRow;

  const selectedRaw: string[] = Array.isArray(session.selected_category_ids)
    ? session.selected_category_ids.map((value) => String(value))
    : [];

  if (selectedRaw.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-black">لا توجد فئات في هذه الجلسة</h1>
          <p className="mt-4 text-white/70">
            يبدو أن الجلسة أُنشئت بدون فئات أو لم يتم حفظها بشكل صحيح.
          </p>
          <Link
            href="/game/start"
            className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 font-black text-slate-950"
          >
            الرجوع لإنشاء لعبة جديدة
          </Link>
        </div>
      </div>
    );
  }

  let categories: CategoryRow[] = [];

  const { data: categoriesByIdData } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .in("id", selectedRaw)
    .eq("is_active", true);

  const categoriesById = (categoriesByIdData ?? []) as CategoryRow[];

  if (categoriesById.length > 0) {
    const orderMap = new Map(selectedRaw.map((value, index) => [value, index]));

    categories = [...categoriesById].sort((a, b) => {
      const aOrder = orderMap.get(a.id) ?? 999;
      const bOrder = orderMap.get(b.id) ?? 999;
      return aOrder - bOrder;
    });
  } else {
    const { data: categoriesBySlugData } = await supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .in("slug", selectedRaw)
      .eq("is_active", true);

    const categoriesBySlug = (categoriesBySlugData ?? []) as CategoryRow[];

    if (categoriesBySlug.length > 0) {
      const orderMap = new Map(selectedRaw.map((value, index) => [value, index]));

      categories = [...categoriesBySlug].sort((a, b) => {
        const aOrder = orderMap.get(a.slug) ?? 999;
        const bOrder = orderMap.get(b.slug) ?? 999;
        return aOrder - bOrder;
      });
    }
  }

  if (categories.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-black">تعذر تحميل الفئات</h1>
          <p className="mt-4 text-white/70">
            الفئات المختارة في الجلسة لم يتم العثور عليها داخل قاعدة البيانات.
          </p>
          <Link
            href="/game/start"
            className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 font-black text-slate-950"
          >
            الرجوع وإنشاء لعبة جديدة
          </Link>
        </div>
      </div>
    );
  }

  const { data: sessionQuestionsData } = await supabase
    .from("game_session_questions")
    .select("category_id, question_id, points, slot_index")
    .eq("session_id", session.id)
    .order("category_id", { ascending: true })
    .order("slot_index", { ascending: true });

  let questions: QuestionRow[] = [];

  if ((sessionQuestionsData ?? []).length > 0) {
    const typedSessionQuestions = (sessionQuestionsData ?? []) as SessionQuestionRow[];

    const questionIds = typedSessionQuestions.map(
      (row: SessionQuestionRow) => String(row.question_id),
    );

    const { data: selectedQuestionsData } = await supabase
      .from("questions")
      .select(`
        id,
        question_text,
        answer_text,
        points,
        is_active,
        is_used,
        category_id,
        year_tolerance_before,
        year_tolerance_after
      `)
      .in("id", questionIds)
      .eq("is_active", true);

    const questionMap = new Map(
      ((selectedQuestionsData ?? []) as QuestionRow[]).map((item: QuestionRow) => [
        item.id,
        item,
      ]),
    );

    questions = typedSessionQuestions
      .map((row: SessionQuestionRow) => questionMap.get(String(row.question_id)) ?? null)
      .filter((item: QuestionRow | null): item is QuestionRow => Boolean(item));
  } else {
    const categoryIds = categories.map((category) => category.id);

    const { data: questionsData } = await supabase
      .from("questions")
      .select(`
        id,
        question_text,
        answer_text,
        points,
        is_active,
        is_used,
        category_id,
        year_tolerance_before,
        year_tolerance_after
      `)
      .in("category_id", categoryIds)
      .eq("is_active", true);

    questions = (questionsData ?? []) as QuestionRow[];
  }

  return (
    <GameBoardClient
      sessionId={session.id}
      userId={user.id}
      initialBoardState={session.board_state ?? null}
      gameName={session.game_name}
      teamOne={session.team_one_name}
      teamTwo={session.team_two_name}
      categories={categories}
      questions={questions}
    />
  );
}