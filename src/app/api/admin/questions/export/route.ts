import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CategorySectionRelation =
  | { id?: string; name?: string; slug?: string }
  | { id?: string; name?: string; slug?: string }[]
  | null;

type CategoryRelation =
  | {
      id?: string;
      name?: string;
      slug?: string;
      category_sections?: CategorySectionRelation;
    }
  | {
      id?: string;
      name?: string;
      slug?: string;
      category_sections?: CategorySectionRelation;
    }[]
  | null;

type QuestionRow = {
  id: string;
  question_text: string;
  answer_text: string | null;
  points: number | null;
  is_active: boolean | null;
  year_tolerance_before: number | null;
  year_tolerance_after: number | null;
  categories: CategoryRelation;
};

function getCategoryObject(categories: CategoryRelation) {
  if (!categories) return null;
  return Array.isArray(categories) ? (categories[0] ?? null) : categories;
}

function getSectionObject(section: CategorySectionRelation) {
  if (!section) return null;
  return Array.isArray(section) ? (section[0] ?? null) : section;
}

function sanitizeFilename(value: string) {
  return value
    .trim()
    .replace(/[^\p{L}\p{N}\-_ ]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "يجب تسجيل الدخول أولًا." },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "غير مصرح لك بتصدير الأسئلة." },
      { status: 403 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const sectionId = searchParams.get("section")?.trim() ?? "";
  const categoryId = searchParams.get("category")?.trim() ?? "";

  let query = supabase
    .from("questions")
    .select(`
      id,
      question_text,
      answer_text,
      points,
      is_active,
      year_tolerance_before,
      year_tolerance_after,
      categories (
        id,
        name,
        slug,
        section_id,
        category_sections (
          id,
          name,
          slug
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  } else if (sectionId) {
    const { data: sectionCategories, error: categoryIdsError } = await supabase
      .from("categories")
      .select("id")
      .eq("section_id", sectionId);

    if (categoryIdsError) {
      return NextResponse.json(
        { error: categoryIdsError.message },
        { status: 500 },
      );
    }

    const ids = ((sectionCategories ?? []) as { id: string | null }[])
      .map((item: { id: string | null }) => item.id)
      .filter(
        (value: string | null): value is string =>
          typeof value === "string" && value.length > 0,
      );

    if (ids.length === 0) {
      const emptyPayload = {
        exported_at: new Date().toISOString(),
        filters: {
          section_id: sectionId || null,
          category_id: null,
        },
        questions: [],
      };

      return new NextResponse(JSON.stringify(emptyPayload, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition":
            'attachment; filename="questions-section-empty.json"',
        },
      });
    }

    query = query.in("category_id", ids);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as QuestionRow[];

  const exportedQuestions = rows.map((row) => {
    const category = getCategoryObject(row.categories);
    const section = getSectionObject(category?.category_sections ?? null);

    return {
      section: section?.name ?? "",
      section_slug: section?.slug ?? "",
      category: category?.name ?? "",
      category_slug: category?.slug ?? "",
      points: row.points ?? 200,
      is_active: row.is_active ?? true,
      year_tolerance_before: row.year_tolerance_before ?? 0,
      year_tolerance_after: row.year_tolerance_after ?? 0,
      question_text: row.question_text ?? "",
      answer_text: row.answer_text ?? "",
    };
  });

  const sectionName =
    exportedQuestions[0]?.section || (sectionId ? "section" : "");
  const categoryName =
    exportedQuestions[0]?.category || (categoryId ? "category" : "");

  const filename = categoryId
    ? `questions-category-${sanitizeFilename(categoryName || "filtered")}.json`
    : sectionId
      ? `questions-section-${sanitizeFilename(sectionName || "filtered")}.json`
      : "questions-all.json";

  const payload = {
    exported_at: new Date().toISOString(),
    filters: {
      section_id: sectionId || null,
      category_id: categoryId || null,
    },
    questions: exportedQuestions,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}