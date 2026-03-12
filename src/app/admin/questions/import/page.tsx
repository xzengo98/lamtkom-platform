import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  success?: string;
  error?: string;
  warning?: string;
}>;

type ProfileRow = {
  role: string | null;
};

type SectionRow = {
  id: string;
  name: string;
  slug: string | null;
  is_active: boolean | null;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string | null;
  section_id: string | null;
  is_active: boolean | null;
};

type ImportQuestionItem = {
  section?: string;
  section_slug?: string;
  category?: string;
  category_slug?: string;
  points?: number | string;
  is_active?: boolean;
  year_tolerance_before?: number | string | null;
  year_tolerance_after?: number | string | null;
  question_text?: string;
  answer_text?: string;
  question_image_url?: string;
  question_video_url?: string;
  answer_image_url?: string;
  answer_video_url?: string;
};

type InsertQuestionRow = {
  category_id: string;
  points: number;
  is_active: boolean;
  year_tolerance_before: number;
  year_tolerance_after: number;
  question_text: string;
  answer_text: string;
  question_image_url: string;
  question_video_url: string;
  answer_image_url: string;
  answer_video_url: string;
};

const CHUNK_SIZE = 200;

function normalizeLookup(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function normalizeHtml(value: string) {
  return value
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toInt(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.trunc(num) : fallback;
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

function buildMessage(parts: string[]) {
  return parts.filter(Boolean).join(" | ");
}

function makeSafeRedirectMessage(value: string) {
  return encodeURIComponent(value);
}

async function requireAdmin() {
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

  const typedProfile = profile as ProfileRow | null;

  if (typedProfile?.role !== "admin") {
    redirect("/");
  }

  return { supabase, user };
}

export default async function AdminQuestionsImportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const [sectionsResult, categoriesResult] = await Promise.all([
    supabase
      .from("category_sections")
      .select("id, name, slug, is_active")
      .order("sort_order", { ascending: true }),
    supabase
      .from("categories")
      .select("id, name, slug, section_id, is_active")
      .order("sort_order", { ascending: true }),
  ]);

  const sections = (sectionsResult.data ?? []) as SectionRow[];
  const categories = (categoriesResult.data ?? []) as CategoryRow[];

  async function importQuestionsAction(formData: FormData) {
    "use server";

    const { supabase } = await requireAdmin();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      redirect(
        "/admin/questions/import?error=" +
          makeSafeRedirectMessage("يرجى اختيار ملف JSON صالح.")
      );
    }

    let rawText = "";

    try {
      rawText = await file.text();
    } catch {
      redirect(
        "/admin/questions/import?error=" +
          makeSafeRedirectMessage("تعذر قراءة الملف المرفوع.")
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      redirect(
        "/admin/questions/import?error=" +
          makeSafeRedirectMessage("الملف ليس JSON صالحًا.")
      );
    }

    const payload = parsed as { questions?: ImportQuestionItem[] };

    if (!payload || !Array.isArray(payload.questions)) {
      redirect(
        "/admin/questions/import?error=" +
          makeSafeRedirectMessage(
            'صيغة الملف غير صحيحة. يجب أن يحتوي على مصفوفة باسم "questions".'
          )
      );
    }

    const [sectionsResult, categoriesResult] = await Promise.all([
      supabase
        .from("category_sections")
        .select("id, name, slug, is_active")
        .order("sort_order", { ascending: true }),
      supabase
        .from("categories")
        .select("id, name, slug, section_id, is_active")
        .order("sort_order", { ascending: true }),
    ]);

    const sections = (sectionsResult.data ?? []) as SectionRow[];
    const categories = (categoriesResult.data ?? []) as CategoryRow[];

    const activeSections = sections.filter((item) => item.is_active !== false);
    const activeCategories = categories.filter((item) => item.is_active !== false);

    const sectionByName = new Map<string, SectionRow>();
    const sectionBySlug = new Map<string, SectionRow>();

    for (const section of activeSections) {
      sectionByName.set(normalizeLookup(section.name), section);
      if (section.slug) {
        sectionBySlug.set(normalizeLookup(section.slug), section);
        sectionBySlug.set(normalizeSlug(section.slug), section);
      }
    }

    function resolveSection(item: ImportQuestionItem) {
      const sectionSlug = toStringValue(item.section_slug);
      const sectionName = toStringValue(item.section);

      if (sectionSlug) {
        return (
          sectionBySlug.get(normalizeLookup(sectionSlug)) ||
          sectionBySlug.get(normalizeSlug(sectionSlug)) ||
          null
        );
      }

      if (sectionName) {
        return (
          sectionByName.get(normalizeLookup(sectionName)) ||
          sectionBySlug.get(normalizeLookup(sectionName)) ||
          sectionBySlug.get(normalizeSlug(sectionName)) ||
          null
        );
      }

      return null;
    }

    function resolveCategory(item: ImportQuestionItem, sectionId: string | null) {
      const categorySlug = toStringValue(item.category_slug);
      const categoryName = toStringValue(item.category);

      const scoped = sectionId
        ? activeCategories.filter((cat) => cat.section_id === sectionId)
        : activeCategories;

      const lookupValues = [
        categorySlug ? normalizeLookup(categorySlug) : "",
        categorySlug ? normalizeSlug(categorySlug) : "",
        categoryName ? normalizeLookup(categoryName) : "",
        categoryName ? normalizeSlug(categoryName) : "",
      ].filter(Boolean);

      for (const key of lookupValues) {
        const bySlug = scoped.find(
          (cat) =>
            (cat.slug && normalizeLookup(cat.slug) === key) ||
            (cat.slug && normalizeSlug(cat.slug) === key)
        );
        if (bySlug) return bySlug;

        const byName = scoped.find((cat) => normalizeLookup(cat.name) === key);
        if (byName) return byName;
      }

      for (const key of lookupValues) {
        const globalBySlug = activeCategories.find(
          (cat) =>
            (cat.slug && normalizeLookup(cat.slug) === key) ||
            (cat.slug && normalizeSlug(cat.slug) === key)
        );
        if (globalBySlug) return globalBySlug;

        const globalByName = activeCategories.find(
          (cat) => normalizeLookup(cat.name) === key
        );
        if (globalByName) return globalByName;
      }

      return null;
    }

    const invalidLines: string[] = [];
    const duplicateInsideFileLines: string[] = [];
    const preparedRows: InsertQuestionRow[] = [];
    const seenQuestionKeys = new Set<string>();

    payload.questions.forEach((item, index) => {
      const lineNumber = index + 1;

      const questionTextRaw = toStringValue(item.question_text);
      const answerTextRaw = toStringValue(item.answer_text);

      if (!questionTextRaw || !answerTextRaw) {
        invalidLines.push(`السطر ${lineNumber}: السؤال أو الجواب فارغ.`);
        return;
      }

      const normalizedQuestionText = normalizeHtml(questionTextRaw);
      const duplicateKey = normalizeLookup(
        questionTextRaw.replace(/<[^>]*>/g, " ").trim()
      );

      if (!duplicateKey) {
        invalidLines.push(`السطر ${lineNumber}: نص السؤال غير صالح.`);
        return;
      }

      if (seenQuestionKeys.has(duplicateKey)) {
        duplicateInsideFileLines.push(`السطر ${lineNumber}: سؤال مكرر داخل الملف.`);
        return;
      }

      seenQuestionKeys.add(duplicateKey);

      const section = resolveSection(item);
      const category = resolveCategory(item, section?.id ?? null);

      if (!category) {
        invalidLines.push(
          `السطر ${lineNumber}: تعذر العثور على الفئة أو القسم المرتبط بها.`
        );
        return;
      }

      const points = toInt(item.points, 0);

      if (![200, 400, 600].includes(points)) {
        invalidLines.push(
          `السطر ${lineNumber}: النقاط يجب أن تكون 200 أو 400 أو 600.`
        );
        return;
      }

      preparedRows.push({
        category_id: category.id,
        points,
        is_active: item.is_active !== false,
        year_tolerance_before: Math.max(0, toInt(item.year_tolerance_before, 0)),
        year_tolerance_after: Math.max(0, toInt(item.year_tolerance_after, 0)),
        question_text: normalizedQuestionText,
        answer_text: normalizeHtml(answerTextRaw),
        question_image_url: toStringValue(item.question_image_url),
        question_video_url: toStringValue(item.question_video_url),
        answer_image_url: toStringValue(item.answer_image_url),
        answer_video_url: toStringValue(item.answer_video_url),
      });
    });

    if (preparedRows.length === 0) {
      redirect(
        "/admin/questions/import?error=" +
          makeSafeRedirectMessage(
            buildMessage([
              "لم يتم العثور على أسئلة صالحة للرفع.",
              ...invalidLines.slice(0, 8),
              ...duplicateInsideFileLines.slice(0, 8),
            ])
          )
      );
    }

    const existingQuestionTexts = new Set<string>();

    for (const textChunk of chunkArray(
      preparedRows.map((row) => row.question_text),
      CHUNK_SIZE
    )) {
      const { data, error } = await supabase
        .from("questions")
        .select("question_text")
        .in("question_text", textChunk);

      if (error) {
        redirect(
          "/admin/questions/import?error=" +
            makeSafeRedirectMessage(
              error.message || "فشل التحقق من الأسئلة الموجودة مسبقًا."
            )
        );
      }

      for (const row of data ?? []) {
        const questionText =
          typeof row.question_text === "string" ? row.question_text : "";
        if (questionText) {
          existingQuestionTexts.add(questionText);
        }
      }
    }

    const rowsToInsert = preparedRows.filter(
      (row) => !existingQuestionTexts.has(row.question_text)
    );

    let insertedCount = 0;

    for (const insertChunk of chunkArray(rowsToInsert, CHUNK_SIZE)) {
      const { data, error } = await supabase
        .from("questions")
        .upsert(insertChunk, {
          onConflict: "question_text",
          ignoreDuplicates: true,
        })
        .select("id");

      if (error) {
        redirect(
          "/admin/questions/import?error=" +
            makeSafeRedirectMessage(
              error.message || "فشل رفع الدفعة الحالية من الأسئلة."
            )
        );
      }

      insertedCount += data?.length ?? 0;
    }

    const skippedExistingCount = preparedRows.length - rowsToInsert.length;
    const skippedInvalidCount = invalidLines.length;
    const skippedInsideFileCount = duplicateInsideFileLines.length;

    revalidatePath("/admin/questions");
    revalidatePath("/admin/questions/import");
    revalidatePath("/game/start");

    const successParts = [
      `تم رفع ${insertedCount} سؤال بنجاح.`,
      skippedExistingCount > 0
        ? `تم تخطي ${skippedExistingCount} سؤال موجود مسبقًا.`
        : "",
      skippedInsideFileCount > 0
        ? `تم تخطي ${skippedInsideFileCount} سؤال مكرر داخل الملف.`
        : "",
      skippedInvalidCount > 0
        ? `تم تخطي ${skippedInvalidCount} سطر غير صالح.`
        : "",
    ];

    const warningParts = [
      ...duplicateInsideFileLines.slice(0, 5),
      ...invalidLines.slice(0, 5),
    ];

    const successMessage = buildMessage(successParts);
    const warningMessage =
      warningParts.length > 0 ? buildMessage(warningParts) : "";

    const query = new URLSearchParams();
    query.set("success", successMessage);
    if (warningMessage) {
      query.set("warning", warningMessage);
    }

    redirect(`/admin/questions/import?${query.toString()}`);
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-10"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#020617_0%,#07143a_50%,#020617_100%)] p-5 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-200 sm:text-sm">
                  إدارة المحتوى
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:text-sm">
                  رفع أسئلة بالجملة
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                رفع أسئلة بصيغة JSON
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                هذا الإصدار يتخطى الأسئلة المكررة داخل الملف أو الموجودة مسبقًا في
                قاعدة البيانات، ويُكمل رفع باقي الأسئلة بدل إيقاف العملية كاملة.
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4 text-center">
              <p className="text-xs text-slate-400">عدد الفئات المتاحة حاليًا</p>
              <p className="mt-2 text-2xl font-black text-white">
                {categories.length}
              </p>
            </div>
          </div>
        </section>

        {params.success ? (
          <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100 sm:text-base">
            {params.success}
          </div>
        ) : null}

        {params.warning ? (
          <div className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100 sm:text-base">
            {params.warning}
          </div>
        ) : null}

        {params.error ? (
          <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-100 sm:text-base">
            {params.error}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white">رفع ملف الأسئلة</h2>
            <p className="mt-2 text-sm leading-8 text-slate-300">
              ارفع ملف JSON يحتوي على مفتاح باسم{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-200">
                questions
              </code>{" "}
              وبداخله قائمة الأسئلة.
            </p>

            <form action={importQuestionsAction} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  ملف JSON
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".json,application/json"
                  className="block w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-sm text-white file:ml-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-950"
                  required
                />
              </div>

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-base font-black text-slate-950 transition hover:bg-cyan-300"
              >
                ارفع الملف الآن
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <h3 className="text-xl font-black text-white">شروط مهمة</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <li>• يجب أن تكون الفئة والقسم موجودين مسبقًا داخل الإدارة.</li>
                <li>• يتم قبول النقاط: 200 أو 400 أو 600 فقط.</li>
                <li>• أي سؤال مكرر داخل الملف سيتم تخطيه تلقائيًا.</li>
                <li>• أي سؤال موجود مسبقًا في قاعدة البيانات سيتم تخطيه تلقائيًا.</li>
                <li>• باقي الأسئلة الصالحة ستُرفع حتى لو وُجدت أخطاء أو تكرارات.</li>
              </ul>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <h3 className="text-xl font-black text-white">الفئات المتوفرة حاليًا</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 sm:text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/questions"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                الرجوع للأسئلة
              </Link>
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                الرجوع للإدارة
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}