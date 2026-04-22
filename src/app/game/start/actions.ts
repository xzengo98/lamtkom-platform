"use server";
import { createAutomaticGameCreatedNotifications } from "@/lib/notifications/server";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  section_id: string | null;
  sort_order?: number | null;
};

type ProfileForSession = {
  games_remaining: number | null;
  account_tier: string | null;
  role: string | null;
};

type QuestionCandidate = {
  id: string;
  category_id: string;
  points: number;
  created_at: string | null;
};

type SessionQuestionInsertRow = {
  category_id: string;
  question_id: string;
  points: number;
  slot_index: number;
};

type CategoryAvailability = {
  availableGames: number;
  isSelectable: boolean;
  mode: "fixed" | "dynamic";
  easyCount: number;
  mediumCount: number;
  hardCount: number;
};

type HistoryRow = {
  question_id: string;
  category_id: string;
};

type ServerSupabase = Awaited<ReturnType<typeof getSupabaseServerClient>>;

const REQUIRED_CATEGORY_COUNT = 6;
const QUESTIONS_PER_GAME_PER_LEVEL = 2;
const QUESTION_TIMER_SECONDS = 30;
const PAGE_SIZE = 1000;
const MAX_GAME_NAME_LENGTH = 80;
const MAX_TEAM_NAME_LENGTH = 50;

function redirectWithError(message: string): never {
  redirect(`/game/start?error=${encodeURIComponent(message)}`);
}

function normalizeText(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function parseSelectedCategoryIds(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return {
      rawIds: [] as string[],
      uniqueIds: [] as string[],
    };
  }

  const rawIds = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const uniqueIds = Array.from(new Set(rawIds));

  return { rawIds, uniqueIds };
}

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function calculateAvailableGames(
  easyCount: number,
  mediumCount: number,
  hardCount: number
) {
  return Math.min(
    Math.floor(easyCount / QUESTIONS_PER_GAME_PER_LEVEL),
    Math.floor(mediumCount / QUESTIONS_PER_GAME_PER_LEVEL),
    Math.floor(hardCount / QUESTIONS_PER_GAME_PER_LEVEL)
  );
}

function buildSessionQuestions(params: {
  selectedCategoryIds: string[];
  allQuestions: QuestionCandidate[];
  usedQuestionIds: Set<string>;
  shouldRandomize: boolean;
  categories: Category[];
}) {
  const {
    selectedCategoryIds,
    allQuestions,
    usedQuestionIds,
    shouldRandomize,
    categories,
  } = params;

  const rows: SessionQuestionInsertRow[] = [];

  const slotStarts = [
    { points: 200, startSlot: 0 },
    { points: 400, startSlot: 2 },
    { points: 600, startSlot: 4 },
  ] as const;

  for (const categoryId of selectedCategoryIds) {
    const categoryName =
      categories.find((item) => item.id === categoryId)?.name ?? "فئة غير معروفة";

    const categoryQuestions = allQuestions.filter(
      (question) => question.category_id === categoryId
    );

    for (const slotGroup of slotStarts) {
      let pool = categoryQuestions.filter(
        (question) => question.points === slotGroup.points
      );

      if (shouldRandomize) {
        pool = pool.filter((question) => !usedQuestionIds.has(question.id));
        pool = shuffleArray(pool);
      } else {
        pool = [...pool].sort((a, b) => {
          const dateCompare = (a.created_at ?? "").localeCompare(
            b.created_at ?? ""
          );

          if (dateCompare !== 0) return dateCompare;
          return a.id.localeCompare(b.id);
        });
      }

      const picked = pool.slice(0, QUESTIONS_PER_GAME_PER_LEVEL);

      if (picked.length < QUESTIONS_PER_GAME_PER_LEVEL) {
        return {
          error: shouldRandomize
            ? `الفئة "${categoryName}" لا تحتوي على عدد كافٍ من أسئلة ${slotGroup.points} غير المستخدمة.`
            : `الفئة "${categoryName}" لا تحتوي على عدد كافٍ من أسئلة ${slotGroup.points}.`,
          rows: [] as SessionQuestionInsertRow[],
        };
      }

      picked.forEach((question, index) => {
        rows.push({
          category_id: categoryId,
          question_id: question.id,
          points: slotGroup.points,
          slot_index: slotGroup.startSlot + index,
        });
      });
    }
  }

  return { error: null, rows };
}

function buildCategoryAvailability(params: {
  categories: Category[];
  questions: QuestionCandidate[];
  usedQuestionIds: Set<string>;
  mode: "fixed" | "dynamic";
}) {
  const { categories, questions, usedQuestionIds, mode } = params;

  const availabilityMap: Record<string, CategoryAvailability> = {};

  for (const category of categories) {
    const categoryQuestions = questions.filter(
      (question) => question.category_id === category.id
    );

    const filtered =
      mode === "dynamic"
        ? categoryQuestions.filter((question) => !usedQuestionIds.has(question.id))
        : categoryQuestions;

    const easyCount = filtered.filter((question) => question.points === 200).length;
    const mediumCount = filtered.filter(
      (question) => question.points === 400
    ).length;
    const hardCount = filtered.filter((question) => question.points === 600).length;

    const availableGames = calculateAvailableGames(
      easyCount,
      mediumCount,
      hardCount
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

async function fetchAllQuestionsPaged(
  supabase: ServerSupabase,
  categoryIds: string[]
) {
  if (categoryIds.length === 0) {
    return { data: [] as QuestionCandidate[], error: null };
  }

  let from = 0;
  const allRows: QuestionCandidate[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("questions")
      .select("id, category_id, points, created_at")
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      return { data: null as QuestionCandidate[] | null, error };
    }

    const rows = (data ?? []) as QuestionCandidate[];
    allRows.push(...rows);

    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: allRows, error: null };
}

async function fetchAllUserHistoryPaged(
  supabase: ServerSupabase,
  userId: string
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

export async function createGameSession(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const gameName = normalizeText(formData.get("gameName"), MAX_GAME_NAME_LENGTH);
  const teamOne = normalizeText(formData.get("teamOne"), MAX_TEAM_NAME_LENGTH);
  const teamTwo = normalizeText(formData.get("teamTwo"), MAX_TEAM_NAME_LENGTH);

  const { rawIds: rawSelectedCategoryIds, uniqueIds: selectedCategoryIds } =
    parseSelectedCategoryIds(formData.get("selectedCategories"));

  if (!gameName || !teamOne || !teamTwo) {
    redirectWithError("اسم اللعبة واسم الفريق الأول واسم الفريق الثاني مطلوبة.");
  }

  if (rawSelectedCategoryIds.length !== REQUIRED_CATEGORY_COUNT) {
    redirectWithError(`يجب اختيار ${REQUIRED_CATEGORY_COUNT} فئات بالضبط.`);
  }

  if (selectedCategoryIds.length !== REQUIRED_CATEGORY_COUNT) {
    redirectWithError("لا يمكن تكرار نفس الفئة أكثر من مرة.");
  }

  const { data: freshProfileData } = await supabase
    .from("profiles")
    .select("games_remaining, account_tier, role")
    .eq("id", user.id)
    .single();

  const freshProfile = freshProfileData as ProfileForSession | null;
  const currentGamesRemaining = freshProfile?.games_remaining ?? 0;
  const normalizedTier = String(freshProfile?.account_tier ?? "free").toLowerCase();
  const isVipAccount = normalizedTier === "vip";
  const hasUnlimitedGames = isVipAccount;

  if (!freshProfile || (!hasUnlimitedGames && currentGamesRemaining <= 0)) {
    redirectWithError("لا توجد ألعاب متبقية");
  }

  const preventRepeat =
    freshProfile.role === "admin" ||
    normalizedTier === "premium" ||
    normalizedTier === "vip";

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, section_id, sort_order")
    .in("id", selectedCategoryIds)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (categoriesError) {
    redirectWithError(categoriesError.message || "فشل تحميل الفئات");
  }

  const categories = (categoriesData ?? []) as Category[];

  if (categories.length !== REQUIRED_CATEGORY_COUNT) {
    redirectWithError("توجد فئة غير صالحة أو غير مفعلة ضمن الاختيارات.");
  }

  const categoryIdsFromDb = new Set(categories.map((category) => category.id));
  const hasUnknownCategory = selectedCategoryIds.some(
    (categoryId) => !categoryIdsFromDb.has(categoryId)
  );

  if (hasUnknownCategory) {
    redirectWithError("تم اكتشاف فئة غير صالحة ضمن الطلب.");
  }

  const { data: selectedQuestionsData, error: questionsError } =
    await fetchAllQuestionsPaged(supabase, selectedCategoryIds);

  if (questionsError) {
    redirectWithError(questionsError.message || "فشل تحميل الأسئلة");
  }

  const selectedQuestions = (selectedQuestionsData ?? []) as QuestionCandidate[];

  let currentUsedQuestionIds = new Set<string>();

  if (preventRepeat) {
    const { data: historyData, error: historyError } =
      await fetchAllUserHistoryPaged(supabase, user.id);

    if (historyError) {
      redirectWithError(historyError.message || "فشل تحميل سجل الأسئلة");
    }

    currentUsedQuestionIds = new Set(
      (historyData ?? []).map((item) => String(item.question_id))
    );
  }

  const selectedAvailability = buildCategoryAvailability({
    categories,
    questions: selectedQuestions,
    usedQuestionIds: currentUsedQuestionIds,
    mode: preventRepeat ? "dynamic" : "fixed",
  });

  const invalidCategory = selectedCategoryIds.find((categoryId) => {
    const availability = selectedAvailability[categoryId];
    return !availability || availability.availableGames < 1;
  });

  if (invalidCategory) {
    const categoryName =
      categories.find((item) => item.id === invalidCategory)?.name ??
      "فئة غير معروفة";

    redirectWithError(
      `الفئة "${categoryName}" لا تحتوي حاليًا على عدد كافٍ من الأسئلة لبدء لعبة كاملة.`
    );
  }

  const built = buildSessionQuestions({
    selectedCategoryIds,
    allQuestions: selectedQuestions,
    usedQuestionIds: currentUsedQuestionIds,
    shouldRandomize: preventRepeat,
    categories,
  });

  if (built.error || built.rows.length === 0) {
    redirectWithError(built.error || "تعذر تجهيز أسئلة الجلسة");
  }

  const initialBoardState = {
    teamOneScore: 0,
    teamTwoScore: 0,
    usedQuestionIds: [],
    openQuestionId: null,
    showAnswer: false,
    showWinnerPicker: false,
    timeLeft: QUESTION_TIMER_SECONDS,
    savedAt: Date.now(),
  };

  const { data: insertedSession, error: insertSessionError } = await admin
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

  if (insertSessionError || !insertedSession) {
    redirectWithError(insertSessionError?.message || "فشل إنشاء الجلسة");
  }

  const sessionQuestionRows = built.rows.map((row) => ({
    session_id: insertedSession.id,
    category_id: row.category_id,
    question_id: row.question_id,
    points: row.points,
    slot_index: row.slot_index,
  }));

  const { error: sessionQuestionsError } = await admin
    .from("game_session_questions")
    .insert(sessionQuestionRows);

  if (sessionQuestionsError) {
    await admin.from("game_sessions").delete().eq("id", insertedSession.id);
    redirectWithError(sessionQuestionsError.message || "فشل حفظ أسئلة الجلسة");
  }

  const insertedHistoryQuestionIds = Array.from(
    new Set(built.rows.map((row) => row.question_id))
  );

  if (preventRepeat) {
    const uniqueHistoryRows = Array.from(
      new Map(
        built.rows.map((row) => [
          `${row.question_id}-${row.category_id}`,
          {
            user_id: user.id,
            question_id: row.question_id,
            category_id: row.category_id,
          },
        ])
      ).values()
    );

    const { error: historyInsertError } = await admin
      .from("user_question_history")
      .insert(uniqueHistoryRows);

    if (historyInsertError) {
      await admin
        .from("game_session_questions")
        .delete()
        .eq("session_id", insertedSession.id);

      await admin.from("game_sessions").delete().eq("id", insertedSession.id);

      redirectWithError(historyInsertError.message || "فشل حفظ سجل الأسئلة");
    }
  }

  const nextRemaining = hasUnlimitedGames
    ? currentGamesRemaining
    : Math.max(currentGamesRemaining - 1, 0);

  if (!hasUnlimitedGames) {
    const { data: decrementedProfile, error: decrementError } = await admin
      .from("profiles")
      .update({
        games_remaining: nextRemaining,
      })
      .eq("id", user.id)
      .eq("games_remaining", currentGamesRemaining)
      .select("id")
      .maybeSingle();

    if (decrementError || !decrementedProfile) {
      await admin
        .from("game_session_questions")
        .delete()
        .eq("session_id", insertedSession.id);

      await admin.from("game_sessions").delete().eq("id", insertedSession.id);

      if (preventRepeat && insertedHistoryQuestionIds.length > 0) {
        await admin
          .from("user_question_history")
          .delete()
          .eq("user_id", user.id)
          .in("question_id", insertedHistoryQuestionIds);
      }

      redirectWithError(
        decrementError?.message || "تعذر تأكيد خصم اللعبة. حاول مرة أخرى.",
      );
    }
  }

  try {
    await createAutomaticGameCreatedNotifications({
      userId: user.id,
      gameName,
      remainingGames: hasUnlimitedGames ? null : nextRemaining,
      sessionId: insertedSession.id,
      isUnlimited: hasUnlimitedGames,
    });
  } catch (notificationError) {
    console.error("Failed to create automatic notifications", notificationError);
  }

  redirect(`/game/board?sessionId=${insertedSession.id}`);
}