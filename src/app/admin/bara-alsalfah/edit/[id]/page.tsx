import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = Promise<{
  id: string;
}>;

type SearchParams = Promise<{
  error?: string;
}>;

type SectionRelation = { name: string } | { name: string }[] | null;

type CategoryRow = {
  id: string;
  name: string;
  bara_sections: SectionRelation;
};

type BaraItemRow = {
  id: string;
  category_id: string;
  correct_answer: string;
  wrong_option_1: string | null;
  wrong_option_2: string | null;
  wrong_option_3: string | null;
  wrong_option_4: string | null;
  is_active: boolean;
};

function getSectionName(section: SectionRelation) {
  if (!section) return "";
  if (Array.isArray(section)) return section[0]?.name ?? "";
  return section.name;
}

export default async function EditBaraItemPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
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

  const [{ data: categoriesData, error: categoriesError }, { data: itemData, error: itemError }] =
    await Promise.all([
      supabase
        .from("bara_categories")
        .select("id, name, bara_sections ( name )")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("bara_items")
        .select(
          "id, category_id, correct_answer, wrong_option_1, wrong_option_2, wrong_option_3, wrong_option_4, is_active",
        )
        .eq("id", resolvedParams.id)
        .single(),
    ]);

  if (categoriesError) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        فشل تحميل الفئات: {categoriesError.message}
      </div>
    );
  }

  if (itemError) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        تعذر تحميل العنصر: {itemError.message}
      </div>
    );
  }

  const categories = (categoriesData ?? []) as CategoryRow[];
  const item = itemData as BaraItemRow;

  async function updateItem(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();

    const category_id = formData.get("category_id")?.toString().trim() || "";
    const correct_answer =
      formData.get("correct_answer")?.toString().trim() || "";
    const wrong_option_1 =
      formData.get("wrong_option_1")?.toString().trim() || "";
    const wrong_option_2 =
      formData.get("wrong_option_2")?.toString().trim() || "";
    const wrong_option_3 =
      formData.get("wrong_option_3")?.toString().trim() || "";
    const wrong_option_4 =
      formData.get("wrong_option_4")?.toString().trim() || "";
    const is_active = formData.get("is_active") === "on";

    if (
      !category_id ||
      !correct_answer ||
      !wrong_option_1 ||
      !wrong_option_2 ||
      !wrong_option_3
    ) {
      redirect(
        `/admin/bara-alsalfah/edit/${resolvedParams.id}?error=${encodeURIComponent(
          "الفئة والجواب الصحيح وثلاثة خيارات خاطئة على الأقل مطلوبة.",
        )}`,
      );
    }

    const { error } = await supabase
      .from("bara_items")
      .update({
        category_id,
        correct_answer,
        wrong_option_1,
        wrong_option_2,
        wrong_option_3,
        wrong_option_4: wrong_option_4 || null,
        is_active,
      })
      .eq("id", resolvedParams.id);

    if (error) {
      redirect(
        `/admin/bara-alsalfah/edit/${resolvedParams.id}?error=${encodeURIComponent(
          error.message,
        )}`,
      );
    }

    revalidatePath("/admin/bara-alsalfah");
    redirect("/admin/bara-alsalfah");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-cyan-300">إدارة اللعبة</div>
            <h1 className="mt-2 text-4xl font-black text-white">
              تعديل عنصر
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-white/75">
              عدّل الجواب الصحيح والخيارات الخاطئة الخاصة بهذا العنصر.
            </p>
          </div>

          <Link
            href="/admin/bara-alsalfah"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            الرجوع
          </Link>
        </div>

        {resolvedSearchParams.error ? (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-100">
            {resolvedSearchParams.error}
          </div>
        ) : null}
      </div>

      <form action={updateItem} className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-white">
                الفئة
              </label>
              <select
                name="category_id"
                defaultValue={item.category_id}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="">اختر الفئة</option>
                {categories.map((category) => {
                  const sectionName = getSectionName(category.bara_sections);
                  return (
                    <option key={category.id} value={category.id}>
                      {sectionName ? `${sectionName} / ${category.name}` : category.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-white">
                الجواب الصحيح
              </label>
              <input
                name="correct_answer"
                defaultValue={item.correct_answer}
                placeholder="مثال: لويس سواريز"
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                خيار خاطئ 1
              </label>
              <input
                name="wrong_option_1"
                defaultValue={item.wrong_option_1 ?? ""}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                خيار خاطئ 2
              </label>
              <input
                name="wrong_option_2"
                defaultValue={item.wrong_option_2 ?? ""}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                خيار خاطئ 3
              </label>
              <input
                name="wrong_option_3"
                defaultValue={item.wrong_option_3 ?? ""}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                خيار خاطئ 4 (اختياري)
              </label>
              <input
                name="wrong_option_4"
                defaultValue={item.wrong_option_4 ?? ""}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={item.is_active}
                className="h-4 w-4 rounded border-white/20 bg-slate-900"
              />
              العنصر مفعّل
            </label>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/bara-alsalfah"
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