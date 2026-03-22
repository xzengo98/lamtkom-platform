import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AdminEmptyState from "@/components/admin/admin-empty-state";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  section?: string;
  category?: string;
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

type PointStatRow = {
  points: number;
};

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
}) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.sectionId) query.set("section", params.sectionId);
  if (params.categoryId) query.set("category", params.categoryId);

  const queryString = query.toString();
  return queryString ? `/admin/questions?${queryString}` : "/admin/questions";
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

    const hasFilters =
      searchQuery.length > 0 ||
      selectedSection.length > 0 ||
      selectedCategory.length > 0;

    const returnTo = buildReturnTo({
      q: searchQuery,
      sectionId: selectedSection,
      categoryId: selectedCategory,
    });

    const supabase = await getSupabaseServerClient();

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
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
          فشل تحميل الأقسام: {sectionsError.message}
        </div>
      );
    }

    if (categoriesError) {
      return (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
          فشل تحميل الفئات: {categoriesError.message}
        </div>
      );
    }

    const sections = (sectionsData ?? []) as SectionRow[];
    const categories = (categoriesData ?? []) as CategoryRow[];

    const filteredCategoriesForDropdown = selectedSection
      ? categories.filter((category) => category.section_id === selectedSection)
      : categories;

    let questions: QuestionRow[] = [];
    let totalFilteredCount = 0;
    let count200 = 0;
    let count400 = 0;
    let count600 = 0;

    if (hasFilters) {
      let allowedCategoryIds: string[] | null = null;

      if (selectedSection) {
        allowedCategoryIds = categories
          .filter((category) => category.section_id === selectedSection)
          .map((category) => category.id);
      }

      if (selectedCategory) {
        allowedCategoryIds = [selectedCategory];
      }

      if (allowedCategoryIds && allowedCategoryIds.length === 0) {
        questions = [];
      } else {
        let statsQuery = supabase
          .from("questions")
          .select("points")
          .order("created_at", { ascending: false });

        if (searchQuery) {
          statsQuery = statsQuery.or(
            `question_text.ilike.%${searchQuery}%,answer_text.ilike.%${searchQuery}%`,
          );
        }

        if (allowedCategoryIds && allowedCategoryIds.length > 0) {
          statsQuery = statsQuery.in("category_id", allowedCategoryIds);
        }

        const { data: statsData, error: statsError } = await statsQuery;

        if (statsError) {
          return (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
              فشل تحميل إحصائيات الأسئلة: {statsError.message}
            </div>
          );
        }

        const pointRows = (statsData ?? []) as PointStatRow[];

        totalFilteredCount = pointRows.length;
        count200 = pointRows.filter((item) => item.points === 200).length;
        count400 = pointRows.filter((item) => item.points === 400).length;
        count600 = pointRows.filter((item) => item.points === 600).length;

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
          .limit(150);

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
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
              فشل تحميل الأسئلة: {error.message}
            </div>
          );
        }

        questions = (data ?? []) as unknown as QuestionRow[];
      }
    }

    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="إدارة الأسئلة"
          description="فلتر الأسئلة بسرعة، راقب الصور داخل السؤال والإجابة، وعدّل أو احذف بدون فقدان الفلترة الحالية."
          action={
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/questions/import"
                className="inline-flex items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-bold text-amber-100 transition hover:bg-amber-500/20"
              >
                رفع أسئلة بالجملة
              </Link>

              <Link
                href="/admin/questions/new"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                إضافة سؤال جديد
              </Link>
            </div>
          }
        />

        <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <form className="grid gap-4 xl:grid-cols-[1.1fr_0.8fr_0.8fr_auto_auto] xl:items-end">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                البحث بنص السؤال
              </label>
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder="اكتب جزءًا من السؤال أو الإجابة..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                القسم
              </label>
              <select
                name="section"
                defaultValue={selectedSection}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
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
              <label className="mb-2 block text-sm font-bold text-white">
                الفئة
              </label>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="">كل الفئات</option>
                {filteredCategoriesForDropdown.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-cyan-500 px-6 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              بحث / فلترة
            </button>

            <Link
              href="/admin/questions"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-bold text-white transition hover:bg-white/10"
            >
              تصفير
            </Link>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              الفلترة الحالية محفوظة داخل الرابط
            </div>

            {hasFilters ? (
              <>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100">
                  عدد النتائج: {totalFilteredCount}
                </div>

                <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-100">
                  200 نقطة: {count200}
                </div>

                <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-bold text-sky-100">
                  400 نقطة: {count400}
                </div>

                <div className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-sm font-bold text-fuchsia-100">
                  600 نقطة: {count600}
                </div>
              </>
            ) : (
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
                ابدأ بالبحث أو اختيار قسم/فئة لإظهار النتائج
              </div>
            )}
          </div>
        </section>

        {!hasFilters ? (
          <div className="space-y-4">
            <AdminEmptyState
              title="لا توجد نتائج بعد"
              description="استخدم البحث أو الفلترة بالقسم أو الفئة، وبعدها ستظهر لك الأسئلة وتوزيعها حسب النقاط."
              buttonText="إضافة سؤال جديد"
            />
            <div className="flex justify-center">
              <Link
                href="/admin/questions/new"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                إضافة سؤال جديد
              </Link>
            </div>
          </div>
        ) : questions.length > 0 ? (
          <section className="grid gap-5 xl:grid-cols-2">
            {questions.map((question) => {
              const questionPreview = truncateText(stripHtml(question.question_text));
              const answerPreview = truncateText(stripHtml(question.answer_text));
              const questionImage = extractFirstImageSrc(question.question_text);
              const answerImage = extractFirstImageSrc(question.answer_text);

              return (
                <article
                  key={question.id}
                  className="rounded-[2rem] border border-white/10 bg-[#071126] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="text-cyan-300 text-sm font-bold">سؤال</div>
                  </div>

                  <h3 className="text-3xl font-black leading-[1.5] text-white">
                    {questionPreview || "بدون نص"}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-bold text-white">
                      {getSectionName(question.categories)}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-bold text-white">
                      {getCategoryName(question.categories)}
                    </span>

                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-100">
                      {question.points} نقطة
                    </span>

                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-sm font-bold",
                        question.is_active
                          ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                          : "border-white/10 bg-white/5 text-white/70",
                      ].join(" ")}
                    >
                      {question.is_active ? "مفعّل" : "غير مفعّل"}
                    </span>

                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-sm font-bold",
                        question.is_used
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                          : "border-white/10 bg-white/5 text-white/70",
                      ].join(" ")}
                    >
                      {question.is_used ? "مستخدم" : "غير مستخدم"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 text-sm font-bold text-white/70">
                        صورة السؤال
                      </div>

                      {questionImage ? (
                        <img
                          src={questionImage}
                          alt="صورة السؤال"
                          className="h-52 w-full rounded-[1rem] object-cover"
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center rounded-[1rem] border border-white/10 bg-slate-950/40 text-white/45">
                          لا توجد صورة داخل السؤال
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 text-sm font-bold text-white/70">
                        صورة الإجابة
                      </div>

                      {answerImage ? (
                        <img
                          src={answerImage}
                          alt="صورة الإجابة"
                          className="h-52 w-full rounded-[1rem] object-cover"
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center rounded-[1rem] border border-white/10 bg-slate-950/40 text-white/45">
                          لا توجد صورة داخل الإجابة
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 text-sm font-bold text-white/70">
                      الإجابة
                    </div>
                    <p className="text-lg leading-8 text-white">
                      {answerPreview || "غير مضافة"}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/questions/edit/${question.id}?returnTo=${encodeURIComponent(
                        returnTo,
                      )}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                    >
                      تعديل
                    </Link>

                    <form action={deleteQuestion}>
                      <input type="hidden" name="id" value={question.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
                      >
                        حذف
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="space-y-4">
            <AdminEmptyState
              title="لا توجد أسئلة مطابقة"
              description="جرّب تغيير نص البحث أو القسم أو الفئة، وستظهر هنا النتائج مع توزيعها حسب النقاط."
              buttonText="إضافة سؤال جديد"
            />
            <div className="flex justify-center">
              <Link
                href="/admin/questions/new"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                إضافة سؤال جديد
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        فشل تحميل الأسئلة:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }
}