"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type QuestionRow = {
  id: string;
  question_text: string;
  answer_text: string | null;
  points: number;
  category_id: string;
  year_tolerance_before?: number | null;
  year_tolerance_after?: number | null;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

type BoardState = {
  teamOneScore: number;
  teamTwoScore: number;
  usedQuestionIds: string[];
  questionResults: Record<string, "teamOne" | "teamTwo" | "none">;
  openQuestionId: string | null;
  showAnswer: boolean;
  showWinnerPicker: boolean;
  timeLeft: number;
  savedAt: number;
};

type Props = {
  sessionId: string;
  gameName: string;
  teamOne: string;
  teamTwo: string;
  initialBoardState: Record<string, unknown> | null;
  question: QuestionRow;
  category: CategoryRow | null;
};

const QUESTION_TIMER_SECONDS = 60;
const TEAM_BLUE_AVATAR = "https://k.top4top.io/p_3739o1dbh1.png";
const TEAM_ORANGE_AVATAR = "https://l.top4top.io/p_3739qbt1f2.png";
const NONE_AVATAR = "https://www.svgrepo.com/show/361654/value-none.svg";

function normalizeBoardState(
  raw: Record<string, unknown> | null | undefined,
): BoardState {
  const rawResults =
    raw && typeof raw.questionResults === "object" && raw.questionResults
      ? (raw.questionResults as Record<string, "teamOne" | "teamTwo" | "none">)
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
    return normalizeBoardState(JSON.parse(raw) as Record<string, unknown>);
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

function RichContent({ html }: { html: string | null | undefined }) {
  const safeHtml = html?.trim();

  if (!safeHtml) {
    return (
      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-8 text-center text-white/60">
        لا يوجد محتوى محفوظ.
      </div>
    );
  }

  return (
    <div
      className="question-rich-content [&_img]:mx-auto [&_img]:my-4 [&_img]:max-h-[320px] [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:border [&_img]:border-white/10 [&_img]:shadow-[0_16px_30px_rgba(0,0,0,0.22)] [&_iframe]:mx-auto [&_iframe]:my-4 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:max-w-3xl [&_iframe]:rounded-2xl [&_iframe]:border [&_iframe]:border-white/10 [&_iframe]:shadow-[0_16px_30px_rgba(0,0,0,0.22)] [&_video]:mx-auto [&_video]:my-4 [&_video]:w-full [&_video]:max-w-3xl [&_video]:rounded-2xl [&_video]:border [&_video]:border-white/10 [&_video]:shadow-[0_16px_30px_rgba(0,0,0,0.22)] [&_p]:my-3 [&_p]:leading-9 [&_ul]:my-4 [&_ul]:space-y-2 [&_li]:leading-8 text-center text-xl font-black text-white md:text-3xl"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

function AnswerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function PlayIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 6 10 6-10 6V6Z" />
    </svg>
  );
}

function PauseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 5v14" />
      <path d="M14 5v14" />
    </svg>
  );
}

function RefreshIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function QuestionIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.75 9.25a2.5 2.5 0 1 1 4.1 2c-.75.6-1.35 1.05-1.35 2" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function getYearToleranceLabel(question: QuestionRow) {
  const before = Number(question.year_tolerance_before ?? 0);
  const after = Number(question.year_tolerance_after ?? 0);

  if (before <= 0 && after <= 0) return "";

  if (before > 0 && after > 0) {
    if (before === after) {
      return `السماحية: ±${before} سنة`;
    }

    return `السماحية: من ${before} سنة قبل إلى ${after} سنة بعد`;
  }

  if (before > 0) {
    return `السماحية: حتى ${before} سنة قبل`;
  }

  return `السماحية: حتى ${after} سنة بعد`;
}

export default function QuestionPageClient({
  sessionId,
  teamOne,
  teamTwo,
  initialBoardState,
  question,
  category,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const storageKey = `seenjeem-board-state:${sessionId}`;

  const initialState = useMemo(
    () => normalizeBoardState(initialBoardState),
    [initialBoardState],
  );

  const [boardState, setBoardState] = useState(initialState);
  const [timerRunning, setTimerRunning] = useState(true);
  const [modalBusy, setModalBusy] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showWinnerPicker, setShowWinnerPicker] = useState(false);

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
    if (!timerRunning || showAnswer || showWinnerPicker) return;

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
  }, [timerRunning, showAnswer, showWinnerPicker]);

  const usedCount = boardState.usedQuestionIds.length;
  const activeTurn = (usedCount + 1) % 2 === 1 ? "teamOne" : "teamTwo";
  const activeTurnName = activeTurn === "teamOne" ? teamOne : teamTwo;
  const yearToleranceLabel = getYearToleranceLabel(question);

  function updateState(updater: (prev: BoardState) => BoardState) {
    setBoardState((prev) => ({
      ...updater(prev),
      savedAt: Date.now(),
    }));
  }

  function handleResetTimer() {
    updateState((prev) => ({
      ...prev,
      timeLeft: QUESTION_TIMER_SECONDS,
    }));
  }

  async function handleAwardPoints(winner: "teamOne" | "teamTwo" | "none") {
    if (modalBusy) return;

    setModalBusy(true);
    setTimerRunning(true);

    updateState((prev) => {
      const nextUsed = prev.usedQuestionIds.includes(question.id)
        ? prev.usedQuestionIds
        : [...prev.usedQuestionIds, question.id];

      return {
        ...prev,
        teamOneScore:
          winner === "teamOne"
            ? prev.teamOneScore + question.points
            : prev.teamOneScore,
        teamTwoScore:
          winner === "teamTwo"
            ? prev.teamTwoScore + question.points
            : prev.teamTwoScore,
        usedQuestionIds: nextUsed,
        questionResults: {
          ...prev.questionResults,
          [question.id]: winner,
        },
        openQuestionId: null,
        showAnswer: false,
        showWinnerPicker: false,
        timeLeft: QUESTION_TIMER_SECONDS,
      };
    });

    setModalBusy(false);
    router.push(`/game/board?sessionId=${sessionId}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        {/* top bar */}
        <section className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
          {/* البرتقالي يسار */}
          <div className="order-2 rounded-[1.8rem] border border-orange-300/20 bg-[linear-gradient(180deg,rgba(53,30,15,0.94)_0%,rgba(18,10,5,0.98)_100%)] p-4 text-center shadow-[0_16px_35px_rgba(251,146,60,0.10)] md:order-1">
            <div className="mb-2 text-xs font-black text-orange-200/75">
              الفريق البرتقالي
            </div>
            <div className="text-2xl font-black text-white">{teamTwo}</div>
          </div>

          {/* المؤقت في الوسط */}
          <div className="order-1 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.98)_0%,rgba(6,12,28,0.99)_100%)] p-4 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] md:order-2">
            <div className="mb-2 text-xs font-black text-white/50">المؤقت</div>
            <div className="text-5xl font-black text-white">
              {Math.ceil(boardState.timeLeft)}
            </div>
            <div className="mt-2 text-sm font-black text-cyan-100">
              الدور الآن: {activeTurnName}
            </div>
          </div>

          {/* الأزرق يمين */}
          <div className="order-3 rounded-[1.8rem] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(7,45,67,0.94)_0%,rgba(4,15,28,0.98)_100%)] p-4 text-center shadow-[0_16px_35px_rgba(34,211,238,0.10)]">
            <div className="mb-2 text-xs font-black text-cyan-200/75">
              الفريق الأزرق
            </div>
            <div className="text-2xl font-black text-white">{teamOne}</div>
          </div>
        </section>

        {/* controls */}
        {!showAnswer && !showWinnerPicker ? (
          <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setTimerRunning((prev) => !prev)}
              aria-label={timerRunning ? "إيقاف الوقت" : "تشغيل الوقت"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/15"
            >
              {timerRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={handleResetTimer}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            >
              <RefreshIcon className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        {/* main content */}
        <section className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.97)_0%,rgba(6,12,28,0.99)_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <div className="border-b border-white/10 bg-white/5 px-5 py-4">
            <div className="flex flex-wrap items-center justify-center gap-3 text-center">
              <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-100">
                {category?.name ?? "فئة"}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white">
                {question.points} نقطة
              </div>
            </div>

            <h1 className="mt-4 text-center text-3xl font-black text-white md:text-5xl">
              {!showAnswer && !showWinnerPicker
                ? "السؤال"
                : showAnswer && !showWinnerPicker
                  ? "الإجابة الصحيحة"
                  : "تحديد الفريق الفائز"}
            </h1>
          </div>

          <div className="px-5 py-8 md:px-8 md:py-10">
            {!showAnswer && !showWinnerPicker ? (
              <>
                <RichContent html={question.question_text} />

                {yearToleranceLabel ? (
                  <div className="mt-4 flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-100 shadow-[0_10px_24px_rgba(0,0,0,0.18)] md:text-sm">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-300/15 text-[11px]">
                        ±
                      </span>
                      <span>{yearToleranceLabel}</span>
                    </div>
                  </div>
                ) : null}
              </>
            ) : showAnswer && !showWinnerPicker ? (
              <>
                <div className="mb-4 flex items-center justify-center gap-2 text-cyan-100">
                  <AnswerIcon className="h-5 w-5" />
                  <span className="text-sm font-black">الإجابة الصحيحة</span>
                </div>

                <RichContent html={question.answer_text} />

                {yearToleranceLabel ? (
                  <div className="mt-4 flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-100 shadow-[0_10px_24px_rgba(0,0,0,0.18)] md:text-sm">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-300/15 text-[11px]">
                        ±
                      </span>
                      <span>{yearToleranceLabel}</span>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <h3 className="mb-6 text-center text-2xl font-black text-white md:text-3xl">
                  أي فريق جاوب صح؟
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* الفريق الأزرق */}
                  <button
                    type="button"
                    onClick={() => handleAwardPoints("teamOne")}
                    disabled={modalBusy}
                    className="rounded-[1.35rem] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(7,45,67,0.94)_0%,rgba(4,15,28,0.98)_100%)] p-4 text-white shadow-[0_16px_35px_rgba(34,211,238,0.08)] transition hover:-translate-y-0.5 hover:bg-cyan-400/10 disabled:opacity-50"
                  >
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-cyan-300/20 bg-cyan-400/10">
                      <img
                        src={TEAM_BLUE_AVATAR}
                        alt={teamOne}
                        className="h-12 w-12 object-contain"
                      />
                    </div>
                    <div className="text-xl font-black">{teamOne}</div>
                  </button>

                  {/* لا أحد */}
                  <button
                    type="button"
                    onClick={() => handleAwardPoints("none")}
                    disabled={modalBusy}
                    className="rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-4 text-white shadow-[0_16px_35px_rgba(255,255,255,0.04)] transition hover:-translate-y-0.5 hover:bg-white/10 disabled:opacity-50"
                  >
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <img
                        src={NONE_AVATAR}
                        alt="لا أحد"
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <div className="text-xl font-black">لا أحد</div>
                  </button>

                  {/* الفريق البرتقالي */}
                  <button
                    type="button"
                    onClick={() => handleAwardPoints("teamTwo")}
                    disabled={modalBusy}
                    className="rounded-[1.35rem] border border-orange-300/20 bg-[linear-gradient(180deg,rgba(53,30,15,0.94)_0%,rgba(18,10,5,0.98)_100%)] p-4 text-white shadow-[0_16px_35px_rgba(251,146,60,0.08)] transition hover:-translate-y-0.5 hover:bg-orange-400/10 disabled:opacity-50"
                  >
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-orange-300/20 bg-orange-400/10">
                      <img
                        src={TEAM_ORANGE_AVATAR}
                        alt={teamTwo}
                        className="h-12 w-12 object-contain"
                      />
                    </div>
                    <div className="text-xl font-black">{teamTwo}</div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* bottom actions */}
          <div className="border-t border-white/10 bg-white/5 px-5 py-4">
            {!showAnswer && !showWinnerPicker ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/game/board?sessionId=${sessionId}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <CloseIcon className="h-4 w-4" />
                  إغلاق
                </Link>

                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  <AnswerIcon className="h-4 w-4" />
                  إظهار الإجابة
                </button>
              </div>
            ) : showAnswer && !showWinnerPicker ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/game/board?sessionId=${sessionId}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <CloseIcon className="h-4 w-4" />
                  إغلاق
                </Link>

                <button
                  type="button"
                  onClick={() => setShowAnswer(false)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <QuestionIcon className="h-4 w-4" />
                  ارجع للسؤال
                </button>

                <button
                  type="button"
                  onClick={() => setShowWinnerPicker(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  <AnswerIcon className="h-4 w-4" />
                  أي فريق؟
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/game/board?sessionId=${sessionId}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <CloseIcon className="h-4 w-4" />
                  إغلاق
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setShowWinnerPicker(false);
                    setShowAnswer(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <QuestionIcon className="h-4 w-4" />
                  العودة للإجابة
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}