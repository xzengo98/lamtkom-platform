"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#0b1e4a,transparent_40%),#020617] text-white">

      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-black leading-tight">
          منصة ألعاب جماعية
          <br />
          <span className="text-cyan-400">تحدي - متعة - سرعة</span>
        </h1>

        <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
          العب مع أصدقائك مباشرة بدون تحميل أو تعقيد.
          تجربة ممتعة وسريعة لكل الأجهزة.
        </p>

        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Link
            href="/game/start"
            className="px-6 py-3 rounded-xl bg-cyan-500 font-bold shadow-lg hover:scale-105 transition"
          >
            ابدأ اللعب الآن
          </Link>

          <a
            href="#games"
            className="px-6 py-3 rounded-xl border border-white/20 font-bold hover:bg-white/10 transition"
          >
            استكشف الألعاب
          </a>
        </div>
      </section>

      {/* ================= FEATURED GAME ================= */}
      <section className="mx-auto max-w-7xl px-6 mb-16">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/40 to-cyan-700/30 border border-white/10 shadow-2xl p-6 flex flex-col md:flex-row items-center gap-6">

          {/* صورة */}
          <div className="w-full md:w-1/2">
            <div className="h-[220px] sm:h-[260px] w-full rounded-2xl bg-[linear-gradient(135deg,#1e3a8a,#06b6d4)] flex items-center justify-center text-6xl font-black">
              ؟
            </div>
          </div>

          {/* نص */}
          <div className="w-full md:w-1/2 text-center md:text-right">
            <h2 className="text-2xl font-black">لمّتنا</h2>
            <p className="mt-2 text-slate-300">
              لعبة الأسئلة الجماعية الممتعة.
              تحدي بين فريقين بأسئلة سريعة ومباشرة.
            </p>

            <Link
              href="/game/start"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-cyan-500 font-bold hover:scale-105 transition"
            >
              ابدأ اللعبة
            </Link>
          </div>
        </div>
      </section>

      {/* ================= GAMES ================= */}
      <section id="games" className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="text-2xl font-black mb-6 text-center">
          اختر اللعبة التي تريدها
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* لعبة 1 */}
          <GameCard
            title="لمّتنا"
            desc="لعبة الأسئلة الجماعية"
            href="/game/start"
            color="from-blue-600 to-cyan-400"
          />

          {/* لعبة 2 */}
          <GameCard
            title="برا السالفة"
            desc="اكتشف من خارج الموضوع"
            href="/bara"
            color="from-purple-600 to-pink-500"
          />

          {/* لعبة 3 */}
          <GameCard
            title="Codenames"
            desc="قريبًا"
            href="#"
            color="from-orange-500 to-red-500"
            disabled
          />

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="text-center pb-20">
        <h2 className="text-2xl font-black">
          جاهز تبدأ التحدي؟
        </h2>

        <Link
          href="/game/start"
          className="inline-block mt-6 px-8 py-4 rounded-2xl bg-cyan-500 font-bold text-lg shadow-lg hover:scale-105 transition"
        >
          ابدأ اللعب الآن
        </Link>
      </section>
    </main>
  );
}

/* ================= GAME CARD ================= */

function GameCard({
  title,
  desc,
  href,
  color,
  disabled = false,
}: {
  title: string;
  desc: string;
  href: string;
  color: string;
  disabled?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl hover:-translate-y-2 transition">

      {/* صورة */}
      <div className={`h-[160px] rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-4xl font-black`}>
        ?
      </div>

      {/* نص */}
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="text-slate-400 text-sm mt-1">{desc}</p>

      <Link
        href={href}
        className={`block mt-4 text-center py-2 rounded-lg font-bold ${
          disabled
            ? "bg-white/10 text-white/40 pointer-events-none"
            : "bg-cyan-500 hover:scale-105 transition"
        }`}
      >
        {disabled ? "قريبًا" : "ابدأ"}
      </Link>
    </div>
  );
}