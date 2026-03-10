import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import HtmlSnippetEditor from "@/components/admin/html-snippet-editor";

export const dynamic = "force-dynamic";

export default async function NewQuestionPage() {
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

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  async function createQuestion(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();

    const question_text = formData.get("question_text")?.toString().trim() || "";
    const answer_text = formData.get("answer_text")?.toString().trim() || "";
    const category_id = formData.get("category_id")?.toString().trim() || "";
    const points = Number(formData.get("points") || 200);
    const is_active = formData.get("is_active") === "on";
    const year_tolerance_before = Number(formData.get("year_tolerance_before") || 0);
    const year_tolerance_after = Number(formData.get("year_tolerance_after") || 0);

    if (!question_text || !answer_text || !category_id) {
      redirect("/admin/questions/new?error=نص السؤال والإجابة والفئة مطلوبة");
    }

    const { error } = await supabase.from("questions").insert({
      question_text,
      answer_text,
      category_id,
      points,
      is_active,
      year_tolerance_before,
      year_tolerance_after,
      media_type: "none",
      media_url: null,
    });

    if (error) {
      redirect(`/admin/questions/new?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/admin/questions");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black md:text-4xl">إضافة سؤال جديد</h1>
              <p className="mt-2 text-slate-300">
                أضف سؤالًا مع الإجابة والنقاط والفئة، ويمكنك إدراج صورة أو فيديو داخل السؤال أو الإجابة.
              </p>
            </div>

            <Link
              href="/admin/questions"
              className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-300"
            >
              الرجوع للأسئلة
            </Link>
          </div>
        </div>

        <form
          action={createQuestion}
          className="rounded-[2rem] border border-white/10 bg-white/5 p-4 md:p-6"
        >
          <div className="space-y-6">
            <HtmlSnippetEditor
              name="question_text"
              label="نص السؤال"
              placeholder="اكتب السؤال هنا، ويمكنك إدراج صورة أو فيديو داخله"
              rows={10}
            />

            <HtmlSnippetEditor
              name="answer_text"
              label="الإجابة"
              placeholder="اكتب الإجابة هنا، ويمكنك إدراج صورة أو فيديو داخلها"
              rows={8}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold">سماحية سنة قبل</label>
              <select
                name="year_tolerance_before"
                defaultValue="0"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                <option value="0">بدون سماحية</option>
                <option value="1">سنة واحدة قبل</option>
                <option value="2">سنتان قبل</option>
                <option value="5">5 سنوات قبل</option>
                <option value="10">10 سنوات قبل</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">سماحية سنة بعد</label>
              <select
                name="year_tolerance_after"
                defaultValue="0"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                <option value="0">بدون سماحية</option>
                <option value="1">سنة واحدة بعد</option>
                <option value="2">سنتان بعد</option>
                <option value="5">5 سنوات بعد</option>
                <option value="10">10 سنوات بعد</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold">الفئة</label>
              <select
                name="category_id"
                defaultValue=""
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                <option value="">اختر الفئة</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">النقاط</label>
              <select
                name="points"
                defaultValue="200"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                <option value="200">200</option>
                <option value="400">400</option>
                <option value="600">600</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              defaultChecked
              className="h-5 w-5"
            />
            <label htmlFor="is_active" className="font-bold">
              السؤال مفعّل
            </label>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Link
              href="/admin/questions"
              className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-300"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950"
            >
              حفظ السؤال
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}