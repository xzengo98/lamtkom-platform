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

const MAX_IMPORT_QUESTIONS = 5000;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const INSERT_CHUNK_SIZE = 200;

const sampleJson = `{
  "questions": [
    {
      "section": "عام",
      "category": "تاريخ",
      "points": 200,
      "is_active": true,
      "question_text": "<p>في أي سنة سقطت القسطنطينية؟</p>",
      "answer_text": "<p>1453</p>",
      "question_image_url": "",
      "question_video_url": "",
      "answer_image_url": "",
      "answer_video_url": ""
    },
    {
      "section": "عام",
      "category": "تاريخ",
      "points": 400,
      "is_active": true,
      "question_text": "<p>ما اسم المعاهدة التي أنهت الحرب العالمية الأولى رسميًا؟</p>",
      "answer_text": "<p>معاهدة فرساي</p>",
      "question_image_url": "",
      "question_video_url": "",
      "answer_image_url": "",
      "answer_video_url": ""
    }
  ]
}`;

function getSectionName(section: CategoryRelation) {
  if (!section) return "بدون قسم";
  if (Array.isArray(section)) return section[0]?.name ?? "بدون قسم";
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

  if (baseHtml) {
    parts.push(baseHtml);
  }

  if (imageUrl) {
    parts.push(`<p><img src="${escapeAttribute(imageUrl)}" alt="" /></p>`);
  }

  if (videoUrl) {
    const embed = toYouTubeEmbed(videoUrl);

    if (embed.includes("youtube.com/embed/")) {
      parts.push(
        `<div class="video-wrap"><iframe src="${escapeAttribute(
          embed
        )}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
      );
    } else {
      parts.push(
        `<p><video src="${escapeAttribute(
          embed
        )}" controls playsinline></video></p>`
      );
    }
  }

  return parts.join("\n\n").trim();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeArabicDigits(value: string) {
  const map: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  return value.replace(/[٠-٩]/g, (char) => map[char] ?? char);
}

function normalizeComparableText(value: string) {
  return normalizeArabicDigits(stripHtml(value))
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ي")
    .replace(/[ة]/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyYearQuestion(questionHtml: string, answerHtml: string) {
  const questionText = normalizeArabicDigits(stripHtml(questionHtml)).toLowerCase();
  const answerText = normalizeArabicDigits(stripHtml(answerHtml))
    .trim()
    .toLowerCase();

  const yearPromptRegex =
    /(في اي سنة|في أي سنة|في اي عام|في أي عام|اي سنة|أي سنة|اي عام|أي عام|ما السنة|ما السنه|عام كم|سنة كم|سنه كم|متى وقع|متى حدث|متى سقط|متى بدات|متى بدأت)/;

  const yearOnlyRegex =
    /^\d{3,4}(\s*(م|ميلادي|هـ|هجري|ق\.?\s?م|قبل الميلاد))?$/i;

  return yearPromptRegex.test(questionText) || yearOnlyRegex.test(answerText);
}

function getAutoToleranceByPoints(points: number) {
  if (points === 600) return 10;
  if (points === 400) return 5;
  return 1;
}

function splitIntoChunks<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  return chunks;
}

export default async function AdminImportQuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
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

  const { data: categoriesData } = await supabase
    .from("categories")
    .select(
      `
        id,
        name,
        slug,
        category_sections ( name, slug )
      `
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const categories = (categoriesData ?? []) as unknown as CategoryLookupRow[];

  async function importQuestions(formData: FormData) {
    "use server";

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

    const file = formData.get("data_file");

    if (!(file instanceof File) || file.size === 0) {
      redirect(
        "/admin/questions/import?error=" +
          encodeURIComponent("يرجى اختيار ملف JSON صالح.")
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      redirect(
        "/admin/questions/import?error=" +
          encodeURIComponent("حجم الملف كبير جدًا. الحد الأقصى 20MB.")
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(await file.text());
    } catch {
      redirect(
        "/admin/questions/import?error=" +
          encodeURIComponent("تعذر قراءة الملف. تأكد أنه JSON صحيح.")
      );
    }

    const rawItems = Array.isArray(parsed)
      ? parsed
      : parsed &&
          typeof parsed === "object" &&
          Array.isArray((parsed as { questions?: unknown[] }).questions)
        ? (parsed as { questions: unknown[] }).questions
        : [];

    const totalFoundInFile = rawItems.length;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      redirect(
        "/admin/questions/import?error=" +
          encodeURIComponent("الملف لا يحتوي على أسئلة قابلة للرفع.")
      );
    }

    if (rawItems.length > MAX_IMPORT_QUESTIONS) {
      redirect(
        "/admin/questions/import?error=" +
          encodeURIComponent(
            `الحد الأقصى في كل رفعة هو ${MAX_IMPORT_QUESTIONS} سؤال.`
          )
      );
    }

    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select(
        `
          id,
          name,
          slug,
          category_sections ( name, slug )
        `
      )
      .eq("is_active", true);

    if (categoriesError) {
      redirect(
        "/admin/questions/import?error=" +
          encodeURIComponent(categoriesError.message)
      );
    }

    const categories = (categoriesData ?? []) as unknown as CategoryLookupRow[];

    const { data: existingQuestionsData, error: existingQuestionsError } =
      await supabase.from("questions").select("question_text");

    if (existingQuestionsError) {
      redirect(
        "/admin/questions/import?error=" +
          encodeURIComponent(
            existingQuestionsError.message || "فشل فحص الأسئلة الحالية"
          )
      );
    }

    const existingQuestionKeys = new Set(
      (existingQuestionsData ?? [])
        .map((item) => normalizeComparableText(String(item.question_text ?? "")))
        .filter(Boolean)
    );

    const findCategory = (identifier: string) => {
      const normalized = identifier.trim().toLowerCase();

      return categories.find(
        (category) =>
          category.slug.trim().toLowerCase() === normalized ||
          category.name.trim().toLowerCase() === normalized
      );
    };

    const insertRows: Array<{
      question_text: string;
      answer_text: string;
      category_id: string;
      points: number;
      is_active: boolean;
      year_tolerance_before: number;
      year_tolerance_after: number;
      media_type: string;
      media_url: null;
    }> = [];

    const validationErrors: string[] = [];
    const fileQuestionKeys = new Set<string>();

    let skippedDuplicateInFile = 0;
    let skippedDuplicateInDatabase = 0;

    rawItems.forEach((item, index) => {
      const row = (item ?? {}) as UploadQuestionRow;
      const line = index + 1;

      const sectionIdentifier = normalizeString(
        row.section_slug ?? row.section_name ?? row.section
      );
      const categoryIdentifier = normalizeString(
        row.category_slug ?? row.category_name ?? row.category
      );

      const questionBase = normalizeString(
        row.question_text ?? row.question_html ?? row.question
      );
      const answerBase = normalizeString(
        row.answer_text ?? row.answer_html ?? row.answer
      );

      if (!questionBase || !answerBase || !categoryIdentifier) {
        validationErrors.push(
          `السطر ${line}: السؤال والجواب والفئة حقول مطلوبة.`
        );
        return;
      }

      const normalizedQuestionKey = normalizeComparableText(questionBase);

      if (!normalizedQuestionKey) {
        validationErrors.push(`السطر ${line}: تعذر قراءة نص السؤال بشكل صحيح.`);
        return;
      }

      if (fileQuestionKeys.has(normalizedQuestionKey)) {
        skippedDuplicateInFile += 1;
        return;
      }

      if (existingQuestionKeys.has(normalizedQuestionKey)) {
        skippedDuplicateInDatabase += 1;
        return;
      }

      fileQuestionKeys.add(normalizedQuestionKey);

      const category = findCategory(categoryIdentifier);

      if (!category) {
        validationErrors.push(
          `السطر ${line}: تعذر العثور على الفئة "${categoryIdentifier}".`
        );
        return;
      }

      if (sectionIdentifier) {
        const sectionName = getSectionName(category.category_sections)
          .trim()
          .toLowerCase();
        const sectionSlug = getSectionSlug(category.category_sections)
          .trim()
          .toLowerCase();
        const expected = sectionIdentifier.trim().toLowerCase();

        if (sectionName !== expected && sectionSlug !== expected) {
          validationErrors.push(
            `السطر ${line}: الفئة "${category.name}" لا تنتمي إلى القسم "${sectionIdentifier}".`
          );
          return;
        }
      }

      const points = normalizePoints(row.points);

      const questionText = appendMediaHtml(
        questionBase,
        normalizeString(row.question_image_url),
        normalizeString(row.question_video_url)
      );

      const answerText = appendMediaHtml(
        answerBase,
        normalizeString(row.answer_image_url),
        normalizeString(row.answer_video_url)
      );

      const explicitBefore =
        row.year_tolerance_before !== undefined &&
        row.year_tolerance_before !== null;
      const explicitAfter =
        row.year_tolerance_after !== undefined &&
        row.year_tolerance_after !== null;

      let yearToleranceBefore = explicitBefore
        ? normalizeTolerance(row.year_tolerance_before)
        : 0;
      let yearToleranceAfter = explicitAfter
        ? normalizeTolerance(row.year_tolerance_after)
        : 0;

      if (
        !explicitBefore &&
        !explicitAfter &&
        isLikelyYearQuestion(questionBase, answerBase)
      ) {
        const autoTolerance = getAutoToleranceByPoints(points);
        yearToleranceBefore = autoTolerance;
        yearToleranceAfter = autoTolerance;
      }

      insertRows.push({
        question_text: questionText,
        answer_text: answerText,
        category_id: category.id,
        points,
        is_active: normalizeBool(row.is_active, true),
        year_tolerance_before: yearToleranceBefore,
        year_tolerance_after: yearToleranceAfter,
        media_type: "none",
        media_url: null,
      });
    });

    if (validationErrors.length > 0) {
      redirect(
        "/admin/questions/import?error=" +
          encodeURIComponent(validationErrors.slice(0, 8).join(" | "))
      );
    }

    if (insertRows.length === 0) {
      redirect(
        "/admin/questions/import?error=" +
          encodeURIComponent(
            `لم يتم العثور على أسئلة جديدة للرفع. تم تخطي ${skippedDuplicateInFile} سؤال مكرر داخل الملف و${skippedDuplicateInDatabase} سؤال موجود مسبقًا في قاعدة البيانات.`
          )
      );
    }

    const chunks = splitIntoChunks(insertRows, INSERT_CHUNK_SIZE);
    let insertedCount = 0;

    for (const chunk of chunks) {
      const { error } = await supabase.from("questions").insert(chunk);

      if (error) {
        redirect(
          "/admin/questions/import?error=" +
            encodeURIComponent(error.message || "فشل رفع إحدى دفعات الأسئلة.")
        );
      }

      insertedCount += chunk.length;
    }

    if (insertedCount !== insertRows.length) {
      redirect(
        "/admin/questions/import?error=" +
          encodeURIComponent(
            `تم تجهيز ${insertRows.length} سؤال لكن تم إدخال ${insertedCount} فقط.`
          )
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/questions");
    revalidatePath("/game/start");
    revalidatePath("/game/board");

    const skippedTotal = skippedDuplicateInFile + skippedDuplicateInDatabase;

    redirect(
      "/admin/questions/import?success=" +
        encodeURIComponent(
          `تم العثور على ${totalFoundInFile} سؤال في الملف، وتم رفع ${insertedCount} سؤال جديد، وتم تخطي ${skippedTotal} سؤال مكرر (${skippedDuplicateInFile} داخل الملف و${skippedDuplicateInDatabase} موجود مسبقًا).`
        )
    );
  }

  const templateHref = `data:application/json;charset=utf-8,${encodeURIComponent(
    sampleJson
  )}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="رفع أسئلة بالجملة"
        description="ارفع ملف JSON يحتوي على مجموعة أسئلة كاملة دفعة واحدة، مع دعم القسم والفئة والنقاط والسماحية والصور والفيديو."
        action={
          <>
            <a
              href={templateHref}
              download="seenjeem-questions-template.json"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              تحميل ملف مثال
            </a>
            <Link
              href="/admin/questions"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
            >
              الرجوع للأسئلة
            </Link>
          </>
        }
      />

      {params.error ? (
        <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-100 sm:text-base">
          {params.error}
        </div>
      ) : null}

      {params.success ? (
        <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100 sm:text-base">
          {params.success}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <form
            action={importQuestions}
            className="rounded-[1.75rem] border border-white/10 bg-slate-900/50 p-4 sm:p-5"
          >
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs text-orange-100 sm:text-sm">
                JSON Upload
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:text-sm">
                الحد الأقصى {MAX_IMPORT_QUESTIONS} سؤال
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-black text-white sm:text-3xl">
              ارفع ملف الأسئلة
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
              الملف يجب أن يكون بصيغة JSON ويحتوي على قائمة أسئلة. يمكنك تحديد
              القسم والفئة بالاسم أو بالـ slug.
            </p>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-white">
                ملف الداتا
              </label>
              <input
                type="file"
                name="data_file"
                accept=".json,application/json"
                className="block w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm text-white file:ml-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-950"
              />
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-bold text-white">الحقول المدعومة</p>
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
                    className="rounded-full border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-base font-black text-slate-950 transition hover:bg-cyan-300"
            >
              رفع وإضافة الأسئلة
            </button>
          </form>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/50 p-4 sm:p-5">
              <p className="text-sm font-bold text-white">ملاحظات مهمة</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                <li>يجب أن تكون الفئة موجودة مسبقًا داخل لوحة الإدارة.</li>
                <li>يمكنك كتابة القسم والفئة بالاسم أو بالـ slug.</li>
                <li>الصور والفيديو تُضاف تلقائيًا داخل السؤال أو الجواب.</li>
                <li>إذا كان جواب السؤال سنة فستُضاف السماحية تلقائيًا حسب النقاط.</li>
                <li>
                  إذا وُجد سؤال مكرر داخل الملف أو داخل قاعدة البيانات فسيتم
                  تخطيه تلقائيًا مع رفع باقي الأسئلة.
                </li>
              </ul>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/50 p-4 sm:p-5">
              <p className="text-sm font-bold text-white">الفئات المتاحة حاليًا</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <span
                      key={category.id}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                    >
                      {category.name} — {getSectionName(category.category_sections)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">
                    لا توجد فئات حالية.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-cyan-300">مثال جاهز</p>
          <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            صيغة الملف المطلوبة
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
            يمكنك تحميل المثال الجاهز أو نسخ هذا الشكل واستخدامه كأساس لملفك.
          </p>
        </div>

        <pre className="mt-6 overflow-x-auto rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4 text-left text-xs leading-7 text-slate-200 sm:text-sm">
          {sampleJson}
        </pre>
      </section>
    </div>
  );
}