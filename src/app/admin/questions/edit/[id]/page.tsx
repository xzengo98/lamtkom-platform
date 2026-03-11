import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import HtmlSnippetEditor from "@/components/admin/html-snippet-editor";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  error?: string;
  success?: string;
}>;

type CategoryRelation = { name: string } | { name: string }[] | null;

type CategoryRow = {
  id: string;
  name: string;
  category_sections: CategoryRelation;
};

type QuestionRow = {
  id: string;
  question_text: string | null;
  answer_text: string | null;
  category_id: string | null;
  points: number | null;
  is_active: boolean | null;
  year_tolerance_before: number | null;
  year_tolerance_after: number | null;
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

function extractFirstMatch(value: string, regex: RegExp) {
  const match = value.match(regex);
  return match?.[1]?.trim() ?? "";
}

function stripMediaBlocks(value: string) {
  return value
    .replace(/<figure[^>]*>\s*<img[^>]*>\s*<\/figure>/gis, "")
    .replace(/<img[^>]*>/gis, "")
    .replace(
      /<div[^>]*class=["'][^"']*video-wrap[^"']*["'][^>]*>[\s\S]*?<\/div>/gis,
      ""
    )
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gis, "")
    .replace(/<video[^>]*>[\s\S]*?<\/video>/gis, "")
    .replace(/<p>\s*<\/p>/gis, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitContentAndMedia(value: string | null) {
  const html = value ?? "";

  const imageUrl = extractFirstMatch(
    html,
    /<img[^>]*src=["']([^"']+)["'][^>]*>/i
  );

  let videoUrl = extractFirstMatch(
    html,
    /<iframe[^>]*src=["']([^"']+)["'][^>]*>/i
  );

  if (!videoUrl) {
    videoUrl = extractFirstMatch(
      html,
      /<video[^>]*src=["']([^"']+)["'][^>]*>/i
    );
  }

  if (!videoUrl) {
    videoUrl = extractFirstMatch(
      html,
      /<source[^>]*src=["']([^"']+)["'][^>]*>/i
    );
  }

  return {
    contentHtml: stripMediaBlocks(html),
    imageUrl,
    videoUrl,
  };
}

export default async function EditQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
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

  const { data: questionData } = await supabase
    .from("questions")
    .select(
      `
        id,
        question_text,
        answer_text,
        category_id,
        points,
        is_active,
        year_tolerance_before,
        year_tolerance_after
      `
    )
    .eq("id", id)
    .single();

  if (!questionData) notFound();

  const question = questionData as QuestionRow;

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, category_sections ( name )")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const categories = (categoriesData ?? []) as CategoryRow[];

  const parsedQuestion = splitContentAndMedia(question.question_text);
  const parsedAnswer = splitContentAndMedia(question.answer_text);

  async function updateQuestion(formData: FormData) {
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
    const year_tolerance_before = Number(formData.get("year_tolerance_before") || 0);
    const year_tolerance_after = Number(formData.get("year_tolerance_after") || 0);

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
        `/admin/questions/edit/${id}?error=${encodeURIComponent(
          "نص السؤال أو وسائطه، والإجابة أو وسائطها، والفئة حقول مطلوبة."
        )}`
      );
    }

    const { error } = await supabase
      .from("questions")
      .update({
        question_text: finalQuestionText,
        answer_text: finalAnswerText,
        category_id,
        points,
        is_active,
        year_tolerance_before,
        year_tolerance_after,
      })
      .eq("id", id);

    if (error) {
      redirect(`/admin/questions/edit/${id}?error=${encodeURIComponent(error.message)}`);
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
              <h1 className="text-3xl font-black md:text-4xl">تعديل السؤال</h1>
              <p className="mt-2 text-slate-300">
                يمكنك تعديل نص السؤال، الإجابة، النقاط، الفئة، التفعيل، وروابط الصور
                والفيديو بشكل مباشر.
              </p>
            </div>

            <Link
              href="/admin/questions"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-300"
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
          action={updateQuestion}
          className="rounded-[2rem] border border-white/10 bg-white/5 p-4 md:p-6"
        >
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-6">
              <HtmlSnippetEditor
                name="question_text"
                label="نص السؤال"
                defaultValue={parsedQuestion.contentHtml}
                placeholder="اكتب السؤال هنا"
                rows={10}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">رابط صورة السؤال</label>
                  <input
                    type="url"
                    name="question_image_url"
                    defaultValue={parsedQuestion.imageUrl}
                    placeholder="https://example.com/question-image.jpg"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">رابط فيديو السؤال</label>
                  <input
                    type="url"
                    name="question_video_url"
                    defaultValue={parsedQuestion.videoUrl}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <HtmlSnippetEditor
                name="answer_text"
                label="الإجابة"
                defaultValue={parsedAnswer.contentHtml}
                placeholder="اكتب الإجابة هنا"
                rows={8}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">رابط صورة الإجابة</label>
                  <input
                    type="url"
                    name="answer_image_url"
                    defaultValue={parsedAnswer.imageUrl}
                    placeholder="https://example.com/answer-image.jpg"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">رابط فيديو الإجابة</label>
                  <input
                    type="url"
                    name="answer_video_url"
                    defaultValue={parsedAnswer.videoUrl}
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
                  يمكنك تغيير الفئة، النقاط، حالة التفعيل، وسماحية السنوات من هنا.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">الفئة</label>
                <select
                  name="category_id"
                  defaultValue={question.category_id ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
                >
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
                  defaultValue={String(question.points ?? 200)}
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
                    defaultValue={String(question.year_tolerance_before ?? 0)}
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
                    defaultValue={String(question.year_tolerance_after ?? 0)}
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
                  defaultChecked={Boolean(question.is_active)}
                  className="h-5 w-5"
                />
                <label htmlFor="is_active" className="font-bold">
                  السؤال مفعّل
                </label>
              </div>

              <div className="rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-7 text-cyan-100">
                إذا أردت تعديل الصورة أو الفيديو مباشرة، غيّر الرابط من الحقول أعلاه.
                وإذا أردت حذف الوسائط، امسح الرابط ثم احفظ التعديلات.
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Link
              href="/admin/questions"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-300"
            >
              إلغاء
            </Link>

            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}