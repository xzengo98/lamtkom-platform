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

const TEAM_BLUE_AVATAR = "https://k.top4top.io/p_3739o1dbh1.png";
const TEAM_ORANGE_AVATAR = "https://l.top4top.io/p_3739qbt1f2.png";

const categoryVisuals: Record<
  string,
  {
    gradient: string;
  }
> = {
  history: { gradient: "from-amber-300/18 via-orange-400/10 to-transparent" },
  sports: { gradient: "from-emerald-300/18 via-green-400/10 to-transparent" },
  geography: { gradient: "from-sky-300/18 via-cyan-400/10 to-transparent" },
  science: { gradient: "from-violet-300/18 via-fuchsia-400/10 to-transparent" },
  movies: { gradient: "from-rose-300/18 via-pink-400/10 to-transparent" },
  islamic: { gradient: "from-yellow-300/18 via-amber-400/10 to-transparent" },
  default: { gradient: "from-slate-300/18 via-slate-400/10 to-transparent" },
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
        large ? "text-lg md:text-3xl" : "text-base md:text-lg",
        "[&_p]:my-0 [&_p]:mb-4 [&_p]:text-center [&_p]:leading-8 md:[&_p]:leading-10",
        "[&_h1]:text-center [&_h2]:text-center [&_h3]:text-center [&_h4]:text-center",
        "[&_img]:mx-auto [&_img]:my-4 [&_img]:block [&_img]:w-auto [&_img]:max-w-full [&_img]:max-h-[140px] md:[&_img]:max-h-[220px] [&_img]:rounded-[1rem] [&_img]:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        "[&_iframe]:mx-auto [&_iframe]:my-4 [&_iframe]:block [&_iframe]:w-full [&_iframe]:max-w-2xl [&_iframe]:max-h-[220px] [&_iframe]:rounded-[1rem]",
        "[&_video]:mx-auto [&_video]:my-4 [&_video]:block [&_video]:w-full [&_video]:max-w-2xl [&_video]:max-h-[220px] [&_video]:rounded-[1rem]",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

function TimerIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.6 1.6" />
      <path d="M9 3h6" />
      <path d="M12 3v2" />
    </svg>
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

function SparkIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
    </svg>
  );
}

function GamepadIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <rect x="4" y="8" width="16" height="8" rx="3" />
      <path d="M8 12h2" />
      <path d="M9 11v2" />
      <path d="M16.5 12h.01" />
      <path d="M18.5 12h.01" />
    </svg>
  );
}

function UserIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
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

function TeamMini({
  teamName,
  avatarUrl,
  accent,
}: {
  teamName: string;
  avatarUrl: string;
  accent: "blue" | "orange";
}) {
  const palette =
    accent === "orange"
      ? "border-orange-300/20 bg-orange-400/10 text-orange-100"
      : "border-cyan-300/20 bg-cyan-400/10 text-cyan-100";

  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${palette}`}
    >
      <img
        src={avatarUrl}
        alt={teamName}
        className="h-9 w-9 rounded-full border border-white/10 object-cover"
      />
      <div className="max-w-[90px] truncate text-xs font-black">{teamName}</div>
    </div>
  );
}

function TeamPortrait({
  teamName,
  avatarUrl,
  accent,
  compact = false,
}: {
  teamName: string;
  avatarUrl: string;
  accent: "blue" | "orange";
  compact?: boolean;
}) {
  const palette =
    accent === "orange"
      ? "border-orange-300/20 bg-orange-400/10 text-orange-100 shadow-[0_0_30px_rgba(251,146,60,0.16)]"
      : "border-cyan-300/20 bg-cyan-400/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.14)]";

  return (
    <div
      className={[
        "rounded-[1.4rem] border p-3 text-center",
        palette,
        compact ? "w-[84px]" : "w-[110px] md:w-[130px]",
      ].join(" ")}
    >
      <img
        src={avatarUrl}
        alt={teamName}
        className={`mx-auto rounded-full border border-white/10 object-cover shadow-[0_10px_24px_rgba(0,0,0,0.18)] ${
          compact ? "h-14 w-14" : "h-20 w-20 md:h-24 md:w-24"
        }`}
      />
      <div
        className={`mt-3 truncate font-black ${
          compact ? "text-[11px]" : "text-sm md:text-base"
        }`}
      >
        {teamName}
      </div>
    </div>
  );
}

function TeamCard({
  teamName,
  score,
  isLeading,
  isTurn,
  onIncrease,
  onDecrease,
  accent,
  avatarUrl,
  compact = false,
}: {
  teamName: string;
  score: number;
  isLeading: boolean;
  isTurn: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  accent: "blue" | "orange";
  avatarUrl: string;
  compact?: boolean;
}) {
  const palette =
    accent === "orange"
      ? {
          glow: "shadow-[0_0_0_1px_rgba(251,146,60,0.16),0_18px_50px_rgba(251,146,60,0.12)]",
          card: "border-orange-300/20 bg-[linear-gradient(180deg,rgba(53,30,15,0.94)_0%,rgba(18,10,5,0.98)_100%)]",
          chip: "border-orange-300/20 bg-orange-400/10 text-orange-100",
          btn: "border-orange-300/20 bg-orange-400/10 text-orange-100 hover:bg-orange-400/15",
          score: "text-orange-50",
          scoreGlow: "drop-shadow-[0_0_18px_rgba(251,146,60,0.18)]",
        }
      : {
          glow: "shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_18px_50px_rgba(34,211,238,0.10)]",
          card: "border-cyan-300/20 bg-[linear-gradient(180deg,rgba(7,45,67,0.94)_0%,rgba(4,15,28,0.98)_100%)]",
          chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
          btn: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15",
          score: "text-cyan-50",
          scoreGlow: "drop-shadow-[0_0_18px_rgba(34,211,238,0.18)]",
        };

  return (
    <div
      className={[
        "rounded-[1.5rem] border p-4 transition board-soft-float",
        compact ? "p-3" : "p-4",
        palette.card,
        palette.glow,
      ].join(" ")}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-md" />
            <img
              src={avatarUrl}
              alt={teamName}
              className={`relative rounded-full border border-white/10 object-cover shadow-[0_12px_24px_rgba(0,0,0,0.18)] ${
                compact ? "h-12 w-12" : "h-16 w-16"
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="text-[10px] font-bold text-white/55">لوحة الفريق</div>
            <div
              className={`truncate font-black text-white ${
                compact ? "text-base" : "text-xl"
              }`}
            >
              {teamName}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {isTurn ? (
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-black ${palette.chip}`}
            >
              الدور الآن
            </span>
          ) : null}

          {isLeading ? (
            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black text-emerald-100">
              متصدر
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onIncrease}
          className={`flex items-center justify-center rounded-full border font-black transition ${palette.btn} ${
            compact ? "h-10 w-10 text-2xl" : "h-12 w-12 text-3xl"
          }`}
        >
          +
        </button>

        <div className="text-center">
          <div
            className={[
              "font-black tracking-tight",
              compact ? "text-4xl" : "text-5xl",
              palette.score,
              palette.scoreGlow,
            ].join(" ")}
          >
            {score}
          </div>
          <div className="text-[11px] font-bold text-white/55">نقطة</div>
        </div>

        <button
          type="button"
          onClick={onDecrease}
          className={`flex items-center justify-center rounded-full border font-black transition ${palette.btn} ${
            compact ? "h-10 w-10 text-2xl" : "h-12 w-12 text-3xl"
          }`}
        >
          −
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
      aria-label={`سؤال ${points}`}
      className={[
        "group relative overflow-hidden rounded-[1.2rem] border transition duration-300",
        compact ? "min-h-[60px] px-1.5 py-2" : "min-h-[88px] px-2 py-3",
        disabled
          ? "cursor-not-allowed border-white/5 bg-[linear-gradient(180deg,rgba(2,8,23,0.84)_0%,rgba(2,8,23,0.96)_100%)] text-slate-500 opacity-70"
          : "border-cyan-300/10 bg-[linear-gradient(180deg,rgba(20,40,85,1)_0%,rgba(4,14,34,1)_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:border-cyan-300/30 hover:shadow-[0_18px_30px_rgba(34,211,238,0.14)]",
        active
          ? "border-cyan-300/50 bg-[linear-gradient(180deg,rgba(16,72,124,1)_0%,rgba(8,29,59,1)_100%)] shadow-[0_0_0_1px_rgba(34,211,238,0.3),0_20px_40px_rgba(34,211,238,0.16)]"
          : "",
      ].join(" ")}
    >
      {!disabled ? (
        <>
          <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_45%)] opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent opacity-60" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_100%)]" />
      )}

      <div className="relative flex h-full items-center justify-center">
        <div
          className={[
            "font-black tracking-tight",
            compact ? "text-[1.2rem] md:text-[1.3rem]" : "text-[1.8rem] md:text-[2rem]",
            used ? "text-slate-500/80" : "text-white",
          ].join(" ")}
        >
          {points}
        </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/90 p-2 md:p-6">
      <div className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.85rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_32%),linear-gradient(180deg,#071126_0%,#050b16_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.55)] md:h-[92vh]">
        <div className="shrink-0 border-b border-white/10 px-3 py-3 md:px-6 md:py-5">
          <div className="flex flex-col gap-4">
            <div className="hidden items-start justify-between md:flex">
              <TeamPortrait
                teamName={teamOne}
                avatarUrl={TEAM_BLUE_AVATAR}
                accent="blue"
                compact
              />

              <div className="flex flex-1 flex-col items-center px-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
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

                <div className="mt-3 text-center">
                  <h2 className="text-3xl font-black text-white md:text-5xl">
                    {!showAnswer && !showWinnerPicker
                      ? "السؤال"
                      : showAnswer && !showWinnerPicker
                        ? "الإجابة الصحيحة"
                        : "تحديد الفريق الفائز"}
                  </h2>
                </div>
              </div>

              <TeamPortrait
                teamName={teamTwo}
                avatarUrl={TEAM_ORANGE_AVATAR}
                accent="orange"
                compact
              />
            </div>

            <div className="md:hidden">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">
                  {openQuestion.categoryName}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-white/85">
                  {openQuestion.points} نقطة
                </span>
              </div>

              <div className="mt-3 text-center">
                <h2 className="text-3xl font-black text-white">السؤال</h2>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <TeamMini
                  teamName={teamOne}
                  avatarUrl={TEAM_BLUE_AVATAR}
                  accent="blue"
                />
                <TeamMini
                  teamName={teamTwo}
                  avatarUrl={TEAM_ORANGE_AVATAR}
                  accent="orange"
                />
              </div>
            </div>

            {!showAnswer && !showWinnerPicker ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,32,66,0.95)_0%,rgba(10,18,38,0.95)_100%)] p-4 md:p-5 shadow-[0_16px_35px_rgba(0,0,0,0.2)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-black text-white/75">
                    <TimerIcon className="h-5 w-5 text-cyan-300" />
                    <span>المؤقت</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {formatCountdown(timeLeft)}
                  </div>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-[width]"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={onToggleTimer}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/15"
                  >
                    <TimerIcon className="h-4 w-4" />
                    <span>{timerRunning ? "إيقاف الوقت" : "تشغيل الوقت"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onResetTimer}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                  >
                    <SparkIcon className="h-4 w-4" />
                    <span>إعادة المؤقت</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6">
          {!showAnswer && !showWinnerPicker ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-[#020817]/45 p-4 md:p-6">
              <RichContent html={openQuestion.question_text} large />
            </div>
          ) : showAnswer && !showWinnerPicker ? (
            <div className="rounded-[1.5rem] border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(7,35,25,0.88)_0%,rgba(4,15,10,0.95)_100%)] p-4 md:p-6 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
              <div className="mb-4 flex items-center justify-center gap-2 text-sm font-black text-emerald-100">
                <AnswerIcon className="h-4 w-4" />
                <span>الإجابة الصحيحة</span>
              </div>
              <RichContent html={openQuestion.answer_text} large />
            </div>
          ) : (
            <div>
              <div className="mb-5 text-center">
                <h3 className="text-2xl font-black text-white md:text-3xl">
                  أي فريق جاوب صح؟
                </h3>
                <p className="mt-2 text-sm text-white/65">
                  اختر الفريق الصحيح لإضافة النقاط مباشرة
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onAwardPoints("teamOne")}
                  disabled={modalBusy}
                  className="rounded-[1.35rem] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(7,45,67,0.94)_0%,rgba(4,15,28,0.98)_100%)] p-4 text-white shadow-[0_16px_35px_rgba(34,211,238,0.08)] transition hover:-translate-y-0.5 hover:bg-cyan-400/10 disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={TEAM_BLUE_AVATAR}
                      alt={teamOne}
                      className="h-16 w-16 rounded-full border border-white/10 object-cover shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                    />
                    <div className="text-right">
                      <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black text-cyan-100">
                        <UserIcon className="h-3.5 w-3.5" />
                        <span>الفريق</span>
                      </div>
                      <div className="text-2xl font-black">{teamOne}</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onAwardPoints("teamTwo")}
                  disabled={modalBusy}
                  className="rounded-[1.35rem] border border-orange-300/20 bg-[linear-gradient(180deg,rgba(53,30,15,0.94)_0%,rgba(18,10,5,0.98)_100%)] p-4 text-white shadow-[0_16px_35px_rgba(251,146,60,0.08)] transition hover:-translate-y-0.5 hover:bg-orange-400/10 disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={TEAM_ORANGE_AVATAR}
                      alt={teamTwo}
                      className="h-16 w-16 rounded-full border border-white/10 object-cover shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                    />
                    <div className="text-right">
                      <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-[11px] font-black text-orange-100">
                        <UserIcon className="h-3.5 w-3.5" />
                        <span>الفريق</span>
                      </div>
                      <div className="text-2xl font-black">{teamTwo}</div>
                    </div>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onAwardPoints("none")}
                disabled={modalBusy}
                className="mx-auto mt-4 block w-full max-w-md rounded-[1.2rem] border border-white/10 bg-white/5 px-5 py-4 text-lg font-black text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                ولا أحد
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 px-3 py-3 md:px-6 md:py-4">
          {!showAnswer && !showWinnerPicker ? (
            <div className="flex flex-wrap justify-center gap-3 md:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                <SparkIcon className="h-4 w-4" />
                <span>إغلاق</span>
              </button>
              <button
                type="button"
                onClick={onRevealAnswer}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                <AnswerIcon className="h-4 w-4" />
                <span>إظهار الإجابة</span>
              </button>
            </div>
          ) : showAnswer && !showWinnerPicker ? (
            <div className="flex flex-wrap justify-center gap-3 md:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                <SparkIcon className="h-4 w-4" />
                <span>إغلاق</span>
              </button>
              <button
                type="button"
                onClick={onBackToQuestion}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                <GamepadIcon className="h-4 w-4" />
                <span>ارجع للسؤال</span>
              </button>
              <button
                type="button"
                onClick={onGoToWinnerPicker}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                <CrownIcon className="h-4 w-4" />
                <span>أي فريق؟</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3 md:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                <SparkIcon className="h-4 w-4" />
                <span>إغلاق</span>
              </button>
              <button
                type="button"
                onClick={onBackToAnswer}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                <AnswerIcon className="h-4 w-4" />
                <span>العودة للإجابة</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/90 shadow-[0_8px_18px_rgba(0,0,0,0.14)]">
      {icon}
      <span>{label}</span>
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.09),transparent_18%),linear-gradient(180deg,#020617_0%,#020b1d_35%,#010617_100%)] text-white">
      <div className="mx-auto max-w-[1800px] px-2 py-2 md:px-5 md:py-5">
        <div
          className={[
            "relative rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,15,37,0.98)_0%,rgba(2,9,24,0.98)_100%)] shadow-[0_25px_80px_rgba(0,0,0,0.38)]",
            compactLandscape ? "p-2.5" : "p-3 md:p-4",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.9rem]">
            <div className="board-soft-glow absolute -right-20 top-10 h-72 w-72 rounded-full bg-cyan-400/8 blur-3xl" />
            <div className="board-soft-glow absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-violet-400/8 blur-3xl" />
            <div className="board-soft-glow absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-400/6 blur-3xl" />
          </div>

          <div
            className={[
              "relative mb-4 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,32,66,0.95)_0%,rgba(10,18,38,0.95)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
              compactLandscape ? "p-3" : "p-4 md:p-5",
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[10px] font-black tracking-[0.18em] text-cyan-300/90">
                  لوحة اللعبة
                </div>
                <h1
                  className={[
                    "mt-1 font-black text-white",
                    compactLandscape ? "text-lg" : "text-3xl md:text-5xl",
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
                <StatusPill
                  label={`الدور الآن: ${activeTurn === "teamOne" ? teamOne : teamTwo}`}
                  icon={<GamepadIcon className="h-4 w-4 text-cyan-300" />}
                />
                <StatusPill
                  label={`المتبقي: ${remainingCount} سؤال`}
                  icon={<TimerIcon className="h-4 w-4 text-white/80" />}
                />
                <StatusPill
                  label={`المتصدر: ${leaderLabel}`}
                  icon={<CrownIcon className="h-4 w-4 text-emerald-300" />}
                />
              </div>
            </div>
          </div>

          <div
            className={
              compactLandscape
                ? "relative grid gap-3 grid-cols-[175px_minmax(0,1fr)]"
                : "relative grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]"
            }
          >
            <aside className="order-1">
              <div
                className={
                  compactLandscape
                    ? "grid gap-3 grid-cols-1"
                    : "grid gap-4 sm:grid-cols-2 xl:grid-cols-1"
                }
              >
                <TeamCard
                  teamName={teamOne}
                  score={boardState.teamOneScore}
                  isLeading={teamOneLeading}
                  isTurn={activeTurn === "teamOne"}
                  onIncrease={() => adjustScore("teamOne", 100)}
                  onDecrease={() => adjustScore("teamOne", -100)}
                  accent="blue"
                  avatarUrl={TEAM_BLUE_AVATAR}
                  compact={compactLandscape}
                />

                <TeamCard
                  teamName={teamTwo}
                  score={boardState.teamTwoScore}
                  isLeading={teamTwoLeading}
                  isTurn={activeTurn === "teamTwo"}
                  onIncrease={() => adjustScore("teamTwo", 100)}
                  onDecrease={() => adjustScore("teamTwo", -100)}
                  accent="orange"
                  avatarUrl={TEAM_ORANGE_AVATAR}
                  compact={compactLandscape}
                />

                <div
                  className={[
                    "rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.95)_100%)]",
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
                  "overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,19,40,0.98)_0%,rgba(2,11,31,1)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
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
                            "relative overflow-hidden rounded-[1.2rem] border border-white/10 bg-gradient-to-b text-center shadow-[0_10px_24px_rgba(0,0,0,0.22)]",
                            visual.gradient,
                            compactLandscape ? "p-2" : "p-3",
                          ].join(" ")}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)] opacity-70" />

                          <div
                            className={`relative mx-auto flex items-center justify-center overflow-hidden rounded-[0.95rem] border border-white/10 bg-white/10 shadow-[0_8px_18px_rgba(0,0,0,0.18)] ${
                              compactLandscape ? "h-10 w-10" : "h-16 w-16"
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
                              "relative mt-3 font-black leading-5 text-white",
                              compactLandscape ? "text-[11px]" : "text-lg",
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

      <style>{`
        @keyframes boardGlow {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }

        @keyframes floatSoft {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .board-soft-glow {
          animation: boardGlow 4.8s ease-in-out infinite;
        }

        .board-soft-float {
          animation: floatSoft 5.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}