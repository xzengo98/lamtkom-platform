export default function GameStartPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-black">بدء لعبة جديدة</h1>
        <p className="mt-4 text-slate-300">
          هنا سيتم إدخال أسماء الفرق، تحديد الفئات، والتحقق من رصيد المستخدم قبل
          إنشاء جلسة اللعب.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="اسم الفريق الأول"
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />
          <input
            type="text"
            placeholder="اسم الفريق الثاني"
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />
        </div>

        <button className="mt-6 rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950">
          متابعة
        </button>
      </div>
    </main>
  );
}