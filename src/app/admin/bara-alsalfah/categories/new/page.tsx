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
    const image_url = formData.get("image_url")?.toString().trim() || "";
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
        image_url: image_url || null,
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
        <h1 className="text-3xl font-black text-white">
          إضافة قسم أو فئة جديدة
        </h1>
        <p className="mt-3 text-white/70">
          من هنا يمكنك إضافة قسم رئيسي جديد أو فئة جديدة داخل قسم موجود، مع
          إمكانية إضافة صورة للفئة.
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

      {params.error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
          {params.error}
        </div>
      ) : null}

      <form
        action={createSectionOrCategory}
        className="space-y-6 rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
      >
        <section className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-black text-white">
            بيانات القسم أو الفئة
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                نوع الإدخال
              </label>
              <select
                id="bara-entry-type"
                name="type"
                defaultValue="section"
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="section">قسم رئيسي</option>
                <option value="category">فئة</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                الاسم
              </label>
              <input
                name="name"
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                slug (اختياري)
              </label>
              <input
                name="slug"
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
                defaultValue={0}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              />
            </div>

            <div id="bara-section-select-wrap" className="hidden md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-white">
                القسم المرتبط
              </label>
              <select
                name="section_id"
                defaultValue=""
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="">اختر القسم</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>

            <div id="bara-category-image-wrap" className="hidden md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-white">
                رابط صورة الفئة
              </label>
              <input
                name="image_url"
                type="url"
                placeholder="https://..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-white">
                الوصف (اختياري)
              </label>
              <textarea
                name="description"
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-cyan-400/50"
              />
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

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const typeSelect = document.getElementById("bara-entry-type");
              const sectionWrap = document.getElementById("bara-section-select-wrap");
              const imageWrap = document.getElementById("bara-category-image-wrap");

              if (!typeSelect || !sectionWrap || !imageWrap) return;

              const syncVisibility = () => {
                const isCategory = typeSelect.value === "category";
                sectionWrap.classList.toggle("hidden", !isCategory);
                imageWrap.classList.toggle("hidden", !isCategory);
              };

              syncVisibility();
              typeSelect.addEventListener("change", syncVisibility);
            })();
          `,
        }}
      />
    </div>
  );
}