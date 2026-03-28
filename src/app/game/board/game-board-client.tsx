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
    questions: QuestionRow[];
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
      <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-6 text-center text-white/70">
        لا يوجد محتوى محفوظ.
      </div>
    );
  }

  return (
    <div
      className={[
        "max-w-none text-center text-white",
        large ? "text-xl md:text-3xl" : "text-base md:text-lg",
        "[&_p]:my-0 [&_p]:mb-3 [&_p]:text-center [&_p]:leading-9 md:[&_p]:leading-10",
        "[&_h1]:text-center [&_h2]:text-center [&_h3]:text-center [&_h4]:text-center",
        "[&_img]:mx-auto [&_img]:my-3 [&_img]:block [&_img]:w-auto [&_img]:max-w-full [&_img]:max-h-[150px] md:[&_img]:max-h-[220px] [&_img]:rounded-[1rem] [&_img]:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        "[&_iframe]:mx-auto [&_iframe]:my-3 [&_iframe]:block [&_iframe]:w-full [&_iframe]:max-w-2xl [&_iframe]:max-h-[220px] [&_iframe]:rounded-[1rem]",
        "[&_video]:mx-auto [&_video]:my-3 [&_video]:block [&_video]:w-full [&_video]:max-w-2xl [&_video]:max-h-[220px] [&_video]:rounded-[1rem]",
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
  accent = "cyan",
  compact = false,
}: {
  teamName: string;
  score: number;
  isLeading: boolean;
  isTurn: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  accent?: "cyan" | "orange";
  compact?: boolean;
}) {
  const classes =
    accent === "orange"
      ? {
          chip: "border-orange-300/20 bg-orange-400/10 text-orange-100",
          card: isTurn
            ? "border-orange-300/30 bg-orange-400/10 shadow-[0_14px_40px_rgba(251,146,60,0.14)]"
            : "border-white/10 bg-white/5",
          btn: "border-orange-300/20 bg-orange-400/10 text-orange-100 hover:bg-orange-400/15",
        }
      : {
          chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
          card: isTurn
            ? "border-cyan-300/30 bg-cyan-400/10 shadow-[0_14px_40px_rgba(34,211,238,0.14)]"
            : "border-white/10 bg-white/5",
          btn: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15",
        };

  return (
    <div
      className={[
        "rounded-[1.25rem] border transition",
        compact ? "p-3" : "p-4",
        classes.card,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-white/55">لوحة الفريق</div>
          <h3
            className={[
              "mt-1 truncate font-black text-white",
              compact ? "text-base" : "text-lg md:text-xl",
            ].join(" ")}
          >
            {teamName}
          </h3>
        </div>

        <div className="flex flex-col gap-1">
          {isTurn ? (
            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${classes.chip}`}
            >
              الدور الآن
            </span>
          ) : null}

          {isLeading ? (
            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black text-emerald-100">
              متصدر
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onDecrease}
          className={`flex items-center justify-center rounded-full border font-black transition ${classes.btn} ${
            compact ? "h-8 w-8 text-lg" : "h-10 w-10 text-xl"
          }`}
        >
          −
        </button>

        <div className="text-center">
          <div
            className={[
              "font-black text-white",
              compact ? "text-2xl" : "text-3xl md:text-4xl",
            ].join(" ")}
          >
            {score}
          </div>
          <div className="text-[10px] font-bold text-white/55">نقطة</div>
        </div>

        <button
          type="button"
          onClick={onIncrease}
          className={`flex items-center justify-center rounded-full border font-black transition ${classes.btn} ${
            compact ? "h-8 w-8 text-lg" : "h-10 w-10 text-xl"
          }`}
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
  compact = false,
}: {
  question: QuestionRow | null;
  points: number;
  used: boolean;
  active?: boolean;
  onOpen?: () => void;
  compact?: boolean;
}) {
  const disabled = !question || used;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onOpen}
      className={[
        "group relative overflow-hidden rounded-[1rem] border text-center transition",
        compact ? "min-h-[56px] px-1 py-1.5" : "min-h-[82px] px-2 py-3",
        disabled
          ? "cursor-not-allowed border-white/5 bg-[linear-gradient(180deg,rgba(2,8,23,0.78)_0%,rgba(2,8,23,0.92)_100%)] text-slate-500"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(22,38,78,0.90)_0%,rgba(5,15,37,0.98)_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:border-cyan-300/30 hover:shadow-[0_10px_30px_rgba(34,211,238,0.12)]",
        active
          ? "border-cyan-300/40 bg-[linear-gradient(180deg,rgba(16,64,112,0.95)_0%,rgba(8,29,59,0.98)_100%)] shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_12px_30px_rgba(34,211,238,0.12)]"
          : "",
      ].join(" ")}
      aria-label={`سؤال ${points}`}
    >
      {!disabled ? (
        <div className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      ) : null}

      <div
        className={[
          "font-black tracking-tight",
          compact ? "text-[1.25rem] md:text-[1.35rem]" : "text-[1.7rem] md:text-[1.85rem]",
          used ? "opacity-55" : "opacity-100",
        ].join(" ")}
      >
        {points}
      </div>
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
      <div className="max-h-[96vh] w-full max-w-5xl overflow-hidden rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_32%),linear-gradient(180deg,#071126_0%,#050b16_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
        <div className="border-b border-white/10 px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
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

              <h2 className="mt-3 text-center text-2xl font-black text-white md:text-right md:text-3xl">
                {!showAnswer && !showWinnerPicker
                  ? "السؤال"
                  : showAnswer && !showWinnerPicker
                    ? "الإجابة الصحيحة"
                    : "تحديد الفريق الفائز"}
              </h2>
            </div>

            {!showAnswer && !showWinnerPicker ? (
              <div className="min-w-[190px]">
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

        <div className="max-h-[70vh] overflow-y-auto px-4 py-5 md:px-6 md:py-6">
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
                  className="rounded-[1.1rem] border border-orange-300/20 bg-orange-400/10 px-5 py-5 text-xl font-black text-white transition hover:bg-orange-400/15 disabled:opacity-50"
                >
                  {teamOne}
                </button>

                <button
                  type="button"
                  onClick={() => onAwardPoints("teamTwo")}
                  disabled={modalBusy}
                  className="rounded-[1.1rem] border border-cyan-300/20 bg-cyan-400/10 px-5 py-5 text-xl font-black text-white transition hover:bg-cyan-400/15 disabled:opacity-50"
                >
                  {teamTwo}
                </button>
              </div>

              <button
                type="button"
                onClick={() => onAwardPoints("none")}
                disabled={modalBusy}
                className="mx-auto mt-4 block w-full max-w-md rounded-[1.1rem] border border-white/10 bg-white/5 px-5 py-4 text-lg font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                ولا أحد
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-4 py-4 md:px-6">
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

  const [isLandscapePhone, setIsLandscapePhone] = useState(false);

  const initialState = useMemo(() => {
    return normalizeBoardState(initialBoardState);
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
  const totalBoardQuestions = boardColumns.reduce((sum, column) => {
    return sum + column.rows.reduce((rowSum, row) => rowSum + row.questions.length, 0);
  }, 0);
  const remainingCount = Math.max(totalBoardQuestions - usedCount, 0);

  const teamOneLeading = boardState.teamOneScore > boardState.teamTwoScore;
  const teamTwoLeading = boardState.teamTwoScore > boardState.teamOneScore;
  const leaderLabel = teamOneLeading
    ? teamOne
    : teamTwoLeading
      ? teamTwo
      : "تعادل";

  const activeTurn = (usedCount + 1) % 2 === 1 ? "teamOne" : "teamTwo";

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

  function adjustScore(team: "teamOne" | "teamTwo", delta: number) {
    updateState((prev) => ({
      ...prev,
      teamOneScore:
        team === "teamOne" ? Math.max(0, prev.teamOneScore + delta) : prev.teamOneScore,
      teamTwoScore:
        team === "teamTwo" ? Math.max(0, prev.teamTwoScore + delta) : prev.teamTwoScore,
    }));
  }

  async function handleAwardPoints(winner: "teamOne" | "teamTwo" | "none") {
    if (!openQuestion || modalBusy) return;

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

  const compactLandscape = isLandscapePhone;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_18%),linear-gradient(180deg,#020617_0%,#020b1d_35%,#010617_100%)] text-white">
      <div className="mx-auto max-w-[1800px] px-2 py-2 md:px-5 md:py-5">
        <div
          className={[
            "rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,15,37,0.98)_0%,rgba(2,9,24,0.98)_100%)] shadow-[0_25px_80px_rgba(0,0,0,0.38)]",
            compactLandscape ? "p-2.5" : "p-3 md:p-4",
          ].join(" ")}
        >
          <div
            className={[
              "mb-3 rounded-[1.35rem] border border-white/10 bg-white/5",
              compactLandscape ? "p-3" : "p-4",
            ].join(" ")}
          >
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[10px] font-black tracking-[0.18em] text-cyan-300/90">
                  لوحة اللعبة
                </div>
                <h1
                  className={[
                    "mt-1 font-black",
                    compactLandscape ? "text-lg" : "text-2xl md:text-4xl",
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
                <div
                  className={`rounded-2xl border border-cyan-300/20 bg-cyan-400/10 font-black text-cyan-100 ${
                    compactLandscape ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                  }`}
                >
                  الدور الآن: {activeTurn === "teamOne" ? teamOne : teamTwo}
                </div>
                <div
                  className={`rounded-2xl border border-white/10 bg-white/5 font-black text-white/85 ${
                    compactLandscape ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                  }`}
                >
                  المتبقي: {remainingCount} سؤال
                </div>
                <div
                  className={`rounded-2xl border border-emerald-300/20 bg-emerald-400/10 font-black text-emerald-100 ${
                    compactLandscape ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                  }`}
                >
                  المتصدر: {leaderLabel}
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              compactLandscape
                ? "grid gap-3 grid-cols-[165px_minmax(0,1fr)]"
                : "grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]"
            }
          >
            <aside className="order-1">
              <div
                className={
                  compactLandscape
                    ? "grid gap-3 grid-cols-1"
                    : "grid gap-3 sm:grid-cols-2 xl:grid-cols-1"
                }
              >
                <ScoreCard
                  teamName={teamOne}
                  score={boardState.teamOneScore}
                  isLeading={teamOneLeading}
                  isTurn={activeTurn === "teamOne"}
                  onIncrease={() => adjustScore("teamOne", 100)}
                  onDecrease={() => adjustScore("teamOne", -100)}
                  accent="cyan"
                  compact={compactLandscape}
                />

                <ScoreCard
                  teamName={teamTwo}
                  score={boardState.teamTwoScore}
                  isLeading={teamTwoLeading}
                  isTurn={activeTurn === "teamTwo"}
                  onIncrease={() => adjustScore("teamTwo", 100)}
                  onDecrease={() => adjustScore("teamTwo", -100)}
                  accent="orange"
                  compact={compactLandscape}
                />

                <div
                  className={[
                    "rounded-[1.2rem] border border-white/10 bg-white/5",
                    compactLandscape ? "p-3" : "p-4",
                  ].join(" ")}
                >
                  <div className="text-[10px] font-bold text-white/55">ملخص الجولة</div>

                  <div className="mt-3 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="flex items-center gap-2 text-xs font-black text-white">
                        <CrownIcon className="h-4 w-4 text-emerald-300" />
                        المتصدر الحالي
                      </div>
                      <div
                        className={[
                          "mt-2 font-black text-emerald-100",
                          compactLandscape ? "text-lg" : "text-xl",
                        ].join(" ")}
                      >
                        {leaderLabel}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="text-xs font-bold text-white/60">الأسئلة المستخدمة</div>
                      <div
                        className={[
                          "mt-1 font-black text-white",
                          compactLandscape ? "text-2xl" : "text-3xl",
                        ].join(" ")}
                      >
                        {usedCount}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="text-xs font-bold text-white/60">الأسئلة المتبقية</div>
                      <div
                        className={[
                          "mt-1 font-black text-cyan-100",
                          compactLandscape ? "text-2xl" : "text-3xl",
                        ].join(" ")}
                      >
                        {remainingCount}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={[
                    "rounded-[1.2rem] border border-white/10 bg-white/5",
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
                  "overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#020b1f]",
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
                  {boardColumns.map((column) => {
                    const visual = getVisualBySlug(column.category.slug);

                    return (
                      <div key={column.category.id} className="flex flex-col gap-2">
                        <div
                          className={[
                            "relative overflow-hidden rounded-[1rem] border border-white/10 bg-gradient-to-b text-center shadow-[0_10px_24px_rgba(0,0,0,0.22)]",
                            visual.gradient,
                            compactLandscape ? "p-1.5" : "p-3",
                          ].join(" ")}
                        >
                          <div
                            className={`mx-auto flex items-center justify-center overflow-hidden rounded-[0.9rem] border border-white/10 bg-white/10 shadow-[0_8px_18px_rgba(0,0,0,0.18)] ${
                              compactLandscape ? "h-9 w-9" : "h-14 w-14 md:h-16 md:w-16"
                            }`}
                          >
                            {column.category.image_url ? (
                              <img
                                src={column.category.image_url}
                                alt={column.category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-[10px] font-black text-white/70">فئة</div>
                            )}
                          </div>

                          <h3
                            className={[
                              "mt-2 font-black leading-5 text-white",
                              compactLandscape ? "text-[11px]" : "text-base md:text-lg",
                            ].join(" ")}
                          >
                            {column.category.name}
                          </h3>
                        </div>

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
                              const active = question?.id === boardState.openQuestionId;

                              return (
                                <QuestionCell
                                  key={`${column.category.id}-${row.points}-${index}`}
                                  question={question}
                                  points={row.points}
                                  used={used}
                                  active={active}
                                  compact={compactLandscape}
                                  onOpen={() => handleOpenQuestion(question)}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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