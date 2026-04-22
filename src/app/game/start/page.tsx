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
  error?: string | string[];
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
const MAX_ERROR_MESSAGE_LENGTH = 280;

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

function sanitizeMessage(
  value: string | string[] | null | undefined,
  fallback = "",
) {
  const raw = Array.isArray(value) ? value[0] ?? "" : value ?? "";
  const normalized = raw.trim();

  if (!normalized) return fallback;

  return normalized.slice(0, MAX_ERROR_MESSAGE_LENGTH);
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

function renderStatePage(params: {
  title: string;
  message: string;
  variant?: "default" | "error";
}) {
  const { title, message, variant = "default" } = params;
  const isError = variant === "error";

  return (
    <main className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div
          className={`mx-auto max-w-3xl rounded-[2rem] p-8 text-center ${
            isError
              ? "border border-red-500/20 bg-red-500/10 text-red-100"
              : "border border-white/10 bg-[#071126] text-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
          }`}
        >
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mt-4">{message}</p>

          {!isError ? (
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                الرجوع للرئيسية
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default async function GameStartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  if (!user) {
    redirect("/login");
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("games_remaining, account_tier, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return renderStatePage({
      title: "فشل التحقق من الحساب",
      message: sanitizeMessage(profileError.message, "تعذر التحقق من بيانات الحساب."),
      variant: "error",
    });
  }

  const profile = profileData as ProfileForSession | null;

  if (!profile) {
    return renderStatePage({
      title: "فشل التحقق من الحساب",
      message: "تعذر العثور على بيانات الحساب المرتبطة بهذا المستخدم.",
      variant: "error",
    });
  }

  const normalizedTier = String(profile.account_tier ?? "free").toLowerCase();
  const isVipAccount = normalizedTier === "vip";
  const canStartWithUnlimitedGames = isVipAccount;

  if (!canStartWithUnlimitedGames && (profile.games_remaining ?? 0) <= 0) {
    return renderStatePage({
      title: "لا توجد ألعاب متبقية",
      message:
        "تم استهلاك عدد الألعاب المتاحة لحسابك. يمكنك الرجوع للرئيسية أو شحن حسابك للمتابعة.",
    });
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
    const message = sanitizeMessage(
      sectionsError?.message ?? categoriesError?.message,
      "تعذر تحميل بيانات الإعداد.",
    );

    return renderStatePage({
      title: "فشل تحميل بيانات الإعداد",
      message,
      variant: "error",
    });
  }

  const sections: CategorySection[] = Array.isArray(sectionsData)
    ? (sectionsData as CategorySection[])
    : [];

  const rawCategories: Category[] = Array.isArray(categoriesData)
    ? (categoriesData as Category[])
    : [];

  const activeSectionIds = new Set(sections.map((section) => section.id));

  const categories = rawCategories.filter(
    (category) =>
      typeof category.section_id === "string" &&
      activeSectionIds.has(category.section_id),
  );

  if (sections.length === 0 || categories.length === 0) {
    return renderStatePage({
      title: "فشل تحميل بيانات الإعداد",
      message: "لا توجد أقسام أو فئات مفعلة متاحة حاليًا لبدء اللعبة.",
      variant: "error",
    });
  }

  const shouldPreventRepeat =
    profile.role === "admin" ||
    normalizedTier === "premium" ||
    normalizedTier === "vip";

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
    return renderStatePage({
      title: "فشل تحميل الأسئلة",
      message: sanitizeMessage(
        allQuestionsError.message,
        "تعذر تحميل الأسئلة الخاصة بالفئات.",
      ),
      variant: "error",
    });
  }

  const allQuestions = (availabilityRowsData ?? []) as QuestionAvailabilityRow[];

  let usedQuestionIds = new Set<string>();

  if (shouldPreventRepeat) {
    const { data: historyData, error: historyError } =
      await fetchAllUserHistoryPaged(supabase, user.id);

    if (historyError) {
      return renderStatePage({
        title: "فشل تحميل سجل الأسئلة",
        message: sanitizeMessage(
          historyError.message,
          "تعذر تحميل سجل الأسئلة السابقة.",
        ),
        variant: "error",
      });
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

  const safeErrorMessage = sanitizeMessage(params.error, "");

  return (
    <main className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative">
        <StartGameForm
          sections={sections}
          categories={categories}
          gamesRemaining={profile.games_remaining ?? 0}
          isVipAccount={isVipAccount}
          action={createGameSession}
          categoryAvailability={categoryAvailability}
          selectionMode={selectionMode}
          errorMessage={safeErrorMessage}
        />

        <footer className="mx-auto mt-8 max-w-7xl px-4 pb-8 md:px-6">
          <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

            <div className="flex flex-col items-center justify-between gap-4 px-5 py-5 text-center sm:flex-row sm:text-right">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.webp"
                  alt="لمتكم"
                  className="h-10 w-auto object-contain opacity-90"
                />
                <div>
                  <div className="text-sm font-black text-white">لمتكم</div>
                  <div className="text-xs text-white/35">
                    تجهيز الجولة يبدأ من هنا
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-white/50">
                <Link href="/" className="transition hover:text-white">
                  الرئيسية
                </Link>
                <Link href="/games" className="transition hover:text-white">
                  الألعاب
                </Link>
                <Link href="/pricing" className="transition hover:text-white">
                  الباقات
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}