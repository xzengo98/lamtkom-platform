import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import HtmlSnippetEditor from "@/components/admin/html-snippet-editor";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  error?: string;
}>;

type CategoryRelation = { name: string } | { name: string }[] | null;

type CategoryRow = {
  id: string;
  name: string;
  category_sections: CategoryRelation;
};

function getSectionName(section: CategoryRelation) {
  if (!section) return "";
  if (Array.isArray(section)) return section[0]?.name ?? "";
  return section.name;
}

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function toYouTubeEmbed(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {}

  return url;
}

function appendMediaHtml(baseHtml: string, imageUrl: string, videoUrl: string) {
  const parts: string[] = [];

  if (baseHtml.trim()) {
    parts.push(baseHtml.trim());
  }

  if (imageUrl.trim()) {
    parts.push(
      `<figure class="media-image"><img src="${escapeAttribute(
        imageUrl.trim()
      )}" alt="image" /></figure>`
    );
  }

  if (videoUrl.trim()) {
    const embed = toYouTubeEmbed(videoUrl.trim());

    if (embed.includes("youtube.com/embed/")) {
      parts.push(
        `<div class="video-wrap"><iframe src="${escapeAttribute(
          embed
        )}" allowfullscreen></iframe></div>`
      );
    } else {
      parts.push(
        `<video controls><source src="${escapeAttribute(
          videoUrl.trim()
        )}" /></video>`
      );
    }
  }

  return parts.join("\n\n").trim();
}

function normalizeHtmlText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export default async function NewQuestionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, category_sections ( name )")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (categoriesError) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-6 md:py-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 text-red-100">
          فشل تحميل الفئات: {categoriesError.message}
        </div>
      </main>
    );
  }

  const categories = (categoriesData ?? []) as CategoryRow[];

  async function createQuestion(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();

    const questionBase = formData.get("question_text")?.toString().trim() || "";
    const answerBase = formData.get("answer_text")?.toString().trim() || "";
    const category_id = formData.get("category_id")?.toString().trim() || "";

    const question_image_url =
      formData.get("question_image_url")?.toString().trim() || "";
    const question_video_url =
      formData.get("question_video_url")?.toString().trim() || "";
    const answer_image_url =
      formData.get("answer_image_url")?.toString().trim() || "";
    const answer_video_url =
      formData.get("answer_video_url")?.toString().trim() || "";

    const points = Number(formData.get("points") || 200);
    const is_active = formData.get("is_active") === "on";
    const year_tolerance_before = Number(
      formData.get("year_tolerance_before") || 0
    );
    const year_tolerance_after = Number(
      formData.get("year_tolerance_after") || 0
    );

    const finalQuestionText = appendMediaHtml(
      questionBase,
      question_image_url,
      question_video_url
    );

    const finalAnswerText = appendMediaHtml(
      answerBase,
      answer_image_url,
      answer_video_url
    );

    if (!finalQuestionText || !finalAnswerText || !category_id) {
      redirect(
        `/admin/questions/new?error=${encodeURIComponent(
          "نص السؤال أو وسائطه، والإجابة أو وسائطها، والفئة حقول مطلوبة."
        )}`
      );
    }

    const normalizedQuestion = normalizeHtmlText(finalQuestionText);

    const { data: existingQuestions, error: existingError } = await supabase
      .from("questions")
      .select("id, question_text")
      .eq("category_id", category_id);

    if (existingError) {
      redirect(
        `/admin/questions/new?error=${encodeURIComponent(existingError.message)}`
      );
    }

    const isDuplicate = (existingQuestions ?? []).some((item) => {
      const currentText =
        typeof item.question_text === "string" ? item.question_text : "";
      return normalizeHtmlText(currentText) === normalizedQuestion;
    });

    if (isDuplicate) {
      redirect(
        `/admin/questions/new?error=${encodeURIComponent(
          "يوجد سؤال مطابق بالفعل داخل هذه الفئة."
        )}`
      );
    }

    const { error } = await supabase.from("questions").insert({
      question_text: finalQuestionText,
      answer_text: finalAnswerText,
      category_id,
      points,
      is_active,
      is_used: false,
      year_tolerance_before,
      year_tolerance_after,
    });

    if (error) {
      redirect(
        `/admin/questions/new?error=${encodeURIComponent(error.message)}`
      );
    }

    revalidatePath("/admin/questions");
    revalidatePath("/admin");
    revalidatePath("/game/start");
    revalidatePath("/game/board");

    redirect("/admin/questions");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black md:text-4xl">إضافة سؤال جديد</h1>
              <p className="mt-2 text-slate-300">
                أضف السؤال مع النص أو الصور أو الفيديو، وحدد الفئة والنقاط
                والتفعيل وسماحية السنوات من صفحة واحدة.
              </p>
            </div>

            <Link
              href="/admin/questions"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/5"
            >
              الرجوع للأسئلة
            </Link>
          </div>
        </div>

        {resolvedSearchParams.error ? (
          <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-4 text-red-100">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <form
          action={createQuestion}
          className="rounded-[2rem] border border-white/10 bg-white/5 p-4 md:p-6"
        >
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-6">
              <HtmlSnippetEditor
                name="question_text"
                label="نص السؤال"
                defaultValue=""
                placeholder="اكتب السؤال هنا"
                rows={10}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    رابط صورة السؤال
                  </label>
                  <input
                    type="url"
                    name="question_image_url"
                    placeholder="https://example.com/question-image.jpg"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    رابط فيديو السؤال
                  </label>
                  <input
                    type="url"
                    name="question_video_url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <HtmlSnippetEditor
                name="answer_text"
                label="الإجابة"
                defaultValue=""
                placeholder="اكتب الإجابة هنا"
                rows={8}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    رابط صورة الإجابة
                  </label>
                  <input
                    type="url"
                    name="answer_image_url"
                    placeholder="https://example.com/answer-image.jpg"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    رابط فيديو الإجابة
                  </label>
                  <input
                    type="url"
                    name="answer_video_url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/60 p-4">
                <h2 className="text-lg font-black">إعدادات السؤال</h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  اختر الفئة الصحيحة وحدد النقاط وحالة التفعيل وسماحية السنوات.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">الفئة</label>
                <select
                  name="category_id"
                  defaultValue=""
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
                  required
                >
                  <option value="" disabled>
                    اختر الفئة
                  </option>
                  {categories.map((category) => {
                    const sectionName = getSectionName(category.category_sections);

                    return (
                      <option key={category.id} value={category.id}>
                        {sectionName ? `${sectionName} / ${category.name}` : category.name}
                      </option>
                    );
                  })}
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

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
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

              <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-slate-900/60 p-4">
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

              <div className="rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-7 text-cyan-100">
                يمكنك إضافة السؤال كنص فقط، أو نص مع صورة، أو نص مع فيديو.
                وينطبق ذلك أيضًا على الإجابة.
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Link
              href="/admin/questions"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/5"
            >
              إلغاء
            </Link>

            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
            >
              حفظ السؤال
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}