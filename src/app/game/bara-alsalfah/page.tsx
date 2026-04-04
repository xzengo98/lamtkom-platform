"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
    <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100">
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
    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-center">
      <div className="text-xs text-white/60 md:text-sm">{label}</div>
      <div className="mt-2 text-xl font-black text-white md:text-3xl">
        {value}
      </div>
    </div>
  );
}

export default function BaraAlsalfahPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState<Step>("intro");

  const [sections, setSections] = useState<BaraSection[]>([]);
  const [categories, setCategories] = useState<BaraCategory[]>([]);
  const [items, setItems] = useState<BaraItem[]>([]);

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

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const [
        { data: sectionsData, error: sectionsError },
        { data: categoriesData, error: categoriesError },
        { data: itemsData, error: itemsError },
      ] = await Promise.all([
        supabase
          .from("bara_sections")
          .select("id, name, slug, description, sort_order, is_active")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("bara_categories")
          .select(
            "id, name, slug, description, image_url, section_id, sort_order, is_active",
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("bara_items")
          .select(
            "id, category_id, correct_answer, wrong_option_1, wrong_option_2, wrong_option_3, wrong_option_4, is_active",
          )
          .eq("is_active", true),
      ]);

      if (sectionsError || categoriesError || itemsError) {
        setLoadError(
          sectionsError?.message ||
            categoriesError?.message ||
            itemsError?.message ||
            "فشل تحميل بيانات اللعبة",
        );
        setLoading(false);
        return;
      }

      setSections((sectionsData ?? []) as BaraSection[]);
      setCategories((categoriesData ?? []) as BaraCategory[]);
      setItems((itemsData ?? []) as BaraItem[]);
      setLoading(false);
    }

    load();
  }, [router, supabase]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] p-4 text-white">
        <div className="mx-auto max-w-6xl animate-pulse rounded-[2rem] border border-white/10 bg-[#071126] p-8">
          جاري تحميل اللعبة...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#020817] p-4 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-red-100">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] px-4 py-6 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_35%),linear-gradient(180deg,#071126_0%,#061020_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-cyan-300">لعبة جديدة</div>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">
                برا السالفة
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base md:leading-8">
                لعبة جماعية ممتعة داخل نفس الموقع. اختر الفئة، أضف اللاعبين، ودع اللعبة تختار شخصًا واحدًا فقط يكون برا السالفة بشكل عشوائي.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="عدد اللاعبين" value={players.length} />
              <StatCard
                label="الفئة"
                value={activeCategory?.name ?? "غير محددة"}
              />
              <StatCard label="الوضع" value={getModeLabel(selectedMode)} />
              <StatCard label="المتبقي" value={remainingItemsCount} />
            </div>
          </div>
        </section>

        {step === "intro" && (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-4 border-white/15 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_60%),#0b1733] text-6xl">
                ?
              </div>

              <h2 className="mt-6 text-4xl font-black">برا السالفة</h2>

              <button
                onClick={() => setStep("category")}
                className="mt-8 w-full rounded-[1.5rem] bg-green-500 px-6 py-4 text-xl font-black text-white transition hover:bg-green-400"
              >
                ابدأ اللعب
              </button>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              <SectionBadge>كيف تعمل اللعبة؟</SectionBadge>

              <div className="mt-5 space-y-4 text-white/75">
                <p>1. تختار الفئة ونوع الجولة.</p>
                <p>2. تضيف اللاعبين يدويًا.</p>
                <p>3. نوزع الأدوار عشوائيًا، وشخص واحد فقط يكون برا السالفة.</p>
                <p>4. كل لاعب يسأل مرة على الأقل ويُسأل مرة على الأقل.</p>
                <p>5. عند انتهاء عناصر الفئة يجب اختيار فئة جديدة.</p>
              </div>
            </div>
          </section>
        )}

        {step === "category" && (
          <section className="space-y-6">
            {groupedSections.map((section) => (
              <div
                key={section.id}
                className="rounded-[2rem] border border-white/10 bg-[#071126] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              >
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <SectionBadge>{section.name}</SectionBadge>
                    <div className="rounded-full border border-white/10 bg-[#0f1b3d] px-3 py-1 text-sm font-bold text-white/85">
                      {section.categories.length} فئات
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0f1b3d] px-4 py-2 text-sm text-white/75 md:max-w-xl">
                    {section.description || "اختر الفئة التي تريد اللعب بها."}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {section.categories.map((category) => {
                    const isActive = selectedCategoryId === category.id;
                    const count = items.filter(
                      (item) => item.category_id === category.id,
                    ).length;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={[
                          "overflow-hidden rounded-[1.3rem] border text-right transition",
                          isActive
                            ? "border-cyan-300/40 ring-2 ring-cyan-400/30"
                            : "border-white/10 hover:border-white/20",
                        ].join(" ")}
                      >
                        <div className="h-32 overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4">
                          <div className="flex items-start justify-between">
                            <div className="rounded-full border border-emerald-500/40 bg-[#0f2e2a] px-2 py-1 text-[11px] font-bold text-emerald-200">
                              {count} عنصر
                            </div>

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-lg font-black text-white">
                              i
                            </div>
                          </div>

                          {category.image_url ? (
                            <div className="mt-3 h-16 w-full overflow-hidden rounded-2xl">
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : null}

                          <div className={`text-center text-lg font-black ${category.image_url ? "mt-3" : "mt-8"}`}>
                            {category.name}
                          </div>
                        </div>

                        <div className="bg-[#ff6a00] px-4 py-3 text-center text-base font-black text-white">
                          {category.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setStep("intro")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white transition hover:bg-white/10"
              >
                رجوع
              </button>

              <button
                onClick={() => setStep("mode")}
                disabled={!selectedCategoryId}
                className="rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </section>
        )}

        {step === "mode" && (
          <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white transition hover:bg-white/10"
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
            <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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

            <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white transition hover:bg-white/10"
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
          <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="text-2xl font-black text-green-400 md:text-4xl">
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
              className="mt-10 rounded-[1.5rem] bg-green-500 px-8 py-4 text-2xl font-black text-white transition hover:bg-green-400"
            >
              التالي
            </button>
          </section>
        )}

        {step === "reveal-role" && revealPlayer && activeItem && (
          <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="text-2xl font-black text-green-400 md:text-4xl">
              {revealPlayer.name}
            </div>

            {!revealShown ? (
              <>
                <p className="mt-5 text-lg leading-8 text-white/80">
                  اضغط على زر الإظهار لرؤية دورك داخل الجولة.
                </p>

                <button
                  onClick={() => setRevealShown(true)}
                  className="mt-10 rounded-[1.5rem] bg-green-500 px-8 py-4 text-2xl font-black text-white transition hover:bg-green-400"
                >
                  إظهار
                </button>
              </>
            ) : revealPlayer.id === outsiderId ? (
              <>
                <p className="mt-5 text-xl leading-9 text-white">
                  أنت <span className="font-black text-green-400">برا السالفة</span>
                  <br />
                  حاول تعرف الكلمة من أسئلة اللاعبين وتصويتهم.
                </p>

                <button
                  onClick={goNextReveal}
                  className="mt-10 rounded-[1.5rem] bg-green-500 px-8 py-4 text-2xl font-black text-white transition hover:bg-green-400"
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
                  className="mt-10 rounded-[1.5rem] bg-green-500 px-8 py-4 text-2xl font-black text-white transition hover:bg-green-400"
                >
                  التالي
                </button>
              </>
            )}
          </section>
        )}

        {step === "questions" && currentQuestionPair && (
          <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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
                className="rounded-[1.4rem] bg-green-500 px-7 py-4 text-xl font-black text-white transition hover:bg-green-400"
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
          <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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
                    className="w-full rounded-[1.2rem] bg-green-500 px-5 py-4 text-lg font-black text-white transition hover:bg-green-400"
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

            <div className="mt-4 text-4xl font-black text-green-400 md:text-6xl">
              {outsiderPlayer.name}
            </div>

            <button
              onClick={() => setStep("guess")}
              className="mt-10 rounded-[1.5rem] bg-green-500 px-8 py-4 text-2xl font-black text-white transition hover:bg-green-400"
            >
              التالي
            </button>
          </section>
        )}

        {step === "guess" && outsiderPlayer && activeItem && (
          <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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
                  className="rounded-[1.5rem] bg-green-500 px-8 py-4 text-2xl font-black text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  إجابة
                </button>
              ) : (
                <button
                  onClick={goToResultsAfterGuess}
                  className="rounded-[1.5rem] bg-green-500 px-8 py-4 text-2xl font-black text-white transition hover:bg-green-400"
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
          <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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
                className="rounded-[1.5rem] bg-green-500 px-8 py-4 text-2xl font-black text-white transition hover:bg-green-400"
              >
                التالي
              </button>
            </div>
          </section>
        )}

        {step === "round-end" && (
          <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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
                className="rounded-[1.4rem] bg-green-500 px-6 py-4 text-xl font-black text-white transition hover:bg-green-400"
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
          <section className="rounded-[2rem] border border-amber-400/20 bg-[#071126] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
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
                className="rounded-[1.5rem] bg-cyan-500 px-8 py-4 text-2xl font-black text-slate-950 transition hover:bg-cyan-400"
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