import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CATEGORIES_PER_PAGE = 12;

type SearchParams = Promise<{
  success?: string;
  error?: string;
  q?: string;
  page?: string;
}>;

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  section_id: string | null;
  category_sections:
    | { name: string; slug: string | null }
    | { name: string; slug: string | null }[]
    | null;
};

function getSectionName(
  section:
    | { name: string; slug: string | null }
    | { name: string; slug: string | null }[]
    | null,
) {
  if (!section) return "بدون قسم";
  if (Array.isArray(section)) return section[0]?.name ?? "بدون قسم";
  return section.name;
}

function buildReturnTo(params: { q: string; page: number }) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.page > 1) query.set("page", String(params.page));

  const queryString = query.toString();
  return queryString ? `/admin/categories?${queryString}` : "/admin/categories";
}

function buildPageHref(params: {
  q: string;
  page: number;
  success?: string;
  error?: string;
}) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.page > 1) query.set("page", String(params.page));
  if (params.success) query.set("success", params.success);
  if (params.error) query.set("error", params.error);

  const queryString = query.toString();
  return queryString ? `/admin/categories?${queryString}` : "/admin/categories";
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

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "admin") {
    redirect("/");
  }

  return supabase;
}

async function deleteCategoryAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const returnTo =
    String(formData.get("returnTo") ?? "").trim() || "/admin/categories";

  if (!id) {
    redirect(
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent(
        "معرّف الفئة مفقود.",
      )}`,
    );
  }

  const supabase = await requireAdmin();

  const { error: questionsError } = await supabase
    .from("questions")
    .delete()
    .eq("category_id", id);

  if (questionsError) {
    redirect(
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent(
        `فشل حذف الأسئلة المرتبطة: ${questionsError.message}`,
      )}`,
    );
  }

  const { error: categoryError } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (categoryError) {
    redirect(
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}error=${encodeURIComponent(
        `فشل حذف الفئة: ${categoryError.message}`,
      )}`,
    );
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/questions");
  revalidatePath("/admin/games");
  revalidatePath("/game/start");

  redirect(
    `${returnTo}${returnTo.includes("?") ? "&" : "?"}success=${encodeURIComponent(
      "تم حذف الفئة بنجاح.",
    )}`,
  );
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const searchQuery = String(params.q ?? "").trim();
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);

  const supabase = await requireAdmin();

  let countQuery = supabase
    .from("categories")
    .select("id", { count: "exact", head: true });

  if (searchQuery) {
    countQuery = countQuery.or(
      `name.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`,
    );
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-red-400">
        فشل تحميل عدد الفئات: {countError.message}
      </div>
    );
  }

  const totalCategories = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCategories / CATEGORIES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const from = (safePage - 1) * CATEGORIES_PER_PAGE;
  const to = from + CATEGORIES_PER_PAGE - 1;

  let query = supabase
    .from("categories")
    .select(
      `
      id,
      name,
      slug,
      description,
      image_url,
      sort_order,
      is_active,
      section_id,
      category_sections (
        name,
        slug
      )
    `,
    )
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .range(from, to);

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-red-400">
        فشل تحميل الفئات: {error.message}
      </div>
    );
  }

  const categories = (data ?? []) as unknown as CategoryRow[];
  const visiblePages = getVisiblePages(safePage, totalPages);

  const returnTo = buildReturnTo({
    q: searchQuery,
    page: safePage,
  });

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="relative mb-6 overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_100%)]">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-36 w-56 rounded-full bg-violet-500/6 blur-2xl" />

          <div className="relative px-6 py-8 md:px-8 md:py-10">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-white/30">
              <Link href="/admin" className="transition hover:text-white/55">Admin</Link>
              <span>/</span>
              <span className="text-white/50">الفئات</span>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white/50">
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  لوحة التحكم
                </span>
                <h1 className="mt-3 text-2xl font-black text-white md:text-3xl">
                  إدارة الفئات
                </h1>
                <p className="mt-1.5 text-sm text-white/45">
                  ابحث وتصفّح وأدر فئات الأسئلة المتاحة على المنصة.
                </p>

                {/* Quick stats */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/18 bg-cyan-400/6 px-3 py-1.5 text-xs font-bold text-cyan-300">
                    {totalCategories} فئة إجمالاً
                  </span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/18 bg-orange-400/6 px-3 py-1.5 text-xs font-bold text-orange-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                      {totalCategories} نتيجة للبحث
                    </span>
                  )}
                </div>
              </div>

              <Link
                href="/admin/categories/new"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.22)] transition hover:bg-cyan-400 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                إضافة فئة جديدة
              </Link>
            </div>

            {/* ── Filter form ── */}
            <form method="GET" className="mt-6 overflow-hidden rounded-[1.6rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,40,0.80)_0%,rgba(5,10,24,0.90)_100%)]">
              {/* Filter header */}
              <div className="flex items-center gap-3 border-b border-white/6 px-5 py-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/8 text-cyan-300">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"/></svg>
                </div>
                <span className="text-sm font-black text-white">البحث والفلترة</span>
                {searchQuery && (
                  <span className="mr-auto inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-black text-cyan-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                    فلتر مفعّل
                  </span>
                )}
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
                {/* Search input */}
                <div className="relative">
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                  <input
                    id="q"
                    name="q"
                    defaultValue={searchQuery}
                    placeholder="اكتب اسم الفئة أو الـ slug للبحث..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3 pr-9 pl-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/60"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
                  بحث
                </button>

                <Link
                  href="/admin/categories"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  تصفير
                </Link>
              </div>

              {/* Active search chip */}
              {searchQuery && (
                <div className="flex flex-wrap items-center gap-2 border-t border-white/6 px-5 py-3">
                  <span className="text-xs font-bold text-white/30">نتائج:</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
                    بحث: &quot;{searchQuery}&quot;
                  </span>
                  <span className="text-xs font-black text-white/45">← {totalCategories} فئة</span>
                </div>
              )}
            </form>

            {/* ── Alerts ── */}
            {params.success && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/8 px-4 py-3 text-sm font-bold text-emerald-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                {params.success}
              </div>
            )}
            {params.error && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-400/25 bg-red-400/8 px-4 py-3 text-sm font-bold text-red-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/></svg>
                {params.error}
              </div>
            )}
          </div>
        </div>

        {/* ── Results count bar ────────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="text-sm font-bold text-white/40">
            {searchQuery ? `نتائج البحث عن "${searchQuery}"` : "جميع الفئات"}
            <span className="mr-2 font-black text-white">{totalCategories} فئة</span>
          </span>
          <span className="text-xs font-bold text-white/30">
            الصفحة {safePage} من {totalPages}
          </span>
        </div>

        {/* ── Categories grid ──────────────────────────────────────────────── */}
        {categories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(16,26,52,0.94)_0%,rgba(6,12,28,0.98)_100%)] transition duration-300 hover:-translate-y-0.5 hover:border-white/12"
              >
                {/* Top bar colored by active state */}
                <div className={`h-[2px] w-full ${category.is_active ? "bg-cyan-400" : "bg-red-400"} opacity-60`} />

                {/* Image */}
                <div className="relative overflow-hidden">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-[linear-gradient(180deg,rgba(34,211,238,0.06)_0%,rgba(14,165,233,0.03)_100%)] text-4xl text-white/20">
                      ✨
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,12,28,0.80)] via-transparent to-transparent" />
                  {/* Status badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black backdrop-blur-sm ${category.is_active ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-red-400/25 bg-red-400/10 text-red-300"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${category.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                      {category.is_active ? "مفعّلة" : "غير مفعّلة"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-black text-white">{category.name}</h3>
                  <div className="mt-1 text-xs font-bold text-cyan-400/70">{category.slug}</div>

                  <p className="mt-2.5 min-h-[44px] text-sm leading-7 text-white/55">
                    {category.description || "بدون وصف"}
                  </p>

                  {/* Meta chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-xs font-bold text-white/45">
                      {getSectionName(category.category_sections)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-xs font-bold text-white/45">
                      ترتيب: {category.sort_order ?? 0}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/admin/categories/edit/${category.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-xs font-black text-cyan-200 transition hover:bg-cyan-400/18 active:scale-[0.98]"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>
                      تعديل
                    </Link>

                    <form action={deleteCategoryAction}>
                      <input type="hidden" name="id" value={category.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/8 px-4 py-2.5 text-xs font-black text-red-300 transition hover:bg-red-500/15 active:scale-[0.98]"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>
                        حذف
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/8 bg-white/[0.02] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-white/20">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <div className="text-lg font-black text-white/50">لا توجد فئات مطابقة</div>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-white/30">
              جرّب البحث باسم آخر أو أعد تعيين الفلترة.
            </p>
            <Link
              href="/admin/categories"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white"
            >
              عرض جميع الفئات
            </Link>
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={buildPageHref({ q: searchQuery, page: Math.max(1, safePage - 1), success: params.success, error: params.error })}
              className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${safePage === 1 ? "pointer-events-none border border-white/6 bg-white/3 text-white/20" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
            >
              ← السابق
            </Link>

            {visiblePages.map((item, index) =>
              item === "dots" ? (
                <span key={`dots-${index}`} className="rounded-xl border border-white/8 bg-white/4 px-3.5 py-2.5 text-sm font-black text-white/30">...</span>
              ) : (
                <Link
                  key={item}
                  href={buildPageHref({ q: searchQuery, page: item, success: params.success, error: params.error })}
                  className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${item === safePage ? "bg-cyan-500 text-slate-950 shadow-[0_2px_12px_rgba(34,211,238,0.25)]" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
                >
                  {item}
                </Link>
              ),
            )}

            <Link
              href={buildPageHref({ q: searchQuery, page: Math.min(totalPages, safePage + 1), success: params.success, error: params.error })}
              className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${safePage === totalPages ? "pointer-events-none border border-white/6 bg-white/3 text-white/20" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
            >
              التالي →
            </Link>
          </div>
        )}

        {/* Footer strip */}
        <div className="mt-8 flex items-center justify-between border-t border-white/6 pt-6 text-xs font-bold text-white/20">
          <span>إجمالي الفئات: {totalCategories}</span>
          <Link href="/admin" className="transition hover:text-white/45">لوحة التحكم</Link>
        </div>
      </div>
    </main>
  );
}