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

  const { data: sessionData } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  const session = sessionData as GameSessionRow | null;

  if (!session) {
    redirect("/game/start");
  }

  const selectedRaw: string[] = Array.isArray(session.selected_category_ids)
    ? session.selected_category_ids.map((value) => String(value))
    : [];

  let categories: CategoryRow[] = [];

  if (selectedRaw.length > 0) {
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
  }

  const categoryIds = categories.map((category) => category.id);

  let questions: QuestionRow[] = [];

  if (categoryIds.length > 0) {
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
      initialBoardState={(session.board_state as Record<string, unknown>) ?? {}}
      gameName={session.game_name}
      teamOne={session.team_one_name}
      teamTwo={session.team_two_name}
      categories={categories}
      questions={questions}
    />
  );
}