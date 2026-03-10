import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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

const REQUIRED_CATEGORY_COUNT = 6;

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

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("games_remaining")
    .eq("id", user.id)
    .single();

  if (!profile || profile.games_remaining <= 0) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-center sm:p-10">
          <h1 className="text-2xl font-black sm:text-4xl">
            لا توجد ألعاب متبقية
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-lg">
            تم استهلاك عدد الألعاب المتاحة لحسابك. يمكنك الرجوع للرئيسية أو شحن
            حسابك للمتابعة.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              الرجوع للرئيسية
            </Link>
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
      <main
        dir="rtl"
        className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 text-center sm:p-10">
          <h1 className="text-2xl font-black sm:text-4xl">
            فشل تحميل بيانات الإعداد
          </h1>
          <p className="mt-4 text-sm leading-7 text-red-100 sm:text-lg">
            {message}
          </p>
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

  async function createGameSession(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const gameName = formData.get("gameName")?.toString().trim() || "";
    const teamOne = formData.get("teamOne")?.toString().trim() || "";
    const teamTwo = formData.get("teamTwo")?.toString().trim() || "";
    const selectedCategoriesRaw =
      formData.get("selectedCategories")?.toString().trim() || "";

    const selectedCategoryIds = selectedCategoriesRaw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!gameName || !teamOne || !teamTwo) {
      redirect(
        "/game/start?error=" +
          encodeURIComponent("اسم اللعبة واسم الفريق الأول واسم الفريق الثاني مطلوبة.")
      );
    }

    if (selectedCategoryIds.length !== REQUIRED_CATEGORY_COUNT) {
      redirect(
        "/game/start?error=" +
          encodeURIComponent(`يجب اختيار ${REQUIRED_CATEGORY_COUNT} فئات بالضبط.`)
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("games_remaining")
      .eq("id", user.id)
      .single();

    if (!profile || profile.games_remaining <= 0) {
      redirect(
        "/game/start?error=" + encodeURIComponent("لا توجد ألعاب متبقية")
      );
    }

    const initialBoardState = {
      teamOneScore: 0,
      teamTwoScore: 0,
      usedQuestionIds: [],
      openQuestionId: null,
      showAnswer: false,
      showWinnerPicker: false,
    };

    const { data: insertedSession, error: insertError } = await supabase
      .from("game_sessions")
      .insert({
        user_id: user.id,
        game_name: gameName,
        team_one_name: teamOne,
        team_two_name: teamTwo,
        selected_category_ids: selectedCategoryIds,
        board_state: initialBoardState,
        status: "active",
      })
      .select("id")
      .single();

    if (insertError || !insertedSession) {
      redirect(
        `/game/start?error=${encodeURIComponent(
          insertError?.message || "فشل إنشاء الجلسة"
        )}`
      );
    }

    const { error: decrementError } = await supabase
      .from("profiles")
      .update({
        games_remaining: Math.max((profile.games_remaining ?? 0) - 1, 0),
      })
      .eq("id", user.id);

    if (decrementError) {
      redirect(
        `/game/start?error=${encodeURIComponent(
          decrementError.message || "فشل خصم لعبة"
        )}`
      );
    }

    redirect(`/game/board?sessionId=${insertedSession.id}`);
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 lg:gap-8 lg:px-8 lg:pb-16 lg:pt-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-5 py-6 shadow-2xl shadow-slate-950/40 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.14),transparent_30%)]" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-cyan-200">
                  إعداد لعبة جديدة
                </span>
                <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1.5 text-orange-100">
                  اختر 6 فئات بالضبط
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black leading-tight sm:text-4xl lg:text-5xl">
                جهّز اللعبة خلال دقائق
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-lg sm:leading-8">
                اختر اسم اللعبة، أضف أسماء الفريقين، ثم حدّد ست فئات لتبدأ
                تجربة مرتبة وواضحة على الهاتف وسطح المكتب.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-center">
                <p className="text-xs text-slate-400 sm:text-sm">
                  الألعاب المتبقية
                </p>
                <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {profile.games_remaining}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-center">
                <p className="text-xs text-slate-400 sm:text-sm">
                  الفئات المطلوبة
                </p>
                <p className="mt-2 text-2xl font-black text-cyan-300 sm:text-3xl">
                  {REQUIRED_CATEGORY_COUNT}
                </p>
              </div>
            </div>
          </div>
        </section>

        {params.error ? (
          <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-100 sm:text-base">
            {params.error}
          </div>
        ) : null}

        <StartGameForm
          sections={sections}
          categories={categories}
          gamesRemaining={profile.games_remaining}
          action={createGameSession}
        />
      </div>
    </main>
  );
}