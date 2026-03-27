import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SectionRow = {
  id: string;
  name: string;
};

export default async function NewBaraCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
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

  const { data: sectionsData, error: sectionsError } = await supabase
    .from("bara_sections")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (sectionsError) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        فشل تحميل الأقسام: {sectionsError.message}
      </div>
    );
  }

  const sections = (sectionsData ?? []) as SectionRow[];

  async function createSectionOrCategory(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();

    const type = formData.get("type")?.toString().trim() || "";
    const name = formData.get("name")?.toString().trim() || "";
    const slug = formData.get("slug")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const sortOrder = Number(formData.get("sort_order") || 0);
    const isActive = formData.get("is_active") === "on";
    const sectionId = formData.get("section_id")?.toString().trim() || "";

    if (!type || !name) {
      redirect(
        `/admin/bara-alsalfah/categories/new?error=${encodeURIComponent(
          "نوع الإدخال والاسم مطلوبان.",
        )}`,
      );
    }

    if (type === "section") {
      const { error } = await supabase.from("bara_sections").insert({
        name,
        slug: slug || null,
        description: description || null,
        sort_order: sortOrder,
        is_active: isActive,
      });

      if (error) {
        redirect(
          `/admin/bara-alsalfah/categories/new?error=${encodeURIComponent(
            error.message,
          )}`,
        );
      }
    }

    if (type === "category") {
      if (!sectionId) {
        redirect(
          `/admin/bara-alsalfah/categories/new?error=${encodeURIComponent(
            "يجب اختيار القسم عند إضافة فئة جديدة.",
          )}`,
        );
      }

      const { error } = await supabase.from("bara_categories").insert({
        name,
        slug: slug || null,
        description: description || null,
        sort_order: sortOrder,
        is_active: isActive,
        section_id: sectionId,
      });

      if (error) {
        redirect(
          `/admin/bara-alsalfah/categories/new?error=${encodeURIComponent(
            error.message,
          )}`,
        );
      }
    }

    revalidatePath("/admin/bara-alsalfah/categories");
    redirect("/admin/bara-alsalfah/categories");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-cyan-300">إدارة الفئات</div>
            <h1 className="mt-2 text-4xl font-black text-white">
              إضافة قسم أو فئة جديدة
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-white/75">
              من هنا يمكنك إضافة قسم رئيسي جديد أو فئة جديدة داخل قسم موجود.
            </p>
          </div>

          <Link
            href="/admin/bara-alsalfah/categories"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            الرجوع
          </Link>
        </div>

        {params.error ? (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-100">
            {params.error}
          </div>
        ) : null}
      </div>

      <form action={createSectionOrCategory} className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-white">
                نوع الإدخال
              </label>
              <select
                name="type"
                defaultValue="section"
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="section">قسم رئيسي</option>
                <option value="category">فئة</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-white">
                الاسم
              </label>
              <input
                name="name"
                placeholder="مثال: مشاهير أو لاعبين"
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                slug (اختياري)
              </label>
              <input
                name="slug"
                placeholder="مثال: celebrities"
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                الترتيب
              </label>
              <input
                type="number"
                name="sort_order"
                defaultValue={0}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-white">
                الوصف (اختياري)
              </label>
              <textarea
                name="description"
                placeholder="وصف مختصر للقسم أو الفئة"
                className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-white">
                القسم المرتبط (عند إضافة فئة فقط)
              </label>
              <select
                name="section_id"
                defaultValue=""
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="">بدون قسم / غير مستخدم عند إضافة قسم</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked
                className="h-4 w-4 rounded border-white/20 bg-slate-900"
              />
              مفعّل
            </label>
          </div>
        </section>

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
            حفظ
          </button>
        </div>
      </form>
    </div>
  );
}