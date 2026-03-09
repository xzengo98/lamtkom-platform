import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Question = {
  id: string;
  question_text: string;
  difficulty: string;
  is_active: boolean;
  categories: {
    name: string;
    slug: string;
  } | {
    name: string;
    slug: string;
  }[] | null;
};

function getCategoryName(
  categories: Question["categories"]
): string {
  if (!categories) return "بدون فئة";
  if (Array.isArray(categories)) return categories[0]?.name ?? "بدون فئة";
  return categories.name;
}

type GamePlayPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function GamePlayPage({
  searchParams,
}: GamePlayPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category;

  if (!selectedCategory) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-black">لا توجد فئة محددة</h1>
          <p className="mt-4 text-slate-300">
            اختر فئة أولًا من صفحة بدء اللعبة.
          </p>
          <Link
            href="/game/start"
            className="mt-6 inline-block rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            الرجوع لبدء اللعبة
          </Link>
        </div>
      </main>
    );
  }

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("questions")
    .select(
      `
      id,
      question_text,
      difficulty,
      is_active,
      categories (
        name,
        slug
      )
    `
    )
    .eq("is_active", true)
    .eq("categories.slug", selectedCategory)
    .order("created_at", { ascending: false });

  const questions = (data ?? []) as Question[];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">اللعبة</h1>
            <p className="mt-3 text-slate-300">
              الفئة الحالية: <span className="text-cyan-300">{selectedCategory}</span>
            </p>
          </div>

          <Link
            href="/game/start"
            className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            تغيير الفئة
          </Link>
        </div>

        {error ? (
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 text-red-200">
            فشل تحميل الأسئلة: {error.message}
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-300">
            لا توجد أسئلة مفعلة لهذه الفئة حاليًا.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span className="rounded-full bg-slate-900/70 px-3 py-1">
                    سؤال {index + 1}
                  </span>
                  <span className="rounded-full bg-slate-900/70 px-3 py-1">
                    {getCategoryName(question.categories)}
                  </span>
                  <span className="rounded-full bg-slate-900/70 px-3 py-1">
                    {question.difficulty}
                  </span>
                </div>

                <h2 className="text-2xl font-black leading-9">
                  {question.question_text}
                </h2>

                <p className="mt-4 text-slate-400">
                  هذه المرحلة تعرض السؤال الحقيقي من قاعدة البيانات. الخطوة التالية
                  سنضيف خيارات الإجابة ونظام احتساب النقاط.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}