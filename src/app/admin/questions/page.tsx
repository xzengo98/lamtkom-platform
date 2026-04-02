import Link from "next/link";
import Script from "next/script";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  section?: string;
  category?: string;
  page?: string;
}>;

type SectionRow = {
  id: string;
  name: string;
  slug: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  section_id: string | null;
};

type CategorySectionRelation =
  | { id?: string; name?: string; slug?: string }
  | { id?: string; name?: string; slug?: string }[]
  | null;

type CategoryRelation =
  | {
      id?: string;
      name?: string;
      slug?: string;
      category_sections?: CategorySectionRelation;
    }
  | {
      id?: string;
      name?: string;
      slug?: string;
      category_sections?: CategorySectionRelation;
    }[]
  | null;

type QuestionRow = {
  id: string;
  question_text: string;
  answer_text: string | null;
  points: number;
  is_active: boolean;
  is_used: boolean;
  category_id: string | null;
  categories: CategoryRelation;
};

type ProfileRow = {
  role: string | null;
};

const QUESTIONS_PER_PAGE = 20;

function getCategoryObject(categories: CategoryRelation) {
  if (!categories) return null;
  return Array.isArray(categories) ? (categories[0] ?? null) : categories;
}

function getSectionObject(section: CategorySectionRelation) {
  if (!section) return null;
  return Array.isArray(section) ? (section[0] ?? null) : section;
}

function getCategoryName(categories: CategoryRelation) {
  const category = getCategoryObject(categories);
  return category?.name ?? "بدون فئة";
}

function getSectionName(categories: CategoryRelation) {
  const category = getCategoryObject(categories);
  const section = getSectionObject(category?.category_sections ?? null);
  return section?.name ?? "بدون قسم";
}

function stripHtml(value: string | null) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength = 160) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractFirstImageSrc(html: string | null | undefined) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (!match?.[1]) return null;
  return decodeHtml(match[1].trim());
}

function buildReturnTo(params: {
  q: string;
  sectionId: string;
  categoryId: string;
  page: number;
}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.sectionId) query.set("section", params.sectionId);
  if (params.categoryId) query.set("category", params.categoryId);
  if (params.page > 1) query.set("page", String(params.page));
  const queryString = query.toString();
  return queryString ? `/admin/questions?${queryString}` : "/admin/questions";
}

function buildPageHref(params: {
  q: string;
  sectionId: string;
  categoryId: string;
  page: number;
}) {
  return buildReturnTo(params);
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | "dots")[] = [1];

  if (currentPage <= 3) {
    pages.push(2, 3, 4, "dots", totalPages);
    return pages;
  }

  if (currentPage >= totalPages - 2) {
    pages.push(
      "dots",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
    return pages;
  }

  pages.push(
    "dots",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "dots",
    totalPages,
  );

  return pages;
}

async function deleteQuestion(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim() || "/admin/questions";

  if (!id) {
    redirect(returnTo);
  }

  const supabase = await getSupabaseServerClient();
  await supabase.from("questions").delete().eq("id", id);

  revalidatePath("/admin/questions");
  revalidatePath("/admin");
  revalidatePath("/game/start");
  revalidatePath("/game/board");

  redirect(returnTo);
}

async function deleteSelectedQuestions(formData: FormData) {
  "use server";

  const returnTo =
    String(formData.get("returnTo") ?? "").trim() || "/admin/questions";

  const selectedIds = formData
    .getAll("selectedIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (selectedIds.length === 0) {
    redirect(returnTo);
  }

  const supabase = await getSupabaseServerClient();
  await supabase.from("questions").delete().in("id", selectedIds);

  revalidatePath("/admin/questions");
  revalidatePath("/admin");
  revalidatePath("/game/start");
  revalidatePath("/game/board");

  redirect(returnTo);
}

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  try {
    const params = await searchParams;

    const searchQuery = String(params.q ?? "").trim();
    const selectedSection = String(params.section ?? "").trim();
    const selectedCategory = String(params.category ?? "").trim();
    const currentPage = Math.max(1, Number(params.page ?? "1") || 1);

    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const typedProfile = profile as ProfileRow | null;

    if (!typedProfile || typedProfile.role !== "admin") {
      redirect("/");
    }

    const [
      { data: sectionsData, error: sectionsError },
      { data: categoriesData, error: categoriesError },
    ] = await Promise.all([
      supabase
        .from("category_sections")
        .select("id, name, slug")
        .order("sort_order", { ascending: true }),
      supabase
        .from("categories")
        .select("id, name, slug, section_id")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

    if (sectionsError) {
      return (
        <div className="mx-auto max-w-5xl p-6 text-red-400">
          فشل تحميل الأقسام: {sectionsError.message}
        </div>
      );
    }

    if (categoriesError) {
      return (
        <div className="mx-auto max-w-5xl p-6 text-red-400">
          فشل تحميل الفئات: {categoriesError.message}
        </div>
      );
    }

    const sections = (sectionsData ?? []) as SectionRow[];
    const categories = (categoriesData ?? []) as CategoryRow[];

    const filteredCategoriesForDropdown = selectedSection
      ? categories.filter((category) => category.section_id === selectedSection)
      : categories;

    const effectiveSelectedCategory =
      selectedCategory &&
      filteredCategoriesForDropdown.some((category) => category.id === selectedCategory)
        ? selectedCategory
        : "";

    let allowedCategoryIds: string[] | null = null;

    if (selectedSection) {
      allowedCategoryIds = categories
        .filter((category) => category.section_id === selectedSection)
        .map((category) => category.id);
    }

    if (effectiveSelectedCategory) {
      allowedCategoryIds = [effectiveSelectedCategory];
    }

    let countQuery = supabase
      .from("questions")
      .select("id", { count: "exact", head: true });

    if (searchQuery) {
      countQuery = countQuery.or(
        `question_text.ilike.%${searchQuery}%,answer_text.ilike.%${searchQuery}%`,
      );
    }

    if (allowedCategoryIds && allowedCategoryIds.length > 0) {
      countQuery = countQuery.in("category_id", allowedCategoryIds);
    }

    if (allowedCategoryIds && allowedCategoryIds.length === 0) {
      countQuery = supabase
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("id", "__no_results__");
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      return (
        <div className="mx-auto max-w-5xl p-6 text-red-400">
          فشل تحميل عدد الأسئلة: {countError.message}
        </div>
      );
    }

    const totalQuestions = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalQuestions / QUESTIONS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const from = (safePage - 1) * QUESTIONS_PER_PAGE;
    const to = from + QUESTIONS_PER_PAGE - 1;

    let questions: QuestionRow[] = [];

    if (!(allowedCategoryIds && allowedCategoryIds.length === 0)) {
      let query = supabase
        .from("questions")
        .select(`
          id,
          question_text,
          answer_text,
          points,
          is_active,
          is_used,
          category_id,
          categories (
            id,
            name,
            slug,
            category_sections (
              id,
              name,
              slug
            )
          )
        `)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchQuery) {
        query = query.or(
          `question_text.ilike.%${searchQuery}%,answer_text.ilike.%${searchQuery}%`,
        );
      }

      if (allowedCategoryIds && allowedCategoryIds.length > 0) {
        query = query.in("category_id", allowedCategoryIds);
      }

      const { data, error } = await query;

      if (error) {
        return (
          <div className="mx-auto max-w-5xl p-6 text-red-400">
            فشل تحميل الأسئلة: {error.message}
          </div>
        );
      }

      questions = (data ?? []) as unknown as QuestionRow[];
    }

    const returnTo = buildReturnTo({
      q: searchQuery,
      sectionId: selectedSection,
      categoryId: effectiveSelectedCategory,
      page: safePage,
    });

    const exportAllHref = "/api/admin/questions/export";
    const exportSectionHref = selectedSection
      ? `/api/admin/questions/export?section=${encodeURIComponent(selectedSection)}`
      : null;
    const exportCategoryHref = effectiveSelectedCategory
      ? `/api/admin/questions/export?category=${encodeURIComponent(
          effectiveSelectedCategory,
        )}`
      : null;

    const hasAnyFilter =
      searchQuery.length > 0 ||
      selectedSection.length > 0 ||
      effectiveSelectedCategory.length > 0;

    const visiblePages = getVisiblePages(safePage, totalPages);

    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
                  إدارة الأسئلة
                </div>
                <h1 className="text-3xl font-black text-white md:text-4xl">
                 صفحة إدارة الأسئلة 

                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
                 قم باستخدام الفلتر لتسهيل عملية الوصول الى النتائج
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/questions/new"
                  className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  إضافة سؤال جديد
                </Link>
                <Link
                  href="/admin/upload"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  رفع أسئلة بالجملة
                </Link>
              </div>
            </div>

            <form
              id="filters-form"
              method="GET"
              className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 md:grid-cols-2 xl:grid-cols-5"
            >
              <div className="xl:col-span-2">
                <label
                  htmlFor="q"
                  className="mb-2 block text-sm font-bold text-white/80"
                >
                  البحث بنص السؤال
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="اكتب جزءًا من السؤال أو الإجابة"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label
                  htmlFor="section"
                  className="mb-2 block text-sm font-bold text-white/80"
                >
                  القسم
                </label>
                <select
                  id="section"
                  name="section"
                  defaultValue={selectedSection}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="">كل الأقسام</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-bold text-white/80"
                >
                  الفئة
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={effectiveSelectedCategory}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="">كل الفئات</option>
                  {filteredCategoriesForDropdown.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-end gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  بحث / فلترة
                </button>

                <Link
                  href="/admin/questions"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  تصفير
                </Link>
              </div>
            </form>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-sm text-white/70">
                  الفلتره الحالية
                  {hasAnyFilter ? (
                    <span className="mr-2 font-black text-cyan-300">
                      • عدد النتائج: {totalQuestions}
                    </span>
                  ) : (
                    <span className="mr-2 font-black text-white/50">
                      • يتم عرض جميع الأسئلة مع تقسيم الصفحات
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={exportAllHref}
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
                  >
                    تصدير جميع الأسئلة
                  </a>

                  {exportSectionHref ? (
                    <a
                      href={exportSectionHref}
                      className="inline-flex items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/15"
                    >
                      تصدير هذا القسم
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/40">
                      اختر قسمًا لتفعيل تصدير القسم
                    </span>
                  )}

                  {exportCategoryHref ? (
                    <a
                      href={exportCategoryHref}
                      className="inline-flex items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm font-black text-violet-100 transition hover:bg-violet-400/15"
                    >
                      تصدير هذه الفئة
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/40">
                      اختر فئة لتفعيل تصدير الفئة
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form id="bulk-delete-form" action={deleteSelectedQuestions}>
            <input type="hidden" name="returnTo" value={returnTo} />
          </form>

          <div className="mb-4 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.95)_100%)] p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white">
                <input id="select-all-questions" type="checkbox" className="h-4 w-4" />
                تحديد الكل في هذه الصفحة
              </label>
              <div className="text-sm text-white/60">
                الصفحة {safePage} من {totalPages}
              </div>
            </div>

            <button
              type="submit"
              form="bulk-delete-form"
              className="inline-flex items-center justify-center rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400"
            >
              حذف المحدد
            </button>
          </div>

          {questions.length > 0 ? (
            <div className="grid gap-5">
              {questions.map((question) => {
                const questionPreview = truncateText(stripHtml(question.question_text));
                const answerPreview = truncateText(stripHtml(question.answer_text));
                const questionImage = extractFirstImageSrc(question.question_text);
                const answerImage = extractFirstImageSrc(question.answer_text);

                return (
                  <div
                    key={question.id}
                    className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.24)]"
                  >
                    <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          form="bulk-delete-form"
                          name="selectedIds"
                          value={question.id}
                          className="question-checkbox mt-1 h-5 w-5 rounded border-white/20 bg-slate-950/70"
                        />
                        <div>
                          <div className="mb-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-100">
                            سؤال
                          </div>
                          <h3 className="text-xl font-black text-white">
                            {questionPreview || "بدون نص"}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/75">
                              {getSectionName(question.categories)}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/75">
                              {getCategoryName(question.categories)}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/75">
                              {question.points} نقطة
                            </span>
                            <span
                              className={`rounded-full px-3 py-1.5 ${
                                question.is_active
                                  ? "border border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                                  : "border border-red-300/20 bg-red-400/10 text-red-100"
                              }`}
                            >
                              {question.is_active ? "مفعّل" : "غير مفعّل"}
                            </span>
                            {question.is_used ? (
                              <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1.5 text-orange-100">
                                مستخدم
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/questions/edit/${question.id}?returnTo=${encodeURIComponent(
                            returnTo,
                          )}`}
                          className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                        >
                          تعديل
                        </Link>

                        <form action={deleteQuestion}>
                          <input type="hidden" name="id" value={question.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-3 text-sm font-black text-white transition hover:bg-red-400"
                          >
                            حذف
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 text-sm font-black text-white">
                          صورة السؤال
                        </div>
                        {questionImage ? (
                          <img
                            src={questionImage}
                            alt="صورة السؤال"
                            className="h-52 w-full rounded-2xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 text-sm font-bold text-white/45">
                            لا توجد صورة داخل السؤال
                          </div>
                        )}
                      </div>

                      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 text-sm font-black text-white">
                          صورة الإجابة
                        </div>
                        {answerImage ? (
                          <img
                            src={answerImage}
                            alt="صورة الإجابة"
                            className="h-52 w-full rounded-2xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 text-sm font-bold text-white/45">
                            لا توجد صورة داخل الإجابة
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 text-sm font-black text-white">
                        الإجابة
                      </div>
                      <p className="text-sm leading-7 text-white/70">
                        {answerPreview || "غير مضافة"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center">
              <div className="mb-3 text-2xl font-black text-white">
                لا توجد نتائج مطابقة
              </div>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-white/65">
                جرّب تغيير البحث أو القسم أو الفئة، أو ارجع لعرض جميع الأسئلة.
              </p>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link
                href={buildPageHref({
                  q: searchQuery,
                  sectionId: selectedSection,
                  categoryId: effectiveSelectedCategory,
                  page: Math.max(1, safePage - 1),
                })}
                className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                  safePage === 1
                    ? "pointer-events-none border border-white/10 bg-white/5 text-white/30"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                السابق
              </Link>

              {visiblePages.map((item, index) =>
                item === "dots" ? (
                  <span
                    key={`dots-${index}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/50"
                  >
                    ...
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={buildPageHref({
                      q: searchQuery,
                      sectionId: selectedSection,
                      categoryId: effectiveSelectedCategory,
                      page: item,
                    })}
                    className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                      item === safePage
                        ? "bg-cyan-500 text-slate-950"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </Link>
                ),
              )}

              <Link
                href={buildPageHref({
                  q: searchQuery,
                  sectionId: selectedSection,
                  categoryId: effectiveSelectedCategory,
                  page: Math.min(totalPages, safePage + 1),
                })}
                className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                  safePage === totalPages
                    ? "pointer-events-none border border-white/10 bg-white/5 text-white/30"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                التالي
              </Link>
            </div>
          ) : null}
        </div>

        <Script id="admin-questions-enhancements" strategy="afterInteractive">
          {`
            (function () {
              function bindAdminQuestionPage() {
                const form = document.getElementById("filters-form");
                const section = document.getElementById("section");
                const category = document.getElementById("category");
                const selectAll = document.getElementById("select-all-questions");
                const questionCheckboxes = Array.from(document.querySelectorAll(".question-checkbox"));

                if (section && form && !section.dataset.bound) {
                  section.dataset.bound = "true";
                  section.addEventListener("change", function () {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set("section", section.value);
                    currentUrl.searchParams.delete("category");
                    const qInput = document.getElementById("q");
                    if (qInput && qInput.value) {
                      currentUrl.searchParams.set("q", qInput.value);
                    } else {
                      currentUrl.searchParams.delete("q");
                    }
                    currentUrl.searchParams.delete("page");
                    window.location.href = currentUrl.toString();
                  });
                }

                if (category && form && !category.dataset.bound) {
                  category.dataset.bound = "true";
                  category.addEventListener("change", function () {
                    form.requestSubmit();
                  });
                }

                if (selectAll && !selectAll.dataset.bound) {
                  selectAll.dataset.bound = "true";
                  selectAll.addEventListener("change", function (event) {
                    const checked = event.target.checked;
                    document.querySelectorAll(".question-checkbox").forEach(function (checkbox) {
                      checkbox.checked = checked;
                    });
                  });
                }
              }

              bindAdminQuestionPage();
              document.addEventListener("DOMContentLoaded", bindAdminQuestionPage);
            })();
          `}
        </Script>
      </main>
    );
  } catch (error) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-red-400">
        فشل تحميل الأسئلة:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }
}