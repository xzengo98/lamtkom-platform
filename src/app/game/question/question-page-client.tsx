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

function normalizeBoardState(raw: Record<string, unknown> | null | undefined): BoardState {
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
  } catch { return null; }
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
  return <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>;
}
function PlayIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 6 10 6-10 6V6Z" /></svg>;
}
function PauseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5v14M14 5v14" /></svg>;
}
function RefreshIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>;
}
function QuestionIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5" /><path d="M9.75 9.25a2.5 2.5 0 1 1 4.1 2c-.75.6-1.35 1.05-1.35 2" /><path d="M12 16.5h.01" /></svg>;
}
function BoardIcon({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>;
}

// ─── RichContent (logic unchanged) ───────────────────────────────────────────

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
      className="question-rich-content [&_img]:mx-auto [&_img]:my-3 [&_img]:max-h-[260px] [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:border [&_img]:border-white/10 [&_img]:shadow-[0_12px_24px_rgba(0,0,0,0.28)] [&_iframe]:mx-auto [&_iframe]:my-3 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:max-w-3xl [&_iframe]:rounded-2xl [&_iframe]:border [&_iframe]:border-white/10 [&_video]:mx-auto [&_video]:my-3 [&_video]:w-full [&_video]:max-w-3xl [&_video]:rounded-2xl [&_video]:border [&_video]:border-white/10 [&_p]:my-2 [&_p]:leading-8 [&_ul]:my-3 [&_ul]:space-y-1.5 [&_li]:leading-7 text-center text-xl font-black text-white md:text-2xl lg:text-3xl"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

// ─── Timer ring — compact version ────────────────────────────────────────────

function TimerRing({
  timeLeft,
  total = QUESTION_TIMER_SECONDS,
  running,
}: {
  timeLeft: number;
  total?: number;
  running: boolean;
}) {
  const pct    = Math.max(0, Math.min(1, timeLeft / total));
  const radius = 32;
  const circ   = 2 * Math.PI * radius;
  const dash   = pct * circ;

  const color =
    pct > 0.5  ? "#22d3ee"
    : pct > 0.25 ? "#f59e0b"
    : "#ef4444";

  return (
    <div className="relative flex h-[88px] w-[88px] items-center justify-center sm:h-24 sm:w-24">
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-20 blur-md"
        style={{ background: `radial-gradient(circle, ${color}40, transparent 70%)` }}
      />
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80" fill="none">
        {/* Track */}
        <circle cx="40" cy="40" r={radius} stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
        {/* Progress */}
        <circle
          cx="40" cy="40" r={radius}
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.4s ease" }}
        />
      </svg>
      <div className="relative text-center">
        <div className="text-2xl font-black leading-none sm:text-3xl" style={{ color }}>
          {Math.ceil(timeLeft)}
        </div>
        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-white/28">
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
  const usedCount      = boardState.usedQuestionIds.length;
  const activeTurn     = (usedCount + 1) % 2 === 1 ? "teamOne" : "teamTwo";
  const activeTurnName = activeTurn === "teamOne" ? teamOne : teamTwo;
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

  // ── Phase ──
  const phaseLabel = !showAnswer && !showWinnerPicker
    ? "السؤال"
    : showAnswer && !showWinnerPicker
      ? "الإجابة الصحيحة"
      : "تحديد الفريق الفائز";

  const phaseColor = !showAnswer && !showWinnerPicker
    ? "text-white/60"
    : showAnswer && !showWinnerPicker
      ? "text-emerald-300"
      : "text-amber-300";

  // Points styling
  const pts = question.points;
  const ptsStyle =
    pts === 200 ? { bg: "bg-[#1b7001]/12 border-[#1b7001]/30", text: "text-[#6dbf47]" }
    : pts === 400 ? { bg: "bg-violet-400/10 border-violet-400/25", text: "text-violet-300" }
    : { bg: "bg-yellow-400/10 border-yellow-400/25", text: "text-yellow-300" };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">

      {/* Subtle grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto max-w-5xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SCORE + TIMER STRIP                                               */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="relative mb-3 overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(8,16,38,1)_0%,rgba(5,10,26,1)_100%)] shadow-[0_8px_32px_rgba(0,0,0,0.40)]">
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">

            {/* ── Team Two (برتقالي) ── */}
            <div className="relative overflow-hidden rounded-2xl border border-orange-400/14 bg-[linear-gradient(160deg,rgba(28,14,6,0.96)_0%,rgba(10,5,2,0.98)_100%)]">
              <div className="absolute inset-x-0 bottom-0 h-px bg-orange-400/15" />
              <div className="flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
                <div className="relative shrink-0">
                  <img
                    src={TEAM_ORANGE_AVATAR}
                    alt={teamTwo}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-orange-400/35 sm:h-13 sm:w-13"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[rgba(10,5,2,0.98)] bg-orange-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-bold text-orange-300/70 sm:text-xs">{teamTwo}</div>
                  <div className="text-2xl font-black text-white sm:text-3xl">{boardState.teamTwoScore}</div>
                </div>
              </div>
            </div>

            {/* ── Timer center ── */}
            <div className="flex flex-col items-center gap-1.5">
              <TimerRing
                timeLeft={boardState.timeLeft}
                total={QUESTION_TIMER_SECONDS}
                running={timerRunning && !showAnswer && !showWinnerPicker}
              />

              {/* Turn pill */}
              <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-center text-[10px] font-bold text-white/50 sm:px-3 sm:text-xs">
                الدور: <span className="text-white/80">{activeTurnName}</span>
              </div>

              {/* Timer controls */}
              {!showAnswer && !showWinnerPicker && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTimerRunning((prev) => !prev)}
                    aria-label={timerRunning ? "إيقاف الوقت" : "تشغيل الوقت"}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white active:scale-95"
                  >
                    {timerRunning ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    aria-label="إعادة ضبط الوقت"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white active:scale-95"
                  >
                    <RefreshIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Team One (أزرق) ── */}
            <div className="relative overflow-hidden rounded-2xl border border-cyan-400/14 bg-[linear-gradient(160deg,rgba(6,14,34,0.96)_0%,rgba(3,7,20,0.98)_100%)]">
              <div className="absolute inset-x-0 bottom-0 h-px bg-cyan-400/15" />
              <div className="flex flex-row-reverse items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
                <div className="relative shrink-0">
                  <img
                    src={TEAM_BLUE_AVATAR}
                    alt={teamOne}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-cyan-400/35 sm:h-13 sm:w-13"
                  />
                  <div className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-[rgba(3,7,20,0.98)] bg-cyan-400" />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <div className="truncate text-[11px] font-bold text-cyan-300/70 sm:text-xs">{teamOne}</div>
                  <div className="text-2xl font-black text-white sm:text-3xl">{boardState.teamOneScore}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MAIN QUESTION CARD                                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,22,48,0.97)_0%,rgba(5,10,24,0.99)_100%)] shadow-[0_16px_50px_rgba(0,0,0,0.38)]">

          {/* Card header — compact pill row */}
          <div className="flex items-center justify-between border-b border-white/6 bg-white/[0.025] px-4 py-2.5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/45">
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                {category?.name ?? "فئة"}
              </span>

              {/* Points */}
              <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${ptsStyle.bg} ${ptsStyle.text}`}>
                {pts} نقطة
              </span>
            </div>

            {/* Phase */}
            <span className={`rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] font-black ${phaseColor}`}>
              {phaseLabel}
            </span>
          </div>

          {/* Card body */}
          <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">

            {/* ── Phase: Question ── */}
            {!showAnswer && !showWinnerPicker && (
              <div className="space-y-3">
                <RichContent html={question.question_text} />
                {yearToleranceLabel && (
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/8 px-4 py-1.5 text-xs font-black text-amber-300">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-400/15 text-[10px]">±</span>
                      {yearToleranceLabel}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Phase: Answer ── */}
            {showAnswer && !showWinnerPicker && (
              <div className="space-y-3">
                {/* Answer label */}
                <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2">
                  <AnswerIcon className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-black text-emerald-300">الإجابة الصحيحة</span>
                </div>
                <RichContent html={question.answer_text} />
                {yearToleranceLabel && (
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/8 px-4 py-1.5 text-xs font-black text-amber-300">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-400/15 text-[10px]">±</span>
                      {yearToleranceLabel}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Phase: Winner picker ── */}
            {showWinnerPicker && (
              <div>
                <h3 className="mb-4 text-center text-lg font-black text-white sm:text-xl md:text-2xl">
                  أي فريق جاوب صح؟
                </h3>
                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">

                  {/* الفريق الأزرق */}
                  <button
                    type="button"
                    onClick={() => handleAwardPoints("teamOne")}
                    disabled={modalBusy}
                    className="group relative overflow-hidden rounded-[1.4rem] border border-cyan-400/20 bg-[linear-gradient(160deg,rgba(6,38,60,0.96)_0%,rgba(3,12,28,0.98)_100%)] p-4 text-white transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-[0_16px_36px_rgba(34,211,238,0.16)] disabled:opacity-50 active:scale-[0.98]"
                  >
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400 opacity-65" />
                    <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-cyan-400/25 bg-cyan-400/10 shadow-[0_0_18px_rgba(34,211,238,0.15)]">
                      <img src={TEAM_BLUE_AVATAR} alt={teamOne} className="h-11 w-11 object-contain" />
                    </div>
                    <div className="text-base font-black sm:text-lg">{teamOne}</div>
                    <div className="mt-0.5 text-xs font-bold text-cyan-400/65">{boardState.teamOneScore} نقطة</div>
                  </button>

                  {/* لا أحد */}
                  <button
                    type="button"
                    onClick={() => handleAwardPoints("none")}
                    disabled={modalBusy}
                    className="group relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.015)_100%)] p-4 text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/6 disabled:opacity-50 active:scale-[0.98]"
                  >
                    <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <img src={NONE_AVATAR} alt="لا أحد" className="h-10 w-10 object-contain opacity-45" />
                    </div>
                    <div className="text-base font-black text-white/55 sm:text-lg">لا أحد</div>
                    <div className="mt-0.5 text-xs font-bold text-white/22">بدون نقاط</div>
                  </button>

                  {/* الفريق البرتقالي */}
                  <button
                    type="button"
                    onClick={() => handleAwardPoints("teamTwo")}
                    disabled={modalBusy}
                    className="group relative overflow-hidden rounded-[1.4rem] border border-orange-400/20 bg-[linear-gradient(160deg,rgba(46,22,8,0.96)_0%,rgba(14,7,3,0.98)_100%)] p-4 text-white transition duration-200 hover:-translate-y-0.5 hover:border-orange-400/40 hover:shadow-[0_16px_36px_rgba(251,146,60,0.16)] disabled:opacity-50 active:scale-[0.98]"
                  >
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-orange-400 opacity-65" />
                    <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-orange-400/25 bg-orange-400/10 shadow-[0_0_18px_rgba(251,146,60,0.15)]">
                      <img src={TEAM_ORANGE_AVATAR} alt={teamTwo} className="h-11 w-11 object-contain" />
                    </div>
                    <div className="text-base font-black sm:text-lg">{teamTwo}</div>
                    <div className="mt-0.5 text-xs font-bold text-orange-400/65">{boardState.teamTwoScore} نقطة</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom action bar ── */}
          <div className="border-t border-white/6 bg-white/[0.025] px-4 py-3 sm:px-6">

            {/* Phase: Question */}
            {!showAnswer && !showWinnerPicker && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-2.5">
                <Link
                  href={`/game/board?sessionId=${sessionId}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  <BoardIcon className="h-4 w-4" />
                  لوحة اللعب
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-black text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.25)] transition hover:bg-cyan-400 active:scale-[0.98] sm:w-auto"
                >
                  <AnswerIcon className="h-4 w-4" />
                  إظهار الإجابة
                </button>
              </div>
            )}

            {/* Phase: Answer */}
            {showAnswer && !showWinnerPicker && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-2.5">
                <Link
                  href={`/game/board?sessionId=${sessionId}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  <BoardIcon className="h-4 w-4" />
                  لوحة اللعب
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAnswer(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  <QuestionIcon className="h-4 w-4" />
                  ارجع للسؤال
                </button>
                <button
                  type="button"
                  onClick={() => setShowWinnerPicker(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-black text-white shadow-[0_4px_16px_rgba(52,211,153,0.25)] transition hover:bg-emerald-400 active:scale-[0.98] sm:w-auto"
                >
                  <AnswerIcon className="h-4 w-4" />
                  أي فريق؟
                </button>
              </div>
            )}

            {/* Phase: Winner picker */}
            {showWinnerPicker && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-2.5">
                <Link
                  href={`/game/board?sessionId=${sessionId}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white active:scale-[0.98] sm:w-auto"
                >
                  <BoardIcon className="h-4 w-4" />
                  لوحة اللعب
                </Link>
                <button
                  type="button"
                  onClick={() => { setShowWinnerPicker(false); setShowAnswer(true); }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white active:scale-[0.98] sm:w-auto"
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