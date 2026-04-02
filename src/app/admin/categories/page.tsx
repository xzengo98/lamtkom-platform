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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
                إدارة الفئات
              </div>
              <h1 className="text-3xl font-black text-white md:text-4xl">
                /admin/categories
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
                ابحث عن فئة معينة بالاسم، واستعرض الفئات بتقسيم صفحات منظم وواضح.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/categories/new"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                إضافة فئة جديدة
              </Link>
            </div>
          </div>

          <form
            method="GET"
            className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <label
                htmlFor="q"
                className="mb-2 block text-sm font-bold text-white/80"
              >
                البحث عن فئة
              </label>
              <input
                id="q"
                name="q"
                defaultValue={searchQuery}
                placeholder="اكتب اسم الفئة أو الـ slug"
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center self-end rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              بحث / فلترة
            </button>

            <Link
              href="/admin/categories"
              className="inline-flex items-center justify-center self-end rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              تصفير
            </Link>
          </form>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            {searchQuery ? (
              <span>
                نتائج البحث عن:{" "}
                <span className="font-black text-cyan-300">{searchQuery}</span>
                <span className="mr-2">• عدد النتائج: {totalCategories}</span>
              </span>
            ) : (
              <span>
                يتم عرض جميع الفئات مع تقسيم الصفحات
                <span className="mr-2 font-black text-cyan-300">
                  • عدد الفئات: {totalCategories}
                </span>
              </span>
            )}
          </div>

          {params.success ? (
            <div className="rounded-[1.3rem] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100">
              {params.success}
            </div>
          ) : null}

          {params.error ? (
            <div className="rounded-[1.3rem] border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-100">
              {params.error}
            </div>
          ) : null}
        </div>

        {categories.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.24)]"
              >
                <div className="mb-4 overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/5">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      width={800}
                      height={500}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-[linear-gradient(180deg,rgba(34,211,238,0.10)_0%,rgba(14,165,233,0.06)_100%)] text-4xl">
                      ✨
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-black text-white">{category.name}</h3>

                <div className="mt-2 text-sm font-bold text-cyan-300">
                  {category.slug}
                </div>

                <p className="mt-3 min-h-[56px] text-sm leading-7 text-white/70">
                  {category.description || "بدون وصف"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/75">
                    القسم: {getSectionName(category.category_sections)}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/75">
                    الترتيب: {category.sort_order ?? 0}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1.5 ${
                      category.is_active
                        ? "border border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                        : "border border-red-300/20 bg-red-400/10 text-red-100"
                    }`}
                  >
                    {category.is_active ? "مفعّلة" : "غير مفعّلة"}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/categories/edit/${category.id}`}
                    className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                  >
                    تعديل
                  </Link>

                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
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
            ))}
          </div>
        ) : (
          <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center">
            <div className="mb-3 text-2xl font-black text-white">
              لا توجد فئات مطابقة
            </div>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-white/65">
              جرّب البحث باسم آخر أو أعد تعيين الفلترة.
            </p>
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={buildPageHref({
                q: searchQuery,
                page: Math.max(1, safePage - 1),
                success: params.success,
                error: params.error,
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
                    page: item,
                    success: params.success,
                    error: params.error,
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
                page: Math.min(totalPages, safePage + 1),
                success: params.success,
                error: params.error,
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
    </main>
  );
}