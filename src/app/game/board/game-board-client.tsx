"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
const MOBILE_BREAKPOINT = 1024;

const categoryVisuals: Record<string, { gradient: string }> = {
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
    teamOneScore:
      typeof raw?.teamOneScore === "number" ? raw.teamOneScore : 0,
    teamTwoScore:
      typeof raw?.teamTwoScore === "number" ? raw.teamTwoScore : 0,
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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-white/70 md:rounded-3xl md:p-6">
        لا يوجد محتوى محفوظ.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className={[
          "mx-auto w-full max-w-5xl text-center font-bold leading-relaxed text-white",
          large
            ? "text-2xl md:text-4xl lg:text-5xl"
            : "text-xl md:text-2xl lg:text-3xl",
          "[&_p]:my-3 [&_p]:text-inherit [&_p]:leading-relaxed",
          "[&_strong]:text-inherit [&_strong]:font-black",
          "[&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-black md:[&_h1]:text-4xl lg:[&_h1]:text-5xl",
          "[&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-black md:[&_h2]:text-3xl lg:[&_h2]:text-4xl",
          "[&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-black md:[&_h3]:text-2xl lg:[&_h3]:text-3xl",
          "[&_li]:my-2 [&_li]:text-inherit",
          "[&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain",
          "[&_img]:max-h-[18vh] sm:[&_img]:max-h-[24vh] md:[&_img]:max-h-[38vh]",
          "[&_figure]:my-4 [&_figure]:text-center",
          "[&_figure_img]:mx-auto",
          "[&_iframe]:mx-auto [&_iframe]:my-3 [&_iframe]:max-h-[20vh] [&_iframe]:w-full",
          "[&_video]:mx-auto [&_video]:my-3 [&_video]:max-h-[20vh]",
        ].join(" ")}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  );
}

function ScoreCard({
  teamName,
  score,
  isLeading,
  onIncrease,
  onDecrease,
  compact = false,
  accent = "cyan",
}: {
  teamName: string;
  score: number;
  isLeading: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  compact?: boolean;
  accent?: "cyan" | "orange";
}) {
  const classes =
    accent === "orange"
      ? {
          chip: "border-orange-300/20 bg-orange-400/10 text-orange-100",
          box: "border-orange-300/20 bg-orange-400/10",
          btn: "border-orange-300/20 bg-orange-400/10 text-orange-100",
        }
      : {
          chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
          box: "border-cyan-300/20 bg-cyan-400/10",
          btn: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
        };

  return (
    <div
      className={[
        "rounded-[1.5rem] border bg-[#0b1230] shadow-[0_18px_40px_rgba(0,0,0,0.28)]",
        compact ? "p-2.5" : "p-4",
        isLeading ? "border-white/15" : "border-white/10",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={[
            "rounded-full border px-2.5 py-1 font-bold",
            compact ? "text-[10px]" : "text-xs",
            classes.chip,
          ].join(" ")}
        >
          {teamName}
        </span>

        {isLeading ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/70">
            متصدر
          </span>
        ) : null}
      </div>

      <div
        className={[
          "rounded-[1.2rem] border px-3 py-3 text-center",
          classes.box,
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onDecrease}
            className={[
              "flex items-center justify-center rounded-full border",
              classes.btn,
              compact ? "h-8 w-8 text-lg" : "h-11 w-11 text-2xl",
            ].join(" ")}
          >
            −
          </button>

          <div>
            <div
              className={[
                "font-black tracking-tight text-white",
                compact ? "text-2xl" : "text-5xl",
              ].join(" ")}
            >
              {score}
            </div>
            <div className="text-[10px] text-white/50">نقطة</div>
          </div>

          <button
            type="button"
            onClick={onIncrease}
            className={[
              "flex items-center justify-center rounded-full border",
              classes.btn,
              compact ? "h-8 w-8 text-lg" : "h-11 w-11 text-2xl",
            ].join(" ")}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionCell({
  question,
  points,
  used,
  onOpen,
  mobile = false,
}: {
  question: QuestionRow | null;
  points: number;
  used: boolean;
  onOpen?: () => void;
  mobile?: boolean;
}) {
  const disabled = !question || used;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onOpen}
      disabled={disabled}
      className={[
        "group rounded-[1rem] border text-center transition",
        mobile
          ? "h-[50px] px-1 py-1 rounded-[0.9rem]"
          : "h-[88px] px-2 py-2 rounded-[1.25rem]",
        disabled
          ? "cursor-not-allowed border-white/5 bg-slate-900/50 text-slate-500"
          : "border-white/10 bg-white/5 text-white hover:border-cyan-300/40 hover:bg-cyan-400/10",
      ].join(" ")}
    >
      <div
        className={[
          "font-black leading-none tracking-tight",
          mobile ? "text-[14px]" : "text-[35px]",
        ].join(" ")}
      >
        {points}
      </div>

      {!mobile ? (
        <div className="mt-1 text-[11px] font-bold text-white/55">
          {question ? (used ? "تم الاستخدام" : "افتح السؤال") : "غير متاح"}
        </div>
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
    <div className="fixed inset-0 z-50 bg-[#020617]/88 backdrop-blur-md">
      <div className="mx-auto flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden border-x border-white/10 bg-[#071126] md:h-[100dvh]">
        <div className="shrink-0 border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_45%)] px-3 py-2.5 sm:px-5 md:px-7 md:py-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold text-cyan-200 sm:text-xs">
                {openQuestion.categoryName}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-white/80 sm:text-xs">
                {openQuestion.points} نقطة
              </span>
              {toleranceVisible ? (
                <span className="rounded-full border border-yellow-300/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-bold text-yellow-200 sm:text-xs">
                  السماحية: قبل {openQuestion.year_tolerance_before ?? 0} / بعد{" "}
                  {openQuestion.year_tolerance_after ?? 0}
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
            <div className="text-center md:text-right">
              <h2 className="text-2xl font-black text-white sm:text-4xl md:text-5xl">
                {!showAnswer && !showWinnerPicker
                  ? "السؤال"
                  : showAnswer && !showWinnerPicker
                    ? "الإجابة الصحيحة"
                    : "تحديد الفريق الفائز"}
              </h2>
            </div>

            {!showAnswer && !showWinnerPicker ? (
              <div className="w-full md:w-[360px]">
                <div className="mb-1 flex items-center justify-between text-[11px] text-white/70 sm:text-sm">
                  <span>المؤقت</span>
                  <span className="font-black text-white">
                    {formatCountdown(timeLeft)}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={onToggleTimer}
                    className="flex-1 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-400/20 sm:text-sm"
                  >
                    {timerRunning ? "إيقاف الوقت" : "تشغيل الوقت"}
                  </button>

                  <button
                    type="button"
                    onClick={onResetTimer}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 sm:text-sm"
                  >
                    إعادة المؤقت
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-white/60 md:text-sm">
                {showWinnerPicker ? "حدد الفريق الفائز" : "عرض الإجابة"}
              </div>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-2 sm:px-5 md:px-7">
          {!showAnswer && !showWinnerPicker ? (
            <div className="flex h-full w-full items-center justify-center overflow-hidden">
              <div className="max-h-full w-full overflow-hidden">
                <RichContent html={openQuestion.question_text} large />
              </div>
            </div>
          ) : showAnswer && !showWinnerPicker ? (
            <div className="flex h-full w-full items-center justify-center overflow-hidden">
              <div className="max-h-full w-full overflow-hidden">
                <RichContent html={openQuestion.answer_text} large />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl py-2">
              <div className="mb-4 text-center">
                <h3 className="text-2xl font-black text-white sm:text-3xl">
                  أي فريق جاوب صح؟
                </h3>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onAwardPoints("teamOne")}
                  disabled={modalBusy}
                  className="rounded-[1.3rem] bg-rose-600 px-5 py-5 text-xl font-black text-white transition hover:bg-rose-500 disabled:opacity-50"
                >
                  {teamOne}
                </button>

                <button
                  type="button"
                  onClick={() => onAwardPoints("teamTwo")}
                  disabled={modalBusy}
                  className="rounded-[1.3rem] bg-cyan-600 px-5 py-5 text-xl font-black text-white transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  {teamTwo}
                </button>
              </div>

              <button
                type="button"
                onClick={() => onAwardPoints("none")}
                disabled={modalBusy}
                className="mx-auto mt-3 block w-full max-w-md rounded-[1.3rem] bg-slate-600 px-5 py-4 text-lg font-black text-white transition hover:bg-slate-500 disabled:opacity-50"
              >
                ولا أحد
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 bg-white/5 px-3 py-3 sm:px-5 md:px-7">
          {!showAnswer && !showWinnerPicker ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onRevealAnswer}
                className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/20"
              >
                إظهار الإجابة
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                إغلاق
              </button>
            </div>
          ) : showAnswer && !showWinnerPicker ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onGoToWinnerPicker}
                className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-bold text-emerald-100 transition hover:bg-emerald-400/20"
              >
                أي فريق؟
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onBackToQuestion}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  ارجع للسؤال
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  إغلاق
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackToAnswer}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                العودة للإجابة
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
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
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const storageKey = `lammatna-board-${sessionId}`;
  const saveTimeoutRef = useRef<number | null>(null);

  const [modalBusy, setModalBusy] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRedirectingToResult, setIsRedirectingToResult] = useState(false);

  const [boardState, setBoardState] = useState<BoardState>(() =>
    normalizeBoardState(initialBoardState),
  );

  useEffect(() => {
    const localState = readLocalBoardState(storageKey);
    if (localState) {
      setBoardState(localState);
      return;
    }

    setBoardState(normalizeBoardState(initialBoardState));
  }, [initialBoardState, storageKey]);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const grouped = useMemo<CategoryColumn[]>(() => {
    return categories.map((category) => {
      const categoryQuestions = questions
        .filter(
          (question) => question.category_id === category.id && question.is_active,
        )
        .sort((a, b) => a.points - b.points);

      return {
        category,
        rows: [
          {
            points: 200,
            questions: categoryQuestions.filter((q) => q.points === 200),
          },
          {
            points: 400,
            questions: categoryQuestions.filter((q) => q.points === 400),
          },
          {
            points: 600,
            questions: categoryQuestions.filter((q) => q.points === 600),
          },
        ],
      };
    });
  }, [categories, questions]);

  const totalPlayableQuestions = useMemo(
    () => questions.filter((question) => question.is_active).length,
    [questions],
  );

  const openQuestion = useMemo<OpenQuestion | null>(() => {
    if (!boardState.openQuestionId) return null;

    const found = questions.find(
      (question) => question.id === boardState.openQuestionId,
    );

    if (!found) return null;

    const category = categories.find((item) => item.id === found.category_id);

    return {
      ...found,
      categoryName: category?.name ?? "السؤال",
    };
  }, [boardState.openQuestionId, questions, categories]);

  const leadingTeam = useMemo<"teamOne" | "teamTwo" | "tie">(() => {
    if (boardState.teamOneScore > boardState.teamTwoScore) return "teamOne";
    if (boardState.teamTwoScore > boardState.teamOneScore) return "teamTwo";
    return "tie";
  }, [boardState.teamOneScore, boardState.teamTwoScore]);

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
            savedAt: Date.now(),
          },
        })
        .eq("id", sessionId);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [boardState, sessionId, storageKey, supabase]);

  useEffect(() => {
    if (!openQuestion || !timerRunning) return;

    const interval = window.setInterval(() => {
      setBoardState((prev) => {
        if (prev.timeLeft <= 1) {
          window.clearInterval(interval);
          return {
            ...prev,
            timeLeft: 0,
          };
        }

        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [openQuestion, timerRunning]);

  useEffect(() => {
    if (!openQuestion) {
      setTimerRunning(false);
    }
  }, [openQuestion]);

  useEffect(() => {
    if (isRedirectingToResult) return;
    if (totalPlayableQuestions === 0) return;
    if (boardState.usedQuestionIds.length < totalPlayableQuestions) return;

    setIsRedirectingToResult(true);

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
    boardState.teamOneScore,
    boardState.teamTwoScore,
    boardState.usedQuestionIds.length,
    gameName,
    isRedirectingToResult,
    router,
    sessionId,
    teamOne,
    teamTwo,
    totalPlayableQuestions,
  ]);

  function updateScore(team: "teamOne" | "teamTwo", delta: number) {
    setBoardState((prev) => {
      const nextValue =
        team === "teamOne"
          ? Math.max(0, prev.teamOneScore + delta)
          : Math.max(0, prev.teamTwoScore + delta);

      return {
        ...prev,
        teamOneScore: team === "teamOne" ? nextValue : prev.teamOneScore,
        teamTwoScore: team === "teamTwo" ? nextValue : prev.teamTwoScore,
      };
    });
  }

  function openSlotQuestion(question: QuestionRow) {
    if (boardState.usedQuestionIds.includes(question.id)) return;

    setBoardState((prev) => ({
      ...prev,
      openQuestionId: question.id,
      showAnswer: false,
      showWinnerPicker: false,
      timeLeft: QUESTION_TIMER_SECONDS,
    }));

    setTimerRunning(false);
  }

  function closeQuestion() {
    setBoardState((prev) => ({
      ...prev,
      openQuestionId: null,
      showAnswer: false,
      showWinnerPicker: false,
      timeLeft: QUESTION_TIMER_SECONDS,
    }));
    setTimerRunning(false);
  }

  function revealAnswer() {
    setBoardState((prev) => ({
      ...prev,
      showAnswer: true,
      showWinnerPicker: false,
    }));
    setTimerRunning(false);
  }

  function backToQuestion() {
    setBoardState((prev) => ({
      ...prev,
      showAnswer: false,
      showWinnerPicker: false,
    }));
  }

  function goToWinnerPicker() {
    setBoardState((prev) => ({
      ...prev,
      showWinnerPicker: true,
    }));
  }

  function backToAnswer() {
    setBoardState((prev) => ({
      ...prev,
      showWinnerPicker: false,
      showAnswer: true,
    }));
  }

  function resetTimer() {
    setBoardState((prev) => ({
      ...prev,
      timeLeft: QUESTION_TIMER_SECONDS,
    }));
    setTimerRunning(false);
  }

  async function awardPoints(winner: "teamOne" | "teamTwo" | "none") {
    if (!openQuestion) return;

    setModalBusy(true);

    try {
      setBoardState((prev) => {
        const used = prev.usedQuestionIds.includes(openQuestion.id)
          ? prev.usedQuestionIds
          : [...prev.usedQuestionIds, openQuestion.id];

        return {
          ...prev,
          usedQuestionIds: used,
          teamOneScore:
            winner === "teamOne"
              ? prev.teamOneScore + openQuestion.points
              : prev.teamOneScore,
          teamTwoScore:
            winner === "teamTwo"
              ? prev.teamTwoScore + openQuestion.points
              : prev.teamTwoScore,
          openQuestionId: null,
          showAnswer: false,
          showWinnerPicker: false,
          timeLeft: QUESTION_TIMER_SECONDS,
        };
      });

      setTimerRunning(false);
    } finally {
      setModalBusy(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#03091c] text-white">
      <div className="mx-auto max-w-[1800px] px-2 py-3 md:px-5 md:py-6">
        <div className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,#071126_0%,#03081b_100%)] p-2 shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:rounded-[2rem] md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 md:mb-4 md:gap-3">
            <div>
              <div className="text-[11px] text-cyan-200/70 md:text-xs">
                لوحة اللعب
              </div>
              <h1 className="mt-1 text-lg font-black md:text-3xl">
                {gameName}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/70 md:px-3 md:py-1.5 md:text-xs">
                {categories.length} فئات
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/70 md:px-3 md:py-1.5 md:text-xs">
                {totalPlayableQuestions} سؤال
              </span>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="order-1">
              {isMobile ? (
                <div className="space-y-2">
                  <div className="rounded-[1.2rem] border border-white/10 bg-[#0b1230] p-3">
                    <div className="text-[11px] text-white/50">لوحة اللعبة</div>
                    <div className="mt-1 text-xl font-black text-white">
                      {gameName}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {leadingTeam === "tie"
                        ? "لا يوجد متصدر"
                        : `المتصدر: ${leadingTeam === "teamOne" ? teamOne : teamTwo}`}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <ScoreCard
                      teamName={teamOne}
                      score={boardState.teamOneScore}
                      isLeading={leadingTeam === "teamOne"}
                      onIncrease={() => updateScore("teamOne", 100)}
                      onDecrease={() => updateScore("teamOne", -100)}
                      compact
                      accent="cyan"
                    />
                    <ScoreCard
                      teamName={teamTwo}
                      score={boardState.teamTwoScore}
                      isLeading={leadingTeam === "teamTwo"}
                      onIncrease={() => updateScore("teamTwo", 100)}
                      onDecrease={() => updateScore("teamTwo", -100)}
                      compact
                      accent="orange"
                    />
                  </div>

                  <div className="rounded-[1.2rem] border border-white/10 bg-[#0b1230] p-2.5">
                    <Link
                      href="/account"
                      className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
                    >
                      الرجوع للحساب
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-[1.8rem] border border-white/10 bg-[#0b1230] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                    <div className="text-xs text-white/50">لوحة اللعبة</div>
                    <h2 className="mt-2 text-2xl font-black text-white">
                      {gameName}
                    </h2>
                    <p className="mt-2 text-sm text-white/65">
                      {leadingTeam === "tie"
                        ? "لا يوجد متصدر حاليًا"
                        : `المتصدر الآن: ${leadingTeam === "teamOne" ? teamOne : teamTwo}`}
                    </p>
                  </div>

                  <ScoreCard
                    teamName={teamOne}
                    score={boardState.teamOneScore}
                    isLeading={leadingTeam === "teamOne"}
                    onIncrease={() => updateScore("teamOne", 100)}
                    onDecrease={() => updateScore("teamOne", -100)}
                    accent="cyan"
                  />

                  <ScoreCard
                    teamName={teamTwo}
                    score={boardState.teamTwoScore}
                    isLeading={leadingTeam === "teamTwo"}
                    onIncrease={() => updateScore("teamTwo", 100)}
                    onDecrease={() => updateScore("teamTwo", -100)}
                    accent="orange"
                  />

                  <div className="rounded-[1.6rem] border border-white/10 bg-[#0b1230] p-3">
                    <Link
                      href="/account"
                      className="flex w-full items-center justify-center rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      الرجوع للحساب
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="order-2 min-w-0">
              <div
                className="grid gap-2 md:gap-4"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(grouped.length, 1)}, minmax(0, 1fr))`,
                }}
              >
                {grouped.map((column) => {
                  const visual = getVisualBySlug(column.category.slug);

                  return (
                    <div
                      key={column.category.id}
                      className="flex min-w-0 flex-col gap-1.5 md:gap-3"
                    >
                      <div className="relative overflow-hidden rounded-[1rem] border border-white/10 bg-[#0c1431] px-1.5 pb-2 pt-2 shadow-[0_10px_24px_rgba(0,0,0,0.22)] md:rounded-[1.6rem] md:px-3 md:pb-4 md:pt-3">
                        <div
                          className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${visual.gradient}`}
                        />
                        <div className="relative flex flex-col items-center gap-1.5 md:gap-3">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-inner md:h-16 md:w-16 md:rounded-2xl">
                            {column.category.image_url ? (
                              <img
                                src={column.category.image_url}
                                alt={column.category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-base text-white/60 md:text-2xl">
                                ?
                              </span>
                            )}
                          </div>

                          <div className="min-h-[32px] text-center md:min-h-[52px]">
                            <h3 className="line-clamp-2 text-[11px] font-black leading-4 text-white md:text-lg md:leading-6">
                              {column.category.name}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-1.5 md:gap-3">
                        {column.rows.map((row) => (
                          <div
                            key={`${column.category.id}-${row.points}`}
                            className="grid gap-1.5 md:gap-2"
                            style={{
                              gridTemplateColumns: `repeat(${Math.max(row.questions.length, 1)}, minmax(0, 1fr))`,
                            }}
                          >
                            {(row.questions.length ? row.questions : [null]).map(
                              (question, index) => (
                                <QuestionCell
                                  key={`${row.points}-${column.category.id}-${question?.id ?? index}`}
                                  question={question}
                                  points={row.points}
                                  used={
                                    question
                                      ? boardState.usedQuestionIds.includes(
                                          question.id,
                                        )
                                      : true
                                  }
                                  onOpen={
                                    question
                                      ? () => openSlotQuestion(question)
                                      : undefined
                                  }
                                  mobile={isMobile}
                                />
                              ),
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
          onClose={closeQuestion}
          onRevealAnswer={revealAnswer}
          onGoToWinnerPicker={goToWinnerPicker}
          onBackToQuestion={backToQuestion}
          onBackToAnswer={backToAnswer}
          onToggleTimer={() => setTimerRunning((prev) => !prev)}
          onResetTimer={resetTimer}
          onAwardPoints={awardPoints}
        />
      ) : null}
    </div>
  );
}