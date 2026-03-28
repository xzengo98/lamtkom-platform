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
  const returnTo =
    String(formData.get("returnTo") ?? "").trim() || "/admin/questions";

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
        <div className="mx-auto max-w-4xl px-4 py-10 text-red-300">
          فشل تحميل الأقسام: {sectionsError.message}
        </div>
      );
    }

    if (categoriesError) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-10 text-red-300">
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
            <div className="mx-auto max-w-4xl px-4 py-10 text-red-300">
              فشل تحميل الأسئلة: {error.message}
            </div>
          );
        }

        questions = (data ?? []) as unknown as QuestionRow[];
      }
    }

    const exportAllHref = "/api/admin/questions/export";
    const exportSectionHref = selectedSection
      ? `/api/admin/questions/export?section=${encodeURIComponent(selectedSection)}`
      : null;
    const exportCategoryHref = selectedCategory
      ? `/api/admin/questions/export?category=${encodeURIComponent(selectedCategory)}`
      : null;

    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <AdminPageHeader
  title="إدارة الأسئلة"
  description="ابحث داخل الأسئلة، عدّلها، واحذفها، وصدّرها كملف JSON جاهز للمراجعة أو إعادة الرفع."
  action={
    <div className="flex flex-wrap gap-3">
      <Link
        href="/admin/questions/new"
        className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-cyan-400 px-5 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300"
      >
        إضافة سؤال جديد
      </Link>

      <Link
        href="/admin/questions/import"
        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
      >
        رفع أسئلة بالجملة
      </Link>
    </div>
  }
/>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur">
          <form className="grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-200">
                البحث بنص السؤال
              </label>
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder="ابحث داخل السؤال أو الإجابة"
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                القسم
              </label>
              <select
                name="section"
                defaultValue={selectedSection}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
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
              <label className="mb-2 block text-sm font-bold text-slate-200">
                الفئة
              </label>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
              >
                <option value="">كل الفئات</option>
                {filteredCategoriesForDropdown.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-end gap-3 lg:col-span-4">
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300"
              >
                بحث / فلترة
              </button>

              <Link
                href="/admin/questions"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                تصفير
              </Link>

              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                الفلترة الحالية محفوظة داخل الرابط{" "}
                {hasFilters ? (
                  <span className="font-bold">• عدد النتائج: {questions.length}</span>
                ) : (
                  <span className="font-bold">
                    • ابدأ بالبحث أو اختيار قسم/فئة لإظهار النتائج
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-slate-200">
                تصدير JSON
              </div>
              <h2 className="mt-3 text-xl font-black text-white">
                تصدير الأسئلة للمراجعة الخارجية
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                يمكنك تحميل جميع الأسئلة أو تصدير قسم أو فئة محددة بنفس التنسيق
                المقبول داخل نظام الرفع لديك.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={exportAllHref}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-extrabold text-cyan-100 transition hover:bg-cyan-400/15"
              >
                تصدير جميع الأسئلة
              </Link>

              {exportSectionHref ? (
                <Link
                  href={exportSectionHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  تصدير هذا القسم
                </Link>
              ) : (
                <span className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm font-bold text-slate-400">
                  اختر قسمًا لتفعيل تصدير القسم
                </span>
              )}

              {exportCategoryHref ? (
                <Link
                  href={exportCategoryHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  تصدير هذه الفئة
                </Link>
              ) : (
                <span className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm font-bold text-slate-400">
                  اختر فئة لتفعيل تصدير الفئة
                </span>
              )}
            </div>
          </div>
        </div>

        {!hasFilters ? (
          <div className="mt-6">
            <AdminEmptyState
              title="ابدأ بالبحث أو الفلترة"
              description="اختر قسمًا أو فئة أو ابحث بالنص لعرض الأسئلة هنا، ويمكنك في أي وقت استخدام أزرار التصدير أعلاه."
            />
          </div>
        ) : questions.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {questions.map((question) => {
              const questionPreview = truncateText(stripHtml(question.question_text));
              const answerPreview = truncateText(stripHtml(question.answer_text));
              const questionImage = extractFirstImageSrc(question.question_text);
              const answerImage = extractFirstImageSrc(question.answer_text);

              return (
                <div
                  key={question.id}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur"
                >
                  <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
                    سؤال
                  </div>

                  <h3 className="text-lg font-black text-white">
                    {questionPreview || "بدون نص"}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-200">
                      {getSectionName(question.categories)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-200">
                      {getCategoryName(question.categories)}
                    </span>
                    <span className="rounded-full border border-amber-400/15 bg-amber-400/10 px-3 py-2 text-amber-100">
                      {question.points} نقطة
                    </span>
                    <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-200">
                      {question.is_active ? "مفعّل" : "غير مفعّل"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-200">
                      {question.is_used ? "مستخدم" : "غير مستخدم"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="mb-2 text-sm font-bold text-slate-200">
                        صورة السؤال
                      </div>
                      {questionImage ? (
                        <img
                          src={questionImage}
                          alt="صورة السؤال"
                          className="max-h-52 w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
                          لا توجد صورة داخل السؤال
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="mb-2 text-sm font-bold text-slate-200">
                        صورة الإجابة
                      </div>
                      {answerImage ? (
                        <img
                          src={answerImage}
                          alt="صورة الإجابة"
                          className="max-h-52 w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
                          لا توجد صورة داخل الإجابة
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="mb-2 text-sm font-bold text-slate-200">
                      الإجابة
                    </div>
                    <p className="text-sm leading-7 text-slate-300">
                      {answerPreview || "غير مضافة"}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/questions/${question.id}/edit?returnTo=${encodeURIComponent(returnTo)}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-cyan-300"
                    >
                      تعديل
                    </Link>

                    <form action={deleteQuestion}>
                      <input type="hidden" name="id" value={question.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/15"
                      >
                        حذف
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <AdminEmptyState
              title="لا توجد نتائج"
              description="لم يتم العثور على أسئلة مطابقة للفلاتر الحالية. يمكنك تعديل الفلاتر أو استخدام التصدير العام."
            />
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-red-300">
        فشل تحميل الأسئلة:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }
}