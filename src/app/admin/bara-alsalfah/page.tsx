import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CategoryRelation =
  | { name: string }
  | { name: string }[]
  | null;

type BaraItemRow = {
  id: string;
  correct_answer: string;
  wrong_option_1: string | null;
  wrong_option_2: string | null;
  wrong_option_3: string | null;
  wrong_option_4: string | null;
  is_active: boolean;
  created_at: string | null;
  bara_categories:
    | {
        id: string;
        name: string;
        bara_sections: CategoryRelation;
      }
    | {
        id: string;
        name: string;
        bara_sections: CategoryRelation;
      }[]
    | null;
};

function getCategoryObject(
  category:
    | {
        id: string;
        name: string;
        bara_sections: CategoryRelation;
      }
    | {
        id: string;
        name: string;
        bara_sections: CategoryRelation;
      }[]
    | null,
) {
  if (!category) return null;
  return Array.isArray(category) ? (category[0] ?? null) : category;
}

function getSectionName(section: CategoryRelation) {
  if (!section) return "بدون قسم";
  if (Array.isArray(section)) return section[0]?.name ?? "بدون قسم";
  return section.name;
}

async function deleteItem(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = await getSupabaseServerClient();
  await supabase.from("bara_items").delete().eq("id", id);

  revalidatePath("/admin/bara-alsalfah");
}

export default async function BaraAlsalfahAdminPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const { data, error } = await supabase
    .from("bara_items")
    .select(`
      id,
      correct_answer,
      wrong_option_1,
      wrong_option_2,
      wrong_option_3,
      wrong_option_4,
      is_active,
      created_at,
      bara_categories (
        id,
        name,
        bara_sections (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        فشل تحميل بيانات اللعبة: {error.message}
      </div>
    );
  }

  const items = (data ?? []) as BaraItemRow[];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-cyan-300">إدارة اللعبة</div>
            <h1 className="mt-2 text-4xl font-black text-white">
              إدارة برا السالفة
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-white/75">
              أضف الفئات والعناصر الصحيحة والخيارات الخاطئة الخاصة بلعبة برا السالفة.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/bara-alsalfah/categories"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              إدارة الفئات
            </Link>

            <Link
              href="/admin/bara-alsalfah/new"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              إضافة عنصر جديد
            </Link>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <h2 className="text-3xl font-black text-white">لا توجد عناصر بعد</h2>
          <p className="mt-3 text-white/70">
            ابدأ بإضافة أول جواب صحيح مع الخيارات الخاطئة.
          </p>

          <div className="mt-5">
            <Link
              href="/admin/bara-alsalfah/new"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              إضافة عنصر جديد
            </Link>
          </div>
        </div>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {items.map((item) => {
            const category = getCategoryObject(item.bara_categories);
            const sectionName = getSectionName(category?.bara_sections ?? null);

            return (
              <article
                key={item.id}
                className="rounded-[2rem] border border-white/10 bg-[#071126] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-bold text-white">
                    {sectionName}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-bold text-white">
                    {category?.name ?? "بدون فئة"}
                  </span>

                  <span
                    className={[
                      "rounded-full border px-3 py-1 text-sm font-bold",
                      item.is_active
                        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                        : "border-white/10 bg-white/5 text-white/70",
                    ].join(" ")}
                  >
                    {item.is_active ? "مفعّل" : "غير مفعّل"}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-cyan-300">الجواب الصحيح</div>
                  <h3 className="mt-2 text-3xl font-black text-white">
                    {item.correct_answer}
                  </h3>
                </div>

                <div className="mt-5">
                  <div className="mb-2 text-sm font-bold text-white/70">
                    الخيارات الأخرى
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {[item.wrong_option_1, item.wrong_option_2, item.wrong_option_3, item.wrong_option_4]
                      .filter(Boolean)
                      .map((option, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                        >
                          {option}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/bara-alsalfah/edit/${item.id}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                  >
                    تعديل
                  </Link>

                  <form action={deleteItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
                    >
                      حذف
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}