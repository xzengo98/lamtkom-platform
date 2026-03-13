import { NextRequest, NextResponse } from "next/server";

type OpenTdbQuestion = {
  type: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

type ImportRequestBody = {
  source?: string;
  sectionName?: string;
  categoryName?: string;
  amount?: number;
};

type OpenTdbApiResponse = {
  response_code: number;
  results: OpenTdbQuestion[];
};

function decodeHtml(html: string) {
  return html
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&uuml;", "ü")
    .replaceAll("&rsquo;", "'")
    .replaceAll("&ldquo;", '"')
    .replaceAll("&rdquo;", '"')
    .replaceAll("&eacute;", "é");
}

function difficultyToPoints(difficulty: string) {
  switch (difficulty) {
    case "easy":
      return 200;
    case "medium":
      return 400;
    case "hard":
      return 600;
    default:
      return 200;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ImportRequestBody;

    const source = body.source;
    const sectionName = body.sectionName?.trim() || "عام";
    const categoryName = body.categoryName?.trim() || "معلومات عامة";
    const amount = Number(body.amount || 9);

    if (source !== "opentdb") {
      return NextResponse.json(
        {
          success: false,
          error: "المصدر غير مدعوم حالياً",
        },
        { status: 400 }
      );
    }

    const apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;

    const response = await fetch(apiUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "فشل في جلب البيانات من المصدر الخارجي",
        },
        { status: 500 }
      );
    }

    const json = (await response.json()) as OpenTdbApiResponse;

    const results = Array.isArray(json.results) ? json.results : [];

    const transformed = results.map((item) => ({
      question_text: decodeHtml(item.question),
      answer_text: decodeHtml(item.correct_answer),
      points: difficultyToPoints(item.difficulty),
      media_type: null,
      media_url: null,
      is_active: true,
      is_used: false,
      category_name: categoryName,
      section_name: sectionName,
    }));

    return NextResponse.json({
      success: true,
      count: transformed.length,
      data: transformed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ داخلي أثناء معالجة الطلب",
      },
      { status: 500 }
    );
  }
}