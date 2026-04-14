import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../../lib/supabase/server";
import { createGameSession } from "./actions";
import StartGameForm from "./start-game-form";

export const dynamic = "force-dynamic";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  section_id: string | null;
  sort_order?: number | null;
};

type CategorySection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

type SearchParams = Promise<{
  error?: string;
}>;

type ProfileForSession = {
  games_remaining: number | null;
  account_tier: string | null;
  role: string | null;
};

type QuestionAvailabilityRow = {
  id: string;
  category_id: string;
  points: number;
};

type HistoryRow = {
  question_id: string;
  category_id: string;
};

export type CategoryAvailability = {
  availableGames: number;
  isSelectable: boolean;
  mode: "fixed" | "dynamic";
  easyCount: number;
  mediumCount: number;
  hardCount: number;
};

type ServerSupabase = Awaited<ReturnType<typeof getSupabaseServerClient>>;

const QUESTIONS_PER_GAME_PER_LEVEL = 2;
const PAGE_SIZE = 1000;

function calculateAvailableGames(
  easyCount: number,
  mediumCount: number,
  hardCount: number,
) {
  return Math.min(
    Math.floor(easyCount / QUESTIONS_PER_GAME_PER_LEVEL),
    Math.floor(mediumCount / QUESTIONS_PER_GAME_PER_LEVEL),
    Math.floor(hardCount / QUESTIONS_PER_GAME_PER_LEVEL),
  );
}

function buildCategoryAvailability(params: {
  categories: Category[];
  questions: Array<{
    id: string;
    category_id: string;
    points: number;
  }>;
  usedQuestionIds: Set<string>;
  mode: "fixed" | "dynamic";
}) {
  const { categories, questions, usedQuestionIds, mode } = params;

  const availabilityMap: Record<string, CategoryAvailability> = {};

  for (const category of categories) {
    const categoryQuestions = questions.filter(
      (question) => question.category_id === category.id,
    );

    const filtered =
      mode === "dynamic"
        ? categoryQuestions.filter((question) => !usedQuestionIds.has(question.id))
        : categoryQuestions;

    const easyCount = filtered.filter((question) => question.points === 200).length;
    const mediumCount = filtered.filter((question) => question.points === 400).length;
    const hardCount = filtered.filter((question) => question.points === 600).length;

    const availableGames = calculateAvailableGames(
      easyCount,
      mediumCount,
      hardCount,
    );

    availabilityMap[category.id] = {
      availableGames,
      isSelectable: availableGames >= 1,
      mode,
      easyCount,
      mediumCount,
      hardCount,
    };
  }

  return availabilityMap;
}

async function fetchQuestionAvailabilityPaged(
  supabase: ServerSupabase,
  categoryIds: string[],
) {
  if (categoryIds.length === 0) {
    return { data: [] as QuestionAvailabilityRow[], error: null };
  }

  let from = 0;
  const allRows: QuestionAvailabilityRow[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("questions")
      .select("id, category_id, points")
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      return { data: null as QuestionAvailabilityRow[] | null, error };
    }

    const rows = (data ?? []) as QuestionAvailabilityRow[];
    allRows.push(...rows);

    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: allRows, error: null };
}

async function fetchAllUserHistoryPaged(
  supabase: ServerSupabase,
  userId: string,
) {
  let from = 0;
  const allRows: HistoryRow[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("user_question_history")
      .select("question_id, category_id")
      .eq("user_id", userId)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      return { data: null as HistoryRow[] | null, error };
    }

    const rows = (data ?? []) as HistoryRow[];
    allRows.push(...rows);

    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: allRows, error: null };
}

export default async function GameStartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("games_remaining, account_tier, role")
    .eq("id", user.id)
    .single();

  const profile = profileData as ProfileForSession | null;

  if (!profile || (profile.games_remaining ?? 0) <= 0) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
        <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-[#071126] p-8 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <h1 className="text-3xl font-black">لا توجد ألعاب متبقية</h1>
            <p className="mt-4 text-white/75">
              تم استهلاك عدد الألعاب المتاحة لحسابك. يمكنك الرجوع للرئيسية أو شحن
              حسابك للمتابعة.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                الرجوع للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const [sectionsResult, categoriesResult] = await Promise.all([
    supabase
      .from("category_sections")
      .select("id, name, slug, description, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("categories")
      .select("id, name, slug, description, image_url, section_id, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const { data: sectionsData, error: sectionsError } = sectionsResult;
  const { data: categoriesData, error: categoriesError } = categoriesResult;

  if (sectionsError || categoriesError) {
    const message =
      sectionsError?.message ?? categoriesError?.message ?? "Unknown error";

    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
        <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-100">
            <h1 className="text-3xl font-black">فشل تحميل بيانات الإعداد</h1>
            <p className="mt-4">{message}</p>
          </div>
        </div>
      </main>
    );
  }

  const sections: CategorySection[] = Array.isArray(sectionsData)
    ? (sectionsData as CategorySection[])
    : [];

  const categories: Category[] = Array.isArray(categoriesData)
    ? (categoriesData as Category[])
    : [];

  const shouldPreventRepeat =
    profile.role === "admin" || profile.account_tier === "premium";

  const selectionMode: "fixed" | "dynamic" = shouldPreventRepeat
    ? "dynamic"
    : "fixed";

  const {
    data: availabilityRowsData,
    error: allQuestionsError,
  } = await fetchQuestionAvailabilityPaged(
    supabase,
    categories.map((category) => category.id),
  );

  if (allQuestionsError) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
        <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-100">
            <h1 className="text-3xl font-black">فشل تحميل الأسئلة</h1>
            <p className="mt-4">{allQuestionsError.message}</p>
          </div>
        </div>
      </main>
    );
  }

  const allQuestions = (availabilityRowsData ?? []) as QuestionAvailabilityRow[];

  let usedQuestionIds = new Set<string>();

  if (shouldPreventRepeat) {
    const { data: historyData, error: historyError } =
      await fetchAllUserHistoryPaged(supabase, user.id);

    if (historyError) {
      return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
          <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-100">
              <h1 className="text-3xl font-black">فشل تحميل سجل الأسئلة</h1>
              <p className="mt-4">{historyError.message}</p>
            </div>
          </div>
        </main>
      );
    }

    usedQuestionIds = new Set(
      (historyData ?? []).map((item) => String(item.question_id)),
    );
  }

  const categoryAvailability = buildCategoryAvailability({
    categories,
    questions: allQuestions,
    usedQuestionIds,
    mode: selectionMode,
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="relative">
        <StartGameForm
          sections={sections}
          categories={categories}
          gamesRemaining={profile.games_remaining ?? 0}
          action={createGameSession}
          categoryAvailability={categoryAvailability}
          selectionMode={selectionMode}
          errorMessage={params.error ?? ""}
        />
      </div>
    </main>
  );
}