import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SectionRow = {
  id: string;
  name: string;
  sort_order: number | null;
  is_active: boolean;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  section_id: string | null;
  sort_order: number | null;
  is_active: boolean;
  image_url: string | null;
};

export default async function EditBaraCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await params;
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

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const [{ data: sectionsData, error: sectionsError }, { data: category, error }] =
    await Promise.all([
      supabase
        .from("bara_sections")
        .select("id, name, sort_order, is_active")
        .order("sort_order", { ascending: true }),
      supabase
        .from("bara_categories")
        .select(
          "id, name, slug, description, section_id, sort_order, is_active, image_url",
        )
        .eq("id", resolvedParams.id)
        .single(),
    ]);

  if (sectionsError) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        فشل تحميل الأقسام: {sectionsError.message}
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        تعذر تحميل الفئة
      </div>
    );
  }

  const sections = (sectionsData ?? []) as SectionRow[];
  const currentCategory = category as CategoryRow;

  async function updateCategory(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();

    const name = formData.get("name")?.toString().trim() || "";
    const slug = formData.get("slug")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const section_id = formData.get("section_id")?.toString().trim() || "";
    const image_url = formData.get("image_url")?.toString().trim() || "";
    const sort_order = Number(formData.get("sort_order") || 0);
    const is_active = formData.get("is_active") === "on";

    if (!name || !section_id) {
      redirect(
        `/admin/bara-alsalfah/categories/edit-category/${resolvedParams.id}?error=${encodeURIComponent(
          "اسم الفئة والقسم مطلوبان.",
        )}`,
      );
    }

    const { error } = await supabase
      .from("bara_categories")
      .update({
        name,
        slug: slug || null,
        description: description || null,
        section_id,
        image_url: image_url || null,
        sort_order,
        is_active,
      })
      .eq("id", resolvedParams.id);

    if (error) {
      redirect(
        `/admin/bara-alsalfah/categories/edit-category/${resolvedParams.id}?error=${encodeURIComponent(
          error.message,
        )}`,
      );
    }

    revalidatePath("/admin/bara-alsalfah/categories");
    redirect("/admin/bara-alsalfah/categories");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
        <h1 className="text-3xl font-black text-white">تعديل الفئة</h1>
        <p className="mt-3 text-white/70">
          عدل اسم الفئة ووصفها وقسمها وصورتها وترتيبها من مكان واحد.
        </p>

        <div className="mt-5">
          <Link
            href="/admin/bara-alsalfah/categories"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            الرجوع
          </Link>
        </div>
      </div>

      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      <form
        action={updateCategory}
        className="space-y-6 rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              اسم الفئة
            </label>
            <input
              name="name"
              defaultValue={currentCategory.name}
              className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              القسم المرتبط
            </label>
            <select
              name="section_id"
              defaultValue={currentCategory.section_id ?? ""}
              className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
            >
              <option value="">اختر القسم</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                  {section.is_active ? "" : " (غير مفعّل)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              slug
            </label>
            <input
              name="slug"
              defaultValue={currentCategory.slug ?? ""}
              className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              الترتيب
            </label>
            <input
              name="sort_order"
              type="number"
              defaultValue={currentCategory.sort_order ?? 0}
              className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-white">
              رابط صورة الفئة
            </label>
            <input
              name="image_url"
              type="url"
              defaultValue={currentCategory.image_url ?? ""}
              placeholder="https://..."
              className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
            />
          </div>

          {currentCategory.image_url ? (
            <div className="md:col-span-2">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3">
                <img
                  src={currentCategory.image_url}
                  alt={currentCategory.name}
                  className="h-56 w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          ) : null}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-white">
              الوصف
            </label>
            <textarea
              name="description"
              rows={5}
              defaultValue={currentCategory.description ?? ""}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-cyan-400/50"
            />
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={currentCategory.is_active}
              className="h-4 w-4"
            />
            مفعّلة
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/bara-alsalfah/categories"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            إلغاء
          </Link>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            حفظ التعديلات
          </button>
        </div>
      </form>
    </div>
  );
}