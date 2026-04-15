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
    <div className="w-full max-w-[260px] sm:max-w-[300px]">
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
  // Points color config
  const ptStyle = points === 200
    ? { idle: "bg-[linear-gradient(180deg,#2ecc5a_0%,#1b7001_100%)] shadow-[0_4px_0_rgba(10,60,0,0.50)] border-[#2dbd4e]/30", label: "text-white" }
    : points === 400
    ? { idle: "bg-[linear-gradient(180deg,#9b59d0_0%,#6a1b9a_100%)] shadow-[0_4px_0_rgba(60,10,100,0.50)] border-violet-400/30", label: "text-white" }
    : { idle: "bg-[linear-gradient(180deg,#f6cf2b_0%,#c9a200_100%)] shadow-[0_4px_0_rgba(100,78,0,0.50)] border-yellow-300/30", label: "text-slate-900" };

  const base = "relative flex w-full items-center justify-center rounded-xl border-2 font-black transition-all duration-150 select-none h-10 text-base sm:h-12 sm:text-lg md:h-14 md:text-xl";

  if (!question) {
    return (
      <div className={`${base} border-white/5 bg-white/[0.03] text-white/10`}>
        {points}
      </div>
    );
  }

  if (used) {
    if (result === "teamOne") {
      return (
        <div className={`${base} border-cyan-400/20 bg-[linear-gradient(160deg,#0277bd_0%,#01579b_100%)] text-white opacity-80`}>
          <span className="absolute right-1 top-0.5 text-[9px] text-cyan-300/60">✓</span>
          {points}
        </div>
      );
    }
    if (result === "teamTwo") {
      return (
        <div className={`${base} border-orange-400/20 bg-[linear-gradient(160deg,#e65100_0%,#bf360c_100%)] text-white opacity-80`}>
          <span className="absolute right-1 top-0.5 text-[9px] text-orange-300/60">✓</span>
          {points}
        </div>
      );
    }
    return (
      <div className={`${base} border-white/4 bg-[linear-gradient(160deg,#0f1c3a_0%,#090f22_100%)] text-white/18 line-through`}>
        {points}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${base} ${ptStyle.idle} hover:brightness-110 active:scale-[0.96] active:brightness-95`}
    >
      <span className={`${ptStyle.label} [text-shadow:0_1px_0_rgba(0,0,0,0.30)]`}>
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
  openInfoId,
  onToggleInfo,
}: {
  column: CategoryColumn;
  boardState: BoardState;
  onOpenQuestion: (question: QuestionRow | null) => void;
  openInfoId: string | null;
  onToggleInfo: (id: string) => void;
}) {
  // ── Logic — completely unchanged ──
  const row200 = column.rows[0];
  const row400 = column.rows[1];
  const row600 = column.rows[2];

  const left200  = row200?.questions[0] ?? null;
  const right200 = row200?.questions[1] ?? null;
  const left400  = row400?.questions[0] ?? null;
  const right400 = row400?.questions[1] ?? null;
  const left600  = row600?.questions[0] ?? null;
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
  const remainingInCategory = Math.max(totalInCategory - usedInCategory, 0);

  const isInfoOpen = openInfoId === column.category.id;
  const isFullyUsed = totalInCategory > 0 && usedInCategory >= totalInCategory;

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
      isFullyUsed
        ? "border-white/8 opacity-70"
        : "border-white/15 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_12px_40px_rgba(34,211,238,0.15)]"
    } shadow-[0_8px_24px_rgba(0,0,0,0.55)]`}>

      {/* ── Image area ── */}
      <div className="relative overflow-hidden">
        {column.category.image_url ? (
          <img
            src={column.category.image_url}
            alt={column.category.name}
            className="h-32 w-full object-cover transition duration-500 group-hover:scale-[1.04] sm:h-36 md:h-40"
            loading="lazy"
          />
        ) : (
          <div className="h-32 w-full bg-[linear-gradient(135deg,#0d2060,#05143a)] sm:h-36 md:h-40" />
        )}

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(2,10,30,0.96)] via-[rgba(2,10,30,0.30)] to-[rgba(2,10,30,0.10)]" />

        {/* Progress bar top */}
        {totalInCategory > 0 && (
          <div className="absolute inset-x-0 top-0 h-[3px] bg-white/8">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-500"
              style={{ width: `${(usedInCategory / totalInCategory) * 100}%` }}
            />
          </div>
        )}

        {/* Top-right: question count badge */}
        <div className="absolute right-1.5 top-1.5 z-10">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[11px] ${
            remainingInCategory === 0
              ? "border-white/15 bg-black/50 text-white/40"
              : "border-emerald-400/30 bg-[rgba(15,60,20,0.80)] text-emerald-200"
          }`}>
            {remainingInCategory} سؤال
          </span>
        </div>

        {/* Top-left: info "!" button */}
        <button
          type="button"
          onClick={() => onToggleInfo(column.category.id)}
          className="absolute left-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[rgba(30,90,160,0.85)] text-xs font-black text-white shadow-lg backdrop-blur-sm transition hover:bg-[rgba(40,110,190,0.95)] active:scale-95 sm:h-8 sm:w-8 sm:text-sm"
          aria-label="معلومات الفئة"
        >
          !
        </button>

        {/* "مؤقتة" / status badge bottom-left */}
        {isFullyUsed && (
          <div className="absolute bottom-8 left-1.5 z-10">
            <span className="rounded-full border border-red-400/30 bg-red-900/70 px-2 py-0.5 text-[9px] font-black text-red-200 backdrop-blur-sm sm:text-[10px]">
              مكتملة
            </span>
          </div>
        )}

        {/* Info tooltip */}
        {isInfoOpen && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="px-3 text-center">
              <div className="text-sm font-black text-cyan-300 sm:text-base">{column.category.name}</div>
              <div className="mt-1 text-[11px] text-white/70 sm:text-xs">
                {remainingInCategory} سؤال متبقي من أصل {totalInCategory}
              </div>
              <div className="mt-2 flex justify-center gap-2 text-[10px] font-bold sm:text-[11px]">
                <span className="rounded-full border border-[#1b7001]/40 bg-[#1b7001]/20 px-2 py-0.5 text-green-300">200</span>
                <span className="rounded-full border border-violet-400/40 bg-violet-900/30 px-2 py-0.5 text-violet-300">400</span>
                <span className="rounded-full border border-yellow-400/40 bg-yellow-900/30 px-2 py-0.5 text-yellow-300">600</span>
              </div>
            </div>
          </div>
        )}

        {/* Category name bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 px-2 pb-1.5 pt-4">
          <div className="truncate text-center text-[13px] font-black text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1.0)] sm:text-sm md:text-base">
            {column.category.name}
          </div>
        </div>
      </div>

      {/* ── Cyan name bar (like the images) ── */}
      <div className={`px-2 py-2 text-center text-[12px] font-black text-white sm:text-[13px] ${
        isFullyUsed
          ? "bg-[linear-gradient(180deg,#1a2a3a_0%,#111d2d_100%)]"
          : "bg-[linear-gradient(180deg,#2eadc4_0%,#1a8fa8_100%)] shadow-[0_-1px_0_rgba(0,0,0,0.25)]"
      }`}>
        <div className="flex items-center justify-center gap-1">
          {usedInCategory > 0 && usedInCategory < totalInCategory && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
          )}
          <span className="truncate">{column.category.name}</span>
        </div>
      </div>

      {/* ── Tile grid: 3 rows × 2 cols ── */}
      <div className="grid grid-cols-2 gap-1 bg-[#040d25] p-1.5 sm:gap-1.5 sm:p-2">
        <QuestionTile question={left200}  points={200} used={getUsed(left200)}  result={getResult(left200)}  onOpen={() => onOpenQuestion(left200)} />
        <QuestionTile question={right200} points={200} used={getUsed(right200)} result={getResult(right200)} onOpen={() => onOpenQuestion(right200)} />
        <QuestionTile question={left400}  points={400} used={getUsed(left400)}  result={getResult(left400)}  onOpen={() => onOpenQuestion(left400)} />
        <QuestionTile question={right400} points={400} used={getUsed(right400)} result={getResult(right400)} onOpen={() => onOpenQuestion(right400)} />
        <QuestionTile question={left600}  points={600} used={getUsed(left600)}  result={getResult(left600)}  onOpen={() => onOpenQuestion(left600)} />
        <QuestionTile question={right600} points={600} used={getUsed(right600)} result={getResult(right600)} onOpen={() => onOpenQuestion(right600)} />
      </div>

      {/* ── Footer legend ── */}
      <div className="flex items-center justify-between border-t border-white/5 bg-[#040d25] px-2.5 py-1 sm:px-3">
        <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#1b7001]" /><span className="text-[9px] font-bold text-white/30">٢٠٠</span></div>
        <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#6a1b9a]" /><span className="text-[9px] font-bold text-white/30">٤٠٠</span></div>
        <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#c9a200]" /><span className="text-[9px] font-bold text-white/30">٦٠٠</span></div>
        <div className="text-[9px] font-bold text-white/20">{usedInCategory}/{totalInCategory}</div>
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
  const [openInfoCategoryId, setOpenInfoCategoryId] = useState<string | null>(null);
  const [showBottomBar, setShowBottomBar] = useState(true);

  const initialState = useMemo(() => normalizeBoardState(initialBoardState), [initialBoardState]);
  const [boardState, setBoardState] = useState<BoardState>(initialState);
  const saveTimeoutRef = useRef<number | null>(null);

  // ── Load local state on mount ──
  useEffect(() => {
    const localState = readLocalBoardState(storageKey);
    if (localState && localState.savedAt >= initialState.savedAt) {
      setBoardState(localState);
    } else {
      setBoardState(initialState);
    }
  }, [initialState, storageKey]);

  // ── Persist state (local + Supabase debounced) ──
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

  // ── Build board columns ──
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

  // ── Derived state ──
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
  const leaderLabel    = teamOneLeading ? teamOne : teamTwoLeading ? teamTwo : "تعادل";

  const activeTurn     = (usedCount + 1) % 2 === 1 ? "teamOne" : "teamTwo";
  const activeTurnName = activeTurn === "teamOne" ? teamOne : teamTwo;

  // ── Auto-redirect when all questions are used ──
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

  // ── State updater ──
  function updateState(updater: (prev: BoardState) => BoardState) {
    setBoardState((prev) => ({
      ...updater(prev),
      savedAt: Date.now(),
    }));
  }

  // ── Handlers ──
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

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#041335_0%,#051741_45%,#05112c_100%)] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 lg:px-6">

        {/* ── Top control panel ──────────────────────────────────────────── */}
        <div className="mb-4 rounded-[28px] border border-white/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-4 shadow-[0_18px_60px_rgba(2,6,23,0.50)] backdrop-blur sm:mb-5 sm:rounded-[30px] sm:p-5">

          {/* Title row */}
          <div className="mb-4 flex flex-col gap-1 sm:mb-5">
            <div className="text-xs font-bold tracking-[0.22em] text-cyan-300/60">
              لوحة اللعبة
            </div>
            <h1 className="text-xl font-black text-white sm:text-2xl md:text-3xl">
              {gameName}
            </h1>
            <p className="text-xs font-medium text-slate-300/70 sm:text-sm">
              اختر الأسئلة من لوحة اللعب في الأسفل وابدأ باللعب.
            </p>
          </div>

          {/* Status pills + action buttons */}
          <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5">
            <StatusPill
              label={`الدور: ${activeTurnName}`}
              icon={<GamepadIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            />
            <StatusPill
              label={`المتصدر: ${leaderLabel}`}
              icon={<CrownIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            />
            <StatusPill label={`المتبقي: ${remainingCount}`} />

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

          {/* Score controls */}
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

        {/* ── Game board ─────────────────────────────────────────────────── */}
        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(4,16,48,0.95)_0%,rgba(3,12,36,0.99)_100%)] p-3 shadow-[0_18px_80px_rgba(2,6,23,0.70)] sm:rounded-[28px] sm:p-4">

          {/* Legend row */}
          <div className="mb-3 flex items-center gap-3 px-1 sm:mb-4">
            <span className="text-xs font-bold text-white/30 sm:text-sm">الفئات</span>
            <div className="h-px flex-1 bg-white/6" />
            <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 sm:text-xs">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-sm bg-[#0277bd]" />فريق ١</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-sm bg-[#e65100]" />فريق ٢</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-sm bg-[#0f1c3a]" />انتهى</span>
            </div>
          </div>

          {/* Grid — dismiss info tooltip on board click */}
          <div
            className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest("[data-info-btn]")) {
                setOpenInfoCategoryId(null);
              }
            }}
          >
            {boardColumns.map((column) => (
              <CategoryCard
                key={column.category.id}
                column={column}
                boardState={boardState}
                onOpenQuestion={handleOpenQuestion}
                openInfoId={openInfoCategoryId}
                onToggleInfo={(id) => setOpenInfoCategoryId((prev) => prev === id ? null : id)}
              />
            ))}
          </div>
        </div>

        {/* Bottom padding to account for popup */}
        <div className="h-32 sm:h-28" />

      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Bottom popup — selected categories bar (like image 2)              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showBottomBar && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="mx-auto max-w-[1000px] overflow-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(160deg,rgba(5,18,48,0.98)_0%,rgba(3,12,32,1.0)_100%)] shadow-[0_-4px_60px_rgba(2,6,23,0.80)] backdrop-blur-xl sm:rounded-[28px]">

            {/* Drag handle */}
            <div className="flex justify-center pt-2.5">
              <div className="h-1 w-10 rounded-full bg-white/15" />
            </div>

            <div className="px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
              {/* Row: label + counter + collapse btn */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white sm:text-base">الفئات المختارة</span>
                  <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-black text-cyan-300">
                    {boardColumns.length} / {boardColumns.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBottomBar(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white/70"
                  aria-label="إخفاء"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Category thumbnails row */}
              <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-2.5">
                {boardColumns.map((col) => {
                  const colAllTiles = col.rows.flatMap((r) => r.questions);
                  const colUsed = colAllTiles.filter((q) => boardState.usedQuestionIds.includes(q.id)).length;
                  const colTotal = colAllTiles.length;
                  const isDone = colTotal > 0 && colUsed >= colTotal;

                  return (
                    <div
                      key={col.category.id}
                      className={`flex shrink-0 flex-col overflow-hidden rounded-xl border transition-all ${
                        isDone
                          ? "border-white/8 opacity-50"
                          : "border-cyan-400/20 shadow-[0_4px_16px_rgba(34,211,238,0.10)]"
                      }`}
                      style={{ width: 72 }}
                    >
                      {col.category.image_url ? (
                        <img
                          src={col.category.image_url}
                          alt={col.category.name}
                          className="h-14 w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-14 w-full items-center justify-center bg-[#0d2060] text-xl">
                          📚
                        </div>
                      )}
                      <div className={`px-1 py-1 text-center text-[9px] font-black leading-tight text-white ${
                        isDone
                          ? "bg-[#111d2d]"
                          : "bg-[linear-gradient(180deg,#2eadc4_0%,#1a8fa8_100%)]"
                      }`}>
                        <div className="line-clamp-1">{col.category.name}</div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty slots if needed — show dashed placeholders */}
                {Array.from({ length: Math.max(0, 6 - boardColumns.length) }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex h-[86px] shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-white/8 bg-white/[0.02]"
                    style={{ width: 72 }}
                  >
                    <span className="text-[10px] font-bold text-white/20">فئة</span>
                  </div>
                ))}
              </div>

              {/* Action buttons row */}
              <div className="mt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={handleFinishGame}
                  className="flex-1 rounded-[16px] bg-[linear-gradient(180deg,#e11d74_0%,#c51160_100%)] py-3 text-sm font-black text-white shadow-[0_4px_0_rgba(109,12,55,0.45)] transition active:scale-[0.97] active:shadow-[0_2px_0_rgba(109,12,55,0.45)] sm:rounded-[18px] sm:py-3.5"
                >
                  إنهاء اللعب والنتائج
                </button>
                <Link
                  href="/account"
                  className="flex items-center justify-center rounded-[16px] border border-white/10 bg-white/6 px-4 py-3 text-xs font-black text-white transition hover:bg-white/10 active:scale-[0.97] sm:rounded-[18px] sm:px-5 sm:py-3.5 sm:text-sm"
                >
                  <HomeIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show popup btn when hidden */}
      {!showBottomBar && (
        <button
          type="button"
          onClick={() => setShowBottomBar(true)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-cyan-400/25 bg-[linear-gradient(180deg,rgba(5,18,48,0.97)_0%,rgba(3,12,32,1.0)_100%)] px-4 py-2.5 text-xs font-black text-cyan-300 shadow-[0_4px_20px_rgba(2,6,23,0.70)] backdrop-blur-xl transition hover:brightness-110 active:scale-95 sm:bottom-5 sm:right-5"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h8"/></svg>
          الفئات
        </button>
      )}

    </main>
  );
}