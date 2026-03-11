import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  error?: string;
  success?: string;
}>;

type CategoryRelation =
  | { name: string; slug: string }
  | { name: string; slug: string }[]
  | null;

type CategoryLookupRow = {
  id: string;
  name: string;
  slug: string;
  category_sections: CategoryRelation;
};

type UploadQuestionRow = {
  section?: string;
  section_name?: string;
  section_slug?: string;
  category?: string;
  category_name?: string;
  category_slug?: string;
  points?: number;
  is_active?: boolean | string;
  year_tolerance_before?: number;
  year_tolerance_after?: number;
  question_text?: string;
  question?: string;
  question_html?: string;
  answer_text?: string;
  answer?: string;
  answer_html?: string;
  question_image_url?: string;
  question_video_url?: string;
  answer_image_url?: string;
  answer_video_url?: string;
};

type PreparedInsertRow = {
  category_id: string;
  question_text: string;
  answer_text: string;
  points: number;
  is_active: boolean;
  is_used: boolean;
  year_tolerance_before: number;
  year_tolerance_after: number;
};

const MAX_IMPORT_QUESTIONS = 1500;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const INSERT_CHUNK_SIZE = 100;

const sampleJson = JSON.stringify(
  {
    questions: [
      {
        section: "عام",
        category: "تاريخ",
        points: 200,
        is_active: true,
        question_text: "<p>في أي سنة سقطت القسطنطينية؟</p>",
        answer_text: "<p>1453</p>",
        question_image_url: "",
        question_video_url: "",
        answer_image_url: "",
        answer_video_url: "",
      },
      {
        section: "عام",
        category: "تاريخ",
        points: 400,
        is_active: true,
        question_text: "<p>ما اسم المعاهدة التي أنهت الحرب العالمية الأولى رسميًا؟</p>",
        answer_text: "<p>معاهدة فرساي</p>",
        question_image_url: "",
        question_video_url: "",
        answer_image_url: "",
        answer_video_url: "",
      },
    ],
  },
  null,
  2
);

function getSectionName(section: CategoryRelation) {
  if (!section) return "";
  if (Array.isArray(section)) return section[0]?.name ?? "";
  return section.name;
}

function getSectionSlug(section: CategoryRelation) {
  if (!section) return "";
  if (Array.isArray(section)) return section[0]?.slug ?? "";
  return section.slug;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLower(value: unknown) {
  return normalizeString(value).toLowerCase();
}

function normalizeBool(value: unknown, fallback = true) {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["false", "0", "off", "no"].includes(normalized)) return false;
    if (["true", "1", "on", "yes"].includes(normalized)) return true;
  }

  return fallback;
}

function normalizePoints(value: unknown) {
  const numeric = Number(value ?? 200);
  if (numeric === 400 || numeric === 600) return numeric;
  return 200;
}

function normalizeTolerance(value: unknown) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.floor(numeric);
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

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function containsLikelyYear(value: string) {
  return /\b(1[0-9]{3}|20[0-9]{2})\b/.test(value);
}

function getDefaultTolerance(points: number) {
  if (points === 600) return 10;
  if (points === 400) return 5;
  return 1;
}

export default async function ImportQuestionsPage({
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
    .select("id, name, slug, category_sections ( name, slug )")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (categoriesError) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-6 md:py-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 text-red-100">
          فشل تحميل الفئات: {categoriesError.message}
        </div>
      </main>
    );
  }

  const categories = (categoriesData ?? []) as CategoryLookupRow[];

  async function importQuestions(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();

    const fileEntry = formData.get("data_file");

    if (!(fileEntry instanceof File) || fileEntry.size === 0) {
      redirect(
        `/admin/questions/import?error=${encodeURIComponent("اختر ملف JSON أولًا.")}`
      );
    }

    if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
      redirect(
        `/admin/questions/import?error=${encodeURIComponent(
          "حجم الملف كبير جدًا. ارفع ملفًا أصغر."
        )}`
      );
    }

    let rawText = "";
    try {
      rawText = await fileEntry.text();
    } catch {
      redirect(
        `/admin/questions/import?error=${encodeURIComponent(
          "تعذر قراءة الملف المرفوع."
        )}`
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      redirect(
        `/admin/questions/import?error=${encodeURIComponent(
          "تنسيق JSON غير صالح."
        )}`
      );
    }

    const rows = Array.isArray(parsed)
      ? (parsed as UploadQuestionRow[])
      : Array.isArray((parsed as { questions?: unknown[] })?.questions)
      ? (((parsed as { questions?: unknown[] }).questions ?? []) as UploadQuestionRow[])
      : [];

    if (!rows.length) {
      redirect(
        `/admin/questions/import?error=${encodeURIComponent(
          "الملف لا يحتوي على أسئلة صالحة."
        )}`
      );
    }

    if (rows.length > MAX_IMPORT_QUESTIONS) {
      redirect(
        `/admin/questions/import?error=${encodeURIComponent(
          `الحد الأقصى المسموح به في الدفعة الواحدة هو ${MAX_IMPORT_QUESTIONS} سؤال.`
        )}`
      );
    }

    const categoryBySlug = new Map<string, CategoryLookupRow>();
    const categoryByName = new Map<string, CategoryLookupRow[]>();

    for (const category of categories) {
      categoryBySlug.set(category.slug.toLowerCase(), category);

      const key = category.name.toLowerCase();
      const list = categoryByName.get(key) ?? [];
      list.push(category);
      categoryByName.set(key, list);
    }

    function resolveCategory(row: UploadQuestionRow) {
      const sectionName = normalizeLower(row.section ?? row.section_name);
      const sectionSlug = normalizeLower(row.section_slug);
      const categoryName = normalizeLower(row.category ?? row.category_name);
      const categorySlug = normalizeLower(row.category_slug);

      if (categorySlug) {
        const bySlug = categoryBySlug.get(categorySlug);
        if (bySlug) return bySlug;
      }

      if (!categoryName) return null;

      const candidates = categoryByName.get(categoryName) ?? [];
      if (!candidates.length) return null;

      if (!sectionName && !sectionSlug) {
        return candidates[0] ?? null;
      }

      return (
        candidates.find((candidate) => {
          const currentSectionName = getSectionName(candidate.category_sections).toLowerCase();
          const currentSectionSlug = getSectionSlug(candidate.category_sections).toLowerCase();

          return (
            (sectionName && currentSectionName === sectionName) ||
            (sectionSlug && currentSectionSlug === sectionSlug)
          );
        }) ?? null
      );
    }

    const preparedRows: PreparedInsertRow[] = [];
    let skippedInvalid = 0;

    for (const row of rows) {
      const resolvedCategory = resolveCategory(row);

      const rawQuestion =
        normalizeString(row.question_text) ||
        normalizeString(row.question) ||
        normalizeString(row.question_html);

      const rawAnswer =
        normalizeString(row.answer_text) ||
        normalizeString(row.answer) ||
        normalizeString(row.answer_html);

      if (!resolvedCategory || !rawQuestion || !rawAnswer) {
        skippedInvalid += 1;
        continue;
      }

      const points = normalizePoints(row.points);

      let yearToleranceBefore = normalizeTolerance(row.year_tolerance_before);
      let yearToleranceAfter = normalizeTolerance(row.year_tolerance_after);

      if (
        yearToleranceBefore === 0 &&
        yearToleranceAfter === 0 &&
        containsLikelyYear(`${rawQuestion} ${rawAnswer}`)
      ) {
        const defaultTolerance = getDefaultTolerance(points);
        yearToleranceBefore = defaultTolerance;
        yearToleranceAfter = defaultTolerance;
      }

      const questionText = appendMediaHtml(
        rawQuestion,
        normalizeString(row.question_image_url),
        normalizeString(row.question_video_url)
      );

      const answerText = appendMediaHtml(
        rawAnswer,
        normalizeString(row.answer_image_url),
        normalizeString(row.answer_video_url)
      );

      preparedRows.push({
        category_id: resolvedCategory.id,
        question_text: questionText,
        answer_text: answerText,
        points,
        is_active: normalizeBool(row.is_active, true),
        is_used: false,
        year_tolerance_before: yearToleranceBefore,
        year_tolerance_after: yearToleranceAfter,
      });
    }

    if (!preparedRows.length) {
      redirect(
        `/admin/questions/import?error=${encodeURIComponent(
          "لم يتم العثور على أسئلة صالحة للرفع بعد التحقق من البيانات."
        )}`
      );
    }

    const categoryIds = Array.from(new Set(preparedRows.map((row) => row.category_id)));

    const { data: existingQuestions, error: existingError } = await supabase
      .from("questions")
      .select("category_id, question_text")
      .in("category_id", categoryIds);

    if (existingError) {
      redirect(
        `/admin/questions/import?error=${encodeURIComponent(existingError.message)}`
      );
    }

    const existingQuestionSet = new Set(
      (existingQuestions ?? []).map((item) => {
        const categoryId =
          typeof item.category_id === "string" ? item.category_id : "";
        const questionText =
          typeof item.question_text === "string" ? item.question_text : "";
        return `${categoryId}::${stripHtml(questionText)}`;
      })
    );

    const fileQuestionSet = new Set<string>();
    const finalRows: PreparedInsertRow[] = [];
    let skippedDuplicates = 0;

    for (const row of preparedRows) {
      const key = `${row.category_id}::${stripHtml(row.question_text)}`;

      if (existingQuestionSet.has(key) || fileQuestionSet.has(key)) {
        skippedDuplicates += 1;
        continue;
      }

      fileQuestionSet.add(key);
      finalRows.push(row);
    }

    if (!finalRows.length) {
      redirect(
        `/admin/questions/import?error=${encodeURIComponent(
          "كل الأسئلة مكررة أو غير قابلة للإضافة."
        )}`
      );
    }

    for (let i = 0; i < finalRows.length; i += INSERT_CHUNK_SIZE) {
      const chunk = finalRows.slice(i, i + INSERT_CHUNK_SIZE);

      const { error } = await supabase.from("questions").insert(chunk);

      if (error) {
        redirect(
          `/admin/questions/import?error=${encodeURIComponent(
            `فشل رفع الدفعة: ${error.message}`
          )}`
        );
      }
    }

    revalidatePath("/admin/questions");
    revalidatePath("/admin");
    revalidatePath("/game/start");
    revalidatePath("/game/board");

    const successMessage = `تم رفع ${finalRows.length} سؤال بنجاح. تم تخطي ${skippedDuplicates} سؤال مكرر و${skippedInvalid} سؤال غير صالح.`;

    redirect(
      `/admin/questions/import?success=${encodeURIComponent(successMessage)}`
    );
  }

  const previewCategories = categories.slice(0, 12);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          title="رفع أسئلة بالجملة"
          description="ارفع ملف JSON منظم لإضافة الأسئلة على دفعات بشكل أخف وأكثر استقرارًا."
          action={
            <div className="flex flex-wrap gap-3">
              <a
                href={`data:application/json;charset=utf-8,${encodeURIComponent(
                  sampleJson
                )}`}
                download="seenjeem-sample-import.json"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                تحميل ملف مثال
              </a>
              <Link
                href="/admin/questions"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/15"
              >
                الرجوع للأسئلة
              </Link>
            </div>
          }
        />

        {resolvedSearchParams.error ? (
          <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-4 text-red-100">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        {resolvedSearchParams.success ? (
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-100">
            {resolvedSearchParams.success}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
              <h2 className="text-xl font-black text-white">ملاحظات مهمة</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <li>الرفع يتم فقط بعد التحقق من الفئة ونص السؤال والإجابة.</li>
                <li>الأسئلة المكررة يتم تخطيها تلقائيًا دون إيقاف العملية.</li>
                <li>الأسئلة غير الصالحة يتم تجاوزها بدل تعطيل كامل الملف.</li>
                <li>إذا وُجدت سنة في السؤال أو الجواب ولم تحدد السماحية، يتم ضبطها تلقائيًا حسب النقاط.</li>
                <li>الدفعات الكبيرة جدًا غير مطلوبة؛ الأفضل الرفع على دفعات متوسطة.</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
              <h2 className="text-xl font-black text-white">الحدود الحالية</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs text-slate-400">الحد الأقصى للأسئلة</p>
                  <p className="mt-2 text-2xl font-black text-white">
                    {MAX_IMPORT_QUESTIONS}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs text-slate-400">أقصى حجم للملف</p>
                  <p className="mt-2 text-2xl font-black text-white">8MB</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
              <h2 className="text-xl font-black text-white">عدد الفئات المتاحة</h2>
              <p className="mt-2 text-sm text-slate-300">
                الفئات النشطة الحالية داخل النظام:{" "}
                <span className="font-black text-white">{categories.length}</span>
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {previewCategories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200"
                  >
                    {getSectionName(category.category_sections)} / {category.name}
                  </span>
                ))}
              </div>

              {categories.length > previewCategories.length ? (
                <p className="mt-3 text-xs text-slate-500">
                  تم إظهار جزء من الفئات فقط لتخفيف الصفحة.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
            <div className="mb-6">
              <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-bold text-orange-100">
                JSON Upload
              </span>
              <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                ارفع ملف الأسئلة
              </h2>
              <p className="mt-3 text-sm leading-8 text-slate-300">
                ارفع ملف JSON يحتوي على مصفوفة أسئلة أو كائنًا يحتوي على المفتاح
                <span className="mx-1 font-black text-white">questions</span>.
              </p>
            </div>

            <form action={importQuestions} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  ملف البيانات
                </label>
                <input
                  type="file"
                  name="data_file"
                  accept=".json,application/json"
                  className="block w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-sm text-white file:ml-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-black file:text-slate-950"
                  required
                />
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/60 p-4">
                <p className="text-sm font-bold text-cyan-300">الحقول المدعومة</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "section / section_slug",
                    "category / category_slug",
                    "question_text",
                    "answer_text",
                    "points",
                    "is_active",
                    "year_tolerance_before",
                    "year_tolerance_after",
                    "question_image_url",
                    "question_video_url",
                    "answer_image_url",
                    "answer_video_url",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-base font-black text-slate-950 transition hover:bg-cyan-300"
              >
                رفع وإضافة الأسئلة
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}