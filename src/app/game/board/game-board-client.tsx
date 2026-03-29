"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

type QuestionRow = {
  id: string;
  question_text: string;
  answer_text: string | null;
  points: number;
  is_active: boolean;
  is_used: boolean;
  category_id: string;
  year_tolerance_before?: number | null;
  year_tolerance_after?: number | null;
};

type Props = {
  sessionId: string;
  userId: string;
  initialBoardState: Record<string, unknown> | null;
  gameName: string;
  teamOne: string;
  teamTwo: string;
  categories: Category[];
  questions: QuestionRow[];
};

type BoardState = {
  teamOneScore: number;
  teamTwoScore: number;
  usedQuestionIds: string[];
  questionResults: Record<string, "teamOne" | "teamTwo" | "none">;
  savedAt: number;
};

type CategoryColumn = {
  category: Category;
  rows: {
    points: 200 | 400 | 600;
    questions: QuestionRow[];
  }[];
};

const TEAM_BLUE_AVATAR = "https://k.top4top.io/p_3739o1dbh1.png";
const TEAM_ORANGE_AVATAR = "https://l.top4top.io/p_3739qbt1f2.png";

const categoryVisuals: Record<string, { gradient: string }> = {
  history: { gradient: "from-amber-300/18 via-orange-400/10 to-transparent" },
  sports: { gradient: "from-emerald-300/18 via-green-400/10 to-transparent" },
  geography: { gradient: "from-sky-300/18 via-cyan-400/10 to-transparent" },
  science: { gradient: "from-violet-300/18 via-fuchsia-400/10 to-transparent" },
  movies: { gradient: "from-rose-300/18 via-pink-400/10 to-transparent" },
  islamic: { gradient: "from-yellow-300/18 via-amber-400/10 to-transparent" },
  default: { gradient: "from-slate-300/18 via-slate-400/10 to-transparent" },
};

function getVisualBySlug(slug: string) {
  return categoryVisuals[slug] ?? categoryVisuals.default;
}

function normalizeBoardState(
  raw: Record<string, unknown> | null | undefined,
): BoardState {
  const rawResults =
    raw && typeof raw.questionResults === "object" && raw.questionResults
      ? (raw.questionResults as Record<string, unknown>)
      : {};

  const questionResults: Record<string, "teamOne" | "teamTwo" | "none"> = {};

  for (const [key, value] of Object.entries(rawResults)) {
    if (value === "teamOne" || value === "teamTwo" || value === "none") {
      questionResults[key] = value;
    }
  }

  return {
    teamOneScore: typeof raw?.teamOneScore === "number" ? raw.teamOneScore : 0,
    teamTwoScore: typeof raw?.teamTwoScore === "number" ? raw.teamTwoScore : 0,
    usedQuestionIds: Array.isArray(raw?.usedQuestionIds)
      ? raw.usedQuestionIds.map((value) => String(value))
      : [],
    questionResults,
    savedAt: typeof raw?.savedAt === "number" ? raw.savedAt : 0,
  };
}

function readLocalBoardState(storageKey: string): BoardState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return normalizeBoardState(parsed);
  } catch {
    return null;
  }
}

function writeLocalBoardState(storageKey: string, state: BoardState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {}
}

function CrownIcon({ className = "h-4 w-4" }: { className?: string }) {
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

function GamepadIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <rect x="4" y="8" width="16" height="8" rx="3" />
      <path d="M8 12h2" />
      <path d="M9 11v2" />
      <path d="M16.5 12h.01" />
      <path d="M18.5 12h.01" />
    </svg>
  );
}

function StatusPill({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/90 shadow-[0_8px_18px_rgba(0,0,0,0.14)]">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function TeamCard({
  teamName,
  score,
  isLeading,
  isTurn,
  onIncrease,
  onDecrease,
  accent,
  avatarUrl,
  compact = false,
}: {
  teamName: string;
  score: number;
  isLeading: boolean;
  isTurn: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  accent: "blue" | "orange";
  avatarUrl: string;
  compact?: boolean;
}) {
  const palette =
    accent === "orange"
      ? {
          glow: "shadow-[0_0_0_1px_rgba(251,146,60,0.16),0_18px_50px_rgba(251,146,60,0.12)]",
          card: "border-orange-300/20 bg-[linear-gradient(180deg,rgba(53,30,15,0.94)_0%,rgba(18,10,5,0.98)_100%)]",
          chip: "border-orange-300/20 bg-orange-400/10 text-orange-100",
          btn: "border-orange-300/20 bg-orange-400/10 text-orange-100 hover:bg-orange-400/15",
          score: "text-orange-50",
          scoreGlow: "drop-shadow-[0_0_18px_rgba(251,146,60,0.18)]",
        }
      : {
          glow: "shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_18px_50px_rgba(34,211,238,0.10)]",
          card: "border-cyan-300/20 bg-[linear-gradient(180deg,rgba(7,45,67,0.94)_0%,rgba(4,15,28,0.98)_100%)]",
          chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
          btn: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15",
          score: "text-cyan-50",
          scoreGlow: "drop-shadow-[0_0_18px_rgba(34,211,238,0.18)]",
        };

  return (
    <div
      className={[
        "rounded-[1.5rem] border p-4 transition board-soft-float",
        compact ? "p-3" : "p-4",
        palette.card,
        palette.glow,
      ].join(" ")}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-md" />
            <img
              src={avatarUrl}
              alt={teamName}
              className={`relative rounded-full border border-white/10 object-cover shadow-[0_12px_24px_rgba(0,0,0,0.18)] ${
                compact ? "h-12 w-12" : "h-16 w-16"
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="text-[10px] font-bold text-white/55">لوحة الفريق</div>
            <div
              className={`truncate font-black text-white ${
                compact ? "text-base" : "text-xl"
              }`}
            >
              {teamName}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {isTurn ? (
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-black ${palette.chip}`}
            >
              الدور الآن
            </span>
          ) : null}

          {isLeading ? (
            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black text-emerald-100">
              متصدر
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onIncrease}
          className={`flex items-center justify-center rounded-full border font-black transition ${palette.btn} ${
            compact ? "h-10 w-10 text-2xl" : "h-12 w-12 text-3xl"
          }`}
        >
          +
        </button>

        <div className="text-center">
          <div
            className={[
              "font-black tracking-tight",
              compact ? "text-4xl" : "text-5xl",
              palette.score,
              palette.scoreGlow,
            ].join(" ")}
          >
            {score}
          </div>
          <div className="text-[11px] font-bold text-white/55">نقطة</div>
        </div>

        <button
          type="button"
          onClick={onDecrease}
          className={`flex items-center justify-center rounded-full border font-black transition ${palette.btn} ${
            compact ? "h-10 w-10 text-2xl" : "h-12 w-12 text-3xl"
          }`}
        >
          −
        </button>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  compact = false,
}: {
  category: Category;
  compact?: boolean;
}) {
  const visual = getVisualBySlug(category.slug);

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-b text-center shadow-[0_12px_26px_rgba(0,0,0,0.20)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(34,211,238,0.12)]",
        visual.gradient,
        compact ? "p-2.5" : "p-3",
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),transparent_50%)] opacity-80" />
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div
        className={`relative mx-auto flex items-center justify-center overflow-hidden rounded-[1rem] border border-white/10 bg-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.18)] ${
          compact ? "h-10 w-10" : "h-16 w-16"
        }`}
      >
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-[10px] font-black text-white/70">فئة</div>
        )}
      </div>

      <h3
        className={[
          "relative mt-3 overflow-hidden text-ellipsis whitespace-nowrap font-black text-white",
          compact ? "text-[10px]" : "text-base md:text-lg",
        ].join(" ")}
        title={category.name}
      >
        {category.name}
      </h3>
    </div>
  );
}

function QuestionCell({
  question,
  points,
  used,
  result = "none",
  onOpen,
  compact = false,
}: {
  question: QuestionRow | null;
  points: number;
  used: boolean;
  result?: "teamOne" | "teamTwo" | "none";
  onOpen?: () => void;
  compact?: boolean;
}) {
  const disabled = !question || used;

  const usedClass =
    result === "teamOne"
      ? "border-cyan-300/10 bg-cyan-400/8 text-cyan-100/70"
      : result === "teamTwo"
        ? "border-orange-300/10 bg-orange-400/8 text-orange-100/70"
        : "border-white/5 bg-[linear-gradient(180deg,rgba(2,8,23,0.84)_0%,rgba(2,8,23,0.96)_100%)] text-slate-500/80 opacity-70";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onOpen}
      aria-label={`سؤال ${points}`}
      className={[
        "group relative overflow-hidden rounded-[1.2rem] border transition duration-300 board-soft-float",
        compact ? "min-h-[60px] px-1.5 py-2" : "min-h-[88px] px-2 py-3",
        disabled
          ? usedClass
          : "border-cyan-300/10 bg-[linear-gradient(180deg,rgba(20,40,85,1)_0%,rgba(4,14,34,1)_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:border-cyan-300/30 hover:shadow-[0_18px_30px_rgba(34,211,238,0.14)]",
      ].join(" ")}
    >
      {!disabled ? (
        <>
          <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_45%)] opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent opacity-60" />
        </>
      ) : null}

      <div className="relative flex h-full items-center justify-center">
        <div
          className={[
            "font-black tracking-tight",
            compact ? "text-[1.2rem] md:text-[1.3rem]" : "text-[1.8rem] md:text-[2rem]",
          ].join(" ")}
        >
          {points}
        </div>
      </div>
    </button>
  );
}

export default function GameBoardClient({
  sessionId,
  initialBoardState,
  gameName,
  teamOne,
  teamTwo,
  categories,
  questions,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const storageKey = `seenjeem-board-state:${sessionId}`;

  const [isLandscapePhone, setIsLandscapePhone] = useState(false);

  const initialState = useMemo(() => {
    return normalizeBoardState(initialBoardState);
  }, [initialBoardState]);

  const [boardState, setBoardState] = useState<BoardState>(initialState);
  const [hasRedirectedToResult, setHasRedirectedToResult] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const localState = readLocalBoardState(storageKey);
    if (localState && localState.savedAt >= initialState.savedAt) {
      setBoardState(localState);
    } else {
      setBoardState(initialState);
    }
  }, [initialState, storageKey]);

  useEffect(() => {
    const checkLandscapePhone = () => {
      if (typeof window === "undefined") return;

      const isLandscape =
        window.matchMedia("(orientation: landscape)").matches &&
        window.innerWidth <= 1024;

      setIsLandscapePhone(isLandscape);
    };

    checkLandscapePhone();
    window.addEventListener("resize", checkLandscapePhone);
    window.addEventListener("orientationchange", checkLandscapePhone);

    return () => {
      window.removeEventListener("resize", checkLandscapePhone);
      window.removeEventListener("orientationchange", checkLandscapePhone);
    };
  }, []);

  useEffect(() => {
    writeLocalBoardState(storageKey, boardState);

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      await supabase
        .from("game_sessions")
        .update({
          board_state: {
            ...boardState,
            savedAt: boardState.savedAt || Date.now(),
          },
        })
        .eq("id", sessionId);
    }, 350);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [boardState, sessionId, storageKey, supabase]);

  const boardColumns = useMemo<CategoryColumn[]>(() => {
    const pointsList: (200 | 400 | 600)[] = [200, 400, 600];

    return categories.map((category) => {
      const categoryQuestions = questions.filter(
        (question) => question.category_id === category.id,
      );

      return {
        category,
        rows: pointsList.map((points) => {
          const matching = categoryQuestions
            .filter((question) => question.points === points)
            .sort((a, b) => a.id.localeCompare(b.id))
            .slice(0, 2);

          return {
            points,
            questions: matching,
          };
        }),
      };
    });
  }, [categories, questions]);

  const usedCount = boardState.usedQuestionIds.length;
  const remainingCount = Math.max(
    boardColumns.reduce(
      (sum, column) =>
        sum +
        column.rows.reduce((rowSum, row) => rowSum + row.questions.length, 0),
      0,
    ) - usedCount,
    0,
  );

  const teamOneLeading = boardState.teamOneScore > boardState.teamTwoScore;
  const teamTwoLeading = boardState.teamTwoScore > boardState.teamOneScore;
  const leaderLabel = teamOneLeading
    ? teamOne
    : teamTwoLeading
      ? teamTwo
      : "تعادل";

  const activeTurn = (usedCount + 1) % 2 === 1 ? "teamOne" : "teamTwo";
  const activeTurnName = activeTurn === "teamOne" ? teamOne : teamTwo;

  useEffect(() => {
    if (remainingCount !== 0) return;
    if (hasRedirectedToResult) return;
    if (questions.length === 0) return;

    setHasRedirectedToResult(true);

    const params = new URLSearchParams({
      sessionId,
      gameName,
      teamOne,
      teamTwo,
      teamOneScore: String(boardState.teamOneScore),
      teamTwoScore: String(boardState.teamTwoScore),
    });

    router.push(`/game/result?${params.toString()}`);
  }, [
    remainingCount,
    hasRedirectedToResult,
    questions.length,
    sessionId,
    gameName,
    teamOne,
    teamTwo,
    boardState.teamOneScore,
    boardState.teamTwoScore,
    router,
  ]);

  function updateState(updater: (prev: BoardState) => BoardState) {
    setBoardState((prev) => {
      const next = updater(prev);
      return {
        ...next,
        savedAt: Date.now(),
      };
    });
  }

  function handleOpenQuestion(question: QuestionRow | null) {
    if (!question) return;
    if (boardState.usedQuestionIds.includes(question.id)) return;

    router.push(`/game/question?sessionId=${sessionId}&questionId=${question.id}`);
  }

  const compactLandscape = isLandscapePhone;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.09),transparent_18%),linear-gradient(180deg,#020617_0%,#020b1d_35%,#010617_100%)] text-white">
      <div className="mx-auto max-w-[1800px] px-2 py-2 md:px-5 md:py-5">
        <div
          className={[
            "relative rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,15,37,0.98)_0%,rgba(2,9,24,0.98)_100%)] shadow-[0_25px_80px_rgba(0,0,0,0.38)]",
            compactLandscape ? "p-2.5" : "p-3 md:p-4",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.9rem]">
            <div className="board-soft-glow absolute -right-20 top-10 h-72 w-72 rounded-full bg-cyan-400/8 blur-3xl" />
            <div className="board-soft-glow absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-violet-400/8 blur-3xl" />
            <div className="board-soft-glow absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-400/6 blur-3xl" />
          </div>

          <div
            className={[
              "relative mb-4 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,32,66,0.95)_0%,rgba(10,18,38,0.95)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
              compactLandscape ? "p-3" : "p-4 md:p-5",
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[10px] font-black tracking-[0.18em] text-cyan-300/90">
                  لوحة اللعبة
                </div>
                <h1
                  className={[
                    "mt-1 font-black text-white",
                    compactLandscape ? "text-lg" : "text-3xl md:text-5xl",
                  ].join(" ")}
                >
                  {gameName}
                </h1>
                {!compactLandscape ? (
                  <p className="mt-2 text-sm leading-7 text-white/70 md:text-base">
                    اختر السؤال التالي وراقب النتيجة لحظة بلحظة ضمن واجهة مهيأة
                    للعرض والهواتف.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill
                  label={`الدور الآن: ${activeTurnName}`}
                  icon={<GamepadIcon className="h-4 w-4 text-cyan-300" />}
                />
                <StatusPill
                  label={`المتبقي: ${remainingCount} سؤال`}
                  icon={<CrownIcon className="h-4 w-4 text-white/80" />}
                />
                <StatusPill
                  label={`المتصدر: ${leaderLabel}`}
                  icon={<CrownIcon className="h-4 w-4 text-emerald-300" />}
                />
              </div>
            </div>
          </div>

          <div
            className={
              compactLandscape
                ? "relative grid gap-3 grid-cols-[175px_minmax(0,1fr)]"
                : "relative grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]"
            }
          >
            <aside className="order-1">
              <div
                className={
                  compactLandscape
                    ? "grid gap-3 grid-cols-1"
                    : "grid gap-4 sm:grid-cols-2 xl:grid-cols-1"
                }
              >
                <TeamCard
                  teamName={teamOne}
                  score={boardState.teamOneScore}
                  isLeading={teamOneLeading}
                  isTurn={activeTurn === "teamOne"}
                  onIncrease={() => updateState((prev) => ({ ...prev, teamOneScore: Math.max(0, prev.teamOneScore + 100) }))}
                  onDecrease={() => updateState((prev) => ({ ...prev, teamOneScore: Math.max(0, prev.teamOneScore - 100) }))}
                  accent="blue"
                  avatarUrl={TEAM_BLUE_AVATAR}
                  compact={compactLandscape}
                />

                <TeamCard
                  teamName={teamTwo}
                  score={boardState.teamTwoScore}
                  isLeading={teamTwoLeading}
                  isTurn={activeTurn === "teamTwo"}
                  onIncrease={() => updateState((prev) => ({ ...prev, teamTwoScore: Math.max(0, prev.teamTwoScore + 100) }))}
                  onDecrease={() => updateState((prev) => ({ ...prev, teamTwoScore: Math.max(0, prev.teamTwoScore - 100) }))}
                  accent="orange"
                  avatarUrl={TEAM_ORANGE_AVATAR}
                  compact={compactLandscape}
                />

                <div
                  className={[
                    "rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.95)_100%)]",
                    compactLandscape ? "p-3" : "p-4",
                  ].join(" ")}
                >
                  <Link
                    href="/account"
                    className={`inline-flex w-full items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 font-black text-white transition hover:bg-white/10 ${
                      compactLandscape
                        ? "min-h-11 px-4 py-2 text-xs"
                        : "min-h-13 px-5 py-3 text-sm"
                    }`}
                  >
                    الرجوع للحساب
                  </Link>
                </div>
              </div>
            </aside>

            <div className="order-2">
              <div
                className={[
                  "overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,19,40,0.98)_0%,rgba(2,11,31,1)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
                  compactLandscape ? "p-2" : "p-3",
                ].join(" ")}
              >
                <div
                  className={
                    compactLandscape
                      ? "grid grid-cols-6 gap-2"
                      : "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
                  }
                >
                  {boardColumns.map((column) => (
                    <div key={column.category.id} className="flex flex-col gap-2">
                      <CategoryCard
                        category={column.category}
                        compact={compactLandscape}
                      />

                      {column.rows.map((row) => (
                        <div
                          key={`${column.category.id}-${row.points}`}
                          className={compactLandscape ? "grid grid-cols-2 gap-1.5" : "grid grid-cols-2 gap-2"}
                        >
                          {[0, 1].map((index) => {
                            const question = row.questions[index] ?? null;
                            const used = question
                              ? boardState.usedQuestionIds.includes(question.id)
                              : true;
                            const result = question
                              ? boardState.questionResults[question.id] ?? "none"
                              : "none";

                            return (
                              <QuestionCell
                                key={`${column.category.id}-${row.points}-${index}`}
                                question={question}
                                points={row.points}
                                used={used}
                                result={result}
                                compact={compactLandscape}
                                onOpen={() => handleOpenQuestion(question)}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes boardGlow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }

        @keyframes floatSoft {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .board-soft-glow {
          animation: boardGlow 4.8s ease-in-out infinite;
        }

        .board-soft-float {
          animation: floatSoft 5.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
