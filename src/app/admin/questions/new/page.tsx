import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import HtmlSnippetEditor from "@/components/admin/html-snippet-editor";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string }>;

type CategoryRelation =
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
  category_sections: CategoryRelation;
};

type GroupedCategorySection = {
  id: string;
  name: string;
  sortOrder: number;
  categories: { id: string; name: string }[];
};

function getSectionObject(section: CategoryRelation) {
  if (!section) return null;
  return Array.isArray(section) ? (section[0] ?? null) : section;
}

function getSectionName(section: CategoryRelation) {
  const sectionObj = getSectionObject(section);
  return sectionObj?.name ?? "";
}

function getSectionSort(section: CategoryRelation) {
  const sectionObj = getSectionObject(section);
  return typeof sectionObj?.sort_order === "number" ? sectionObj.sort_order : 999999;
}

function getSectionId(section: CategoryRelation) {
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

function appendMediaHtml(
  baseHtml: string,
  imageUrl: string,
  videoUrl: string,
) {
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
    .select("id, name, category_sections ( id, name, sort_order )")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (categoriesError) {
    return (
      <div className="p-6 text-red-400">
        فشل تحميل الفئات: {categoriesError.message}
      </div>
    );
  }

  const categories = (categoriesData ?? []) as CategoryRow[];

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
      formData.get("year_tolerance_before") || 0,
    );
    const year_tolerance_after = Number(
      formData.get("year_tolerance_after") || 0,
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
        `/admin/questions/new?error=${encodeURIComponent(
          "نص السؤال أو وسائطه، والإجابة أو وسائطها، والفئة حقول مطلوبة.",
        )}`,
      );
    }

    const normalizedQuestion = normalizeHtmlText(finalQuestionText);

    const { data: existingQuestions, error: existingError } = await supabase
      .from("questions")
      .select("id, question_text")
      .eq("category_id", category_id);

    if (existingError) {
      redirect(
        `/admin/questions/new?error=${encodeURIComponent(existingError.message)}`,
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
        `/admin/questions/new?error=${encodeURIComponent(
          "يوجد سؤال مطابق بالفعل داخل هذه الفئة.",
        )}`,
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
        `/admin/questions/new?error=${encodeURIComponent(error.message)}`,
      );
    }

    revalidatePath("/admin/questions");
    revalidatePath("/admin");
    revalidatePath("/game/start");
    revalidatePath("/game/board");

    redirect("/admin/questions");
  }

  const inputClass = "w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/60";
  const labelClass = "mb-1.5 block text-xs font-bold text-white/50";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">

        {/* ── Page header ── */}
        <div className="relative mb-6 overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_100%)]">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl" />
          <div className="relative px-7 py-9 md:px-10">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-white/30">
              <Link href="/admin" className="transition hover:text-white/55">Admin</Link>
              <span>/</span>
              <Link href="/admin/questions" className="transition hover:text-white/55">الأسئلة</Link>
              <span>/</span>
              <span className="text-white/50">إضافة جديد</span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white/50">
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  لوحة التحكم
                </span>
                <h1 className="mt-3 text-2xl font-black text-white md:text-3xl">
                  إضافة سؤال جديد
                </h1>
                <p className="mt-1.5 text-sm text-white/45">
                  أضف نص السؤال والإجابة مع الوسائط، وحدد الفئة والنقاط والإعدادات.
                </p>
              </div>
              <Link
                href="/admin/questions"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                الرجوع للأسئلة
              </Link>
            </div>
          </div>
        </div>

        {/* ── Error alert ── */}
        {resolvedSearchParams.error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-400/25 bg-red-400/8 px-4 py-3.5 text-sm font-bold text-red-300">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/></svg>
            {resolvedSearchParams.error}
          </div>
        )}

        {/* ── Main form ── */}
        <form action={createQuestion} className="space-y-5">

          {/* ─ Question block ─ */}
          <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.92)_0%,rgba(5,10,24,0.97)_100%)]">
            <div className="flex items-center gap-3 border-b border-white/6 px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/8 text-cyan-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.75 9.25a2.5 2.5 0 1 1 4.1 2c-.75.6-1.35 1.05-1.35 2"/><path d="M12 16.5h.01"/></svg>
              </div>
              <div>
                <h2 className="text-sm font-black text-white">السؤال</h2>
                <p className="text-[11px] text-white/35">نص السؤال وصورة أو فيديو اختياري</p>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <HtmlSnippetEditor
                name="question_text"
                label="نص السؤال"
                placeholder="اكتب السؤال هنا..."
                rows={8}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>رابط صورة السؤال (اختياري)</label>
                  <input name="question_image_url" type="url" placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>رابط فيديو السؤال (اختياري)</label>
                  <input name="question_video_url" type="url" placeholder="https://..." className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* ─ Answer block ─ */}
          <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.92)_0%,rgba(5,10,24,0.97)_100%)]">
            <div className="flex items-center gap-3 border-b border-white/6 px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/8 text-emerald-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
              </div>
              <div>
                <h2 className="text-sm font-black text-white">الإجابة</h2>
                <p className="text-[11px] text-white/35">نص الإجابة الصحيحة وصورة أو فيديو اختياري</p>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <HtmlSnippetEditor
                name="answer_text"
                label="نص الإجابة"
                placeholder="اكتب الإجابة هنا..."
                rows={8}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>رابط صورة الإجابة (اختياري)</label>
                  <input name="answer_image_url" type="url" placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>رابط فيديو الإجابة (اختياري)</label>
                  <input name="answer_video_url" type="url" placeholder="https://..." className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* ─ Settings block ─ */}
          <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.92)_0%,rgba(5,10,24,0.97)_100%)]">
            <div className="flex items-center gap-3 border-b border-white/6 px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/8 text-violet-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div>
                <h2 className="text-sm font-black text-white">إعدادات السؤال</h2>
                <p className="text-[11px] text-white/35">الفئة، النقاط، التفعيل، وسماحية السنوات</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Category */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>الفئة <span className="text-red-400">*</span></label>
                  <select
                    name="category_id"
                    defaultValue=""
                    className={inputClass}
                  >
                    <option value="">اختر الفئة...</option>
                    {groupedSections.map((section) => (
                      <optgroup key={section.id} label={section.name} className="text-white">
                        {section.categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Points */}
                <div>
                  <label className={labelClass}>النقاط <span className="text-red-400">*</span></label>
                  <select name="points" defaultValue="200" className={inputClass}>
                    <option value="200">200 نقطة — سهل</option>
                    <option value="400">400 نقطة — متوسط</option>
                    <option value="600">600 نقطة — صعب</option>
                  </select>
                </div>

                {/* Is active */}
                <div className="flex items-end">
                  <label className="inline-flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/8">
                    <input name="is_active" type="checkbox" defaultChecked className="h-4 w-4 rounded accent-cyan-400" />
                    <span>
                      السؤال مفعّل
                      <span className="mt-0.5 block text-[11px] font-bold text-white/35">يظهر في اللعبة فور الحفظ</span>
                    </span>
                  </label>
                </div>

                {/* Year tolerance */}
                <div>
                  <label className={labelClass}>سماحية سنوات قبل</label>
                  <select name="year_tolerance_before" defaultValue="0" className={inputClass}>
                    <option value="0">بدون سماحية</option>
                    <option value="1">سنة واحدة قبل</option>
                    <option value="2">سنتان قبل</option>
                    <option value="5">5 سنوات قبل</option>
                    <option value="10">10 سنوات قبل</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>سماحية سنوات بعد</label>
                  <select name="year_tolerance_after" defaultValue="0" className={inputClass}>
                    <option value="0">بدون سماحية</option>
                    <option value="1">سنة واحدة بعد</option>
                    <option value="2">سنتان بعد</option>
                    <option value="5">5 سنوات بعد</option>
                    <option value="10">10 سنوات بعد</option>
                  </select>
                </div>
              </div>

              {/* Hint */}
              <p className="mt-4 text-xs leading-6 text-white/35">
                يمكنك إضافة السؤال كنص فقط، أو نص مع صورة أو فيديو. السماحية تُستخدم للأسئلة التي تعتمد على سنة معينة.
              </p>
            </div>
          </div>

          {/* ─ Submit bar ─ */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
            <p className="text-xs text-white/30">
              <span className="text-red-400">*</span> حقول مطلوبة — نص السؤال، نص الإجابة، والفئة
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/admin/questions"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white active:scale-[0.98]"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-black text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.22)] transition hover:bg-cyan-400 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                حفظ السؤال
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}