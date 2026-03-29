import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  sessionId?: string;
  gameName?: string;
  teamOne?: string;
  teamTwo?: string;
  teamOneScore?: string;
  teamTwoScore?: string;
}>;

const TEAM_BLUE_AVATAR = "https://k.top4top.io/p_3739o1dbh1.png";
const TEAM_ORANGE_AVATAR = "https://l.top4top.io/p_3739qbt1f2.png";

function CrownIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 18h16" />
      <path d="m5 18 1.5-9 5 4 4-7 2.5 7 1.5-4 1 9" />
    </svg>
  );
}

function SparkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
    </svg>
  );
}

function TrophyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M5 6H3a2 2 0 0 0 2 2" />
      <path d="M19 6h2a2 2 0 0 1-2 2" />
    </svg>
  );
}

function TeamResultCard({
  name,
  score,
  avatar,
  accent,
  isWinner,
  compact = false,
}: {
  name: string;
  score: number;
  avatar: string;
  accent: "blue" | "orange";
  isWinner: boolean;
  compact?: boolean;
}) {
  const palette =
    accent === "orange"
      ? {
          card: "border-orange-300/20 bg-[linear-gradient(180deg,rgba(53,30,15,0.94)_0%,rgba(18,10,5,0.98)_100%)]",
          glow: "shadow-[0_0_0_1px_rgba(251,146,60,0.16),0_18px_50px_rgba(251,146,60,0.12)]",
          pill: "border-orange-300/20 bg-orange-400/10 text-orange-100",
          score: "text-orange-50",
        }
      : {
          card: "border-cyan-300/20 bg-[linear-gradient(180deg,rgba(7,45,67,0.94)_0%,rgba(4,15,28,0.98)_100%)]",
          glow: "shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_18px_50px_rgba(34,211,238,0.10)]",
          pill: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
          score: "text-cyan-50",
        };

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[1.8rem] border p-5",
        palette.card,
        palette.glow,
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={avatar}
            alt={name}
            className={`rounded-full border border-white/10 object-cover shadow-[0_14px_30px_rgba(0,0,0,0.22)] ${
              compact ? "h-16 w-16" : "h-20 w-20"
            }`}
          />
          <div>
            <div className="text-[11px] font-bold text-white/55">الفريق</div>
            <div className={compact ? "text-2xl font-black text-white" : "text-3xl font-black text-white"}>
              {name}
            </div>
          </div>
        </div>

        {isWinner ? (
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${palette.pill}`}
          >
            <CrownIcon className="h-4 w-4" />
            <span>الفائز</span>
          </div>
        ) : null}
      </div>

      <div className="relative mt-6 text-center">
        <div className="text-[12px] font-bold text-white/55">النتيجة النهائية</div>
        <div
          className={[
            "mt-2 font-black tracking-tight drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]",
            compact ? "text-5xl" : "text-6xl",
            palette.score,
          ].join(" ")}
        >
          {score}
        </div>
        <div className="mt-1 text-sm font-bold text-white/55">نقطة</div>
      </div>
    </div>
  );
}

export default async function GameResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const sessionId = String(params.sessionId ?? "").trim();
  const gameName = String(params.gameName ?? "اللعبة").trim();
  const teamOne = String(params.teamOne ?? "الفريق الأول").trim();
  const teamTwo = String(params.teamTwo ?? "الفريق الثاني").trim();
  const teamOneScore = Number(params.teamOneScore ?? 0);
  const teamTwoScore = Number(params.teamTwoScore ?? 0);

  if (!sessionId) {
    redirect("/game/start");
  }

  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const winnerTeam =
    teamOneScore > teamTwoScore
      ? teamOne
      : teamTwoScore > teamOneScore
        ? teamTwo
        : "تعادل";

  await supabase.rpc("finish_game_session", {
    p_session_id: sessionId,
    p_user_id: user.id,
    p_team_one_score: teamOneScore,
    p_team_two_score: teamTwoScore,
    p_winner_team: winnerTeam,
    p_board_state: {},
  });

  const isTeamOneWinner = winnerTeam === teamOne;
  const isTeamTwoWinner = winnerTeam === teamTwo;
  const isDraw = winnerTeam === "تعادل";

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_20%),linear-gradient(180deg,#020617_0%,#020b1d_35%,#010617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Balloons */}
        <div className="balloon balloon-blue left-[8%] top-[10%]" />
        <div className="balloon balloon-orange left-[18%] top-[22%]" />
        <div className="balloon balloon-blue right-[14%] top-[14%]" />
        <div className="balloon balloon-orange right-[24%] top-[24%]" />
        <div className="balloon balloon-blue left-[30%] bottom-[12%]" />
        <div className="balloon balloon-orange right-[30%] bottom-[10%]" />

        {/* Sparkles */}
        <div className="spark left-[15%] top-[16%]" />
        <div className="spark left-[52%] top-[12%]" />
        <div className="spark right-[18%] top-[20%]" />
        <div className="spark left-[28%] bottom-[20%]" />
        <div className="spark right-[32%] bottom-[18%]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,19,40,0.98)_0%,rgba(2,11,31,1)_100%)] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.38)] md:p-6">
          <div className="mb-6 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,32,66,0.95)_0%,rgba(10,18,38,0.95)_100%)] p-5 text-center md:p-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              <TrophyIcon className="h-4 w-4" />
              <span>النتيجة النهائية</span>
            </div>

            <h1 className="text-4xl font-black text-white md:text-6xl">
              {gameName}
            </h1>

            <p className="mt-3 text-sm text-white/70 md:text-base">
             انتهت اللعبة وهذا هو الفريق الفائز : 
            </p>

            <div className="mt-5 flex justify-center">
              <div className="inline-flex items-center gap-3 rounded-[1.25rem] border border-amber-300/20 bg-amber-400/10 px-5 py-3 text-amber-100 shadow-[0_16px_35px_rgba(251,191,36,0.08)]">
                <CrownIcon className="h-5 w-5" />
                <div className="text-right">
                  <div className="text-[11px] font-bold text-amber-200/80">
                    الفائز
                  </div>
                  <div className="text-lg font-black md:text-2xl">
                    {winnerTeam}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TeamResultCard
              name={teamOne}
              score={teamOneScore}
              avatar={TEAM_BLUE_AVATAR}
              accent="blue"
              isWinner={isTeamOneWinner}
            />

            <TeamResultCard
              name={teamTwo}
              score={teamTwoScore}
              avatar={TEAM_ORANGE_AVATAR}
              accent="orange"
              isWinner={isTeamTwoWinner}
            />
          </div>

          {isDraw ? (
            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/90">
                <SparkIcon className="h-4 w-4" />
                <span>انتهت اللعبة بتعادل</span>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Link
              href="/game/start"
              className="inline-flex min-h-14 items-center justify-center rounded-[1.25rem] bg-cyan-500 px-6 py-4 text-base font-black text-slate-950 transition hover:bg-cyan-400"
            >
              بدء لعبة جديدة
            </Link>

            <Link
              href="/account"
              className="inline-flex min-h-14 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/5 px-6 py-4 text-base font-black text-white transition hover:bg-white/10"
            >
              حسابي
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-18px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        .balloon {
          position: absolute;
          width: 42px;
          height: 54px;
          border-radius: 999px 999px 999px 999px;
          opacity: 0.22;
          animation: floatUp 4.8s ease-in-out infinite;
        }

        .balloon::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 100%;
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(-50%);
        }

        .balloon-blue {
          background: linear-gradient(180deg, rgba(34,211,238,0.8), rgba(14,116,144,0.8));
        }

        .balloon-orange {
          background: linear-gradient(180deg, rgba(251,146,60,0.8), rgba(154,52,18,0.8));
        }

        .spark {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.85);
          box-shadow: 0 0 18px rgba(255,255,255,0.55);
          animation: sparkle 2.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}