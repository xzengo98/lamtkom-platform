"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// ─── Types (unchanged) ────────────────────────────────────────────────────────

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

// ─── Constants (unchanged) ────────────────────────────────────────────────────

const QUESTION_TIMER_SECONDS = 60;
const TEAM_BLUE_AVATAR   = "https://k.top4top.io/p_3739o1dbh1.png";
const TEAM_ORANGE_AVATAR = "https://l.top4top.io/p_3739qbt1f2.png";
const NONE_AVATAR        = "https://www.svgrepo.com/show/361654/value-none.svg";

// ─── State helpers (unchanged) ────────────────────────────────────────────────

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
    teamOneScore:     typeof raw?.teamOneScore === "number" ? raw.teamOneScore : 0,
    teamTwoScore:     typeof raw?.teamTwoScore === "number" ? raw.teamTwoScore : 0,
    usedQuestionIds:  Array.isArray(raw?.usedQuestionIds) ? raw.usedQuestionIds.map((v) => String(v)) : [],
    questionResults,
    openQuestionId:   typeof raw?.openQuestionId === "string" ? raw.openQuestionId : null,
    showAnswer:       Boolean(raw?.showAnswer ?? false),
    showWinnerPicker: Boolean(raw?.showWinnerPicker ?? false),
    timeLeft:         typeof raw?.timeLeft === "number" && raw.timeLeft >= 0 ? raw.timeLeft : QUESTION_TIMER_SECONDS,
    savedAt:          typeof raw?.savedAt === "number" ? raw.savedAt : 0,
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
  try { window.localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
}

function getYearToleranceLabel(question: QuestionRow) {
  const before = Number(question.year_tolerance_before ?? 0);
  const after  = Number(question.year_tolerance_after  ?? 0);
  if (before <= 0 && after <= 0) return "";
  if (before > 0 && after > 0) {
    if (before === after) return `السماحية: ±${before} سنة`;
    return `السماحية: من ${before} سنة قبل إلى ${after} سنة بعد`;
  }
  if (before > 0) return `السماحية: حتى ${before} سنة قبل`;
  return `السماحية: حتى ${after} سنة بعد`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function AnswerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function PlayIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 6 10 6-10 6V6Z" />
    </svg>
  );
}

function PauseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 5v14M14 5v14" />
    </svg>
  );
}

function RefreshIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
    </svg>
  );
}

function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}

function QuestionIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.75 9.25a2.5 2.5 0 1 1 4.1 2c-.75.6-1.35 1.05-1.35 2" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function BoardIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

// ─── RichContent (unchanged logic, improved empty state) ──────────────────────

function RichContent({ html }: { html: string | null | undefined }) {
  const safeHtml = html?.trim();

  if (!safeHtml) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center text-white/40">
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

// ─── Timer ring component ──────────────────────────────────────────────────────

function TimerRing({
  timeLeft,
  total = QUESTION_TIMER_SECONDS,
  running,
}: {
  timeLeft: number;
  total?: number;
  running: boolean;
}) {
  const pct     = Math.max(0, Math.min(1, timeLeft / total));
  const radius  = 38;
  const circ    = 2 * Math.PI * radius;
  const dash    = pct * circ;

  const color =
    pct > 0.5 ? "#22d3ee"
    : pct > 0.25 ? "#f59e0b"
    : "#ef4444";

  return (
    <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96" fill="none">
        {/* Track */}
        <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        {/* Progress */}
        <circle
          cx="48" cy="48" r={radius}
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.4s ease" }}
        />
      </svg>
      {/* Number */}
      <div className="relative text-center">
        <div
          className="text-3xl font-black leading-none sm:text-4xl"
          style={{ color }}
        >
          {Math.ceil(timeLeft)}
        </div>
        <div className="mt-0.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
          {running ? "يعمل" : "متوقف"}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuestionPageClient({
  sessionId,
  teamOne,
  teamTwo,
  initialBoardState,
  question,
  category,
}: Props) {
  const router   = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const storageKey = `seenjeem-board-state:${sessionId}`;

  const initialState = useMemo(() => normalizeBoardState(initialBoardState), [initialBoardState]);

  const [boardState,       setBoardState]       = useState(initialState);
  const [timerRunning,     setTimerRunning]      = useState(true);
  const [modalBusy,        setModalBusy]         = useState(false);
  const [showAnswer,       setShowAnswer]        = useState(false);
  const [showWinnerPicker, setShowWinnerPicker]  = useState(false);

  const saveTimeoutRef  = useRef<number | null>(null);
  const awardLockedRef  = useRef(false);

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
        .update({ board_state: { ...boardState, savedAt: boardState.savedAt || Date.now() } })
        .eq("id", sessionId);
    }, 350);
    return () => { if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current); };
  }, [boardState, sessionId, storageKey, supabase]);

  // ── Timer countdown (unchanged) ──
  useEffect(() => {
    if (!timerRunning || showAnswer || showWinnerPicker) return;
    const timer = window.setInterval(() => {
      setBoardState((prev) => {
        if (prev.timeLeft <= 1) {
          window.clearInterval(timer);
          return { ...prev, timeLeft: 0, savedAt: Date.now() };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1, savedAt: Date.now() };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, showAnswer, showWinnerPicker]);

  // ── Derived state (unchanged) ──
  const usedCount       = boardState.usedQuestionIds.length;
  const activeTurn      = (usedCount + 1) % 2 === 1 ? "teamOne" : "teamTwo";
  const activeTurnName  = activeTurn === "teamOne" ? teamOne : teamTwo;
  const yearToleranceLabel = getYearToleranceLabel(question);

  function updateState(updater: (prev: BoardState) => BoardState) {
    setBoardState((prev) => ({ ...updater(prev), savedAt: Date.now() }));
  }

  function handleResetTimer() {
    updateState((prev) => ({ ...prev, timeLeft: QUESTION_TIMER_SECONDS }));
  }

  async function handleAwardPoints(winner: "teamOne" | "teamTwo" | "none") {
    if (modalBusy || awardLockedRef.current) return;
    awardLockedRef.current = true;
    setModalBusy(true);
    setTimerRunning(false);

    updateState((prev) => {
      if (prev.usedQuestionIds.includes(question.id)) return prev;
      return {
        ...prev,
        teamOneScore:     winner === "teamOne" ? prev.teamOneScore + question.points : prev.teamOneScore,
        teamTwoScore:     winner === "teamTwo" ? prev.teamTwoScore + question.points : prev.teamTwoScore,
        usedQuestionIds:  [...prev.usedQuestionIds, question.id],
        questionResults:  { ...prev.questionResults, [question.id]: winner },
        openQuestionId:   null,
        showAnswer:       false,
        showWinnerPicker: false,
        timeLeft:         QUESTION_TIMER_SECONDS,
      };
    });

    router.push(`/game/board?sessionId=${sessionId}`);
  }

  // ── Phase label ──
  const phaseLabel = !showAnswer && !showWinnerPicker
    ? "السؤال"
    : showAnswer && !showWinnerPicker
      ? "الإجابة الصحيحة"
      : "تحديد الفريق الفائز";

  const phaseColor = !showAnswer && !showWinnerPicker
    ? "text-white"
    : showAnswer && !showWinnerPicker
      ? "text-cyan-300"
      : "text-amber-300";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-3 py-4 sm:px-5 sm:py-6 md:px-6">

        {/* ── Score + Timer strip ──────────────────────────────────────── */}
        <section className="mb-4 overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_100%)] sm:mb-5">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute left-0 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-2xl" />
          <div className="pointer-events-none absolute right-0 h-40 w-40 translate-x-1/2 rounded-full bg-orange-500/6 blur-2xl" />

          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-4 sm:gap-4 sm:px-5 sm:py-5">

            {/* Team One (أزرق) — يمين */}
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/6 p-3 text-center sm:p-4">
              <div className="mb-1.5 flex justify-center">
                <img src={TEAM_BLUE_AVATAR} alt={teamOne} className="h-8 w-8 rounded-full object-contain sm:h-10 sm:w-10" />
              </div>
              <div className="truncate text-xs font-bold text-cyan-400/70 sm:text-sm">{teamOne}</div>
              <div className="mt-1 text-xl font-black text-cyan-300 sm:text-2xl md:text-3xl">
                {boardState.teamOneScore}
              </div>
            </div>

            {/* Timer — وسط */}
            <div className="flex flex-col items-center gap-2">
              <TimerRing
                timeLeft={boardState.timeLeft}
                total={QUESTION_TIMER_SECONDS}
                running={timerRunning && !showAnswer && !showWinnerPicker}
              />

              {/* Turn indicator */}
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-center text-[10px] font-bold text-white/55 sm:text-xs">
                الدور: <span className="text-white/80">{activeTurnName}</span>
              </div>

              {/* Timer controls — visible only on question phase */}
              {!showAnswer && !showWinnerPicker && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTimerRunning((prev) => !prev)}
                    aria-label={timerRunning ? "إيقاف الوقت" : "تشغيل الوقت"}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 transition hover:bg-cyan-400/18 active:scale-95"
                  >
                    {timerRunning ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetTimer}
                    aria-label="إعادة ضبط الوقت"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 active:scale-95"
                  >
                    <RefreshIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Team Two (برتقالي) — يسار */}
            <div className="rounded-2xl border border-orange-400/15 bg-orange-400/6 p-3 text-center sm:p-4">
              <div className="mb-1.5 flex justify-center">
                <img src={TEAM_ORANGE_AVATAR} alt={teamTwo} className="h-8 w-8 rounded-full object-contain sm:h-10 sm:w-10" />
              </div>
              <div className="truncate text-xs font-bold text-orange-400/70 sm:text-sm">{teamTwo}</div>
              <div className="mt-1 text-xl font-black text-orange-300 sm:text-2xl md:text-3xl">
                {boardState.teamTwoScore}
              </div>
            </div>
          </div>
        </section>

        {/* ── Main content card ────────────────────────────────────────── */}
        <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(16,27,52,0.97)_0%,rgba(6,12,28,0.99)_100%)] shadow-[0_20px_50px_rgba(0,0,0,0.32)]">

          {/* Card header */}
          <div className="border-b border-white/8 bg-white/[0.03] px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-2">

              {/* Category badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white/50">
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                {category?.name ?? "فئة"}
              </span>

              {/* Points badge */}
              {(() => {
                const pts = question.points;
                const color =
                  pts === 200 ? "border-[#1b7001]/30 bg-[#1b7001]/10 text-[#6dbf47]"
                  : pts === 400 ? "border-violet-400/25 bg-violet-400/10 text-violet-300"
                  : "border-yellow-400/25 bg-yellow-400/10 text-yellow-300";
                return (
                  <span className={`rounded-full border px-3.5 py-1.5 text-xs font-black ${color}`}>
                    {pts} نقطة
                  </span>
                );
              })()}

              {/* Phase badge */}
              <span className={`rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-black ${phaseColor}`}>
                {phaseLabel}
              </span>
            </div>
          </div>

          {/* Card body */}
          <div className="px-4 py-8 sm:px-6 sm:py-10 md:px-8">

            {/* ── Phase: Question ── */}
            {!showAnswer && !showWinnerPicker && (
              <div className="space-y-4">
                <RichContent html={question.question_text} />
                {yearToleranceLabel && (
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/8 px-4 py-2 text-xs font-black text-amber-300 sm:text-sm">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/15 text-[11px]">±</span>
                      {yearToleranceLabel}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Phase: Answer ── */}
            {showAnswer && !showWinnerPicker && (
              <div className="space-y-4">
                {/* Answer label bar */}
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/15 bg-cyan-400/6 px-4 py-2.5">
                  <AnswerIcon className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-black text-cyan-300">الإجابة الصحيحة</span>
                </div>

                <RichContent html={question.answer_text} />

                {yearToleranceLabel && (
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/8 px-4 py-2 text-xs font-black text-amber-300 sm:text-sm">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/15 text-[11px]">±</span>
                      {yearToleranceLabel}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Phase: Winner picker ── */}
            {showWinnerPicker && (
              <div>
                <h3 className="mb-6 text-center text-xl font-black text-white sm:text-2xl md:text-3xl">
                  أي فريق جاوب صح؟
                </h3>

                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">

                  {/* الفريق الأزرق */}
                  <button
                    type="button"
                    onClick={() => handleAwardPoints("teamOne")}
                    disabled={modalBusy}
                    className="group relative overflow-hidden rounded-[1.5rem] border border-cyan-400/20 bg-[linear-gradient(160deg,rgba(7,45,67,0.94)_0%,rgba(4,15,28,0.98)_100%)] p-5 text-white shadow-[0_16px_35px_rgba(34,211,238,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/35 hover:shadow-[0_20px_40px_rgba(34,211,238,0.14)] disabled:opacity-50 active:scale-[0.98]"
                  >
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400 opacity-60" />
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-cyan-400/20 bg-cyan-400/10">
                      <img src={TEAM_BLUE_AVATAR} alt={teamOne} className="h-12 w-12 object-contain" />
                    </div>
                    <div className="text-lg font-black sm:text-xl">{teamOne}</div>
                    <div className="mt-1 text-sm font-bold text-cyan-400/70">{boardState.teamOneScore} نقطة</div>
                  </button>

                  {/* لا أحد */}
                  <button
                    type="button"
                    onClick={() => handleAwardPoints("none")}
                    disabled={modalBusy}
                    className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-5 text-white shadow-[0_16px_35px_rgba(255,255,255,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/8 disabled:opacity-50 active:scale-[0.98]"
                  >
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <img src={NONE_AVATAR} alt="لا أحد" className="h-10 w-10 object-contain opacity-50" />
                    </div>
                    <div className="text-lg font-black text-white/60 sm:text-xl">لا أحد</div>
                    <div className="mt-1 text-sm font-bold text-white/25">بدون نقاط</div>
                  </button>

                  {/* الفريق البرتقالي */}
                  <button
                    type="button"
                    onClick={() => handleAwardPoints("teamTwo")}
                    disabled={modalBusy}
                    className="group relative overflow-hidden rounded-[1.5rem] border border-orange-400/20 bg-[linear-gradient(160deg,rgba(53,30,15,0.94)_0%,rgba(18,10,5,0.98)_100%)] p-5 text-white shadow-[0_16px_35px_rgba(251,146,60,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-orange-400/35 hover:shadow-[0_20px_40px_rgba(251,146,60,0.14)] disabled:opacity-50 active:scale-[0.98]"
                  >
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-orange-400 opacity-60" />
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-orange-400/20 bg-orange-400/10">
                      <img src={TEAM_ORANGE_AVATAR} alt={teamTwo} className="h-12 w-12 object-contain" />
                    </div>
                    <div className="text-lg font-black sm:text-xl">{teamTwo}</div>
                    <div className="mt-1 text-sm font-bold text-orange-400/70">{boardState.teamTwoScore} نقطة</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom actions ───────────────────────────────────────────── */}
          <div className="border-t border-white/8 bg-white/[0.03] px-4 py-4 sm:px-6">

            {/* Phase: Question */}
            {!showAnswer && !showWinnerPicker && (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                <Link
                  href={`/game/board?sessionId=${sessionId}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  <BoardIcon className="h-4 w-4" />
                  لوحة اللعب
                </Link>

                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.22)] transition hover:bg-cyan-400 active:scale-[0.98] sm:w-auto"
                >
                  <AnswerIcon className="h-4 w-4" />
                  إظهار الإجابة
                </button>
              </div>
            )}

            {/* Phase: Answer */}
            {showAnswer && !showWinnerPicker && (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                <Link
                  href={`/game/board?sessionId=${sessionId}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  <BoardIcon className="h-4 w-4" />
                  لوحة اللعب
                </Link>

                <button
                  type="button"
                  onClick={() => setShowAnswer(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  <QuestionIcon className="h-4 w-4" />
                  ارجع للسؤال
                </button>

                <button
                  type="button"
                  onClick={() => setShowWinnerPicker(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.22)] transition hover:bg-cyan-400 active:scale-[0.98] sm:w-auto"
                >
                  <AnswerIcon className="h-4 w-4" />
                  أي فريق؟
                </button>
              </div>
            )}

            {/* Phase: Winner picker */}
            {showWinnerPicker && (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                <Link
                  href={`/game/board?sessionId=${sessionId}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  <BoardIcon className="h-4 w-4" />
                  لوحة اللعب
                </Link>

                <button
                  type="button"
                  onClick={() => { setShowWinnerPicker(false); setShowAnswer(true); }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white active:scale-[0.98] sm:w-auto"
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