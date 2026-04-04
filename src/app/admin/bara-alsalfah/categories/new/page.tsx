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
            "يجب اختيار القسم عند إنشاء فئة.",
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
        <h1 className="text-3xl font-black text-white">إضافة قسم أو فئة جديدة</h1>
        <p className="mt-3 text-white/70">
          اختر هل تريد إنشاء قسم رئيسي جديد أو فئة جديدة. عند اختيار فئة سيظهر
          لك ربطها بالقسم مع إمكانية إضافة صورة لها.
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
        <input id="bara-entry-type-input" type="hidden" name="type" value="category" />

        <section className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-black text-white">اختر نوع الإدخال</h2>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              id="bara-type-section-btn"
              type="button"
              className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-right text-white transition hover:bg-slate-800"
            >
              <div className="text-lg font-black">إنشاء قسم</div>
              <div className="mt-1 text-sm text-white/65">
                قسم رئيسي يحتوي على عدة فئات داخله
              </div>
            </button>

            <button
              id="bara-type-category-btn"
              type="button"
              className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-4 text-right text-cyan-100 transition"
            >
              <div className="text-lg font-black">إنشاء فئة</div>
              <div className="mt-1 text-sm text-white/65">
                فئة مرتبطة بقسم ويمكن إضافة صورة لها
              </div>
            </button>
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-black text-white">بيانات القسم أو الفئة</h2>

          <div className="grid gap-4 md:grid-cols-2">
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

            <div id="bara-section-select-wrap">
              <label className="mb-2 block text-sm font-bold text-white">
                القسم المرتبط
              </label>
              <select
                name="section_id"
                defaultValue=""
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="">
                  {sections.length ? "اختر القسم" : "لا توجد أقسام مفعلة"}
                </option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>

            <div id="bara-category-image-wrap" className="md:col-span-2">
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
              const hiddenInput = document.getElementById("bara-entry-type-input");
              const sectionBtn = document.getElementById("bara-type-section-btn");
              const categoryBtn = document.getElementById("bara-type-category-btn");
              const sectionWrap = document.getElementById("bara-section-select-wrap");
              const imageWrap = document.getElementById("bara-category-image-wrap");

              if (!hiddenInput || !sectionBtn || !categoryBtn || !sectionWrap || !imageWrap) return;

              const setMode = (mode) => {
                hiddenInput.value = mode;

                const isCategory = mode === "category";

                sectionWrap.style.display = isCategory ? "" : "none";
                imageWrap.style.display = isCategory ? "" : "none";

                if (isCategory) {
                  categoryBtn.className = "rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-4 text-right text-cyan-100 transition";
                  sectionBtn.className = "rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-right text-white transition hover:bg-slate-800";
                } else {
                  sectionBtn.className = "rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-4 text-right text-cyan-100 transition";
                  categoryBtn.className = "rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-right text-white transition hover:bg-slate-800";
                }
              };

              sectionBtn.addEventListener("click", () => setMode("section"));
              categoryBtn.addEventListener("click", () => setMode("category"));

              setMode("category");
            })();
          `,
        }}
      />
    </div>
  );
}