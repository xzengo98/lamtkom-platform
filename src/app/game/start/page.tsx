import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export default async function GameStartPage() {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const categories = (data ?? []) as Category[];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-4xl font-black">بدء لعبة جديدة</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            اختر الفئة التي تريد اللعب بها، وبعدها سنعرض لك الأسئلة الحقيقية من قاعدة البيانات.
          </p>
        </div>

        {error ? (
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 text-red-200">
            فشل تحميل الفئات: {error.message}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-300">
            لا توجد فئات مفعلة حاليًا.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
              >
                <h2 className="text-2xl font-black">{category.name}</h2>
                <p className="mt-3 text-sm text-cyan-300">{category.slug}</p>

                <p className="mt-4 min-h-[48px] text-slate-300">
                  {category.description || "بدون وصف"}
                </p>

                <Link
                  href={`/game/play?category=${category.slug}`}
                  className="mt-6 inline-block rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
                >
                  ابدأ اللعب
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}