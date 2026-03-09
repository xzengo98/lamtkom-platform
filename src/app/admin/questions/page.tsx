import AdminEmptyState from "@/components/admin/admin-empty-state";
import AdminPageHeader from "@/components/admin/admin-page-header";

const questions = [
  { text: "ما هي عاصمة الأردن؟", category: "جغرافيا", difficulty: "سهلة" },
  { text: "من فاز بكأس العالم 2022؟", category: "رياضة", difficulty: "متوسطة" },
  { text: "في أي عام بدأ برج إيفل؟", category: "تاريخ", difficulty: "متوسطة" },
];

export default function AdminQuestionsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="إدارة الأسئلة"
        description="لاحقًا ستتمكن من إضافة الأسئلة وتعديلها واستيرادها من ملف."
        action={
          <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
            إضافة سؤال
          </button>
        }
      />

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">
          <input
            type="text"
            placeholder="ابحث عن سؤال..."
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />
          <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none">
            <option>كل الفئات</option>
            <option>تاريخ</option>
            <option>رياضة</option>
            <option>جغرافيا</option>
          </select>
          <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none">
            <option>كل الصعوبات</option>
            <option>سهلة</option>
            <option>متوسطة</option>
            <option>صعبة</option>
          </select>
        </div>
      </div>

      {questions.length > 0 ? (
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
      ) : (
        <AdminEmptyState
          title="لا توجد أسئلة بعد"
          description="بإمكانك إضافة الأسئلة يدويًا الآن، ثم لاحقًا سنضيف الاستيراد من ملف."
          buttonText="إضافة أول سؤال"
        />
      )}
    </div>
  );
}