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

type CategorySectionRelation =
  | {
      id?: string;
      name?: string;
      sort_order?: number | null;
    }
  | {
      id?: string;
      name?: string;
      sort_order?: number | null;
    }[]
  | null;

type CategoryRow = {
  id: string;
  name: string;
  category_sections: CategorySectionRelation;
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

type GroupedCategorySection = {
  id: string;
  name: string;
  sortOrder: number;
  categories: { id: string; name: string }[];
};

function getSectionObject(section: CategorySectionRelation) {
  if (!section) return null;
  return Array.isArray(section) ? (section[0] ?? null) : section;
}

function getSectionName(section: CategorySectionRelation) {
  const sectionObj = getSectionObject(section);
  return sectionObj?.name ?? "";
}

function getSectionSort(section: CategorySectionRelation) {
  const sectionObj = getSectionObject(section);
  return typeof sectionObj?.sort_order === "number" ? sectionObj.sort_order : 999999;
}

function getSectionId(section: CategorySectionRelation) {
  const sectionObj = getSectionObject(section);
  return sectionObj?.id ?? "__uncategorized__";
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
      )}" alt="" class="mx-auto my-4 rounded-2xl max-w-full" />`,
    );
  }

  if (videoUrl.trim()) {
    const embed = toYouTubeEmbed(videoUrl.trim());

    if (embed.includes("youtube.com/embed/")) {
      parts.push(
        `<iframe src="${escapeAttribute(
          embed,
        )}" class="w-full max-w-3xl aspect-video rounded-2xl mx-auto my-4" allowfullscreen></iframe>`,
      );
    } else {
      parts.push(
        `<video controls preload="metadata" src="${escapeAttribute(
          videoUrl.trim(),
        )}" class="w-full max-w-3xl rounded-2xl mx-auto my-4"></video>`,
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
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<video[^>]*>.*?<\/video>/gi, "")
    .replace(/<video[^>]*\/?>/gi, "")
    .replace(/<audio[^>]*>.*?<\/audio>/gi, "")
    .replace(/<audio[^>]*\/?>/gi, "")
    .replace(/<source[^>]*\/?>/gi, "")
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

  const [
    { data: categoriesData, error: categoriesError },
    { data: questionData, error: questionError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, category_sections ( id, name, sort_order )")
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
      <div className="p-6 text-red-400">
        فشل تحميل الفئات: {categoriesError.message}
      </div>
    );
  }

  if (questionError) {
    return (
  <div className="mx-auto max-w-3xl p-4 md:p-6">
    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
      <h1 className="text-2xl font-black text-white">تعذر تحميل السؤال</h1>
      <p className="mt-3 text-sm leading-7 text-white/70">
        لم يتم العثور على السؤال المطلوب أو حدث خطأ أثناء التحميل.
      </p>

      <div className="mt-5">
        <Link
          href="/admin/questions"
          className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
        >
          الرجوع للأسئلة
        </Link>
      </div>
    </div>
  </div>
);
  }
  

  const categories = (categoriesData ?? []) as CategoryRow[];
  const question = questionData as QuestionRow;

  const groupedSectionsMap = new Map<string, GroupedCategorySection>();

  for (const category of categories) {
    const sectionId = getSectionId(category.category_sections);
    const sectionName = getSectionName(category.category_sections) || "بدون قسم";
    const sortOrder = getSectionSort(category.category_sections);

    if (!groupedSectionsMap.has(sectionId)) {
      groupedSectionsMap.set(sectionId, {
        id: sectionId,
        name: sectionName,
        sortOrder,
        categories: [],
      });
    }

    groupedSectionsMap.get(sectionId)!.categories.push({
      id: category.id,
      name: category.name,
    });
  }

  const groupedSections = Array.from(groupedSectionsMap.values())
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name, "ar");
    })
    .map((section) => ({
      ...section,
      categories: section.categories.sort((a, b) =>
        a.name.localeCompare(b.name, "ar"),
      ),
    }));

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

    const isDuplicate = (existingQuestions ?? []).some(
      (item: { id?: string; question_text?: string | null }) => {
        const currentText =
          typeof item.question_text === "string" ? item.question_text : "";
        return normalizeHtmlText(currentText) === normalizedQuestion;
      },
    );

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
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <h1 className="text-3xl font-black text-white">تعديل السؤال</h1>
        <p className="mt-3 text-sm leading-7 text-white/70">
          عدّل السؤال مع النص أو الصور أو الفيديو أو الصوت، وحدد الفئة والنقاط
          والتفعيل وسماحية السنوات من صفحة واحدة.
        </p>

        <div className="mt-5">
          <Link
            href={returnTo}
            className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
          >
            الرجوع للأسئلة
          </Link>
        </div>
      </div>

      {resolvedSearchParams.error ? (
        <div className="mb-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-100">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      <form
        action={updateQuestion}
        className="space-y-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
      >
        <input type="hidden" name="returnTo" value={returnTo} />

        <HtmlSnippetEditor
          name="question_text"
          label="نص السؤال"
          defaultValue={initialQuestionBase}
          placeholder="اكتب السؤال هنا..."
          rows={8}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-black text-white/80">
              رابط صورة السؤال
            </label>
            <input
              name="question_image_url"
              type="url"
              defaultValue={initialQuestionImageUrl}
              placeholder="https://..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-white/80">
              رابط فيديو السؤال
            </label>
            <input
              name="question_video_url"
              type="url"
              defaultValue={initialQuestionVideoUrl}
              placeholder="https://..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </div>
        </div>

        <HtmlSnippetEditor
          name="answer_text"
          label="نص الإجابة"
          defaultValue={initialAnswerBase}
          placeholder="اكتب الإجابة هنا..."
          rows={8}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-black text-white/80">
              رابط صورة الإجابة
            </label>
            <input
              name="answer_image_url"
              type="url"
              defaultValue={initialAnswerImageUrl}
              placeholder="https://..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-white/80">
              رابط فيديو الإجابة
            </label>
            <input
              name="answer_video_url"
              type="url"
              defaultValue={initialAnswerVideoUrl}
              placeholder="https://..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-black text-white">إعدادات السؤال</h2>
          <p className="mb-5 text-sm leading-7 text-white/65">
            اختر الفئة الصحيحة وحدد النقاط وحالة التفعيل وسماحية السنوات.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-black text-white/80">
                الفئة
              </label>
              <select
                name="category_id"
                defaultValue={question.category_id ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                <option value="">اختر الفئة</option>
                {groupedSections.map((section) => (
                  <optgroup
                    key={section.id}
                    label={section.name}
                    className="text-white"
                  >
                    {section.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-white/80">
                النقاط
              </label>
              <select
                name="points"
                defaultValue={String(question.points)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                <option value="200">200</option>
                <option value="400">400</option>
                <option value="600">600</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-white/80">
                سماحية سنة قبل
              </label>
              <select
                name="year_tolerance_before"
                defaultValue={String(question.year_tolerance_before ?? 0)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                <option value="0">بدون سماحية</option>
                <option value="1">سنة واحدة قبل</option>
                <option value="2">سنتان قبل</option>
                <option value="5">5 سنوات قبل</option>
                <option value="10">10 سنوات قبل</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-white/80">
                سماحية سنة بعد
              </label>
              <select
                name="year_tolerance_after"
                defaultValue={String(question.year_tolerance_after ?? 0)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                <option value="0">بدون سماحية</option>
                <option value="1">سنة واحدة بعد</option>
                <option value="2">سنتان بعد</option>
                <option value="5">5 سنوات بعد</option>
                <option value="10">10 سنوات بعد</option>
              </select>
            </div>
          </div>

          <label className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={question.is_active}
              className="h-4 w-4 accent-cyan-400"
            />
            السؤال مفعّل
          </label>

          <div className="mt-4 text-sm font-bold text-white/65">
            حالة الاستخدام الحالية:{" "}
            <span className="text-white">
              {question.is_used ? "مستخدم" : "غير مستخدم"}
            </span>
          </div>
        </div>

        <p className="text-sm leading-7 text-white/65">
          يمكنك تعديل السؤال كنص فقط، أو نص مع صورة، أو نص مع فيديو، أو مقطع
          صوتي من داخل المحرر. وينطبق ذلك أيضًا على الإجابة.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={returnTo}
            className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
          >
            إلغاء
          </Link>

          <button
            type="submit"
            className="inline-flex items-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
          >
            حفظ التعديلات
          </button>
        </div>
      </form>
    </main>
  );
}