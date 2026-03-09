import Link from "next/link";

type ResultPageProps = {
  searchParams: Promise<{
    gameName?: string;
    teamOne?: string;
    teamTwo?: string;
    teamOneScore?: string;
    teamTwoScore?: string;
  }>;
};

export default async function GameResultPage({
  searchParams,
}: ResultPageProps) {
  const params = await searchParams;

  const gameName = (params.gameName ?? "اللعبة").trim();
  const teamOne = (params.teamOne ?? "الفريق الأول").trim();
  const teamTwo = (params.teamTwo ?? "الفريق الثاني").trim();
  const teamOneScore = Number(params.teamOneScore ?? 0);
  const teamTwoScore = Number(params.teamTwoScore ?? 0);

  const winner =
    teamOneScore > teamTwoScore
      ? teamOne
      : teamTwoScore > teamOneScore
      ? teamTwo
      : "تعادل";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-12">
          <div className="text-center">
            <div className="text-sm text-slate-400">نتائج اللعبة</div>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              {gameName}
            </h1>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-8 text-center">
              <div className="text-2xl font-black">{teamOne}</div>
              <div className="mt-4 text-6xl font-black">{teamOneScore}</div>
              <div className="mt-2 text-slate-300">نقطة</div>
            </div>

            <div className="rounded-[2rem] border border-orange-400/20 bg-orange-400/10 p-8 text-center">
              <div className="text-2xl font-black">{teamTwo}</div>
              <div className="mt-4 text-6xl font-black">{teamTwoScore}</div>
              <div className="mt-2 text-slate-300">نقطة</div>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 text-center">
            <div className="text-lg text-slate-400">الفائز</div>
            <div className="mt-4 text-4xl font-black text-cyan-300 md:text-5xl">
              {winner}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/game/start"
              className="rounded-[2rem] bg-cyan-400 px-8 py-4 text-xl font-black text-slate-950"
            >
              بدء لعبة جديدة
            </Link>

            <Link
              href="/"
              className="rounded-[2rem] border border-white/10 px-8 py-4 text-xl font-black text-slate-200 transition hover:bg-white/5"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}