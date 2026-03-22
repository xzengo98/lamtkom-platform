import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import HtmlSnippetEditor from "@/components/admin/html-snippet-editor";
import AdminEmptyState from "@/components/admin/admin-empty-state";

export const dynamic = "force-dynamic";

type Params = Promise<{
  id: string;
}>;

type SearchParams = Promise<{
  error?: string;
  returnTo?: string;
}>;

type CategoryRelation = { name: string } | { name: string }[] | null;

type CategoryRow = {
  id: string;
  name: string;
  category_sections: CategoryRelation;
};

type QuestionRow = {
  id: string;
  question_text: string;
  answer_text: string | null;
  category_id: string | null;
  points: number;
  is_active: boolean;
  is_used: boolean;
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
      `<img src="${escapeAttribute(
        imageUrl.trim(),
      )}" alt="" class="w-full rounded-2xl object-contain" />`,
    );
  }

  if (videoUrl.trim()) {
    const embed = toYouTubeEmbed(videoUrl.trim());

    if (embed.includes("youtube.com/embed/")) {
      parts.push(
        `<iframe src="${escapeAttribute(
          embed,
        )}" class="aspect-video w-full rounded-2xl" allowfullscreen></iframe>`,
      );
    } else {
      parts.push(
        `<video src="${escapeAttribute(
          embed,
        )}" controls class="w-full rounded-2xl"></video>`,
      );
    }
  }

  return parts.join("\n\n").trim();
}

function normalizeHtmlText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function extractFirstImageSrc(html: string | null | undefined) {
  if (!html) return "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match?.[1]?.trim() ?? "";
}

function extractFirstVideoSrc(html: string | null | undefined) {
  if (!html) return "";

  const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (iframeMatch?.[1]) return iframeMatch[1].trim();

  const videoMatch = html.match(/<video[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (videoMatch?.[1]) return videoMatch[1].trim();

  return "";
}

function stripMediaHtml(html: string | null | undefined) {
  if (!html) return "";

  return html
    .replace(/<img[^>]*>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<video[\s\S]*?<\/video>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeReturnTo(returnTo: string | undefined) {
  if (!returnTo || !returnTo.startsWith("/")) {
    return "/admin/questions";
  }

  return returnTo;
}

export default async function EditQuestionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const questionId = resolvedParams.id;
  const returnTo = sanitizeReturnTo(resolvedSearchParams.returnTo);

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

  const [{ data: categoriesData, error: categoriesError }, { data: questionData, error: questionError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name, category_sections ( name )")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("questions")
        .select(
          "id, question_text, answer_text, category_id, points, is_active, is_used, year_tolerance_before, year_tolerance_after",
        )
        .eq("id", questionId)
        .single(),
    ]);

  if (categoriesError) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        فشل تحميل الفئات: {categoriesError.message}
      </div>
    );
  }

  if (questionError) {
    return (
      <div className="space-y-4">
        <AdminEmptyState
          title="السؤال غير موجود"
          description="ربما تم حذف السؤال أو أن الرابط غير صحيح."
          buttonText="الرجوع للأسئلة"
        />
        <div className="flex justify-center">
          <Link
            href={returnTo}
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            الرجوع للأسئلة
          </Link>
        </div>
      </div>
    );
  }

  const categories = (categoriesData ?? []) as CategoryRow[];
  const question = questionData as QuestionRow;

  const initialQuestionBase = stripMediaHtml(question.question_text);
  const initialAnswerBase = stripMediaHtml(question.answer_text);
  const initialQuestionImageUrl = extractFirstImageSrc(question.question_text);
  const initialQuestionVideoUrl = extractFirstVideoSrc(question.question_text);
  const initialAnswerImageUrl = extractFirstImageSrc(question.answer_text);
  const initialAnswerVideoUrl = extractFirstVideoSrc(question.answer_text);

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
    const year_tolerance_before = Number(
      formData.get("year_tolerance_before") || 0,
    );
    const year_tolerance_after = Number(
      formData.get("year_tolerance_after") || 0,
    );
    const safeReturnTo = sanitizeReturnTo(
      formData.get("returnTo")?.toString().trim(),
    );

    const finalQuestionText = appendMediaHtml(
      questionBase,
      question_image_url,
      question_video_url,
    );
    const finalAnswerText = appendMediaHtml(
      answerBase,
      answer_image_url,
      answer_video_url,
    );

    if (!finalQuestionText || !finalAnswerText || !category_id) {
      redirect(
        `/admin/questions/edit/${questionId}?returnTo=${encodeURIComponent(
          safeReturnTo,
        )}&error=${encodeURIComponent(
          "نص السؤال أو وسائطه، والإجابة أو وسائطها، والفئة حقول مطلوبة.",
        )}`,
      );
    }

    const normalizedQuestion = normalizeHtmlText(finalQuestionText);

    const { data: existingQuestions, error: existingError } = await supabase
      .from("questions")
      .select("id, question_text")
      .eq("category_id", category_id)
      .neq("id", questionId);

    if (existingError) {
      redirect(
        `/admin/questions/edit/${questionId}?returnTo=${encodeURIComponent(
          safeReturnTo,
        )}&error=${encodeURIComponent(existingError.message)}`,
      );
    }

    const isDuplicate = (existingQuestions ?? []).some((item) => {
      const currentText =
        typeof item.question_text === "string" ? item.question_text : "";
      return normalizeHtmlText(currentText) === normalizedQuestion;
    });

    if (isDuplicate) {
      redirect(
        `/admin/questions/edit/${questionId}?returnTo=${encodeURIComponent(
          safeReturnTo,
        )}&error=${encodeURIComponent(
          "يوجد سؤال مطابق بالفعل داخل هذه الفئة.",
        )}`,
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
      .eq("id", questionId);

    if (error) {
      redirect(
        `/admin/questions/edit/${questionId}?returnTo=${encodeURIComponent(
          safeReturnTo,
        )}&error=${encodeURIComponent(error.message)}`,
      );
    }

    revalidatePath("/admin/questions");
    revalidatePath("/admin");
    revalidatePath("/game/start");
    revalidatePath("/game/board");

    redirect(safeReturnTo);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-cyan-300">إدارة المحتوى</div>
            <h1 className="mt-2 text-4xl font-black text-white">
              تعديل السؤال
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-white/75">
              عدّل السؤال مع النص أو الصور أو الفيديو، وحدد الفئة والنقاط والتفعيل
              وسماحية السنوات من صفحة واحدة.
            </p>
          </div>

          <Link
            href={returnTo}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            الرجوع للأسئلة
          </Link>
        </div>

        {resolvedSearchParams.error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-100">
            {resolvedSearchParams.error}
          </div>
        ) : null}
      </div>

      <form action={updateQuestion} className="space-y-6">
        <input type="hidden" name="returnTo" value={returnTo} />

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <HtmlSnippetEditor
              name="question_text"
              label="نص السؤال"
              defaultValue={initialQuestionBase}
              placeholder="اكتب نص السؤال هنا..."
              rows={10}
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  رابط صورة السؤال
                </label>
                <input
                  name="question_image_url"
                  defaultValue={initialQuestionImageUrl}
                  placeholder="https://example.com/question-image.jpg"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  رابط فيديو السؤال
                </label>
                <input
                  name="question_video_url"
                  defaultValue={initialQuestionVideoUrl}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <HtmlSnippetEditor
              name="answer_text"
              label="نص الإجابة"
              defaultValue={initialAnswerBase}
              placeholder="اكتب نص الإجابة هنا..."
              rows={10}
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  رابط صورة الإجابة
                </label>
                <input
                  name="answer_image_url"
                  defaultValue={initialAnswerImageUrl}
                  placeholder="https://example.com/answer-image.jpg"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  رابط فيديو الإجابة
                </label>
                <input
                  name="answer_video_url"
                  defaultValue={initialAnswerVideoUrl}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <h2 className="text-2xl font-black text-white">إعدادات السؤال</h2>
          <p className="mt-2 text-white/70">
            اختر الفئة الصحيحة وحدد النقاط وحالة التفعيل وسماحية السنوات.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                الفئة
              </label>
              <select
                name="category_id"
                defaultValue={question.category_id ?? ""}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="">اختر الفئة</option>
                {categories.map((category) => {
                  const sectionName = getSectionName(category.category_sections);
                  return (
                    <option key={category.id} value={category.id}>
                      {sectionName
                        ? `${sectionName} / ${category.name}`
                        : category.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                النقاط
              </label>
              <select
                name="points"
                defaultValue={String(question.points ?? 200)}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="200">200</option>
                <option value="400">400</option>
                <option value="600">600</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                سماحية سنة قبل
              </label>
              <select
                name="year_tolerance_before"
                defaultValue={String(question.year_tolerance_before ?? 0)}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="0">بدون سماحية</option>
                <option value="1">سنة واحدة قبل</option>
                <option value="2">سنتان قبل</option>
                <option value="5">5 سنوات قبل</option>
                <option value="10">10 سنوات قبل</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                سماحية سنة بعد
              </label>
              <select
                name="year_tolerance_after"
                defaultValue={String(question.year_tolerance_after ?? 0)}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="0">بدون سماحية</option>
                <option value="1">سنة واحدة بعد</option>
                <option value="2">سنتان بعد</option>
                <option value="5">5 سنوات بعد</option>
                <option value="10">10 سنوات بعد</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={question.is_active}
                className="h-4 w-4 rounded border-white/20 bg-slate-900"
              />
              السؤال مفعّل
            </label>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              حالة الاستخدام الحالية: {question.is_used ? "مستخدم" : "غير مستخدم"}
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-white/60">
            يمكنك تعديل السؤال كنص فقط، أو نص مع صورة، أو نص مع فيديو. وينطبق ذلك
            أيضًا على الإجابة.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href={returnTo}
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