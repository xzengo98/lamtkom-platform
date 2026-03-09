import { getSupabaseServerClient } from "@/lib/supabase/server";
import StartGameForm from "./start-game-form";

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
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 px-8 py-6">
          <h1 className="text-4xl font-black md:text-5xl">إعداد لعبة جديدة</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            اختر الفئات، أدخل اسم اللعبة واسمَي الفريقين، ثم ابدأ لوحة اللعبة
            الاحترافية.
          </p>
        </div>

        {error ? (
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 text-red-200">
            فشل تحميل الفئات: {error.message}
          </div>
        ) : (
          <StartGameForm categories={categories} />
        )}
      </div>
    </main>
  );
}