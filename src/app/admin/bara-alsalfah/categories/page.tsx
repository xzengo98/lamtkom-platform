import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<{
  error?: string;
  success?: string;
}>;

type BaraCategoryRow = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
};

type BaraSectionRow = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
  bara_categories: BaraCategoryRow[] | null;
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const { data: sectionsData, error } = await supabase
    .from("bara_sections")
    .select(`
      id,
      name,
      slug,
      description,
      sort_order,
      is_active,
      bara_categories (
        id,
        name,
        slug,
        description,
        sort_order,
        is_active
      )
    `)
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        فشل تحميل الأقسام والفئات: {error.message}
      </div>
    );
  }

  const sections = (sectionsData ?? []) as BaraSectionRow[];

  async function deleteSection(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();
    const sectionId = formData.get("section_id")?.toString().trim() || "";

    if (!sectionId) {
      redirect(
        `/admin/bara-alsalfah/categories?error=${encodeURIComponent(
          "لم يتم تحديد القسم المطلوب حذفه.",
        )}`,
      );
    }

    const { data: relatedCategories, error: relatedError } = await supabase
      .from("bara_categories")
      .select("id")
      .eq("section_id", sectionId);

    if (relatedError) {
      redirect(
        `/admin/bara-alsalfah/categories?error=${encodeURIComponent(
          relatedError.message,
        )}`,
      );
    }

    if ((relatedCategories ?? []).length > 0) {
      redirect(
        `/admin/bara-alsalfah/categories?error=${encodeURIComponent(
          "لا يمكن حذف القسم لأنه يحتوي على فئات مرتبطة به. احذف الفئات أولًا أو انقلها إلى قسم آخر.",
        )}`,
      );
    }

    const { error: deleteError } = await supabase
      .from("bara_sections")
      .delete()
      .eq("id", sectionId);

    if (deleteError) {
      redirect(
        `/admin/bara-alsalfah/categories?error=${encodeURIComponent(
          deleteError.message,
        )}`,
      );
    }

    revalidatePath("/admin/bara-alsalfah/categories");
    redirect(
      `/admin/bara-alsalfah/categories?success=${encodeURIComponent(
        "تم حذف القسم بنجاح.",
      )}`,
    );
  }

  async function deleteCategory(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();
    const categoryId = formData.get("category_id")?.toString().trim() || "";

    if (!categoryId) {
      redirect(
        `/admin/bara-alsalfah/categories?error=${encodeURIComponent(
          "لم يتم تحديد الفئة المطلوب حذفها.",
        )}`,
      );
    }

    const { error: deleteError } = await supabase
      .from("bara_categories")
      .delete()
      .eq("id", categoryId);

    if (deleteError) {
      redirect(
        `/admin/bara-alsalfah/categories?error=${encodeURIComponent(
          deleteError.message,
        )}`,
      );
    }

    revalidatePath("/admin/bara-alsalfah/categories");
    redirect(
      `/admin/bara-alsalfah/categories?success=${encodeURIComponent(
        "تم حذف الفئة بنجاح.",
      )}`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">إدارة الفئات</h1>
            <p className="mt-3 text-white/70">
              من هنا تعدل الأقسام والفئات الخاصة بلعبة برا السالفة، وتحذفها أو
              تنقل الفئات لاحقًا بين الأقسام.
            </p>
          </div>

          <Link
            href="/admin/bara-alsalfah/categories/new"
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            إضافة قسم / فئة
          </Link>
        </div>
      </div>

      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      {resolvedSearchParams.success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100">
          {resolvedSearchParams.success}
        </div>
      ) : null}

      {sections.map((section) => (
        <div
          key={section.id}
          className="space-y-4 rounded-[2rem] border border-white/10 bg-[#071126] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-cyan-300">
                {section.name}
              </h2>

              <p className="mt-2 text-white/70">
                {section.description || "بدون وصف"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white">
                  الترتيب: {section.sort_order ?? 0}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white">
                  {section.is_active ? "مفعّل" : "غير مفعّل"}
                </span>

                {section.slug ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
                    {section.slug}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/bara-alsalfah/categories/edit-section/${section.id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                تعديل القسم
              </Link>

              <form action={deleteSection}>
                <input type="hidden" name="section_id" value={section.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400"
                >
                  حذف القسم
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(section.bara_categories ?? []).map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-white">
                      {cat.name}
                    </div>

                    <p className="mt-2 text-sm text-white/65">
                      {cat.description || "بدون وصف"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/bara-alsalfah/categories/edit-category/${cat.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                    >
                      تعديل
                    </Link>

                    <form action={deleteCategory}>
                      <input type="hidden" name="category_id" value={cat.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-400"
                      >
                        حذف
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-[#0f1b3d] px-3 py-1 text-xs text-white">
                    الترتيب: {cat.sort_order ?? 0}
                  </span>

                  <span className="rounded-full border border-white/10 bg-[#0f1b3d] px-3 py-1 text-xs text-white">
                    {cat.is_active ? "مفعّلة" : "غير مفعّلة"}
                  </span>

                  {cat.slug ? (
                    <span className="rounded-full border border-white/10 bg-[#0f1b3d] px-3 py-1 text-xs text-white/80">
                      {cat.slug}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {(section.bara_categories ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm font-bold text-white/60">
              لا توجد فئات داخل هذا القسم حاليًا.
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}