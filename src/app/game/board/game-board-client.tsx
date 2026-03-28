"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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

type OpenQuestion = QuestionRow & {
  categoryName: string;
};

type BoardState = {
  teamOneScore: number;
  teamTwoScore: number;
  usedQuestionIds: string[];
  openQuestionId: string | null;
  showAnswer: boolean;
  showWinnerPicker: boolean;
  timeLeft: number;
  savedAt: number;
};

type CategoryColumn = {
  category: Category;
  rows: {
    points: 200 | 400 | 600;
    question: QuestionRow | null;
  }[];
};

const QUESTION_TIMER_SECONDS = 60;

const categoryVisuals: Record<
  string,
  {
    gradient: string;
  }
> = {
  history: {
    gradient: "from-amber-300/20 via-orange-400/10 to-transparent",
  },
  sports: {
    gradient: "from-emerald-300/20 via-green-400/10 to-transparent",
  },
  geography: {
    gradient: "from-sky-300/20 via-cyan-400/10 to-transparent",
  },
  science: {
    gradient: "from-violet-300/20 via-fuchsia-400/10 to-transparent",
  },
  movies: {
    gradient: "from-rose-300/20 via-pink-400/10 to-transparent",
  },
  islamic: {
    gradient: "from-yellow-300/20 via-amber-400/10 to-transparent",
  },
  default: {
    gradient: "from-slate-300/20 via-slate-400/10 to-transparent",
  },
};

function getVisualBySlug(slug: string) {
  return categoryVisuals[slug] ?? categoryVisuals.default;
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function normalizeBoardState(
  raw: Record<string, unknown> | null | undefined,
): BoardState {
  return {
    teamOneScore: typeof raw?.teamOneScore === "number" ? raw.teamOneScore : 0,
    teamTwoScore: typeof raw?.teamTwoScore === "number" ? raw.teamTwoScore : 0,
    usedQuestionIds: Array.isArray(raw?.usedQuestionIds)
      ? raw.usedQuestionIds.map((value) => String(value))
      : [],
    openQuestionId:
      typeof raw?.openQuestionId === "string" ? raw.openQuestionId : null,
    showAnswer: Boolean(raw?.showAnswer ?? false),
    showWinnerPicker: Boolean(raw?.showWinnerPicker ?? false),
    timeLeft:
      typeof raw?.timeLeft === "number" && raw.timeLeft >= 0
        ? raw.timeLeft
        : QUESTION_TIMER_SECONDS,
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

function stripHtml(html: string | null | undefined) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function RichContent({
  html,
  large = false,
}: {
  html: string | null | undefined;
  large?: boolean;
}) {
  const safeHtml = html?.trim();

  if (!safeHtml) {
    return (
      <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6 text-center text-white/70">
        لا يوجد محتوى محفوظ.
      </div>
    );
  }

  return (
    <div
      className={[
        "prose prose-invert max-w-none",
        "prose-p:leading-8 prose-headings:text-white prose-strong:text-white",
        "prose-img:mx-auto prose-img:rounded-[1.4rem] prose-img:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        "prose-iframe:w-full prose-iframe:rounded-[1.4rem]",
        large ? "text-lg md:text-xl" : "text-base md:text-lg",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
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

function ScoreCard({
  teamName,
  score,
  isLeading,
  isTurn,
  onIncrease,
  onDecrease,
  compact = false,
  accent = "cyan",
}: {
  teamName: string;
  score: number;
  isLeading: boolean;
  isTurn: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  compact?: boolean;
  accent?: "cyan" | "orange";
}) {
  const classes =
    accent === "orange"
      ? {
          chip: "border-orange-300/20 bg-orange-400/10 text-orange-100",
          card: isTurn
            ? "border-orange-300/35 bg-orange-400/12 shadow-[0_18px_60px_rgba(251,146,60,0.16)]"
            : "border-white/10 bg-white/5",
          btn: "border-orange-300/20 bg-orange-400/10 text-orange-100 hover:bg-orange-400/15",
        }
      : {
          chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
          card: isTurn
            ? "border-cyan-300/35 bg-cyan-400/12 shadow-[0_18px_60px_rgba(34,211,238,0.16)]"
            : "border-white/10 bg-white/5",
          btn: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15",
        };

  return (
    <div
      className={[
        "rounded-[1.8rem] border p-4 transition",
        compact ? "min-h-[122px]" : "min-h-[156px]",
        classes.card,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold text-white/55">لوحة الفريق</div>
          <h3 className="mt-1 truncate text-lg font-black text-white md:text-xl">
            {teamName}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {isTurn ? (
            <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${classes.chip}`}>
              الدور الآن
            </span>
          ) : null}

          {isLeading ? (
            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-black text-emerald-100">
              متصدر
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onDecrease}
          className={`flex h-12 w-12 items-center justify-center rounded-full border text-2xl font-black transition ${classes.btn}`}
        >
          −
        </button>

        <div className="text-center">
          <div className="text-4xl font-black text-white md:text-5xl">{score}</div>
          <div className="text-xs font-bold text-white/55">نقطة</div>
        </div>

        <button
          type="button"
          onClick={onIncrease}
          className={`flex h-12 w-12 items-center justify-center rounded-full border text-2xl font-black transition ${classes.btn}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function QuestionCell({
  question,
  points,
  used,
  active = false,
  onOpen,
}: {
  question: QuestionRow | null;
  points: number;
  used: boolean;
  active?: boolean;
  onOpen?: () => void;
}) {
  const disabled = !question || used;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onOpen}
      className={[
        "group relative min-h-[102px] rounded-[1.4rem] border px-3 py-4 text-center transition md:min-h-[118px]",
        disabled
          ? "cursor-not-allowed border-white/5 bg-slate-950/50 text-slate-500"
          : "border-white/10 bg-white/5 text-white hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-400/10",
        active ? "border-cyan-300/40 bg-cyan-400/12 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]" : "",
      ].join(" ")}
    >
      <div className="text-4xl font-black tracking-tight md:text-5xl">{points}</div>

      <div className="mt-2 text-xs font-bold">
        {!question ? "غير متاح" : used ? "تم الاستخدام" : "جاهز"}
      </div>

      {!disabled ? (
        <div className="mt-1 text-[11px] font-medium text-white/55">اختر السؤال</div>
      ) : null}
    </button>
  );
}

function QuestionOverlay({
  openQuestion,
  teamOne,
  teamTwo,
  showAnswer,
  showWinnerPicker,
  modalBusy,
  timeLeft,
  timerRunning,
  onClose,
  onRevealAnswer,
  onGoToWinnerPicker,
  onBackToQuestion,
  onBackToAnswer,
  onToggleTimer,
  onResetTimer,
  onAwardPoints,
}: {
  openQuestion: OpenQuestion;
  teamOne: string;
  teamTwo: string;
  showAnswer: boolean;
  showWinnerPicker: boolean;
  modalBusy: boolean;
  timeLeft: number;
  timerRunning: boolean;
  onClose: () => void;
  onRevealAnswer: () => void;
  onGoToWinnerPicker: () => void;
  onBackToQuestion: () => void;
  onBackToAnswer: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onAwardPoints: (winner: "teamOne" | "teamTwo" | "none") => void;
}) {
  const toleranceVisible =
    (openQuestion.year_tolerance_before ?? 0) > 0 ||
    (openQuestion.year_tolerance_after ?? 0) > 0;

  const progressPercentage = Math.max(
    0,
    Math.min(100, (timeLeft / QUESTION_TIMER_SECONDS) * 100),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/90 p-3 md:p-6">
      <div className="max-h-[96vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_32%),linear-gradient(180deg,#071126_0%,#050b16_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
        <div className="border-b border-white/10 px-5 py-4 md:px-8 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">
                  {openQuestion.categoryName}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-white/85">
                  {openQuestion.points} نقطة
                </span>
                {toleranceVisible ? (
                  <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-100">
                    السماحية: قبل {openQuestion.year_tolerance_before ?? 0} / بعد{" "}
                    {openQuestion.year_tolerance_after ?? 0}
                  </span>
                ) : null}
              </div>

              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
                {!showAnswer && !showWinnerPicker
                  ? "السؤال"
                  : showAnswer && !showWinnerPicker
                    ? "الإجابة الصحيحة"
                    : "تحديد الفريق الفائز"}
              </h2>
            </div>

            {!showAnswer && !showWinnerPicker ? (
              <div className="min-w-[200px]">
                <div className="mb-2 flex items-center justify-between text-sm font-bold text-white/75">
                  <span>المؤقت</span>
                  <span>{formatCountdown(timeLeft)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-[width]"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onToggleTimer}
                    className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/15"
                  >
                    {timerRunning ? "إيقاف الوقت" : "تشغيل الوقت"}
                  </button>
                  <button
                    type="button"
                    onClick={onResetTimer}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
                  >
                    إعادة المؤقت
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/75">
                {showWinnerPicker ? "حدد الفريق الفائز" : "تم كشف الإجابة"}
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5 md:px-8 md:py-7">
          {!showAnswer && !showWinnerPicker ? (
            <RichContent html={openQuestion.question_text} large />
          ) : showAnswer && !showWinnerPicker ? (
            <RichContent html={openQuestion.answer_text} large />
          ) : (
            <div>
              <h3 className="mb-5 text-center text-2xl font-black text-white md:text-3xl">
                أي فريق جاوب صح؟
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onAwardPoints("teamOne")}
                  disabled={modalBusy}
                  className="rounded-[1.3rem] border border-orange-300/20 bg-orange-400/10 px-5 py-5 text-xl font-black text-white transition hover:bg-orange-400/15 disabled:opacity-50"
                >
                  {teamOne}
                </button>

                <button
                  type="button"
                  onClick={() => onAwardPoints("teamTwo")}
                  disabled={modalBusy}
                  className="rounded-[1.3rem] border border-cyan-300/20 bg-cyan-400/10 px-5 py-5 text-xl font-black text-white transition hover:bg-cyan-400/15 disabled:opacity-50"
                >
                  {teamTwo}
                </button>
              </div>

              <button
                type="button"
                onClick={() => onAwardPoints("none")}
                disabled={modalBusy}
                className="mx-auto mt-4 block w-full max-w-md rounded-[1.3rem] border border-white/10 bg-white/5 px-5 py-4 text-lg font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                ولا أحد
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4 md:px-8">
          {!showAnswer && !showWinnerPicker ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onRevealAnswer}
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                إظهار الإجابة
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                إغلاق
              </button>
            </div>
          ) : showAnswer && !showWinnerPicker ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onGoToWinnerPicker}
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                أي فريق؟
              </button>
              <button
                type="button"
                onClick={onBackToQuestion}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                ارجع للسؤال
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                إغلاق
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onBackToAnswer}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                العودة للإجابة
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                إغلاق
              </button>
            </div>
          )}
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
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const storageKey = `seenjeem-board-state:${sessionId}`;

  const initialState = useMemo(() => {
    const normalizedServer = normalizeBoardState(initialBoardState);
    return normalizedServer;
  }, [initialBoardState]);

  const [boardState, setBoardState] = useState<BoardState>(initialState);
  const [timerRunning, setTimerRunning] = useState(false);
  const [modalBusy, setModalBusy] = useState(false);
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

  useEffect(() => {
    if (!boardState.openQuestionId || boardState.showAnswer || boardState.showWinnerPicker) {
      setTimerRunning(false);
      return;
    }
  }, [boardState.openQuestionId, boardState.showAnswer, boardState.showWinnerPicker]);

  useEffect(() => {
    if (!timerRunning) return;

    const timer = window.setInterval(() => {
      setBoardState((prev) => {
        if (prev.timeLeft <= 1) {
          window.clearInterval(timer);
          return {
            ...prev,
            timeLeft: 0,
            savedAt: Date.now(),
          };
        }

        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
          savedAt: Date.now(),
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timerRunning]);

  const questionMap = useMemo(() => {
    return new Map(questions.map((question) => [question.id, question]));
  }, [questions]);

  const openQuestion = useMemo<OpenQuestion | null>(() => {
    if (!boardState.openQuestionId) return null;

    const found = questionMap.get(boardState.openQuestionId);
    if (!found) return null;

    const category = categories.find((item) => item.id === found.category_id);

    return {
      ...found,
      categoryName: category?.name ?? "فئة",
    };
  }, [boardState.openQuestionId, categories, questionMap]);

  const boardColumns = useMemo<CategoryColumn[]>(() => {
    const pointsList: (200 | 400 | 600)[] = [200, 400, 600];

    return categories.map((category) => {
      const categoryQuestions = questions.filter(
        (question) => question.category_id === category.id,
      );

      return {
        category,
        rows: pointsList.map((points) => {
          const available = categoryQuestions
            .filter((question) => question.points === points)
            .sort((a, b) => a.id.localeCompare(b.id));

          const preferredUnused =
            available.find(
              (question) => !boardState.usedQuestionIds.includes(question.id),
            ) ?? null;

          const fallbackUsed = available[0] ?? null;

          return {
            points,
            question: preferredUnused ?? fallbackUsed,
          };
        }),
      };
    });
  }, [boardState.usedQuestionIds, categories, questions]);

  const usedCount = boardState.usedQuestionIds.length;
  const totalBoardQuestions = boardColumns.reduce((sum, column) => {
    return sum + column.rows.filter((row) => row.question).length;
  }, 0);
  const remainingCount = Math.max(totalBoardQuestions - usedCount, 0);

  const teamOneLeading = boardState.teamOneScore > boardState.teamTwoScore;
  const teamTwoLeading = boardState.teamTwoScore > boardState.teamOneScore;
  const leaderLabel = teamOneLeading
    ? teamOne
    : teamTwoLeading
      ? teamTwo
      : "تعادل";

  const activeTurn =
    (usedCount + 1) % 2 === 1 ? "teamOne" : "teamTwo";

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

    setTimerRunning(false);
    updateState((prev) => ({
      ...prev,
      openQuestionId: question.id,
      showAnswer: false,
      showWinnerPicker: false,
      timeLeft: QUESTION_TIMER_SECONDS,
    }));
  }

  function handleCloseOverlay() {
    setTimerRunning(false);
    updateState((prev) => ({
      ...prev,
      openQuestionId: null,
      showAnswer: false,
      showWinnerPicker: false,
      timeLeft: QUESTION_TIMER_SECONDS,
    }));
  }

  function handleRevealAnswer() {
    setTimerRunning(false);
    updateState((prev) => ({
      ...prev,
      showAnswer: true,
      showWinnerPicker: false,
    }));
  }

  function handleGoToWinnerPicker() {
    updateState((prev) => ({
      ...prev,
      showWinnerPicker: true,
    }));
  }

  function handleBackToQuestion() {
    updateState((prev) => ({
      ...prev,
      showAnswer: false,
      showWinnerPicker: false,
    }));
  }

  function handleBackToAnswer() {
    updateState((prev) => ({
      ...prev,
      showAnswer: true,
      showWinnerPicker: false,
    }));
  }

  function handleResetTimer() {
    updateState((prev) => ({
      ...prev,
      timeLeft: QUESTION_TIMER_SECONDS,
    }));
  }

  function handleToggleTimer() {
    setTimerRunning((prev) => !prev);
  }

  async function handleAwardPoints(winner: "teamOne" | "teamTwo" | "none") {
    if (!openQuestion) return;
    if (modalBusy) return;

    setModalBusy(true);
    setTimerRunning(false);

    updateState((prev) => {
      const nextUsed = prev.usedQuestionIds.includes(openQuestion.id)
        ? prev.usedQuestionIds
        : [...prev.usedQuestionIds, openQuestion.id];

      return {
        ...prev,
        teamOneScore:
          winner === "teamOne"
            ? prev.teamOneScore + openQuestion.points
            : prev.teamOneScore,
        teamTwoScore:
          winner === "teamTwo"
            ? prev.teamTwoScore + openQuestion.points
            : prev.teamTwoScore,
        usedQuestionIds: nextUsed,
        openQuestionId: null,
        showAnswer: false,
        showWinnerPicker: false,
        timeLeft: QUESTION_TIMER_SECONDS,
      };
    });

    setModalBusy(false);
  }

  function adjustScore(team: "teamOne" | "teamTwo", delta: number) {
    updateState((prev) => ({
      ...prev,
      teamOneScore:
        team === "teamOne" ? Math.max(0, prev.teamOneScore + delta) : prev.teamOneScore,
      teamTwoScore:
        team === "teamTwo" ? Math.max(0, prev.teamTwoScore + delta) : prev.teamTwoScore,
    }));
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_18%),linear-gradient(180deg,#020617_0%,#020b1d_35%,#010617_100%)] text-white">
      <div className="mx-auto max-w-[1800px] px-3 py-3 md:px-5 md:py-5">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,15,37,0.98)_0%,rgba(2,9,24,0.98)_100%)] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.38)] md:p-5">
          <div className="mb-4 rounded-[1.8rem] border border-white/10 bg-white/5 p-4 md:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-xs font-black tracking-[0.18em] text-cyan-300/90">
                  لوحة اللعبة
                </div>
                <h1 className="mt-2 text-2xl font-black md:text-4xl">{gameName}</h1>
                <p className="mt-2 text-sm leading-7 text-white/70 md:text-base">
                  اختر السؤال التالي وراقب النتيجة لحظة بلحظة ضمن واجهة مهيأة
                  للعرض والهواتف.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100">
                  الدور الآن: {activeTurn === "teamOne" ? teamOne : teamTwo}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/85">
                  المتبقي: {remainingCount} سؤال
                </div>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100">
                  المتصدر: {leaderLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="order-2 xl:order-1">
              <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#020b1f] p-3 md:p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                  {boardColumns.map((column) => {
                    const visual = getVisualBySlug(column.category.slug);

                    return (
                      <div key={column.category.id} className="flex flex-col gap-3">
                        <div
                          className={[
                            "relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-b p-4 text-center shadow-[0_12px_35px_rgba(0,0,0,0.25)]",
                            visual.gradient,
                          ].join(" ")}
                        >
                          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:h-16 md:w-16">
                            {column.category.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={column.category.image_url}
                                alt={column.category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-xs font-black text-white/70">فئة</div>
                            )}
                          </div>

                          <h3 className="mt-4 text-lg font-black leading-7 text-white md:text-xl">
                            {column.category.name}
                          </h3>
                        </div>

                        {column.rows.map((row) => {
                          const used = row.question
                            ? boardState.usedQuestionIds.includes(row.question.id)
                            : true;

                          const active =
                            row.question?.id === boardState.openQuestionId;

                          return (
                            <QuestionCell
                              key={`${column.category.id}-${row.points}`}
                              question={row.question}
                              points={row.points}
                              used={used}
                              active={active}
                              onOpen={() => handleOpenQuestion(row.question)}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="order-1 xl:order-2">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <ScoreCard
                  teamName={teamOne}
                  score={boardState.teamOneScore}
                  isLeading={teamOneLeading}
                  isTurn={activeTurn === "teamOne"}
                  onIncrease={() => adjustScore("teamOne", 100)}
                  onDecrease={() => adjustScore("teamOne", -100)}
                  accent="cyan"
                />

                <ScoreCard
                  teamName={teamTwo}
                  score={boardState.teamTwoScore}
                  isLeading={teamTwoLeading}
                  isTurn={activeTurn === "teamTwo"}
                  onIncrease={() => adjustScore("teamTwo", 100)}
                  onDecrease={() => adjustScore("teamTwo", -100)}
                  accent="orange"
                />

                <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 xl:p-5">
                  <div className="text-xs font-bold text-white/55">ملخص الجولة</div>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <CrownIcon className="h-4 w-4 text-emerald-300" />
                        المتصدر الحالي
                      </div>
                      <div className="mt-2 text-lg font-black text-emerald-100">
                        {leaderLabel}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="text-sm font-bold text-white/60">الأسئلة المستخدمة</div>
                      <div className="mt-2 text-3xl font-black text-white">
                        {usedCount}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="text-sm font-bold text-white/60">الأسئلة المتبقية</div>
                      <div className="mt-2 text-3xl font-black text-cyan-100">
                        {remainingCount}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4">
                  <Link
                    href="/account"
                    className="inline-flex min-h-14 w-full items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/5 px-5 py-3 text-base font-black text-white transition hover:bg-white/10"
                  >
                    الرجوع للحساب
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {openQuestion ? (
        <QuestionOverlay
          openQuestion={openQuestion}
          teamOne={teamOne}
          teamTwo={teamTwo}
          showAnswer={boardState.showAnswer}
          showWinnerPicker={boardState.showWinnerPicker}
          modalBusy={modalBusy}
          timeLeft={boardState.timeLeft}
          timerRunning={timerRunning}
          onClose={handleCloseOverlay}
          onRevealAnswer={handleRevealAnswer}
          onGoToWinnerPicker={handleGoToWinnerPicker}
          onBackToQuestion={handleBackToQuestion}
          onBackToAnswer={handleBackToAnswer}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
          onAwardPoints={handleAwardPoints}
        />
      ) : null}
    </div>
  );
}