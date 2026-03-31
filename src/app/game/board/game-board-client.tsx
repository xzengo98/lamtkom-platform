"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

function CrownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 18 2.5 7.5l5.2 4.1L12 5l4.3 6.6 5.2-4.1L20 18H4Z"
        className="fill-current"
        opacity="0.9"
      />
      <path
        d="M5 20h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GamepadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="3.5"
        y="8"
        width="17"
        height="8.5"
        rx="4.25"
        stroke="currentColor"
        strokeWidth="1.8"
      />
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

function StatusPill({
  label,
  icon,
}: {
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/28 bg-[linear-gradient(180deg,#58c6f2_0%,#3caee1_100%)] px-4 py-2 text-sm font-black text-white shadow-[0_4px_0_rgba(10,77,111,0.45)]">
      {icon}
      <span>{label}</span>
    </div>
  );
}

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
          circle:
            "bg-[linear-gradient(180deg,#ffab4f_0%,#f18412_100%)] shadow-[0_4px_0_rgba(148,77,15,0.58)]",
          ring: "ring-orange-100/70",
        }
      : {
          top: "bg-[linear-gradient(180deg,#39a8da_0%,#1f91c6_100%)]",
          topShadow: "shadow-[0_4px_0_rgba(18,82,113,0.45)]",
          circle:
            "bg-[linear-gradient(180deg,#39a8da_0%,#1f91c6_100%)] shadow-[0_4px_0_rgba(19,83,113,0.55)]",
          ring: "ring-cyan-200/60",
        };

  return (
    <div className="w-full max-w-[320px]">
      <div
        className={`rounded-t-[28px] px-6 pb-5 pt-4 text-center text-[18px] font-black text-white ${palette.top} ${palette.topShadow}`}
      >
        <span className="block truncate">{teamName}</span>
      </div>

      <div className="relative -mt-1 rounded-b-[28px] border-t-4 border-slate-500/30 bg-[linear-gradient(180deg,#ece8e2_0%,#d9d4cc_100%)] px-5 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.18)]">
        <button
          type="button"
          onClick={onIncrease}
          className={`absolute left-[-1px] top-1/2 flex h-[58px] w-[58px] -translate-y-1/2 items-center justify-center rounded-full text-[36px] font-black text-white ring-4 transition duration-150 hover:scale-105 active:scale-95 ${palette.ring} ${palette.circle}`}
        >
          +
        </button>

        <button
          type="button"
          onClick={onDecrease}
          className={`absolute right-[-1px] top-1/2 flex h-[58px] w-[58px] -translate-y-1/2 items-center justify-center rounded-full text-[36px] font-black text-white ring-4 transition duration-150 hover:scale-105 active:scale-95 ${palette.ring} ${palette.circle}`}
        >
          −
        </button>

        <div className="text-center text-[28px] font-black leading-none text-slate-800">
          {score}
        </div>
      </div>
    </div>
  );
}

function CategoryIllustration({ category }: { category: Category }) {
  if (category.image_url) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#cbcccf] px-3 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.image_url}
          alt={category.name}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#cbcccf] px-4 py-4 text-center text-slate-900">
      <div className="text-base font-black">{category.name}</div>
    </div>
  );
}

function QuestionPill({
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
  const baseClass =
    "flex h-[82px] w-[136px] items-center justify-center rounded-full border border-slate-400/30 bg-[#cbcccf] text-[18px] font-black text-red-700 transition";

  if (!question) {
    return <div className={baseClass}>{points}</div>;
  }

  if (used) {
    const usedClass =
      result === "teamOne"
        ? "border-cyan-200/30 bg-[linear-gradient(180deg,#45b9ea_0%,#2f9fd8_100%)] text-white"
        : result === "teamTwo"
          ? "border-orange-200/30 bg-[linear-gradient(180deg,#ffa85f_0%,#f28a34_100%)] text-white"
          : "border-slate-700/50 bg-[linear-gradient(180deg,#1a2746_0%,#101a34_100%)] text-white line-through decoration-2";

    return <div className={`${baseClass} ${usedClass}`}>{points}</div>;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${baseClass} hover:bg-[#d5d6d8] active:scale-[0.98]`}
    >
      {points}
    </button>
  );
}

function CategoryBoardColumn({
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

  return (
    <div className="flex w-full max-w-[480px] flex-col items-center">
      {/* العنوان العلوي */}
      <div className="mb-0 w-[210px] rounded-t-[16px] bg-[#262626] px-4 py-3 text-center shadow-[0_4px_0_rgba(0,0,0,0.18)]">
        <div className="truncate text-[18px] font-black text-white">
          {column.category.name}
        </div>
      </div>

      {/* جسم الفئة */}
      <div className="grid grid-cols-[136px_200px_136px] grid-rows-[90px_90px_90px] items-center justify-items-center gap-x-0 gap-y-[4px]">
        {/* اليسار */}
        <div className="col-start-1 row-start-1">
          <QuestionPill
            question={left200}
            points={200}
            used={getUsed(left200)}
            result={getResult(left200)}
            onOpen={() => onOpenQuestion(left200)}
          />
        </div>

        <div className="col-start-1 row-start-2">
          <QuestionPill
            question={left400}
            points={400}
            used={getUsed(left400)}
            result={getResult(left400)}
            onOpen={() => onOpenQuestion(left400)}
          />
        </div>

        <div className="col-start-1 row-start-3">
          <QuestionPill
            question={left600}
            points={600}
            used={getUsed(left600)}
            result={getResult(left600)}
            onOpen={() => onOpenQuestion(left600)}
          />
        </div>

        {/* الوسط */}
        <div className="col-start-2 row-start-1 row-span-3 h-[278px] w-[200px] overflow-hidden bg-[#cbcccf] shadow-[0_8px_18px_rgba(0,0,0,0.10)]">
          <CategoryIllustration category={column.category} />
        </div>

        {/* اليمين */}
        <div className="col-start-3 row-start-1">
          <QuestionPill
            question={right200}
            points={200}
            used={getUsed(right200)}
            result={getResult(right200)}
            onOpen={() => onOpenQuestion(right200)}
          />
        </div>

        <div className="col-start-3 row-start-2">
          <QuestionPill
            question={right400}
            points={400}
            used={getUsed(right400)}
            result={getResult(right400)}
            onOpen={() => onOpenQuestion(right400)}
          />
        </div>

        <div className="col-start-3 row-start-3">
          <QuestionPill
            question={right600}
            points={600}
            used={getUsed(right600)}
            result={getResult(right600)}
            onOpen={() => onOpenQuestion(right600)}
          />
        </div>
      </div>

      {/* العنوان السفلي */}
      <div className="mt-0 w-[210px] rounded-b-[16px] bg-[#262626] px-4 py-3 text-center shadow-[0_4px_0_rgba(0,0,0,0.18)]">
        <div className="truncate text-[16px] font-black text-white">
          {column.category.name}
        </div>
      </div>
    </div>
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

  const [hasRedirectedToResult, setHasRedirectedToResult] = useState(false);

  const initialState = useMemo(() => {
    return normalizeBoardState(initialBoardState);
  }, [initialBoardState]);

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(23,85,199,0.16),transparent_26%),linear-gradient(180deg,#041335_0%,#051741_45%,#05112c_100%)] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 lg:px-6">
        <div className="mb-5 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-4 shadow-[0_18px_80px_rgba(2,6,23,0.50)] backdrop-blur">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-xs font-bold tracking-[0.24em] text-cyan-200/75">
                  لوحة اللعبة
                </div>
                <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                  {gameName}
                </h1>

                <p className="mt-2 text-sm font-medium text-slate-200/80">
                  اختر الأسئلة من لوحة اللعب في الأسفل وابدأ باللعب.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  label={`الدور ${activeTurnName}`}
                  icon={<GamepadIcon className="h-4 w-4" />}
                />
                <StatusPill
                  label={`المتصدر ${leaderLabel}`}
                  icon={<CrownIcon className="h-4 w-4" />}
                />
                <StatusPill label={`المتبقي ${remainingCount}`} />

                <button
                  type="button"
                  onClick={handleFinishGame}
                  className="inline-flex items-center gap-2 rounded-[18px] bg-[linear-gradient(180deg,#e11d74_0%,#c51160_100%)] px-6 py-3 text-sm font-black text-white shadow-[0_5px_0_rgba(109,12,55,0.45)] transition duration-150 hover:scale-[1.02] hover:brightness-105 active:scale-95"
                >
                  <FlagIcon className="h-4 w-4" />
                  إنهاء اللعب
                </button>

                <Link
                  href="/account"
                  className="inline-flex items-center rounded-[18px] border border-white/10 bg-white/6 px-4 py-3 text-sm font-black text-white transition duration-150 hover:bg-white/10 hover:scale-[1.02] active:scale-95"
                >
                  الرجوع للحساب
                </Link>
              </div>
            </div>

            <div className="grid items-start gap-4 xl:grid-cols-2">
              <div className="flex justify-center xl:justify-start">
                <ScoreControl
                  teamName={teamOne}
                  score={boardState.teamOneScore}
                  accent="orange"
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

              <div className="flex justify-center xl:justify-end">
                <ScoreControl
                  teamName={teamTwo}
                  score={boardState.teamTwoScore}
                  accent="blue"
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

        <div className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(5,20,57,0.86)_0%,rgba(4,17,44,0.98)_100%)] p-5 shadow-[0_18px_80px_rgba(2,6,23,0.55)]">
  <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 2xl:grid-cols-3">
    {boardColumns.map((column) => (
      <CategoryBoardColumn
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