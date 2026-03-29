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

function RichContent({
  html,
}: {
  html: string | null | undefined;
}) {
  const safeHtml = html?.trim();

  if (!safeHtml) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
        لا يوجد محتوى محفوظ.
      </div>
    );
  }

  return (
    <div
      className={[
        "max-w-none text-center text-white text-lg md:text-3xl",
        "[&_p]:my-0 [&_p]:mb-6 [&_p]:text-center [&_p]:leading-8 md:[&_p]:leading-10",
        "[&_h1]:text-center [&_h2]:text-center [&_h3]:text-center [&_h4]:text-center",
        "[&_img]:mx-auto [&_img]:my-6 [&_img]:block [&_img]:w-auto [&_img]:max-w-full [&_img]:max-h-[220px] md:[&_img]:max-h-[320px] [&_img]:rounded-[1rem] [&_img]:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
      ].join(" ")}
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
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
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

  const [boardState, setBoardState] = useState<BoardState>(initialState);
  const [timerRunning, setTimerRunning] = useState(false);
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
    setTimerRunning(false);

    updateState((prev) => {
      const nextUsed = prev.usedQuestionIds.includes(question.id)
        ? prev.usedQuestionIds
        : [...prev.usedQuestionIds, question.id];

      return {
        ...prev,
        teamOneScore:
          winner === "teamOne" ? prev.teamOneScore + question.points : prev.teamOneScore,
        teamTwoScore:
          winner === "teamTwo" ? prev.teamTwoScore + question.points : prev.teamTwoScore,
        usedQuestionIds: nextUsed,
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_24%),linear-gradient(180deg,#071126_0%,#040b18_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 py-3 md:px-6 md:py-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(90deg,rgba(8,37,66,0.96)_0%,rgba(10,17,40,0.96)_50%,rgba(54,24,10,0.96)_100%)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex items-center gap-3 rounded-[1rem] border border-cyan-300/15 bg-cyan-400/5 p-3">
              <img
                src={TEAM_BLUE_AVATAR}
                alt={teamOne}
                className="h-10 w-10 rounded-full border border-white/10 object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-cyan-100">
                  {teamOne}
                </div>
              </div>
            </div>

            <div className="mx-auto flex min-w-[110px] flex-col items-center rounded-[999px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.22)]">
              <div className="text-[11px] font-black text-white/70">المؤقت</div>
              <div className="text-3xl font-black text-amber-200">
                {Math.ceil(boardState.timeLeft)}
              </div>
              <div className="mt-1 text-[11px] font-black text-white/70">
                {activeTurnName}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 rounded-[1rem] border border-orange-300/15 bg-orange-400/5 p-3">
              <div className="min-w-0 text-right">
                <div className="truncate text-sm font-black text-orange-100">
                  {teamTwo}
                </div>
              </div>
              <img
                src={TEAM_ORANGE_AVATAR}
                alt={teamTwo}
                className="h-10 w-10 rounded-full border border-white/10 object-cover"
              />
            </div>
          </div>

          {!showAnswer && !showWinnerPicker ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setTimerRunning((prev) => !prev)}
                aria-label={timerRunning ? "إيقاف الوقت" : "تشغيل الوقت"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/15"
              >
                {timerRunning ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M8 5v14l11-7-11-7Z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetTimer}
                aria-label="إعادة المؤقت"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v5h5" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">
            {category?.name ?? "فئة"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-white/85">
            {question.points} نقطة
          </span>
        </div>

        <div className="mt-4 text-center">
          <h1 className="text-4xl font-black md:text-6xl">
            {!showAnswer && !showWinnerPicker
              ? "السؤال"
              : showAnswer && !showWinnerPicker
                ? "الإجابة الصحيحة"
                : "تحديد الفريق الفائز"}
          </h1>
        </div>

        <div className="mt-5 flex-1">
          {!showAnswer && !showWinnerPicker ? (
            <div className="rounded-[1.45rem] border border-white/10 bg-[#020817]/45 p-4 md:p-6">
              <RichContent html={question.question_text} />
            </div>
          ) : showAnswer && !showWinnerPicker ? (
            <div className="rounded-[1.45rem] border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(7,35,25,0.88)_0%,rgba(4,15,10,0.95)_100%)] p-4 md:p-6 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
              <div className="mb-4 flex items-center justify-center gap-2 text-sm font-black text-emerald-100">
                <AnswerIcon className="h-4 w-4" />
                <span>الإجابة الصحيحة</span>
              </div>
              <RichContent html={question.answer_text} />
            </div>
          ) : (
            <div>
              <div className="mb-5 text-center">
                <h3 className="text-2xl font-black text-white md:text-3xl">
                  أي فريق جاوب صح؟
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleAwardPoints("teamOne")}
                  disabled={modalBusy}
                  className="rounded-[1.35rem] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(7,45,67,0.94)_0%,rgba(4,15,28,0.98)_100%)] p-4 text-white shadow-[0_16px_35px_rgba(34,211,238,0.08)] transition hover:-translate-y-0.5 hover:bg-cyan-400/10 disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={TEAM_BLUE_AVATAR}
                      alt={teamOne}
                      className="h-16 w-16 rounded-full border border-white/10 object-cover"
                    />
                    <div className="text-right">
                      <div className="text-2xl font-black">{teamOne}</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAwardPoints("teamTwo")}
                  disabled={modalBusy}
                  className="rounded-[1.35rem] border border-orange-300/20 bg-[linear-gradient(180deg,rgba(53,30,15,0.94)_0%,rgba(18,10,5,0.98)_100%)] p-4 text-white shadow-[0_16px_35px_rgba(251,146,60,0.08)] transition hover:-translate-y-0.5 hover:bg-orange-400/10 disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={TEAM_ORANGE_AVATAR}
                      alt={teamTwo}
                      className="h-16 w-16 rounded-full border border-white/10 object-cover"
                    />
                    <div className="text-right">
                      <div className="text-2xl font-black">{teamTwo}</div>
                    </div>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleAwardPoints("none")}
                disabled={modalBusy}
                className="mx-auto mt-4 block w-full max-w-md rounded-[1.2rem] border border-white/10 bg-white/5 px-5 py-4 text-lg font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                ولا أحد
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
          {!showAnswer && !showWinnerPicker ? (
            <>
              <Link
                href={`/game/board?sessionId=${sessionId}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                إغلاق
              </Link>
              <button
                type="button"
                onClick={() => setShowAnswer(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                إظهار الإجابة
              </button>
            </>
          ) : showAnswer && !showWinnerPicker ? (
            <>
              <Link
                href={`/game/board?sessionId=${sessionId}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                إغلاق
              </Link>
              <button
                type="button"
                onClick={() => setShowAnswer(false)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                ارجع للسؤال
              </button>
              <button
                type="button"
                onClick={() => setShowWinnerPicker(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                أي فريق؟
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/game/board?sessionId=${sessionId}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
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
                العودة للإجابة
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}