import Link from "next/link";
import Script from "next/script";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// ─── Types (unchanged) ────────────────────────────────────────────────────────

type SearchParams = Promise<{
  q?: string;
  section?: string;
  category?: string;
  page?: string;
}>;

type SectionRow = { id: string; name: string; slug: string };
type CategoryRow = { id: string; name: string; slug: string; section_id: string | null };

type CategorySectionRelation =
  | { id?: string; name?: string; slug?: string }
  | { id?: string; name?: string; slug?: string }[]
  | null;

type CategoryRelation =
  | { id?: string; name?: string; slug?: string; category_sections?: CategorySectionRelation }
  | { id?: string; name?: string; slug?: string; category_sections?: CategorySectionRelation }[]
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

type ProfileRow = { role: string | null };

// ─── Constants & Helpers (all unchanged) ──────────────────────────────────────

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

function buildReturnTo(params: { q: string; sectionId: string; categoryId: string; page: number }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.sectionId) query.set("section", params.sectionId);
  if (params.categoryId) query.set("category", params.categoryId);
  if (params.page > 1) query.set("page", String(params.page));
  const queryString = query.toString();
  return queryString ? `/admin/questions?${queryString}` : "/admin/questions";
}

function buildPageHref(params: { q: string; sectionId: string; categoryId: string; page: number }) {
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
    pages.push("dots", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    return pages;
  }
  pages.push("dots", currentPage - 1, currentPage, currentPage + 1, "dots", totalPages);
  return pages;
}

// ─── Server Actions (unchanged) ───────────────────────────────────────────────

async function deleteQuestion(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim() || "/admin/questions";
  if (!id) redirect(returnTo);
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
  const returnTo = String(formData.get("returnTo") ?? "").trim() || "/admin/questions";
  const selectedIds = formData.getAll("selectedIds").map((value) => String(value).trim()).filter(Boolean);
  if (selectedIds.length === 0) redirect(returnTo);
  const supabase = await getSupabaseServerClient();
  await supabase.from("questions").delete().in("id", selectedIds);
  revalidatePath("/admin/questions");
  revalidatePath("/admin");
  revalidatePath("/game/start");
  revalidatePath("/game/board");
  redirect(returnTo);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function FilterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />
    </svg>
  );
}

function ResetIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function EditIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function UploadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function GridIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function HomeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5" />
    </svg>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default async function AdminQuestionsPage({ searchParams }: { searchParams: SearchParams }) {
  try {
    const params = await searchParams;

    // ── Params (unchanged) ──
    const searchQuery       = String(params.q        ?? "").trim();
    const selectedSection   = String(params.section  ?? "").trim();
    const selectedCategory  = String(params.category ?? "").trim();
    const currentPage       = Math.max(1, Number(params.page ?? "1") || 1);

    const supabase = await getSupabaseServerClient();

    // ── Auth guard (unchanged) ──
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const typedProfile = profile as ProfileRow | null;
    if (!typedProfile || typedProfile.role !== "admin") redirect("/");

    // ── Fetch sections & categories (unchanged) ──
    const [
      { data: sectionsData,   error: sectionsError },
      { data: categoriesData, error: categoriesError },
    ] = await Promise.all([
      supabase.from("category_sections").select("id, name, slug").order("sort_order", { ascending: true }),
      supabase.from("categories").select("id, name, slug, section_id").eq("is_active", true).order("sort_order", { ascending: true }),
    ]);

    if (sectionsError)   return <div className="p-6 text-red-400">فشل تحميل الأقسام: {sectionsError.message}</div>;
    if (categoriesError) return <div className="p-6 text-red-400">فشل تحميل الفئات: {categoriesError.message}</div>;

    const sections   = (sectionsData   ?? []) as SectionRow[];
    const categories = (categoriesData ?? []) as CategoryRow[];

    // ── Filter logic (unchanged) ──
    const filteredCategoriesForDropdown = selectedSection
      ? categories.filter((category) => category.section_id === selectedSection)
      : categories;

    const effectiveSelectedCategory =
      selectedCategory && filteredCategoriesForDropdown.some((category) => category.id === selectedCategory)
        ? selectedCategory
        : "";

    let allowedCategoryIds: string[] | null = null;
    if (selectedSection) {
      allowedCategoryIds = categories.filter((category) => category.section_id === selectedSection).map((category) => category.id);
    }
    if (effectiveSelectedCategory) {
      allowedCategoryIds = [effectiveSelectedCategory];
    }

    // ── Count query (unchanged) ──
    let countQuery = supabase.from("questions").select("id", { count: "exact", head: true });
    if (searchQuery) {
      countQuery = countQuery.or(`question_text.ilike.%${searchQuery}%,answer_text.ilike.%${searchQuery}%`);
    }
    if (allowedCategoryIds && allowedCategoryIds.length > 0) {
      countQuery = countQuery.in("category_id", allowedCategoryIds);
    }
    if (allowedCategoryIds && allowedCategoryIds.length === 0) {
      countQuery = supabase.from("questions").select("id", { count: "exact", head: true }).eq("id", "__no_results__");
    }

    const { count, error: countError } = await countQuery;
    if (countError) return <div className="p-6 text-red-400">فشل تحميل عدد الأسئلة: {countError.message}</div>;

    const totalQuestions = count ?? 0;
    const totalPages     = Math.max(1, Math.ceil(totalQuestions / QUESTIONS_PER_PAGE));
    const safePage       = Math.min(currentPage, totalPages);
    const from           = (safePage - 1) * QUESTIONS_PER_PAGE;
    const to             = from + QUESTIONS_PER_PAGE - 1;

    // ── Main query (unchanged) ──
    let questions: QuestionRow[] = [];
    if (!(allowedCategoryIds && allowedCategoryIds.length === 0)) {
      let query = supabase
        .from("questions")
        .select(`id, question_text, answer_text, points, is_active, is_used, category_id,
          categories ( id, name, slug, category_sections ( id, name, slug ) )`)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchQuery)    query = query.or(`question_text.ilike.%${searchQuery}%,answer_text.ilike.%${searchQuery}%`);
      if (allowedCategoryIds && allowedCategoryIds.length > 0) query = query.in("category_id", allowedCategoryIds);

      const { data, error } = await query;
      if (error) return <div className="p-6 text-red-400">فشل تحميل الأسئلة: {error.message}</div>;
      questions = (data ?? []) as unknown as QuestionRow[];
    }

    // ── Derived values (unchanged) ──
    const returnTo = buildReturnTo({ q: searchQuery, sectionId: selectedSection, categoryId: effectiveSelectedCategory, page: safePage });
    const exportAllHref      = "/api/admin/questions/export";
    const exportSectionHref  = selectedSection       ? `/api/admin/questions/export?section=${encodeURIComponent(selectedSection)}`                 : null;
    const exportCategoryHref = effectiveSelectedCategory ? `/api/admin/questions/export?category=${encodeURIComponent(effectiveSelectedCategory)}` : null;
    const hasAnyFilter       = searchQuery.length > 0 || selectedSection.length > 0 || effectiveSelectedCategory.length > 0;
    const visiblePages       = getVisiblePages(safePage, totalPages);

    // ── Labels for filter chips ──
    const activeSectionLabel   = sections.find((s) => s.id === selectedSection)?.name ?? null;
    const activeCategoryLabel  = filteredCategoriesForDropdown.find((c) => c.id === effectiveSelectedCategory)?.name ?? null;

    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_100%)]">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl" />

            <div className="relative px-6 py-8 md:px-8">
              {/* Breadcrumb */}
              <div className="mb-4 flex items-center gap-2 text-xs font-bold text-white/30">
                <Link href="/admin" className="flex items-center gap-1.5 transition hover:text-white/55">
                  <HomeIcon />
                  Admin
                </Link>
                <span>/</span>
                <span className="text-white/50">إدارة الأسئلة</span>
              </div>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white/50">
                    <span className="h-1 w-1 rounded-full bg-cyan-400" />
                    لوحة التحكم
                  </div>
                  <h1 className="text-2xl font-black text-white md:text-3xl">
                    إدارة الأسئلة
                  </h1>
                  <p className="mt-1.5 text-sm text-white/45">
                    استعراض، فلترة، تعديل وحذف أسئلة لعبة لمتكم
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href="/admin/questions/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.22)] transition hover:bg-cyan-400 active:scale-[0.98]"
                  >
                    <PlusIcon className="h-4 w-4" />
                    سؤال جديد
                  </Link>
                  <Link
                    href="/admin/upload"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white"
                  >
                    <UploadIcon className="h-4 w-4" />
                    رفع بالجملة
                  </Link>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-5 py-2.5 text-sm font-bold text-white/40 transition hover:text-white/70"
                  >
                    <HomeIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">لوحة التحكم</span>
                  </Link>
                </div>
              </div>

              {/* Stats strip */}
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { val: totalQuestions,  label: "إجمالي النتائج",    color: "border-cyan-400/15 bg-cyan-400/6 text-cyan-300",    lbl: "text-cyan-400/55" },
                  { val: sections.length, label: "قسم متاح",          color: "border-orange-400/15 bg-orange-400/6 text-orange-300", lbl: "text-orange-400/55" },
                  { val: categories.length, label: "فئة متاحة",       color: "border-violet-400/15 bg-violet-400/6 text-violet-300", lbl: "text-violet-400/55" },
                  { val: QUESTIONS_PER_PAGE, label: "سؤال لكل صفحة",  color: "border-white/8 bg-white/4 text-white/55",             lbl: "text-white/30" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl border px-3.5 py-2 ${s.color}`}>
                    <span className="text-sm font-black">{s.val}</span>
                    <span className={`mr-1.5 text-xs font-bold ${s.lbl}`}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Filter Panel ────────────────────────────────────────────── */}
          <div className="mb-5 overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(16,26,52,0.92)_0%,rgba(6,12,28,0.98)_100%)]">

            {/* Panel header */}
            <div className="flex items-center gap-3 border-b border-white/6 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/8 text-cyan-300">
                <FilterIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-black text-white">الفلتره والبحث</span>
              {hasAnyFilter && (
                <span className="mr-auto inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-black text-cyan-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                  فلتر مفعّل
                </span>
              )}
            </div>

            {/* Filter form */}
            <form id="filters-form" method="GET" className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">

              {/* Search */}
              <div className="relative sm:col-span-2 xl:col-span-1">
                <label htmlFor="q" className="mb-1.5 block text-xs font-bold text-white/45">
                  البحث بنص السؤال أو الإجابة
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                    <SearchIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="q"
                    name="q"
                    defaultValue={searchQuery}
                    placeholder="اكتب جزءًا من السؤال أو الإجابة..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3 pr-9 pl-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/60"
                  />
                </div>
              </div>

              {/* Section select */}
              <div>
                <label htmlFor="section" className="mb-1.5 block text-xs font-bold text-white/45">
                  القسم
                </label>
                <select
                  id="section"
                  name="section"
                  defaultValue={selectedSection}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
                >
                  <option value="">كل الأقسام ({sections.length})</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>

              {/* Category select */}
              <div>
                <label htmlFor="category" className="mb-1.5 block text-xs font-bold text-white/45">
                  الفئة {selectedSection && <span className="text-cyan-400/60">({filteredCategoriesForDropdown.length} فئة)</span>}
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={effectiveSelectedCategory}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
                >
                  <option value="">كل الفئات</option>
                  {filteredCategoriesForDropdown.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex flex-col justify-end gap-2 sm:col-span-2 xl:col-span-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  <SearchIcon className="h-4 w-4" />
                  بحث
                </button>
                <Link
                  href="/admin/questions"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white"
                >
                  <ResetIcon className="h-4 w-4" />
                  تصفير
                </Link>
              </div>
            </form>

            {/* Active filter chips */}
            {hasAnyFilter && (
              <div className="flex flex-wrap items-center gap-2 border-t border-white/6 px-5 py-3">
                <span className="text-xs font-bold text-white/30">فلاتر مفعّلة:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    <SearchIcon className="h-3 w-3" />
                    بحث: &quot;{searchQuery}&quot;
                  </span>
                )}
                {activeSectionLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-300">
                    <GridIcon className="h-3 w-3" />
                    قسم: {activeSectionLabel}
                  </span>
                )}
                {activeCategoryLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300">
                    <FilterIcon className="h-3 w-3" />
                    فئة: {activeCategoryLabel}
                  </span>
                )}
                <span className="mr-1 text-xs font-black text-white/50">
                  ← {totalQuestions} نتيجة
                </span>
              </div>
            )}

            {/* Results & export bar */}
            <div className="flex flex-col gap-3 border-t border-white/6 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/40">
                  {hasAnyFilter ? "نتائج الفلترة:" : "عرض جميع الأسئلة:"}
                </span>
                <span className="font-black text-white">{totalQuestions.toLocaleString("ar-EG")} سؤال</span>
                <span className="text-white/25">•</span>
                <span className="text-white/40">الصفحة {safePage} من {totalPages}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={exportAllHref}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-black text-white/60 transition hover:bg-white/8 hover:text-white"
                >
                  <DownloadIcon className="h-3.5 w-3.5" />
                  تصدير الكل
                </a>

                {exportSectionHref ? (
                  <a
                    href={exportSectionHref}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-orange-400/20 bg-orange-400/8 px-3.5 py-2 text-xs font-black text-orange-300 transition hover:bg-orange-400/14"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                    تصدير القسم
                  </a>
                ) : (
                  <span className="inline-flex items-center rounded-xl border border-white/6 bg-white/3 px-3.5 py-2 text-xs font-bold text-white/20 cursor-default">
                    تصدير القسم
                  </span>
                )}

                {exportCategoryHref ? (
                  <a
                    href={exportCategoryHref}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/20 bg-violet-400/8 px-3.5 py-2 text-xs font-black text-violet-300 transition hover:bg-violet-400/14"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                    تصدير الفئة
                  </a>
                ) : (
                  <span className="inline-flex items-center rounded-xl border border-white/6 bg-white/3 px-3.5 py-2 text-xs font-bold text-white/20 cursor-default">
                    تصدير الفئة
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Bulk actions bar ────────────────────────────────────────── */}
          <form id="bulk-delete-form" action={deleteSelectedQuestions}>
            <input type="hidden" name="returnTo" value={returnTo} />
          </form>

          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:bg-white/8">
                <input id="select-all-questions" type="checkbox" className="h-4 w-4 rounded accent-cyan-400" />
                تحديد كل هذه الصفحة
              </label>
              <span className="text-xs font-bold text-white/30">
                الصفحة {safePage} / {totalPages}
              </span>
            </div>

            <button
              type="submit"
              form="bulk-delete-form"
              className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/8 px-4 py-2.5 text-sm font-black text-red-300 transition hover:bg-red-500/15 active:scale-[0.98]"
            >
              <TrashIcon className="h-4 w-4" />
              حذف المحدد
            </button>
          </div>

          {/* ── Questions list ──────────────────────────────────────────── */}
          {questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((question) => {
                const questionPreview = truncateText(stripHtml(question.question_text));
                const answerPreview   = truncateText(stripHtml(question.answer_text));
                const questionImage   = extractFirstImageSrc(question.question_text);
                const answerImage     = extractFirstImageSrc(question.answer_text);
                const sectionName     = getSectionName(question.categories);
                const categoryName    = getCategoryName(question.categories);

                const pointsColor =
                  question.points === 200 ? "border-[#1b7001]/30 bg-[#1b7001]/10 text-[#6dbf47]"
                  : question.points === 400 ? "border-violet-400/25 bg-violet-400/10 text-violet-300"
                  : "border-yellow-400/25 bg-yellow-400/10 text-yellow-300";

                return (
                  <div
                    key={question.id}
                    className="group overflow-hidden rounded-[1.6rem] border border-white/8 bg-[linear-gradient(160deg,rgba(16,26,52,0.92)_0%,rgba(6,12,28,0.97)_100%)] transition duration-200 hover:border-white/12"
                  >
                    {/* Card top row */}
                    <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-start xl:justify-between">

                      {/* Left — checkbox + text */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          form="bulk-delete-form"
                          name="selectedIds"
                          value={question.id}
                          className="question-checkbox mt-1.5 h-4 w-4 shrink-0 rounded accent-cyan-400"
                        />

                        <div className="min-w-0 flex-1">
                          {/* Meta badges */}
                          <div className="mb-2.5 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/50">
                              {sectionName}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/15 bg-cyan-400/6 px-2.5 py-1 text-xs font-bold text-cyan-400/70">
                              {categoryName}
                            </span>
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${pointsColor}`}>
                              {question.points} نقطة
                            </span>
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${
                              question.is_active
                                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                                : "border-red-400/25 bg-red-400/10 text-red-300"
                            }`}>
                              {question.is_active ? "مفعّل" : "غير مفعّل"}
                            </span>
                            {question.is_used && (
                              <span className="rounded-full border border-orange-400/25 bg-orange-400/10 px-2.5 py-1 text-xs font-black text-orange-300">
                                مستخدم
                              </span>
                            )}
                          </div>

                          {/* Question text */}
                          <p className="text-sm font-bold leading-7 text-white/80">
                            {questionPreview || "بدون نص"}
                          </p>
                        </div>
                      </div>

                      {/* Right — action buttons */}
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
                          href={`/admin/questions/edit/${question.id}?returnTo=${encodeURIComponent(returnTo)}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-xs font-black text-cyan-200 transition hover:bg-cyan-400/18 active:scale-[0.98]"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                          تعديل
                        </Link>

                        <form action={deleteQuestion}>
                          <input type="hidden" name="id" value={question.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/8 px-4 py-2.5 text-xs font-black text-red-300 transition hover:bg-red-500/15 active:scale-[0.98]"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            حذف
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Expandable detail section */}
                    <div className="grid gap-3 border-t border-white/6 p-4 xl:grid-cols-[1fr_1fr_1fr]">
                      {/* Question image */}
                      <div>
                        <div className="mb-2 text-xs font-black text-white/35">صورة السؤال</div>
                        {questionImage ? (
                          <img
                            src={questionImage}
                            alt="صورة السؤال"
                            className="h-40 w-full rounded-xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/8 bg-white/[0.02] text-xs font-bold text-white/25">
                            لا توجد صورة
                          </div>
                        )}
                      </div>

                      {/* Answer image */}
                      <div>
                        <div className="mb-2 text-xs font-black text-white/35">صورة الإجابة</div>
                        {answerImage ? (
                          <img
                            src={answerImage}
                            alt="صورة الإجابة"
                            className="h-40 w-full rounded-xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/8 bg-white/[0.02] text-xs font-bold text-white/25">
                            لا توجد صورة
                          </div>
                        )}
                      </div>

                      {/* Answer text */}
                      <div>
                        <div className="mb-2 text-xs font-black text-white/35">الإجابة</div>
                        <div className="flex h-40 items-start overflow-y-auto rounded-xl border border-white/8 bg-white/[0.03] p-3">
                          <p className="text-sm leading-7 text-white/55">
                            {answerPreview || "غير مضافة"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Empty state ── */
            <div className="rounded-[2rem] border border-dashed border-white/8 bg-white/[0.02] px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-white/20">
                <SearchIcon className="h-6 w-6" />
              </div>
              <div className="text-xl font-black text-white/50">لا توجد نتائج مطابقة</div>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-white/30">
                جرّب تغيير البحث أو القسم أو الفئة، أو ارجع لعرض جميع الأسئلة.
              </p>
              <Link
                href="/admin/questions"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white"
              >
                <ResetIcon className="h-4 w-4" />
                عرض جميع الأسئلة
              </Link>
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link
                href={buildPageHref({ q: searchQuery, sectionId: selectedSection, categoryId: effectiveSelectedCategory, page: Math.max(1, safePage - 1) })}
                className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${
                  safePage === 1
                    ? "pointer-events-none border border-white/6 bg-white/3 text-white/20"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                ← السابق
              </Link>

              {visiblePages.map((item, index) =>
                item === "dots" ? (
                  <span key={`dots-${index}`} className="rounded-xl border border-white/8 bg-white/4 px-3.5 py-2.5 text-sm font-black text-white/30">
                    ...
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={buildPageHref({ q: searchQuery, sectionId: selectedSection, categoryId: effectiveSelectedCategory, page: item })}
                    className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${
                      item === safePage
                        ? "bg-cyan-500 text-slate-950 shadow-[0_2px_12px_rgba(34,211,238,0.25)]"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </Link>
                ),
              )}

              <Link
                href={buildPageHref({ q: searchQuery, sectionId: selectedSection, categoryId: effectiveSelectedCategory, page: Math.min(totalPages, safePage + 1) })}
                className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${
                  safePage === totalPages
                    ? "pointer-events-none border border-white/6 bg-white/3 text-white/20"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                التالي →
              </Link>
            </div>
          )}

          {/* ── Script (unchanged) ────────────────────────────────────── */}
          <Script id="admin-questions-enhancements" strategy="afterInteractive">
            {`
              (function () {
                function bindAdminQuestionPage() {
                  const form     = document.getElementById("filters-form");
                  const section  = document.getElementById("section");
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
        </div>
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