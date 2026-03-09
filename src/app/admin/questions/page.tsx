const questions = [
  { text: "ما هي عاصمة الأردن؟", category: "جغرافيا", difficulty: "سهلة" },
  { text: "من فاز بكأس العالم 2022؟", category: "رياضة", difficulty: "متوسطة" },
  { text: "في أي عام بدأ برج إيفل؟", category: "تاريخ", difficulty: "متوسطة" },
];

export default function AdminQuestionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black">إدارة الأسئلة</h2>
          <p className="mt-2 text-slate-300">
            لاحقًا ستتمكن من إضافة الأسئلة وتعديلها واستيرادها من ملف.
          </p>
        </div>

        <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
          إضافة سؤال
        </button>
      </div>

      <div className="grid gap-4">
        {questions.map((question, index) => (
          <div
            key={index}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
          >
            <h3 className="text-xl font-black">{question.text}</h3>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full bg-slate-900/70 px-3 py-1">
                {question.category}
              </span>
              <span className="rounded-full bg-slate-900/70 px-3 py-1">
                {question.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}