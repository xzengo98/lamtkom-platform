"use client";

import { useMemo, useState } from "react";

type ImportedQuestion = {
  question_text: string;
  answer_text: string;
  points: number;
  media_type: string | null;
  media_url: string | null;
  is_active: boolean;
  is_used: boolean;
  category_name: string;
  section_name: string;
};

type ImportResponse = {
  success: boolean;
  count?: number;
  data?: ImportedQuestion[];
  error?: string;
};

export default function ImportApiJsonPage() {
  const [sectionName, setSectionName] = useState("عام");
  const [categoryName, setCategoryName] = useState("معلومات عامة");
  const [amount, setAmount] = useState(9);
  const [source, setSource] = useState("opentdb");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);

  const previewJson = useMemo(() => {
    if (!result?.data) return "";
    return JSON.stringify(result.data, null, 2);
  }, [result]);

  async function handleImport() {
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/admin/import-api-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source,
          sectionName,
          categoryName,
          amount,
        }),
      });

      const json: ImportResponse = await res.json();
      setResult(json);
    } catch (error) {
      setResult({
        success: false,
        error: "حدث خطأ أثناء جلب البيانات",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.data) return;

    const blob = new Blob([JSON.stringify(result.data, null, 2)], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sectionName}-${categoryName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">استيراد API وتحويله إلى JSON</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          نسخة بسيطة للبدء، بنفس أسلوب مشروعك، لسحب الأسئلة وتحويلها لملف JSON جاهز.
        </p>
      </div>

      <div className="rounded-2xl border bg-background p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">المصدر</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 outline-none"
            >
              <option value="opentdb">Open Trivia DB</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">عدد الأسئلة</label>
            <input
              type="number"
              min={1}
              max={50}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">اسم القسم</label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 outline-none"
              placeholder="مثال: عام"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">اسم الفئة</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 outline-none"
              placeholder="مثال: معلومات عامة"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleImport}
            disabled={loading}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "جاري الاستيراد..." : "استيراد البيانات"}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!result?.success || !result?.data?.length}
            className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            تنزيل JSON
          </button>
        </div>
      </div>

      {result?.error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {result.error}
        </div>
      ) : null}

      {result?.success && result.data ? (
        <div className="mt-6 rounded-2xl border bg-background p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              المعاينة ({result.count} سؤال)
            </h2>
          </div>

          <pre className="max-h-[600px] overflow-auto rounded-xl bg-muted p-4 text-xs leading-6">
            {previewJson}
          </pre>
        </div>
      ) : null}
    </div>
  );
}