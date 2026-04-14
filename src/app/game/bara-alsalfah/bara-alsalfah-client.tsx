"use client";

import { useMemo, useState, type ReactNode } from "react";

type BaraSection = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
};

type BaraCategory = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  section_id: string | null;
  sort_order: number | null;
  is_active: boolean;
};

type BaraItem = {
  id: string;
  category_id: string;
  correct_answer: string;
  wrong_option_1: string | null;
  wrong_option_2: string | null;
  wrong_option_3: string | null;
  wrong_option_4: string | null;
  is_active: boolean;
};

type Player = {
  id: string;
  name: string;
  score: number;
};

type VoteMap = Record<string, string>;

type Step =
  | "intro"
  | "category"
  | "mode"
  | "players"
  | "reveal-pass"
  | "reveal-role"
  | "questions"
  | "vote"
  | "reveal-outsider"
  | "guess"
  | "results"
  | "round-end"
  | "category-finished";

type GameMode = "points" | "judge";

type QuestionPair = {
  asker: Player;
  target: Player;
};

function randomPick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffleArray<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getModeLabel(mode: GameMode | null) {
  if (mode === "points") return "نظام النقاط";
  if (mode === "judge") return "نظام الحكم";
  return "غير محدد";
}

function buildQuestionPairs(players: Player[]): QuestionPair[] {
  if (players.length < 2) return [];

  const shuffledPlayers = shuffleArray(players);

  const firstRound: QuestionPair[] = shuffledPlayers.map((asker, index) => ({
    asker,
    target: shuffledPlayers[(index + 1) % shuffledPlayers.length],
  }));

  const usedKeys = new Set(
    firstRound.map((pair) => `${pair.asker.id}->${pair.target.id}`),
  );

  const remainingPairs: QuestionPair[] = [];

  for (const asker of shuffledPlayers) {
    for (const target of shuffledPlayers) {
      if (asker.id === target.id) continue;

      const key = `${asker.id}->${target.id}`;
      if (!usedKeys.has(key)) {
        remainingPairs.push({ asker, target });
      }
    }
  }

  return [...firstRound, ...shuffleArray(remainingPairs)];
}

function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white/55">
      <span className="h-1 w-1 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04]">
      <div className="h-[2px] w-full bg-cyan-400 opacity-50" />
      <div className="px-3 py-3 text-center">
        <div className="text-[11px] font-bold text-white/45 sm:text-xs">{label}</div>
        <div className="mt-1.5 text-lg font-black text-cyan-300 md:text-2xl">
          {value}
        </div>
      </div>
    </div>
  );
}

type BaraAlsalfahClientProps = {
  initialSections: BaraSection[];
  initialCategories: BaraCategory[];
  initialItems: BaraItem[];
};

export default function BaraAlsalfahClient({
  initialSections,
  initialCategories,
  initialItems,
}: BaraAlsalfahClientProps) {
  const [step, setStep] = useState<Step>("intro");

  const [sections] = useState<BaraSection[]>(initialSections);
  const [categories] = useState<BaraCategory[]>(initialCategories);
  const [items] = useState<BaraItem[]>(initialItems);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingPlayerName, setEditingPlayerName] = useState("");

  const [activeItem, setActiveItem] = useState<BaraItem | null>(null);
  const [outsiderId, setOutsiderId] = useState<string | null>(null);

  const [usedItemIdsByCategory, setUsedItemIdsByCategory] = useState<
    Record<string, string[]>
  >({});
  const [exhaustedCategoryName, setExhaustedCategoryName] = useState("");

  const [revealOrder, setRevealOrder] = useState<string[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [revealShown, setRevealShown] = useState(false);

  const [questionPairs, setQuestionPairs] = useState<QuestionPair[]>([]);
  const [questionTurnIndex, setQuestionTurnIndex] = useState(0);

  const [voteOrder, setVoteOrder] = useState<string[]>([]);
  const [voteIndex, setVoteIndex] = useState(0);
  const [votes, setVotes] = useState<VoteMap>({});

  const [guessOptions, setGuessOptions] = useState<string[]>([]);
  const [selectedGuess, setSelectedGuess] = useState("");
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const [guessWasCorrect, setGuessWasCorrect] = useState<boolean | null>(null);
  const [tooltipCategoryId, setTooltipCategoryId] = useState<string | null>(null);


  const groupedSections = useMemo(() => {
    return sections
      .map((section) => ({
        ...section,
        categories: categories.filter(
          (category) => category.section_id === section.id,
        ),
      }))
      .filter((section) => section.categories.length > 0);
  }, [sections, categories]);

  const activeCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const activeCategoryItems = useMemo(() => {
    if (!selectedCategoryId) return [];
    return items.filter((item) => item.category_id === selectedCategoryId);
  }, [items, selectedCategoryId]);

  const outsiderPlayer = useMemo(
    () => players.find((player) => player.id === outsiderId) ?? null,
    [players, outsiderId],
  );

  const revealPlayer = useMemo(() => {
    const playerId = revealOrder[revealIndex];
    return players.find((player) => player.id === playerId) ?? null;
  }, [players, revealOrder, revealIndex]);

  const votingPlayer = useMemo(() => {
    const playerId = voteOrder[voteIndex];
    return players.find((player) => player.id === playerId) ?? null;
  }, [players, voteOrder, voteIndex]);

  const currentQuestionPair = questionPairs[questionTurnIndex] ?? null;

  const remainingItemsCount = useMemo(() => {
    if (!selectedCategoryId) return 0;
    const usedCount = usedItemIdsByCategory[selectedCategoryId]?.length ?? 0;
    return Math.max(activeCategoryItems.length - usedCount, 0);
  }, [selectedCategoryId, usedItemIdsByCategory, activeCategoryItems.length]);

  function addPlayer() {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;

    setPlayers((prev) => [
      ...prev,
      {
        id: uid(),
        name: trimmed,
        score: 0,
      },
    ]);

    setNewPlayerName("");
  }

  function deletePlayer(id: string) {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  }

  function startEditPlayer(player: Player) {
    setEditingPlayerId(player.id);
    setEditingPlayerName(player.name);
  }

  function saveEditPlayer() {
    const trimmed = editingPlayerName.trim();
    if (!trimmed || !editingPlayerId) return;

    setPlayers((prev) =>
      prev.map((player) =>
        player.id === editingPlayerId ? { ...player, name: trimmed } : player,
      ),
    );

    setEditingPlayerId(null);
    setEditingPlayerName("");
  }

  function resetRoundState() {
    setActiveItem(null);
    setOutsiderId(null);
    setRevealOrder([]);
    setRevealIndex(0);
    setRevealShown(false);
    setQuestionPairs([]);
    setQuestionTurnIndex(0);
    setVoteOrder([]);
    setVoteIndex(0);
    setVotes({});
    setGuessOptions([]);
    setSelectedGuess("");
    setGuessSubmitted(false);
    setGuessWasCorrect(null);
  }

  function resetEverything() {
    setPlayers([]);
    setNewPlayerName("");
    setEditingPlayerId(null);
    setEditingPlayerName("");
    setSelectedCategoryId(null);
    setSelectedMode(null);
    setUsedItemIdsByCategory({});
    setExhaustedCategoryName("");
    resetRoundState();
    setStep("intro");
  }

  function pickOutsiderSmart() {
    const historyKey = "bara-alsalfah-outsider-history";
    let recentIds: string[] = [];

    try {
      recentIds = JSON.parse(localStorage.getItem(historyKey) || "[]");
    } catch {
      recentIds = [];
    }

    let pool = players.filter((player) => !recentIds.includes(player.id));
    if (pool.length === 0) {
      pool = players;
    }

    const picked = randomPick(pool);
    const nextHistory = [picked.id, ...recentIds].slice(0, 2);

    localStorage.setItem(historyKey, JSON.stringify(nextHistory));
    return picked.id;
  }

  function pickNextItemForCategory(categoryId: string) {
    const categoryItems = items.filter((item) => item.category_id === categoryId);
    if (categoryItems.length === 0) return null;

    const usedIds = usedItemIdsByCategory[categoryId] ?? [];
    const availableItems = categoryItems.filter((item) => !usedIds.includes(item.id));

    if (availableItems.length === 0) {
      return null;
    }

    const chosen = randomPick(availableItems);

    setUsedItemIdsByCategory((prev) => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] ?? []), chosen.id],
    }));

    return chosen;
  }

  function prepareRound() {
    if (!selectedCategoryId || !selectedMode) return;
    if (players.length < 3) return;

    const chosenItem = pickNextItemForCategory(selectedCategoryId);

    if (!chosenItem) {
      setExhaustedCategoryName(activeCategory?.name ?? "هذه الفئة");
      resetRoundState();
      setStep("category-finished");
      return;
    }

    const chosenOutsiderId = pickOutsiderSmart();

    setActiveItem(chosenItem);
    setOutsiderId(chosenOutsiderId);

    setRevealOrder(shuffleArray(players.map((player) => player.id)));
    setRevealIndex(0);
    setRevealShown(false);

    setQuestionPairs(buildQuestionPairs(players));
    setQuestionTurnIndex(0);

    setVotes({});
    setVoteIndex(0);
    setVoteOrder(shuffleArray(players.map((player) => player.id)));

    setGuessOptions(
      shuffleArray(
        [
          chosenItem.correct_answer,
          chosenItem.wrong_option_1,
          chosenItem.wrong_option_2,
          chosenItem.wrong_option_3,
          chosenItem.wrong_option_4,
        ].filter(Boolean) as string[],
      ),
    );

    setSelectedGuess("");
    setGuessSubmitted(false);
    setGuessWasCorrect(null);
    setStep("reveal-pass");
  }

  function beginRoleDistribution() {
    prepareRound();
  }

  function continueWithSamePlayersAndCategory() {
    prepareRound();
  }

  function goNextReveal() {
    if (revealIndex < revealOrder.length - 1) {
      setRevealIndex((prev) => prev + 1);
      setRevealShown(false);
      setStep("reveal-pass");
      return;
    }

    setRevealShown(false);
    setStep("questions");
  }

  function nextQuestionTurn() {
    if (questionPairs.length === 0) return;

    setQuestionTurnIndex((prev) =>
      prev < questionPairs.length - 1 ? prev + 1 : 0,
    );
  }

  function castVote(targetId: string) {
    if (!votingPlayer) return;

    const newVotes = {
      ...votes,
      [votingPlayer.id]: targetId,
    };

    setVotes(newVotes);

    if (voteIndex < voteOrder.length - 1) {
      setVoteIndex((prev) => prev + 1);
      return;
    }

    const updatedPlayers = players.map((player) => {
      const votedTarget = newVotes[player.id];
      const gained = votedTarget === outsiderId ? 1 : 0;

      return {
        ...player,
        score: player.score + gained,
      };
    });

    setPlayers(updatedPlayers);
    setStep("reveal-outsider");
  }

  function submitOutsiderGuess() {
    if (!selectedGuess || !outsiderId || !activeItem) return;

    const isCorrect = selectedGuess === activeItem.correct_answer;
    setGuessSubmitted(true);
    setGuessWasCorrect(isCorrect);

    if (isCorrect) {
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === outsiderId
            ? { ...player, score: player.score + 3 }
            : player,
        ),
      );
    }
  }

  function goToResultsAfterGuess() {
    setStep("results");
  }

  function changePlayersKeepScores() {
    resetRoundState();
    setStep("players");
  }

  function changeCategoryKeepScores() {
    resetRoundState();
    setSelectedCategoryId(null);
    setExhaustedCategoryName("");
    setStep("category");
  }


  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_60%,#020814_100%)] px-4 py-6 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(10,20,44,0.98)_0%,rgba(5,10,24,1)_55%,rgba(8,16,38,0.98)_100%)]">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-56 rounded-full bg-cyan-500/6 blur-2xl" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/8 px-3.5 py-1.5 text-xs font-bold text-orange-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                  لعبة جديدة
                </span>
                <h1 className="mt-3 text-3xl font-black text-white md:text-5xl">
                  برا السالفة
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-7 text-white/50 md:text-base">
                  لعبة جماعية ممتعة — اختر الفئة، أضف اللاعبين، ودع اللعبة تختار شخصًا واحدًا يكون برا السالفة.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                <StatCard label="عدد اللاعبين" value={players.length} />
                <StatCard label="الفئة" value={activeCategory?.name ?? "—"} />
                <StatCard label="الوضع" value={getModeLabel(selectedMode)} />
                <StatCard label="المتبقي" value={remainingItemsCount} />
              </div>
            </div>
          </div>
        </section>

        {step === "intro" && (
          <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-8 text-center">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-orange-400 opacity-60" />
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-2 border-orange-400/25 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.15),transparent_60%)] text-5xl">
                ?
              </div>
              <h2 className="mt-6 text-4xl font-black text-white">برا السالفة</h2>
              <p className="mt-3 text-sm text-white/45">العبوها مع أصدقائك واكتشفوا من هو برا السالفة</p>
              <button
                onClick={() => setStep("category")}
                className="mt-8 w-full rounded-2xl bg-orange-500 px-6 py-4 text-xl font-black text-white shadow-[0_6px_24px_rgba(249,115,22,0.25)] transition hover:bg-orange-400 active:scale-[0.98]"
              >
                ابدأ اللعب
              </button>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-6">
              <SectionBadge>كيف تعمل اللعبة؟</SectionBadge>
              <div className="mt-5 space-y-3">
                {[
                  "تختار الفئة ونوع الجولة.",
                  "تضيف اللاعبين يدويًا.",
                  "نوزع الأدوار عشوائيًا، وشخص واحد فقط يكون برا السالفة.",
                  "كل لاعب يسأل مرة على الأقل ويُسأل مرة على الأقل.",
                  "عند انتهاء عناصر الفئة يجب اختيار فئة جديدة.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-orange-400/25 bg-orange-400/10 text-[11px] font-black text-orange-300">{i + 1}</span>
                    <p className="text-sm leading-7 text-white/60">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === "category" && (
          <section className="space-y-5">
            {groupedSections.map((section) => {
              // Count total items per category for this section
              const sectionCategoryIds = section.categories.map((c) => c.id);
              const totalSectionItems = items.filter((item) =>
                sectionCategoryIds.includes(item.category_id)
              ).length;

              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,40,0.96)_0%,rgba(4,10,24,0.99)_100%)]"
                >
                  {/* Section header — styled like لمتكم game board */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Section name badge */}
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/8 px-3.5 py-1.5 text-xs font-bold text-orange-300">
                        <span className="h-1 w-1 rounded-full bg-orange-400" />
                        {section.name}
                      </span>
                      {/* Category count */}
                      <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-bold text-white/50">
                        {section.categories.length} {section.categories.length === 1 ? "فئة" : "فئات"}
                      </span>
                    </div>

                    {/* Section description */}
                    {section.description && (
                      <p className="text-xs text-white/40 md:max-w-lg">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {/* Category cards grid — لمتكم style */}
                  <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:p-5">
                    {section.categories.map((category) => {
                      const isActive = selectedCategoryId === category.id;
                      const totalCount = items.filter(
                        (item) => item.category_id === category.id,
                      ).length;
                      const usedCount = usedItemIdsByCategory[category.id]?.length ?? 0;
                      const remainingCount = Math.max(totalCount - usedCount, 0);
                      const isExhausted = totalCount === 0 || (usedCount >= totalCount && totalCount > 0);
                      const showTooltip = tooltipCategoryId === category.id;

                      const gameLabel =
                        remainingCount === 0
                          ? "غير متاح"
                          : remainingCount === 1
                          ? "لعبة واحدة"
                          : `${remainingCount} ألعاب`;

                      return (
                        <div key={category.id} className="relative">
                          {/* Tooltip popup */}
                          {showTooltip && category.description && (
                            <div
                              className="absolute -top-2 left-1/2 z-50 w-56 -translate-x-1/2 -translate-y-full rounded-2xl border border-white/12 bg-[rgba(10,18,38,0.97)] px-4 py-3 text-center text-sm leading-6 text-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
                            >
                              <div className="text-xs font-black text-orange-300 mb-1">{category.name}</div>
                              {category.description}
                              {/* Arrow */}
                              <div className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[rgba(10,18,38,0.97)]" />
                            </div>
                          )}

                          <button
                            key={category.id}
                            type="button"
                            disabled={isExhausted}
                            onClick={() => {
                              if (!isExhausted) {
                                setSelectedCategoryId(category.id);
                                setTooltipCategoryId(null);
                              }
                            }}
                            className={[
                              "group relative w-full overflow-hidden rounded-[1.4rem] border text-right transition duration-200",
                              isExhausted
                                ? "cursor-not-allowed opacity-60 border-white/5"
                                : isActive
                                ? "border-orange-400/50 shadow-[0_0_0_2px_rgba(249,115,22,0.25)]"
                                : "border-white/8 hover:border-white/18 hover:-translate-y-0.5",
                            ].join(" ")}
                          >
                            {/* Image area — full cover like لمتكم */}
                            <div className="relative overflow-hidden">
                              {category.image_url ? (
                                <img
                                  src={category.image_url}
                                  alt={category.name}
                                  className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                                />
                              ) : (
                                <div className="flex h-40 w-full items-center justify-center bg-[linear-gradient(160deg,rgba(20,14,6,0.95),rgba(10,7,3,0.98))] text-5xl">
                                  🎯
                                </div>
                              )}

                              {/* Dark gradient overlay from bottom */}
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,14,30,0.90)] via-transparent to-transparent" />

                              {/* "i" info button — top right */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTooltipCategoryId(
                                    showTooltip ? null : category.id
                                  );
                                }}
                                className="absolute left-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[rgba(14,100,180,0.85)] text-sm font-black text-white shadow-lg backdrop-blur-sm transition hover:bg-[rgba(14,130,220,0.95)]"
                                title={category.description || category.name}
                              >
                                i
                              </button>

                              {/* Game count badge — top left (right in RTL) */}
                              <div
                                className={`absolute right-2 top-2 z-20 rounded-full border px-2.5 py-1 text-[11px] font-black backdrop-blur-sm ${
                                  isExhausted
                                    ? "border-red-400/40 bg-red-500/25 text-red-200"
                                    : isActive
                                    ? "border-orange-400/50 bg-orange-500/30 text-orange-100"
                                    : "border-emerald-400/35 bg-emerald-500/20 text-emerald-100"
                                }`}
                              >
                                {gameLabel}
                              </div>

                              {/* Selected ring */}
                              {isActive && (
                                <div className="pointer-events-none absolute inset-0 border-[3px] border-orange-400/60 rounded-t-[1.4rem]" />
                              )}

                              {/* Exhausted overlay */}
                              {isExhausted && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
                                  <span className="rounded-full border border-red-400/40 bg-red-500/20 px-3 py-1.5 text-xs font-black text-red-200">
                                    غير متاح
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Name bar at bottom — orange gradient like لمتكم */}
                            <div
                              className={`px-3 py-2.5 text-center text-sm font-black text-white transition-colors ${
                                isActive
                                  ? "bg-gradient-to-r from-orange-600 to-orange-500"
                                  : isExhausted
                                  ? "bg-[rgba(60,20,10,0.80)]"
                                  : "bg-gradient-to-r from-[rgba(180,70,0,0.90)] to-[rgba(200,80,0,0.80)] group-hover:from-orange-600 group-hover:to-orange-500"
                              }`}
                            >
                              {category.name}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Close tooltip on outside click */}
            {tooltipCategoryId && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setTooltipCategoryId(null)}
              />
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setStep("intro")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white/70 transition hover:bg-white/8 hover:text-white"
              >
                رجوع
              </button>

              <button
                onClick={() => setStep("mode")}
                disabled={!selectedCategoryId}
                className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-[0_4px_16px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
              >
                التالي
              </button>
            </div>
          </section>
        )}

        {step === "mode" && (
          <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-6">
            <SectionBadge>اختر وضع اللعبة</SectionBadge>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <button
                onClick={() => setSelectedMode("points")}
                className={[
                  "rounded-[1.5rem] border p-5 text-right transition",
                  selectedMode === "points"
                    ? "border-cyan-300/40 bg-cyan-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                ].join(" ")}
              >
                <div className="text-2xl font-black">وضع النقاط</div>
                <p className="mt-3 text-white/70">
                  اللاعبون يأخذون نقطة عند التصويت الصحيح، والشخص برا السالفة يأخذ 3 نقاط إذا عرف الجواب.
                </p>
              </button>

              <button
                onClick={() => setSelectedMode("judge")}
                className={[
                  "rounded-[1.5rem] border p-5 text-right transition",
                  selectedMode === "judge"
                    ? "border-cyan-300/40 bg-cyan-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                ].join(" ")}
              >
                <div className="text-2xl font-black">نظام الحكم</div>
                <p className="mt-3 text-white/70">
                  الوضع الثاني جاهز للتمديد لاحقًا، وحاليًا يعمل بنفس منطق الجولات الأساسية.
                </p>
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setStep("category")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white/70 transition hover:bg-white/8 hover:text-white"
              >
                رجوع
              </button>

              <button
                onClick={() => setStep("players")}
                disabled={!selectedMode}
                className="rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </section>
        )}

        {step === "players" && (
          <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-6">
              <SectionBadge>إضافة اللاعبين</SectionBadge>

              <div className="mt-5 flex gap-3">
                <input
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="اكتب اسم اللاعب"
                  className="h-14 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
                />

                <button
                  type="button"
                  onClick={addPlayer}
                  className="rounded-2xl bg-cyan-500 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  إضافة
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4"
                  >
                    {editingPlayerId === player.id ? (
                      <div className="flex w-full flex-wrap gap-3">
                        <input
                          value={editingPlayerName}
                          onChange={(e) => setEditingPlayerName(e.target.value)}
                          className="h-12 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={saveEditPlayer}
                          className="rounded-xl bg-cyan-500 px-4 py-2 font-bold text-slate-950"
                        >
                          حفظ
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-lg font-black">{player.name}</div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditPlayer(player)}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white"
                          >
                            تعديل
                          </button>

                          <button
                            type="button"
                            onClick={() => deletePlayer(player.id)}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100"
                          >
                            حذف
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-6">
              <SectionBadge>ملخص الجلسة</SectionBadge>

              <div className="mt-5 grid gap-4">
                <StatCard label="عدد اللاعبين" value={players.length} />
                <StatCard
                  label="الفئة المختارة"
                  value={activeCategory?.name ?? "غير محددة"}
                />
                <StatCard label="الوضع" value={getModeLabel(selectedMode)} />
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-white/75">
                يجب إدخال 3 لاعبين على الأقل حتى تبدأ الجولة.
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setStep("mode")}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  رجوع
                </button>

                <button
                  onClick={beginRoleDistribution}
                  disabled={
                    players.length < 3 ||
                    !selectedCategoryId ||
                    !selectedMode ||
                    activeCategoryItems.length === 0
                  }
                  className="rounded-2xl bg-green-500 px-6 py-3 font-bold text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  بدء اللعب
                </button>
              </div>
            </div>
          </section>
        )}

        {step === "reveal-pass" && revealPlayer && (
          <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-8 text-center">
            <div className="text-2xl font-black text-orange-300 md:text-4xl">
              {revealPlayer.name}
            </div>

            <p className="mt-4 text-lg leading-8 text-white/80">
              أعطوا الجوال لـ <strong>{revealPlayer.name}</strong>
              <br />
              واضغط التالي لعرض دوره.
            </p>

            <button
              onClick={() => {
                setRevealShown(false);
                setStep("reveal-role");
              }}
              className="mt-10 w-full rounded-2xl bg-orange-500 px-8 py-4 text-xl font-black text-white shadow-[0_4px_20px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 active:scale-[0.98]"
            >
              التالي
            </button>
          </section>
        )}

        {step === "reveal-role" && revealPlayer && activeItem && (
          <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="text-2xl font-black text-orange-300 md:text-4xl">
              {revealPlayer.name}
            </div>

            {!revealShown ? (
              <>
                <p className="mt-5 text-lg leading-8 text-white/80">
                  اضغط على زر الإظهار لرؤية دورك داخل الجولة.
                </p>

                <button
                  onClick={() => setRevealShown(true)}
                  className="mt-10 w-full rounded-2xl bg-orange-500 px-8 py-4 text-xl font-black text-white shadow-[0_4px_20px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 active:scale-[0.98]"
                >
                  إظهار
                </button>
              </>
            ) : revealPlayer.id === outsiderId ? (
              <>
                <p className="mt-5 text-xl leading-9 text-white">
                  أنت <span className="font-black text-orange-400">برا السالفة</span>
                  <br />
                  حاول تعرف الكلمة من أسئلة اللاعبين وتصويتهم.
                </p>

                <button
                  onClick={goNextReveal}
                  className="mt-10 w-full rounded-2xl bg-orange-500 px-8 py-4 text-xl font-black text-white shadow-[0_4px_20px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 active:scale-[0.98]"
                >
                  التالي
                </button>
              </>
            ) : (
              <>
                <p className="mt-5 text-lg text-white/80">أنت داخل السالفة، والكلمة هي:</p>
                <div className="mt-4 text-3xl font-black text-white md:text-5xl">
                  {activeItem.correct_answer}
                </div>

                <button
                  onClick={goNextReveal}
                  className="mt-10 w-full rounded-2xl bg-orange-500 px-8 py-4 text-xl font-black text-white shadow-[0_4px_20px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 active:scale-[0.98]"
                >
                  التالي
                </button>
              </>
            )}
          </section>
        )}

        {step === "questions" && currentQuestionPair && (
          <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-8 text-center">
            <SectionBadge>وقت الأسئلة</SectionBadge>

            <h2 className="mt-5 text-3xl font-black md:text-5xl">
              {currentQuestionPair.asker.name}
            </h2>

            <p className="mt-4 text-xl leading-9 text-white/80">
              يسأل الآن
              <br />
              <span className="font-black text-cyan-300">
                {currentQuestionPair.target.name}
              </span>
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                onClick={nextQuestionTurn}
                className="rounded-2xl bg-orange-500 px-7 py-4 text-xl font-black text-white shadow-[0_3px_14px_rgba(249,115,22,0.20)] transition hover:bg-orange-400 active:scale-[0.98]"
              >
                التالي
              </button>

              <button
                onClick={() => setStep("vote")}
                className="rounded-[1.4rem] bg-cyan-500 px-7 py-4 text-xl font-black text-slate-950 transition hover:bg-cyan-400"
              >
                التصويت
              </button>
            </div>
          </section>
        )}

        {step === "vote" && votingPlayer && (
          <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-8 text-center">
            <div className="text-center">
              <SectionBadge>التصويت</SectionBadge>
              <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
                {votingPlayer.name}
              </h2>
              <p className="mt-4 text-lg leading-8 text-white/75">
                على من يصوّت أنه برا السالفة؟
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-2xl space-y-3">
              {players
                .filter((player) => player.id !== votingPlayer.id)
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => castVote(player.id)}
                    className="w-full rounded-2xl border border-orange-400/20 bg-orange-500/10 px-5 py-4 text-lg font-black text-orange-100 transition hover:bg-orange-500/20 active:scale-[0.98]"
                  >
                    {player.name}
                  </button>
                ))}
            </div>
          </section>
        )}

        {step === "reveal-outsider" && outsiderPlayer && (
          <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <SectionBadge>انتهى التصويت</SectionBadge>

            <p className="mt-6 text-lg leading-8 text-white/75">
              الشخص الذي كان برا السالفة هو:
            </p>

            <div className="mt-4 text-4xl font-black text-orange-400 md:text-6xl">
              {outsiderPlayer.name}
            </div>

            <button
              onClick={() => setStep("guess")}
              className="mt-10 w-full rounded-2xl bg-orange-500 px-8 py-4 text-xl font-black text-white shadow-[0_4px_20px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 active:scale-[0.98]"
            >
              التالي
            </button>
          </section>
        )}

        {step === "guess" && outsiderPlayer && activeItem && (
          <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-8">
            <div className="text-center">
              <SectionBadge>تخمين الشخص برا السالفة</SectionBadge>
              <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
                {outsiderPlayer.name}
              </h2>
              <p className="mt-4 text-lg leading-8 text-white/75">
                اختر ما تعتقد أنها الكلمة الصحيحة.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-3xl grid gap-3 md:grid-cols-2">
              {guessOptions.map((option) => {
                const isSelected = selectedGuess === option;
                const isCorrect = option === activeItem.correct_answer;

                let classes =
                  "rounded-[1.2rem] border px-5 py-4 text-lg font-black transition";

                if (guessSubmitted && isCorrect) {
                  classes +=
                    " border-emerald-400/40 bg-emerald-500/20 text-emerald-100";
                } else if (guessSubmitted && isSelected && !isCorrect) {
                  classes += " border-red-400/40 bg-red-500/20 text-red-100";
                } else if (isSelected) {
                  classes +=
                    " border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
                } else {
                  classes +=
                    " border-white/10 bg-white/5 text-white hover:bg-white/10";
                }

                return (
                  <button
                    key={option}
                    onClick={() => {
                      if (!guessSubmitted) setSelectedGuess(option);
                    }}
                    className={classes}
                    disabled={guessSubmitted}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              {!guessSubmitted ? (
                <button
                  onClick={submitOutsiderGuess}
                  disabled={!selectedGuess}
                  className="rounded-2xl bg-orange-500 px-8 py-4 text-xl font-black text-white shadow-[0_4px_20px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                  إجابة
                </button>
              ) : (
                <button
                  onClick={goToResultsAfterGuess}
                  className="rounded-2xl bg-orange-500 px-8 py-4 text-xl font-black text-white shadow-[0_4px_20px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 active:scale-[0.98]"
                >
                  النتائج
                </button>
              )}
            </div>

            {guessSubmitted ? (
              <div
                className={[
                  "mt-6 rounded-2xl border px-4 py-3 text-center text-lg font-black",
                  guessWasCorrect
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                    : "border-red-400/30 bg-red-500/10 text-red-100",
                ].join(" ")}
              >
                {guessWasCorrect
                  ? "إجابة صحيحة — تم احتساب 3 نقاط"
                  : "إجابة خاطئة — لا توجد نقاط إضافية"}
              </div>
            ) : null}
          </section>
        )}

        {step === "results" && (
          <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-8">
            <div className="text-center">
              <SectionBadge>النتائج</SectionBadge>
              <h2 className="mt-4 text-3xl font-black md:text-5xl">
                نقاط اللاعبين
              </h2>
            </div>

            <div className="mx-auto mt-8 max-w-3xl space-y-3">
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/5 px-5 py-4"
                  >
                    <div className="text-lg font-black">{player.name}</div>
                    <div className="text-2xl font-black text-cyan-300">
                      {player.score}
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setStep("round-end")}
                className="rounded-2xl bg-orange-500 px-8 py-4 text-xl font-black text-white shadow-[0_4px_20px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 active:scale-[0.98]"
              >
                التالي
              </button>
            </div>
          </section>
        )}

        {step === "round-end" && (
          <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(5,10,24,0.98)_100%)] p-8">
            <div className="text-center">
              <SectionBadge>انتهت هذه الجولة</SectionBadge>
              <h2 className="mt-4 text-3xl font-black md:text-5xl">
                ماذا تريدون الآن؟
              </h2>
              <p className="mt-4 text-lg leading-8 text-white/75">
                تستطيعون الاستمرار بنفس اللاعبين ونفس الفئة، أو تغيير اللاعبين، أو تغيير الفئة، مع بقاء النقاط محفوظة.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
              <button
                onClick={continueWithSamePlayersAndCategory}
                className="rounded-2xl bg-orange-500 px-6 py-4 text-xl font-black text-white shadow-[0_3px_14px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 active:scale-[0.98]"
              >
                كمل اللعبة
              </button>

              <button
                onClick={changePlayersKeepScores}
                className="rounded-[1.4rem] bg-cyan-500 px-6 py-4 text-xl font-black text-slate-950 transition hover:bg-cyan-400"
              >
                تغيير اللاعبين
              </button>

              <button
                onClick={changeCategoryKeepScores}
                className="rounded-[1.4rem] bg-cyan-500 px-6 py-4 text-xl font-black text-slate-950 transition hover:bg-cyan-400 md:col-span-2"
              >
                تغيير نوع السالفة
              </button>

              <button
                onClick={resetEverything}
                className="rounded-[1.4rem] border border-white/10 bg-white/5 px-6 py-4 text-xl font-black text-white transition hover:bg-white/10 md:col-span-2"
              >
                العودة للبداية
              </button>
            </div>
          </section>
        )}

        {step === "category-finished" && (
          <section className="overflow-hidden rounded-[2rem] border border-amber-400/20 bg-[linear-gradient(160deg,rgba(20,14,6,0.98)_0%,rgba(5,10,24,0.98)_100%)] p-8 text-center">
            <SectionBadge>انتهت أسئلة الفئة</SectionBadge>

            <h2 className="mt-5 text-3xl font-black text-white md:text-5xl">
              انتهت الأسئلة المتوفرة في هذه الفئة
            </h2>

            <p className="mt-5 text-lg leading-8 text-white/75">
              الفئة الحالية: <span className="font-black text-cyan-300">{exhaustedCategoryName}</span>
              <br />
              يرجى اختيار فئة جديدة، وسيتم الحفاظ على نفس النقاط ونفس اللاعبين.
            </p>

            <div className="mt-10 flex justify-center">
              <button
                onClick={changeCategoryKeepScores}
                className="rounded-2xl bg-cyan-500 px-8 py-4 text-xl font-black text-slate-950 shadow-[0_4px_20px_rgba(34,211,238,0.22)] transition hover:bg-cyan-400 active:scale-[0.98]"
              >
                تغيير نوع السالفة
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}