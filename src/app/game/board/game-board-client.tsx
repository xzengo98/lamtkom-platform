"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// ─── Types (unchanged) ────────────────────────────────────────────────────────

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
  } catch { /**/ }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CrownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 18 2.5 7.5l5.2 4.1L12 5l4.3 6.6 5.2-4.1L20 18H4Z" className="fill-current" opacity="0.9" />
      <path d="M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GamepadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="8" width="17" height="8.5" rx="4.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10.5v4M6 12.5h4M15.5 11.25h.01M17.5 13.25h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FlagIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 20V5m0 0c2.5-1.8 4.7-.2 7-1.2 2.1-.9 3.7-2 5-1.3V11c-1.3-.7-2.9.4-5 1.3-2.3 1-4.5-.6-7 1.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 12L12 3l9 9M5 10v11h5v-6h4v6h5V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

// ─── ScoreCard ────────────────────────────────────────────────────────────────
// Replaces ScoreControl — same logic, new visual

function ScoreCard({
  teamName,
  score,
  accent,
  onIncrease,
  onDecrease,
  isLeading,
}: {
  teamName: string;
  score: number;
  accent: "blue" | "orange";
  onIncrease: () => void;
  onDecrease: () => void;
  isLeading: boolean;
}) {
  const isBlue = accent === "blue";

  const palette = isBlue
    ? {
        card:       "border-cyan-400/20 bg-[linear-gradient(160deg,rgba(4,18,48,0.98)_0%,rgba(2,10,28,0.99)_100%)]",
        bar:        "bg-cyan-400",
        name:       "text-cyan-300",
        btnPlus:    "border-cyan-400/30 bg-cyan-500 text-white hover:bg-cyan-400 shadow-[0_4px_16px_rgba(34,211,238,0.30)]",
        btnMinus:   "border-cyan-400/20 bg-cyan-500/12 text-cyan-300 hover:bg-cyan-500/20",
        score:      "text-white",
        glow:       isLeading ? "shadow-[0_0_32px_rgba(34,211,238,0.18)]" : "",
        leadBadge:  "border-cyan-400/30 bg-cyan-400/12 text-cyan-300",
      }
    : {
        card:       "border-orange-400/20 bg-[linear-gradient(160deg,rgba(28,12,4,0.98)_0%,rgba(14,6,2,0.99)_100%)]",
        bar:        "bg-orange-400",
        name:       "text-orange-300",
        btnPlus:    "border-orange-400/30 bg-orange-500 text-white hover:bg-orange-400 shadow-[0_4px_16px_rgba(249,115,22,0.30)]",
        btnMinus:   "border-orange-400/20 bg-orange-500/12 text-orange-300 hover:bg-orange-500/20",
        score:      "text-white",
        glow:       isLeading ? "shadow-[0_0_32px_rgba(249,115,22,0.18)]" : "",
        leadBadge:  "border-orange-400/30 bg-orange-400/12 text-orange-300",
      };

  return (
    <div className={`relative overflow-hidden rounded-[1.6rem] border transition-all duration-300 ${palette.card} ${palette.glow}`}>
      {/* Accent top bar */}
      <div className={`h-[3px] w-full ${palette.bar}`} />

      {/* Leading crown */}
      {isLeading && (
        <div className={`absolute right-2.5 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${palette.leadBadge}`}>
          <CrownIcon className="h-3 w-3" />
          يتصدر
        </div>
      )}

      <div className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">
        {/* Minus */}
        <button
          type="button"
          onClick={onDecrease}
          aria-label="تقليل النقاط"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition active:scale-90 sm:h-11 sm:w-11 ${palette.btnMinus}`}
        >
          <MinusIcon className="h-4 w-4" />
        </button>

        {/* Name + Score */}
        <div className="min-w-0 flex-1 text-center">
          <div className={`truncate text-[11px] font-bold sm:text-xs ${palette.name}`}>{teamName}</div>
          <div className={`text-3xl font-black leading-none sm:text-4xl ${palette.score}`}>{score}</div>
        </div>

        {/* Plus */}
        <button
          type="button"
          onClick={onIncrease}
          aria-label="زيادة النقاط"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition active:scale-90 sm:h-11 sm:w-11 ${palette.btnPlus}`}
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── QuestionTile (logic unchanged, visual improved) ─────────────────────────

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
  // Point-level color config
  const ptCfg = points === 200
    ? { idle: "bg-[linear-gradient(180deg,#1faf2a_0%,#126e18_100%)] border-[#1faf2a]/30 shadow-[0_4px_0_rgba(10,80,10,0.50)]", label: "text-white" }
    : points === 400
    ? { idle: "bg-[linear-gradient(180deg,#8b5cf6_0%,#6d28d9_100%)] border-violet-400/30 shadow-[0_4px_0_rgba(90,30,180,0.45)]", label: "text-white" }
    : { idle: "bg-[linear-gradient(180deg,#f6c72b_0%,#ca9a10_100%)] border-yellow-300/30 shadow-[0_4px_0_rgba(120,90,0,0.45)]", label: "text-slate-900" };

  const base = "relative flex w-full items-center justify-center rounded-xl border-2 font-black transition-all duration-150 select-none h-11 text-lg sm:h-12 sm:text-xl md:h-14";

  if (!question) {
    return (
      <div className={`${base} border-white/4 bg-white/[0.025] text-white/12`}>
        {points}
      </div>
    );
  }

  if (used) {
    if (result === "teamOne") {
      return (
        <div className={`${base} border-cyan-400/25 bg-[linear-gradient(160deg,rgba(2,119,189,0.85)_0%,rgba(1,87,155,0.90)_100%)] text-white/90`}>
          <span className="absolute left-1.5 top-1 text-[9px] text-cyan-300/60 sm:text-[10px]">✓</span>
          <span className="opacity-80">{points}</span>
        </div>
      );
    }
    if (result === "teamTwo") {
      return (
        <div className={`${base} border-orange-400/25 bg-[linear-gradient(160deg,rgba(230,81,0,0.85)_0%,rgba(191,54,12,0.90)_100%)] text-white/90`}>
          <span className="absolute left-1.5 top-1 text-[9px] text-orange-300/60 sm:text-[10px]">✓</span>
          <span className="opacity-80">{points}</span>
        </div>
      );
    }
    // none
    return (
      <div className={`${base} border-white/4 bg-[linear-gradient(160deg,rgba(10,16,38,0.60)_0%,rgba(5,8,20,0.70)_100%)] text-white/18 line-through`}>
        {points}
      </div>
    );
  }

  // Available — clickable
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${base} ${ptCfg.idle} hover:brightness-110 active:scale-[0.96] active:brightness-95`}
    >
      <span className={`${ptCfg.label} [text-shadow:0_1px_0_rgba(0,0,0,0.20)]`}>
        {points}
      </span>
    </button>
  );
}

// ─── CategoryCard (logic unchanged, visual rebuilt) ───────────────────────────

function CategoryCard({
  column,
  boardState,
  onOpenQuestion,
}: {
  column: CategoryColumn;
  boardState: BoardState;
  onOpenQuestion: (question: QuestionRow | null) => void;
}) {
  // ── Logic (completely unchanged) ──
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
  const pct = totalInCategory > 0 ? (usedInCategory / totalInCategory) * 100 : 0;
  const isDone = totalInCategory > 0 && usedInCategory >= totalInCategory;

  return (
    <div className={`group flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 ${
      isDone
        ? "border-white/5 opacity-70"
        : "border-white/10 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:shadow-[0_12px_40px_rgba(34,211,238,0.10)]"
    } bg-[linear-gradient(160deg,rgba(6,16,42,0.95)_0%,rgba(3,9,26,0.98)_100%)] shadow-[0_6px_28px_rgba(0,0,0,0.45)]`}>

      {/* ── Image header ── */}
      <div className="relative overflow-hidden">
        {column.category.image_url ? (
          <>
            <img
              src={column.category.image_url}
              alt={column.category.name}
              className="h-32 w-full object-cover object-center transition duration-500 group-hover:scale-[1.04] sm:h-36 md:h-40"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(3,9,26,0.96)] via-[rgba(3,9,26,0.25)] to-transparent" />
          </>
        ) : (
          <div className="h-32 w-full bg-[linear-gradient(135deg,#061a50,#030d2e)] sm:h-36 md:h-40" />
        )}

        {/* Progress bar at top */}
        {totalInCategory > 0 && (
          <div className="absolute inset-x-0 top-0 h-[3px] bg-white/8">
            <div
              className={`h-full transition-all duration-700 ${pct >= 100 ? "bg-white/20" : "bg-gradient-to-r from-cyan-400 to-teal-400"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        {/* Category name overlay */}
        <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2">
          <div className="truncate text-center text-sm font-black text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)] sm:text-[15px] md:text-base">
            {column.category.name}
          </div>
        </div>

        {/* Done overlay */}
        {isDone && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-black text-white/55">
              مكتملة
            </span>
          </div>
        )}
      </div>

      {/* ── Cyan name bar ── */}
      <div className="bg-[linear-gradient(180deg,#2eadc4_0%,#1a8fa8_100%)] px-2 py-2 text-center text-[12px] font-black text-white shadow-[0_-1px_0_rgba(0,0,0,0.20)] sm:text-[13px]">
        {column.category.name}
      </div>

      {/* ── Question tiles: 3 rows × 2 cols ── */}
      <div className="grid grid-cols-2 gap-1 bg-[rgba(3,9,26,0.80)] p-1.5 sm:gap-1.5 sm:p-2">
        <QuestionTile question={left200}  points={200} used={getUsed(left200)}  result={getResult(left200)}  onOpen={() => onOpenQuestion(left200)} />
        <QuestionTile question={right200} points={200} used={getUsed(right200)} result={getResult(right200)} onOpen={() => onOpenQuestion(right200)} />
        <QuestionTile question={left400}  points={400} used={getUsed(left400)}  result={getResult(left400)}  onOpen={() => onOpenQuestion(left400)} />
        <QuestionTile question={right400} points={400} used={getUsed(right400)} result={getResult(right400)} onOpen={() => onOpenQuestion(right400)} />
        <QuestionTile question={left600}  points={600} used={getUsed(left600)}  result={getResult(left600)}  onOpen={() => onOpenQuestion(left600)} />
        <QuestionTile question={right600} points={600} used={getUsed(right600)} result={getResult(right600)} onOpen={() => onOpenQuestion(right600)} />
      </div>

      {/* ── Footer legend ── */}
      <div className="flex items-center justify-between bg-[rgba(3,9,26,0.80)] border-t border-white/5 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1faf2a]" />
          <span className="text-[9px] font-bold text-white/25 sm:text-[10px]">٢٠٠</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          <span className="text-[9px] font-bold text-white/25 sm:text-[10px]">٤٠٠</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
          <span className="text-[9px] font-bold text-white/25 sm:text-[10px]">٦٠٠</span>
        </div>
        <div className="text-[9px] font-bold text-white/18 sm:text-[10px]">{usedInCategory}/{totalInCategory}</div>
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

  // ── Load local state (unchanged) ──
  useEffect(() => {
    const localState = readLocalBoardState(storageKey);
    if (localState && localState.savedAt >= initialState.savedAt) {
      setBoardState(localState);
    } else {
      setBoardState(initialState);
    }
  }, [initialState, storageKey]);

  // ── Persist state (unchanged) ──
  useEffect(() => {
    writeLocalBoardState(storageKey, boardState);
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(async () => {
      await supabase
        .from("game_sessions")
        .update({
          board_state: { ...boardState, savedAt: boardState.savedAt || Date.now() },
        })
        .eq("id", sessionId);
    }, 350);
    return () => { if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current); };
  }, [boardState, sessionId, storageKey, supabase]);

  // ── boardColumns (unchanged) ──
  const boardColumns = useMemo<CategoryColumn[]>(() => {
    const pointsList: (200 | 400 | 600)[] = [200, 400, 600];
    return categories.map((category) => {
      const categoryQuestions = questions.filter((q) => q.category_id === category.id);
      return {
        category,
        rows: pointsList.map((points) => ({
          points,
          questions: categoryQuestions
            .filter((q) => q.points === points)
            .sort((a, b) => a.id.localeCompare(b.id))
            .slice(0, 2),
        })),
      };
    });
  }, [categories, questions]);

  // ── Derived state (unchanged) ──
  const usedCount = boardState.usedQuestionIds.length;

  const remainingCount = Math.max(
    boardColumns.reduce(
      (sum, column) => sum + column.rows.reduce((rowSum, row) => rowSum + row.questions.length, 0),
      0,
    ) - usedCount,
    0,
  );

  const teamOneLeading = boardState.teamOneScore > boardState.teamTwoScore;
  const teamTwoLeading = boardState.teamTwoScore > boardState.teamOneScore;
  const leaderLabel    = teamOneLeading ? teamOne : teamTwoLeading ? teamTwo : "تعادل";

  const activeTurn     = (usedCount + 1) % 2 === 1 ? "teamOne" : "teamTwo";
  const activeTurnName = activeTurn === "teamOne" ? teamOne : teamTwo;

  // ── Auto-redirect (unchanged) ──
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
  }, [remainingCount, hasRedirectedToResult, questions.length, sessionId, gameName, teamOne, teamTwo, boardState.teamOneScore, boardState.teamTwoScore, router]);

  // ── State updater (unchanged) ──
  function updateState(updater: (prev: BoardState) => BoardState) {
    setBoardState((prev) => ({ ...updater(prev), savedAt: Date.now() }));
  }

  // ── Handlers (unchanged) ──
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

  // ── Shared score updaters ──
  const teamOneIncrease = () => updateState((prev) => ({ ...prev, teamOneScore: Math.max(0, prev.teamOneScore + 100) }));
  const teamOneDecrease = () => updateState((prev) => ({ ...prev, teamOneScore: Math.max(0, prev.teamOneScore - 100) }));
  const teamTwoIncrease = () => updateState((prev) => ({ ...prev, teamTwoScore: Math.max(0, prev.teamTwoScore + 100) }));
  const teamTwoDecrease = () => updateState((prev) => ({ ...prev, teamTwoScore: Math.max(0, prev.teamTwoScore - 100) }));

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_60%,#020814_100%)] text-white">

      {/* Subtle grid overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:60px_60px]" />

      <div className="relative mx-auto w-full max-w-[1640px] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* CONTROL PANEL                                                      */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="relative mb-3 overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(8,16,40,0.98)_0%,rgba(4,8,24,0.99)_100%)] sm:mb-4">
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />

          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-12 left-1/4 h-28 w-52 rounded-full bg-cyan-500/8 blur-2xl" />
          <div className="pointer-events-none absolute -top-12 right-1/4 h-28 w-52 rounded-full bg-orange-500/6 blur-2xl" />

          <div className="relative px-4 py-3 sm:px-5 sm:py-4">

            {/* ── Top bar: game title + status pills + actions ── */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

              {/* Left: game name */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/8">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-cyan-400" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="4" y="8" width="16" height="8" rx="3"/><path d="M8 12h2M9 11v2M16.5 12h.01M18.5 12h.01"/></svg>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">لوحة اللعبة</div>
                  <h1 className="text-base font-black text-white sm:text-lg">{gameName}</h1>
                </div>
              </div>

              {/* Center: status pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Active turn */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-[linear-gradient(180deg,rgba(46,173,196,0.90)_0%,rgba(26,143,168,0.95)_100%)] px-3 py-1.5 text-[11px] font-black text-white shadow-[0_2px_0_rgba(10,77,111,0.35)] sm:px-4 sm:text-xs">
                  <GamepadIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  الدور: {activeTurnName}
                </div>

                {/* Leader */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-[linear-gradient(180deg,rgba(46,173,196,0.90)_0%,rgba(26,143,168,0.95)_100%)] px-3 py-1.5 text-[11px] font-black text-white shadow-[0_2px_0_rgba(10,77,111,0.35)] sm:px-4 sm:text-xs">
                  <CrownIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {leaderLabel}
                </div>

                {/* Remaining */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-[linear-gradient(180deg,rgba(46,173,196,0.90)_0%,rgba(26,143,168,0.95)_100%)] px-3 py-1.5 text-[11px] font-black text-white shadow-[0_2px_0_rgba(10,77,111,0.35)] sm:px-4 sm:text-xs">
                  {remainingCount} متبقي
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFinishGame}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(180deg,#e11d74_0%,#c51160_100%)] px-3 py-2 text-[11px] font-black text-white shadow-[0_3px_0_rgba(109,12,55,0.45)] transition hover:brightness-110 active:scale-95 sm:px-4 sm:text-xs"
                >
                  <FlagIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">إنهاء اللعب</span>
                  <span className="sm:hidden">إنهاء</span>
                </button>

                <Link
                  href="/account"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-[11px] font-black text-white transition hover:bg-white/10 active:scale-95 sm:px-4 sm:text-xs"
                >
                  <HomeIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">الحساب</span>
                </Link>
              </div>
            </div>

            {/* ── Score controls ── */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <ScoreCard
                teamName={teamOne}
                score={boardState.teamOneScore}
                accent="blue"
                onIncrease={teamOneIncrease}
                onDecrease={teamOneDecrease}
                isLeading={teamOneLeading}
              />
              <ScoreCard
                teamName={teamTwo}
                score={boardState.teamTwoScore}
                accent="orange"
                onIncrease={teamTwoIncrease}
                onDecrease={teamTwoDecrease}
                isLeading={teamTwoLeading}
              />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* GAME BOARD                                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(3,10,30,0.85)_0%,rgba(2,7,20,0.92)_100%)] p-2.5 shadow-[0_16px_60px_rgba(2,6,23,0.65)] sm:rounded-[2rem] sm:p-3 lg:p-4">

          {/* Legend */}
          <div className="mb-2.5 flex items-center gap-3 px-0.5 sm:mb-3">
            <span className="text-[11px] font-bold text-white/28 sm:text-xs">الفئات</span>
            <div className="h-px flex-1 bg-white/5" />
            <div className="flex items-center gap-3 text-[9px] font-bold text-white/28 sm:gap-4 sm:text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.50)]" />
                فريق ١
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(249,115,22,0.50)]" />
                فريق ٢
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/18" />
                انتهى
              </span>
            </div>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3">
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