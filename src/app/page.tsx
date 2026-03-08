export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            منصة ألعاب أسئلة عربية احترافية
          </span>

          <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
            نبني الآن
            <span className="block text-cyan-400">SeenJeem Platform</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300 md:text-xl">
            هذه هي البداية الصحيحة للمشروع النهائي. الخطوة الجاية ستكون بناء
            الواجهة الرئيسية الاحترافية، ثم نظام الحسابات، ثم لوحة التحكم،
            ثم نظام اللعب الكامل.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:opacity-90">
              ابدأ الآن
            </button>
            <button className="rounded-2xl border border-white/15 px-6 py-3 font-bold transition hover:bg-white/5">
              لوحة التحكم قريبًا
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}