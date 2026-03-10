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
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-4xl font-black">لا توجد فئات في هذه الجلسة</h1>
          <p className="mt-4 text-lg text-red-200">
            يبدو أن الجلسة أنشئت بدون فئات أو لم يتم حفظها بشكل صحيح.
          </p>
          <div className="mt-8">
            <a
              href="/game/start"
              className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white"
            >
              الرجوع لإنشاء لعبة جديدة
            </a>
          </div>
        </div>
      </main>
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
    const orderMap = new Map<string, number>(
      selectedRaw.map((value, index) => [value, index])
    );

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
      const orderMap = new Map<string, number>(
        selectedRaw.map((value, index) => [value, index])
      );

      categories = [...categoriesBySlug].sort((a, b) => {
        const aOrder = orderMap.get(a.slug) ?? 999;
        const bOrder = orderMap.get(b.slug) ?? 999;
        return aOrder - bOrder;
      });
    }
  }

  if (categories.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-4xl font-black">تعذر تحميل الفئات</h1>
          <p className="mt-4 text-lg text-red-200">
            الفئات المختارة في الجلسة لم يتم العثور عليها داخل قاعدة البيانات.
          </p>
          <div className="mt-8">
            <a
              href="/game/start"
              className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white"
            >
              الرجوع وإنشاء لعبة جديدة
            </a>
          </div>
        </div>
      </main>
    );
  }

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

  const questions = (questionsData ?? []) as QuestionRow[];

  return (
    <GameBoardClient
      sessionId={session.id}
      userId={user.id}
      initialBoardState={(session.board_state as Record<string, unknown>) ?? {}}
      gameName={session.game_name}
      teamOne={session.team_one_name}
      teamTwo={session.team_two_name}
      categories={categories}
      questions={questions}
    />
  );
}