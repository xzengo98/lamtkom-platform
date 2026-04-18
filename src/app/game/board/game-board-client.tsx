"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  userId?: string;
  initialBoardState: Record<string, unknown> | null;
  gameName: string;
  teamOne: string;
  teamTwo: string;
  categories: Category[];
  questions: QuestionRow[];
};

type QuestionResult = "teamOne" | "teamTwo" | "none";

type BoardState = {
  teamOneScore: number;
  teamTwoScore: number;
  usedQuestionIds: string[];
  questionResults: Record<string, QuestionResult>;
  savedAt: number;
};

type CategoryColumn = {
  category: Category;
  rows: {
    points: 200 | 400 | 600;
    questions: QuestionRow[];
  }[];
};

// ─── State helpers (logic unchanged) ─────────────────────────────────────────

function normalizeBoardState(
  raw: Record<string, unknown> | null | undefined,
): BoardState {
  const rawResults =
    raw &&
    typeof raw.questionResults === "object" &&
    raw.questionResults !== null
      ? (raw.questionResults as Record<string, unknown>)
      : {};

  const questionResults: Record<string, QuestionResult> = {};

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
  } catch {
    //
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CrownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 18 2.5 7.5l5.2 4.1L12 5l4.3 6.6 5.2-4.1L20 18H4Z"
        className="fill-current"
        opacity="0.9"
      />
      <path d="M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GamepadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="8" width="17" height="8.5" rx="4.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 10.5v4M6 12.5h4M15.5 11.25h.01M17.5 13.25h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FlagIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 20V5m0 0c2.5-1.8 4.7-.2 7-1.2 2.1-.9 3.7-2 5-1.3V11c-1.3-.7-2.9.4-5 1.3-2.3 1-4.5-.6-7 1.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 12L12 3l9 9M5 10v11h5v-6h4v6h5V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── StatusPill ───────────────────────────────────────────────────────────────

function StatusPill({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-[linear-gradient(180deg,#58c6f2_0%,#3caee1_100%)] px-3 py-1.5 text-xs font-black text-white shadow-[0_3px_0_rgba(10,77,111,0.40)] sm:px-4 sm:py-2 sm:text-sm">
      {icon}
      <span>{label}</span>
    </div>
  );
}

// ─── ScoreControl ─────────────────────────────────────────────────────────────

function ScoreControl({
  teamName,
  score,
  accent,
  onIncrease,
  onDecrease,
}: {
  teamName: string;
  score: number;
  accent: "blue" | "orange";
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  const palette =
    accent === "orange"
      ? {
          top: "bg-[linear-gradient(180deg,#ff9c52_0%,#f57c1f_100%)]",
          topShadow: "shadow-[0_4px_0_rgba(150,76,16,0.52)]",
          circle: "bg-[linear-gradient(180deg,#ffab4f_0%,#f18412_100%)] shadow-[0_4px_0_rgba(148,77,15,0.58)]",
          ring: "ring-orange-100/70",
        }
      : {
          top: "bg-[linear-gradient(180deg,#39a8da_0%,#1f91c6_100%)]",
          topShadow: "shadow-[0_4px_0_rgba(18,82,113,0.45)]",
          circle: "bg-[linear-gradient(180deg,#39a8da_0%,#1f91c6_100%)] shadow-[0_4px_0_rgba(19,83,113,0.55)]",
          ring: "ring-cyan-200/60",
        };

  return (
    <div className="w-[214px] shrink-0 sm:w-[250px] xl:w-full xl:max-w-[300px]">
      <div
        className={`rounded-t-[24px] px-5 pb-4 pt-3.5 text-center text-base font-black text-white sm:rounded-t-[28px] sm:px-6 sm:pb-5 sm:pt-4 sm:text-lg ${palette.top} ${palette.topShadow}`}
      >
        <span className="block truncate">{teamName}</span>
      </div>

      <div className="relative -mt-1 rounded-b-[24px] border-t-4 border-slate-500/30 bg-[linear-gradient(180deg,#ece8e2_0%,#d9d4cc_100%)] px-5 py-3.5 shadow-[0_10px_25px_rgba(0,0,0,0.18)] sm:rounded-b-[28px] sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={onIncrease}
          className={`absolute left-[-1px] top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-3xl font-black text-white ring-4 transition duration-150 hover:scale-105 active:scale-95 sm:h-[58px] sm:w-[58px] sm:text-[36px] ${palette.ring} ${palette.circle}`}
          aria-label="زيادة النقاط"
        >
          +
        </button>

        <div className="text-center text-[26px] font-black leading-none text-slate-800 sm:text-[28px]">
          {score}
        </div>

        <button
          type="button"
          onClick={onDecrease}
          className={`absolute right-[-1px] top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-3xl font-black text-white ring-4 transition duration-150 hover:scale-105 active:scale-95 sm:h-[58px] sm:w-[58px] sm:text-[36px] ${palette.ring} ${palette.circle}`}
          aria-label="تقليل النقاط"
        >
          −
        </button>
      </div>
    </div>
  );
}

// ─── Board: QuestionTile ──────────────────────────────────────────────────────

function QuestionTile({
  question,
  points,
  used,
  result = "none",
  onOpen,
}: {
  question: QuestionRow | null;
  points: 200 | 400 | 600;
  used: boolean;
  result?: QuestionResult;
  onOpen?: () => void;
}) {
  const pointsColors = {
    bg: "bg-[linear-gradient(160deg,#6b7280_0%,#4b5563_100%)]",
    text: "text-white",
    glow:
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_16px_rgba(17,24,39,0.38)]",
    hover:
      "hover:brightness-110 hover:shadow-[0_6px_24px_rgba(17,24,39,0.45)]",
    border: "border-[#9ca3af]/25",
  };

  const base =
    "relative flex w-full items-center justify-center rounded-xl border font-black transition-all duration-200 select-none" +
    " h-12 text-lg sm:h-14 sm:text-xl md:h-16 md:text-2xl";

  if (!question) {
    return (
      <div className={`${base} border-white/5 bg-white/[0.03] text-white/15`}>
        {points}
      </div>
    );
  }

  if (used) {
    if (result === "teamOne") {
      return (
        <div
          className={`${base} border-cyan-400/30 bg-[linear-gradient(160deg,#0277bd_0%,#01579b_100%)] text-white shadow-[inset_0_0_20px_rgba(79,195,247,0.12),0_4px_16px_rgba(2,119,189,0.40)]`}
        >
          <span className="absolute right-1.5 top-1 text-[10px] text-cyan-300/70 sm:text-xs">✓</span>
          {points}
        </div>
      );
    }

    if (result === "teamTwo") {
      return (
        <div
          className={`${base} border-orange-400/30 bg-[linear-gradient(160deg,#e65100_0%,#bf360c_100%)] text-white shadow-[inset_0_0_20px_rgba(255,183,77,0.12),0_4px_16px_rgba(230,81,0,0.40)]`}
        >
          <span className="absolute right-1.5 top-1 text-[10px] text-orange-300/70 sm:text-xs">✓</span>
          {points}
        </div>
      );
    }

    return (
      <div
        className={`${base} border-white/5 bg-[linear-gradient(160deg,#0f1c3a_0%,#090f22_100%)] text-white/25 line-through decoration-2`}
      >
        {points}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${base} ${pointsColors.bg} ${pointsColors.glow} ${pointsColors.hover} ${pointsColors.border}`}
    >
      <span className={`${pointsColors.text} [text-shadow:0_1px_0_rgba(0,0,0,0.95),0_0_6px_rgba(0,0,0,0.45)]`}>
        {points}
      </span>
    </button>
  );
}

// ─── Board: CategoryCard ──────────────────────────────────────────────────────

function CategoryCard({
  column,
  boardState,
  onOpenQuestion,
}: {
  column: CategoryColumn;
  boardState: BoardState;
  onOpenQuestion: (question: QuestionRow | null) => void;
}) {
  const row200 = column.rows[0];
  const row400 = column.rows[1];
  const row600 = column.rows[2];

  const left200 = row200?.questions[0] ?? null;
  const right200 = row200?.questions[1] ?? null;
  const left400 = row400?.questions[0] ?? null;
  const right400 = row400?.questions[1] ?? null;
  const left600 = row600?.questions[0] ?? null;
  const right600 = row600?.questions[1] ?? null;

  function getUsed(question: QuestionRow | null) {
    return question ? boardState.usedQuestionIds.includes(question.id) : true;
  }

  function getResult(question: QuestionRow | null): QuestionResult {
    return question ? boardState.questionResults[question.id] ?? "none" : "none";
  }

  const allTiles = [left200, right200, left400, right400, left600, right600];
  const usedInCategory = allTiles.filter(
    (q) => q && boardState.usedQuestionIds.includes(q.id),
  ).length;
  const totalInCategory = allTiles.filter(Boolean).length;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,22,54,0.72)_0%,rgba(4,12,32,0.86)_100%)] shadow-[0_8px_32px_rgba(0,0,0,0.50)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5">
      <div className="relative overflow-hidden">
        {column.category.image_url ? (
          <>
            <img
              src={column.category.image_url}
              alt={column.category.name}
              className="h-[5.5rem] w-full object-cover object-center sm:h-[6.5rem] md:h-[7.5rem]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(5,14,38,0.90)] via-[rgba(5,14,38,0.30)] to-transparent" />
          </>
        ) : (
          <div className="h-[5.5rem] w-full bg-[linear-gradient(135deg,#0d2060,#05143a)] sm:h-[6.5rem] md:h-[7.5rem]" />
        )}

        {totalInCategory > 0 && (
          <div className="absolute top-0 inset-x-0 h-[3px] bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-500"
              style={{ width: `${(usedInCategory / totalInCategory) * 100}%` }}
            />
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 px-3 pb-2.5 pt-6">
          <div className="truncate text-center text-sm font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-base md:text-lg">
            {column.category.name}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-2 sm:gap-2 sm:p-2.5">
        <QuestionTile
          question={left200}
          points={200}
          used={getUsed(left200)}
          result={getResult(left200)}
          onOpen={() => onOpenQuestion(left200)}
        />
        <QuestionTile
          question={right200}
          points={200}
          used={getUsed(right200)}
          result={getResult(right200)}
          onOpen={() => onOpenQuestion(right200)}
        />

        <QuestionTile
          question={left400}
          points={400}
          used={getUsed(left400)}
          result={getResult(left400)}
          onOpen={() => onOpenQuestion(left400)}
        />
        <QuestionTile
          question={right400}
          points={400}
          used={getUsed(right400)}
          result={getResult(right400)}
          onOpen={() => onOpenQuestion(right400)}
        />

        <QuestionTile
          question={left600}
          points={600}
          used={getUsed(left600)}
          result={getResult(left600)}
          onOpen={() => onOpenQuestion(left600)}
        />
        <QuestionTile
          question={right600}
          points={600}
          used={getUsed(right600)}
          result={getResult(right600)}
          onOpen={() => onOpenQuestion(right600)}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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

  const [hasRedirectedToResult, setHasRedirectedToResult] = useState(false);

  const initialState = useMemo(() => normalizeBoardState(initialBoardState), [initialBoardState]);
  const [boardState, setBoardState] = useState<BoardState>(initialState);
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
        rows: pointsList.map((points) => ({
          points,
          questions: categoryQuestions
            .filter((question) => question.points === points)
            .sort((a, b) => a.id.localeCompare(b.id))
            .slice(0, 2),
        })),
      };
    });
  }, [categories, questions]);

  const usedCount = boardState.usedQuestionIds.length;

  const remainingCount = Math.max(
    boardColumns.reduce(
      (sum, column) =>
        sum + column.rows.reduce((rowSum, row) => rowSum + row.questions.length, 0),
      0,
    ) - usedCount,
    0,
  );

  const teamOneLeading = boardState.teamOneScore > boardState.teamTwoScore;
  const teamTwoLeading = boardState.teamTwoScore > boardState.teamOneScore;
  const leaderLabel = teamOneLeading ? teamOne : teamTwoLeading ? teamTwo : "تعادل";

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
    setBoardState((prev) => ({
      ...updater(prev),
      savedAt: Date.now(),
    }));
  }

  function handleOpenQuestion(question: QuestionRow | null) {
    if (!question) return;
    if (boardState.usedQuestionIds.includes(question.id)) return;
    router.push(`/game/question?sessionId=${sessionId}&questionId=${question.id}`);
  }

  function handleFinishGame() {
    if (hasRedirectedToResult) return;
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
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 lg:px-6">
        <div className="mb-4 rounded-[28px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.015)_100%)] px-4 py-4 shadow-[0_18px_60px_rgba(2,6,23,0.50)] backdrop-blur-sm sm:mb-5 sm:rounded-[30px] sm:px-5 sm:py-5">
  <div className="xl:hidden">
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300/55">
          لوحة اللعبة
        </div>
        <h1 className="mt-1 text-2xl font-black text-white">
          {gameName}
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <StatusPill
          label={`الدور: ${activeTurnName}`}
          icon={<GamepadIcon className="h-3.5 w-3.5" />}
        />
        <StatusPill
          label={`المتصدر: ${leaderLabel}`}
          icon={<CrownIcon className="h-3.5 w-3.5" />}
        />
        <StatusPill label={`المتبقي: ${remainingCount} سؤال`} />
      </div>

      <div className="flex justify-center">
        <ScoreControl
          teamName={teamOne}
          score={boardState.teamOneScore}
          accent="blue"
          onIncrease={() =>
            updateState((prev) => ({
              ...prev,
              teamOneScore: Math.max(0, prev.teamOneScore + 100),
            }))
          }
          onDecrease={() =>
            updateState((prev) => ({
              ...prev,
              teamOneScore: Math.max(0, prev.teamOneScore - 100),
            }))
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleFinishGame}
          className="inline-flex items-center gap-1.5 rounded-[16px] bg-[linear-gradient(180deg,#e11d74_0%,#c51160_100%)] px-4 py-2.5 text-xs font-black text-white shadow-[0_4px_0_rgba(109,12,55,0.45)] transition duration-150 hover:brightness-105 active:scale-95"
        >
          <FlagIcon className="h-3.5 w-3.5" />
          إنهاء اللعب
        </button>

        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 rounded-[16px] border border-white/10 bg-white/6 px-4 py-2.5 text-xs font-black text-white transition duration-150 hover:bg-white/10 active:scale-95"
        >
          <HomeIcon className="h-3.5 w-3.5" />
          الرجوع للحساب
        </Link>
      </div>

      <div className="flex justify-center">
        <ScoreControl
          teamName={teamTwo}
          score={boardState.teamTwoScore}
          accent="orange"
          onIncrease={() =>
            updateState((prev) => ({
              ...prev,
              teamTwoScore: Math.max(0, prev.teamTwoScore + 100),
            }))
          }
          onDecrease={() =>
            updateState((prev) => ({
              ...prev,
              teamTwoScore: Math.max(0, prev.teamTwoScore - 100),
            }))
          }
        />
      </div>
    </div>
  </div>

  <div className="hidden xl:block">
    <div className="mb-3 flex items-center justify-center gap-3 sm:mb-4">
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300/55 sm:text-xs">
          لوحة اللعبة
        </div>
        <h1 className="text-lg font-black text-white sm:text-xl md:text-2xl">
          {gameName}
        </h1>
      </div>
    </div>

    <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5">
      <StatusPill
        label={`الدور: ${activeTurnName}`}
        icon={<GamepadIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
      />
      <StatusPill
        label={`المتصدر: ${leaderLabel}`}
        icon={<CrownIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
      />
      <StatusPill label={`المتبقي: ${remainingCount} سؤال`} />

      <div className="hidden flex-1 xl:block" />

      <button
        type="button"
        onClick={handleFinishGame}
        className="inline-flex items-center gap-1.5 rounded-[16px] bg-[linear-gradient(180deg,#e11d74_0%,#c51160_100%)] px-4 py-2.5 text-xs font-black text-white shadow-[0_4px_0_rgba(109,12,55,0.45)] transition duration-150 hover:brightness-105 active:scale-95 sm:rounded-[18px] sm:px-6 sm:py-3 sm:text-sm"
      >
        <FlagIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        إنهاء اللعب
      </button>

      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 rounded-[16px] border border-white/10 bg-white/6 px-4 py-2.5 text-xs font-black text-white transition duration-150 hover:bg-white/10 active:scale-95 sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-sm"
      >
        <HomeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">الرجوع للحساب</span>
        <span className="sm:hidden">الحساب</span>
      </Link>
    </div>

    <div className="grid grid-cols-2 items-start gap-3 sm:gap-5">
      <div className="flex justify-center sm:justify-start">
        <ScoreControl
          teamName={teamOne}
          score={boardState.teamOneScore}
          accent="blue"
          onIncrease={() =>
            updateState((prev) => ({
              ...prev,
              teamOneScore: Math.max(0, prev.teamOneScore + 100),
            }))
          }
          onDecrease={() =>
            updateState((prev) => ({
              ...prev,
              teamOneScore: Math.max(0, prev.teamOneScore - 100),
            }))
          }
        />
      </div>

      <div className="flex justify-center sm:justify-end">
        <ScoreControl
          teamName={teamTwo}
          score={boardState.teamTwoScore}
          accent="orange"
          onIncrease={() =>
            updateState((prev) => ({
              ...prev,
              teamTwoScore: Math.max(0, prev.teamTwoScore + 100),
            }))
          }
          onDecrease={() =>
            updateState((prev) => ({
              ...prev,
              teamTwoScore: Math.max(0, prev.teamTwoScore - 100),
            }))
          }
        />
      </div>
    </div>
  </div>
</div>

        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(3,14,38,0.82)_0%,rgba(2,9,24,0.92)_100%)] p-3 shadow-[0_18px_80px_rgba(2,6,23,0.60)] backdrop-blur-sm sm:rounded-[28px] sm:p-4">
          <div className="mb-3 flex items-center gap-3 px-1 sm:mb-4">
            <span className="text-xs font-bold text-white/30 sm:text-sm">الفئات</span>
            <div className="flex-1 h-px bg-white/6" />
            <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 sm:text-xs">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded bg-[#1565c0]" />
                فريق ١
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded bg-[#e65100]" />
                فريق ٢
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded bg-[#0f1c3a]" />
                انتهى
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
            {boardColumns.map((column) => (
              <CategoryCard
                key={column.category.id}
                column={column}
                boardState={boardState}
                onOpenQuestion={handleOpenQuestion}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}