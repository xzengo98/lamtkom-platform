import Link from "next/link";

export default function CodenamesHomePage() {
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0a1020] shadow-2xl">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden p-8 md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.16),_transparent_35%)]" />
            <div className="relative z-10">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                لعبة جماعية مباشرة
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl">
                Codenames
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                أنشئ غرفة ووزع اللاعبين على الفريقين وحدد الـ Spymasters ثم ابدأ
                اللعبة. كل الأحداث تتحدث مباشرة عند الجميع داخل الغرفة.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/games/codenames/create"
                  className="rounded-2xl bg-emerald-500 px-6 py-3 text-base font-bold text-white transition hover:bg-emerald-400"
                >
                  إنشاء غرفة
                </Link>
                <Link
                  href="/games/codenames/join"
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-base font-bold text-white transition hover:bg-white/10"
                >
                  الانضمام لغرفة
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/20 p-6 lg:border-r-0 lg:border-t-0 lg:border-l lg:border-white/10">
            <div className="grid gap-4">
              <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
                <div className="text-sm font-semibold text-blue-200">الفريق الأزرق</div>
                <div className="mt-2 text-2xl font-black text-white">
                  Operatives + Spymaster
                </div>
              </div>

              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                <div className="text-sm font-semibold text-red-200">الفريق البرتقالي</div>
                <div className="mt-2 text-2xl font-black text-white">
                  Operatives + Spymaster
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold text-white/70">اللعب</div>
                <div className="mt-2 text-xl font-bold text-white">
                  لعبة جماعية فيها فريقين كل فريق عنده قائد بيعطي كلمة تلميح + رقم والباقي يحاولوا يخمّنوا الكلمات الصح على اللوحة
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}