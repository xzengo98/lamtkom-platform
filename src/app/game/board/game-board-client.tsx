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

const TEAM_BLUE_AVATAR = "https://k.top4top.io/p_3739o1dbh1.png";
const TEAM_ORANGE_AVATAR = "https://l.top4top.io/p_3739qbt1f2.png";

const categoryVisuals: Record<
  string,
  {
    glow: string;
    header: string;
    body: string;
  }
> = {
  history: {
    glow: "shadow-[0_0_0_1px_rgba(251,191,36,0.16),0_18px_50px_rgba(245,158,11,0.12)]",
    header:
      "bg-[linear-gradient(180deg,rgba(80,205,255,1)_0%,rgba(34,150,214,1)_100%)]",
    body:
      "bg-[linear-gradient(180deg,rgba(228,234,242,0.98)_0%,rgba(180,191,208,0.96)_100%)]",
  },
  geography: {
    glow: "shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_18px_50px_rgba(14,165,233,0.13)]",
    header:
      "bg-[linear-gradient(180deg,rgba(80,205,255,1)_0%,rgba(34,150,214,1)_100%)]",
    body:
      "bg-[linear-gradient(180deg,rgba(230,236,245,0.98)_0%,rgba(177,189,207,0.96)_100%)]",
  },
  islamic: {
    glow: "shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_18px_50px_rgba(5,150,105,0.13)]",
    header:
      "bg-[linear-gradient(180deg,rgba(80,205,255,1)_0%,rgba(34,150,214,1)_100%)]",
    body:
      "bg-[linear-gradient(180deg,rgba(232,237,245,0.98)_0%,rgba(184,194,211,0.96)_100%)]",
  },
  sports: {
    glow: "shadow-[0_0_0_1px_rgba(52,211,153,0.18),0_18px_50px_rgba(16,185,129,0.13)]",
    header:
      "bg-[linear-gradient(180deg,rgba(80,205,255,1)_0%,rgba(34,150,214,1)_100%)]",
    body:
      "bg-[linear-gradient(180deg,rgba(231,237,245,0.98)_0%,rgba(182,193,209,0.96)_100%)]",
  },
  science: {
    glow: "shadow-[0_0_0_1px_rgba(167,139,250,0.18),0_18px_50px_rgba(139,92,246,0.13)]",
    header:
      "bg-[linear-gradient(180deg,rgba(80,205,255,1)_0%,rgba(34,150,214,1)_100%)]",
    body:
      "bg-[linear-gradient(180deg,rgba(231,236,245,0.98)_0%,rgba(181,190,208,0.96)_100%)]",
  },
  movies: {
    glow: "shadow-[0_0_0_1px_rgba(244,114,182,0.18),0_18px_50px_rgba(236,72,153,0.13)]",
    header:
      "bg-[linear-gradient(180deg,rgba(80,205,255,1)_0%,rgba(34,150,214,1)_100%)]",
    body:
      "bg-[linear-gradient(180deg,rgba(231,236,245,0.98)_0%,rgba(181,190,208,0.96)_100%)]",
  },
  technology: {
    glow: "shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_18px_50px_rgba(37,99,235,0.13)]",
    header:
      "bg-[linear-gradient(180deg,rgba(80,205,255,1)_0%,rgba(34,150,214,1)_100%)]",
    body:
      "bg-[linear-gradient(180deg,rgba(232,237,245,0.98)_0%,rgba(181,190,208,0.96)_100%)]",
  },
  default: {
    glow: "shadow-[0_0_0_1px_rgba(148,163,184,0.18),0_18px_50px_rgba(100,116,139,0.12)]",
    header:
      "bg-[linear-gradient(180deg,rgba(80,205,255,1)_0%,rgba(34,150,214,1)_100%)]",
    body:
      "bg-[linear-gradient(180deg,rgba(231,236,245,0.98)_0%,rgba(180,190,208,0.96)_100%)]",
  },
};

function getVisualBySlug(slug: string) {
  return categoryVisuals[slug] ?? categoryVisuals.default;
}

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

function StatusPill({
  label,
  icon,
  className = "",
}: {
  label: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-bold text-white/90 backdrop-blur ${className}`}
    >
      {icon}
      <span>{label}</span>
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
}: {
  teamName: string;
  score: number;
  isLeading: boolean;
  isTurn: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  accent: "blue" | "orange";
  avatarUrl: string;
}) {
  const palette =
    accent === "orange"
      ? {
          card:
            "border-orange-300/20 bg-[linear-gradient(180deg,rgba(51,25,10,0.95)_0%,rgba(19,10,6,0.98)_100%)]",
          glow:
            "shadow-[0_0_0_1px_rgba(251,146,60,0.18),0_18px_50px_rgba(251,146,60,0.12)]",
          text: "text-orange-50",
          soft: "text-orange-100/80",
          btn: "border-orange-300/20 bg-orange-400/10 hover:bg-orange-400/18 text-orange-50",
        }
      : {
          card:
            "border-cyan-300/20 bg-[linear-gradient(180deg,rgba(7,41,64,0.95)_0%,rgba(4,15,28,0.98)_100%)]",
          glow:
            "shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_18px_50px_rgba(34,211,238,0.10)]",
          text: "text-cyan-50",
          soft: "text-cyan-100/80",
          btn: "border-cyan-300/20 bg-cyan-400/10 hover:bg-cyan-400/18 text-cyan-50",
        };

  return (
    <div
      className={`rounded-[24px] border p-3 ${palette.card} ${palette.glow}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={teamName} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className={`truncate text-sm font-black ${palette.text}`}>
            {teamName}
          </div>

          <div className="mt-1 flex flex-wrap gap-2">
            {isTurn ? (
              <StatusPill label="الدور الآن" className={palette.soft} />
            ) : null}
            {isLeading ? (
              <StatusPill
                label="متصدر"
                icon={<CrownIcon className="h-3.5 w-3.5" />}
                className={palette.soft}
              />
            ) : null}
          </div>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-black leading-none ${palette.text}`}>
            {score}
          </div>
          <div className={`mt-1 text-[11px] font-bold ${palette.soft}`}>
            نقطة
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onIncrease}
          className={`rounded-2xl border px-3 py-2 text-sm font-black transition ${palette.btn}`}
        >
          +
        </button>
        <button
          type="button"
          onClick={onDecrease}
          className={`rounded-2xl border px-3 py-2 text-sm font-black transition ${palette.btn}`}
        >
          −
        </button>
      </div>
    </div>
  );
}

function CategoryIllustration({
  category,
}: {
  category: Category;
}) {
  if (category.image_url) {
    return (
      <div className="flex h-full w-full items-center justify-center px-3 pt-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.image_url}
          alt={category.name}
          className="max-h-[148px] w-auto max-w-full object-contain drop-shadow-[0_10px_18px_rgba(15,23,42,0.18)]"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center px-4 pt-7">
      <div className="rounded-3xl border border-slate-400/30 bg-white/40 px-6 py-5 text-center text-slate-700 shadow-inner">
        <div className="text-sm font-black">فئة</div>
        <div className="mt-1 text-xs font-bold opacity-70">{category.name}</div>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  children,
}: {
  category: Category;
  children: ReactNode;
}) {
  const visual = getVisualBySlug(category.slug);

  return (
    <div
      className={`relative flex h-[438px] min-w-[198px] max-w-[198px] flex-col overflow-hidden rounded-[28px] border-4 border-slate-950/90 ${visual.glow}`}
    >
      <div className={`relative h-[274px] ${visual.body}`}>
        <div className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_70%)]" />

        <div className="absolute left-1/2 top-[-2px] z-20 w-[82%] -translate-x-1/2">
          <div
            className={`rounded-b-[20px] rounded-t-[16px] px-4 py-3 text-center text-[15px] font-black text-white shadow-[0_8px_0_rgba(0,0,0,0.10)] ${visual.header}`}
          >
            <span className="block truncate">{category.name}</span>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[54px] bottom-0">
          <CategoryIllustration category={category} />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,#1c2f63_0%,#0f234d_100%)]">
        {children}
      </div>
    </div>
  );
}

function QuestionCell({
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
  const disabled = !question || used;

  const pointPalette =
    points === 200
      ? "bg-[linear-gradient(180deg,#ffa45e_0%,#fb9252_100%)] text-slate-950"
      : points === 400
        ? "bg-[linear-gradient(180deg,#89c86d_0%,#7cbc60_100%)] text-slate-950"
        : "bg-[linear-gradient(180deg,#4d90d8_0%,#3a79bf_100%)] text-white";

  const usedPalette =
    result === "teamOne"
      ? "bg-[linear-gradient(180deg,rgba(20,52,103,0.95)_0%,rgba(11,31,67,0.98)_100%)] text-cyan-100/45"
      : result === "teamTwo"
        ? "bg-[linear-gradient(180deg,rgba(71,41,20,0.95)_0%,rgba(49,28,13,0.98)_100%)] text-orange-100/45"
        : "bg-[linear-gradient(180deg,rgba(18,34,72,0.95)_0%,rgba(13,28,60,0.98)_100%)] text-white/30";

  const baseClass =
    "flex h-[54px] w-full items-center justify-center text-[14px] font-black tracking-[0.02em] transition";

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={`${baseClass} ${usedPalette}`}
      >
        {question ? points : "–"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${baseClass} ${pointPalette} hover:brightness-105 active:scale-[0.99]`}
    >
      <span className="text-[15px] font-black">{points}</span>
    </button>
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

  const [isLandscapePhone, setIsLandscapePhone] = useState(false);

  const initialState = useMemo(() => {
    return normalizeBoardState(initialBoardState);
  }, [initialBoardState]);

  const [boardState, setBoardState] = useState<BoardState>(initialState);
  const [hasRedirectedToResult, setHasRedirectedToResult] = useState(false);

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

  const compactLandscape = isLandscapePhone;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,80,175,0.18),transparent_30%),linear-gradient(180deg,#041133_0%,#051742_45%,#051230_100%)] text-white">
      <div className="mx-auto w-full max-w-[1540px] px-3 py-4 sm:px-4 lg:px-6">
        <div className="mb-4 rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-bold tracking-[0.25em] text-cyan-200/75">
                  لوحة اللعبة
                </div>
                <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {gameName}
                </h1>

                {!compactLandscape ? (
                  <p className="mt-2 max-w-2xl text-sm font-medium text-slate-200/80">
                    قم باختيار الأسئلة حتى انتهاء جميع الخانات ثم الانتقال تلقائيًا
                    إلى صفحة النتيجة.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill
                  label={`الدور: ${activeTurnName}`}
                  icon={<GamepadIcon className="h-4 w-4" />}
                />
                <StatusPill
                  label={`المتصدر: ${leaderLabel}`}
                  icon={<CrownIcon className="h-4 w-4" />}
                />
                <StatusPill label={`المتبقي: ${remainingCount}`} />
                <Link
                  href="/account"
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm font-black text-white transition hover:bg-white/12"
                >
                  الرجوع للحساب
                </Link>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <TeamCard
                teamName={teamOne}
                score={boardState.teamOneScore}
                isLeading={teamOneLeading}
                isTurn={activeTurn === "teamOne"}
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
                accent="blue"
                avatarUrl={TEAM_BLUE_AVATAR}
              />

              <TeamCard
                teamName={teamTwo}
                score={boardState.teamTwoScore}
                isLeading={teamTwoLeading}
                isTurn={activeTurn === "teamTwo"}
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
                accent="orange"
                avatarUrl={TEAM_ORANGE_AVATAR}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(5,20,57,0.92)_0%,rgba(4,17,44,0.98)_100%)] p-4 shadow-[0_18px_80px_rgba(2,6,23,0.55)]">
          <div
            className={`flex gap-4 ${compactLandscape ? "min-w-max scale-[0.92] origin-top-left" : "min-w-max"}`}
          >
            {boardColumns.map((column) => (
              <CategoryCard key={column.category.id} category={column.category}>
                {column.rows.map((row) => (
                  <div
                    key={`${column.category.id}-${row.points}`}
                    className="grid grid-cols-2"
                  >
                    {[0, 1].map((index) => {
                      const question = row.questions[index] ?? null;
                      const used = question
                        ? boardState.usedQuestionIds.includes(question.id)
                        : true;
                      const result = question
                        ? boardState.questionResults[question.id] ?? "none"
                        : "none";

                      return (
                        <QuestionCell
                          key={`${column.category.id}-${row.points}-${index}`}
                          question={question}
                          points={row.points}
                          used={used}
                          result={result}
                          onOpen={() => handleOpenQuestion(question)}
                        />
                      );
                    })}
                  </div>
                ))}
              </CategoryCard>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}