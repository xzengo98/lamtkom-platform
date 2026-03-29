import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  createCodenamesWord,
  deleteCodenamesWord,
  toggleCodenamesWordStatus,
  updateCodenamesWord,
} from "./actions";

type SearchParams = Promise<{
  q?: string;
  language?: string;
  status?: string;
}>;

type WordRow = {
  id: string;
  word: string;
  normalized_word: string;
  language: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default async function AdminCodenamesWordsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await getSupabaseServerClient();
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const language = params.language?.trim() || "";
  const status = params.status?.trim() || "";

  let query = supabase
    .from("codenames_word_bank")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `word.ilike.%${q}%,category.ilike.%${q}%,language.ilike.%${q}%`
    );
  }

  if (language) {
    query = query.eq("language", language);
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  }

  if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  const { data, count, error } = await query;
  const words: WordRow[] = (data ?? []) as WordRow[];

  const { data: statsData } = await supabase
    .from("codenames_word_bank")
    .select("id, is_active, language");

  const stats =
    (statsData as Array<{ id: string; is_active: boolean; language: string }>) ??
    [];

  const totalWords = stats.length;
  const activeWords = stats.filter((item) => item.is_active).length;
  const arabicWords = stats.filter((item) => item.language === "ar").length;
  const englishWords = stats.filter((item) => item.language === "en").length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">
              إدارة كلمات Codenames
            </h1>
            <p className="mt-1 text-sm text-white/70">
              إضافة وتعديل وحذف ورفع كلمات اللعبة
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/codenames"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
            >
              لوحة اللعبة
            </Link>
            <Link
              href="/admin/codenames/upload"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              رفع جماعي
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/60">إجمالي الكلمات</div>
            <div className="mt-2 text-2xl font-bold text-white">{totalWords}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/60">الكلمات النشطة</div>
            <div className="mt-2 text-2xl font-bold text-green-400">{activeWords}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/60">الكلمات العربية</div>
            <div className="mt-2 text-2xl font-bold text-white">{arabicWords}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/60">الكلمات الإنجليزية</div>
            <div className="mt-2 text-2xl font-bold text-white">{englishWords}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-4 text-lg font-bold text-white">إضافة كلمة جديدة</h2>

        <form action={createCodenamesWord} className="grid gap-3 md:grid-cols-4">
          <input
            name="word"
            placeholder="الكلمة"
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/40"
          />

          <select
            name="language"
            defaultValue="ar"
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            <option value="ar">عربي</option>
            <option value="en">English</option>
          </select>

          <input
            name="category"
            placeholder="تصنيف اختياري"
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/40"
          />

          <select
            name="is_active"
            defaultValue="true"
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            <option value="true">نشطة</option>
            <option value="false">معطلة</option>
          </select>

          <div className="md:col-span-4">
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500"
            >
              إضافة الكلمة
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <form className="grid gap-3 md:grid-cols-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="بحث بالكلمة أو التصنيف"
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/40"
          />

          <select
            name="language"
            defaultValue={language}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            <option value="">كل اللغات</option>
            <option value="ar">عربي</option>
            <option value="en">English</option>
          </select>

          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            <option value="">كل الحالات</option>
            <option value="active">نشطة</option>
            <option value="inactive">معطلة</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-white/10 px-4 py-3 font-medium text-white hover:bg-white/15"
          >
            تطبيق الفلترة
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">الكلمات</h2>
          <div className="text-sm text-white/60">
            العدد الظاهر: {count ?? words.length}
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error.message}
          </div>
        ) : !words.length ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center text-white/60">
            لا توجد كلمات حالياً
          </div>
        ) : (
          <div className="space-y-4">
            {words.map((item: WordRow) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <form action={updateCodenamesWord} className="grid gap-3 md:grid-cols-5">
                  <input type="hidden" name="id" value={item.id} />

                  <input
                    name="word"
                    defaultValue={item.word}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  />

                  <select
                    name="language"
                    defaultValue={item.language}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  >
                    <option value="ar">عربي</option>
                    <option value="en">English</option>
                  </select>

                  <input
                    name="category"
                    defaultValue={item.category ?? ""}
                    placeholder="تصنيف"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  />

                  <select
                    name="is_active"
                    defaultValue={String(item.is_active)}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  >
                    <option value="true">نشطة</option>
                    <option value="false">معطلة</option>
                  </select>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500"
                    >
                      حفظ
                    </button>
                  </div>
                </form>

                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={toggleCodenamesWordStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="hidden"
                      name="current"
                      value={String(item.is_active)}
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                    >
                      {item.is_active ? "تعطيل" : "تفعيل"}
                    </button>
                  </form>

                  <form action={deleteCodenamesWord}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 hover:bg-red-500/20"
                    >
                      حذف
                    </button>
                  </form>

                  <div className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60">
                    {item.language === "ar" ? "عربي" : "English"}
                  </div>

                  <div className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60">
                    {item.category || "بدون تصنيف"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}