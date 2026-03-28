"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { CategoryAvailability } from "./page";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  section_id: string | null;
  sort_order?: number | null;
};

type CategorySection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

type Props = {
  sections?: CategorySection[];
  categories?: Category[];
  gamesRemaining: number;
  action: (formData: FormData) => void | Promise<void>;
  categoryAvailability: Record<string, CategoryAvailability>;
  selectionMode: "fixed" | "dynamic";
  errorMessage?: string;
};

const REQUIRED_CATEGORY_COUNT = 6;

const sectionThemes: Record<
  string,
  {
    badge: string;
    glow: string;
  }
> = {
  general: {
    badge: "border-orange-400/30 bg-orange-500/10 text-orange-200",
    glow: "from-orange-400/10 via-orange-300/5 to-transparent",
  },
  islamic: {
    badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    glow: "from-emerald-400/10 via-lime-300/5 to-transparent",
  },
  sports: {
    badge: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
    glow: "from-cyan-400/10 via-sky-300/5 to-transparent",
  },
  entertainment: {
    badge: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200",
    glow: "from-fuchsia-400/10 via-pink-300/5 to-transparent",
  },
  default: {
    badge: "border-white/15 bg-white/5 text-white/85",
    glow: "from-slate-400/10 via-slate-300/5 to-transparent",
  },
};

function getSectionTheme(slug: string) {
  return sectionThemes[slug] ?? sectionThemes.default;
}

function formatAvailableGamesLabel(count: number) {
  if (count <= 0) return "غير متاحة";
  if (count === 1) return "لعبة واحدة";
  if (count === 2) return "لعبتان";
  if (count >= 3 && count <= 10) return `${count} ألعاب`;
  return `${count} لعبة`;
}

function getAvailabilityBadge(availability: CategoryAvailability) {
  if (!availability.isSelectable) {
    return {
      text: "غير متاحة",
      className: "border-red-500/30 bg-[#34161b] text-red-200",
    };
  }

  if (availability.mode === "fixed") {
    return {
      text: "متاحة",
      className: "border-white/15 bg-[#161f3d] text-white",
    };
  }

  return {
    text: formatAvailableGamesLabel(availability.availableGames),
    className: "border-emerald-500/40 bg-[#0f2e2a] text-emerald-200",
  };
}

function SummaryCard({
  label,
  value,
  accent = "default",
}: {
  label: string;
  value: string;
  accent?: "default" | "cyan";
}) {
  return (
    <div
      className={[
        "rounded-[1.1rem] border p-3 md:rounded-[1.35rem] md:p-4",
        accent === "cyan"
          ? "border-cyan-400/20 bg-cyan-400/10"
          : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      <div
        className={[
          "text-xs md:text-sm",
          accent === "cyan" ? "text-cyan-100/80" : "text-white/60",
        ].join(" ")}
      >
        {label}
      </div>
      <div
        className={[
          "mt-1 font-black",
          accent === "cyan" ? "text-cyan-100" : "text-white",
          "text-lg md:text-2xl",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
      <div className="text-[10px] text-white/55 md:text-xs">{label}</div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
    </div>
  );
}

export default function StartGameForm({
  sections = [],
  categories = [],
  gamesRemaining,
  action,
  categoryAvailability,
  selectionMode,
  errorMessage = "",
}: Props) {
  const [gameName, setGameName] = useState("");
  const [teamOne, setTeamOne] = useState("");
  const [teamTwo, setTeamTwo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [localError, setLocalError] = useState("");
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);

  const safeSections = Array.isArray(sections) ? sections : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const groupedSections = useMemo(() => {
    return safeSections
      .map((section) => ({
        ...section,
        categories: safeCategories.filter(
          (category) => category.section_id === section.id,
        ),
      }))
      .filter((section) => section.categories.length > 0);
  }, [safeSections, safeCategories]);

  const uncategorized = useMemo(() => {
    return safeCategories.filter((category) => !category.section_id);
  }, [safeCategories]);

  const selectedCount = selectedCategories.length;
  const remainingToSelect = Math.max(REQUIRED_CATEGORY_COUNT - selectedCount, 0);
  const isReadyToSubmit = selectedCount === REQUIRED_CATEGORY_COUNT;

  function toggleCategory(id: string) {
    const availability = categoryAvailability[id];

    if (!availability?.isSelectable) {
      setLocalError(
        "هذه الفئة غير متاحة حاليًا ولا تحتوي على عدد كافٍ من الأسئلة لبدء لعبة جديدة.",
      );
      return;
    }

    setSelectedCategories((prev) => {
      const isSelected = prev.includes(id);

      if (isSelected) {
        setLocalError("");
        return prev.filter((item) => item !== id);
      }

      if (prev.length >= REQUIRED_CATEGORY_COUNT) {
        setLocalError(`يمكنك اختيار ${REQUIRED_CATEGORY_COUNT} فئات فقط.`);
        return prev;
      }

      setLocalError("");
      return [...prev, id];
    });
  }

  function handleInfoClick(event: ReactMouseEvent, categoryId: string) {
    event.preventDefault();
    event.stopPropagation();
    setOpenInfoId((prev) => (prev === categoryId ? null : categoryId));
  }

  function validateBeforeSubmit(event: FormEvent) {
    const cleanGameName = gameName.trim();
    const cleanTeamOne = teamOne.trim();
    const cleanTeamTwo = teamTwo.trim();

    if (!cleanGameName || !cleanTeamOne || !cleanTeamTwo) {
      event.preventDefault();
      setLocalError("اسم اللعبة واسم الفريق الأول واسم الفريق الثاني مطلوبة.");
      return;
    }

    if (selectedCategories.length !== REQUIRED_CATEGORY_COUNT) {
      event.preventDefault();
      setLocalError(`يجب اختيار ${REQUIRED_CATEGORY_COUNT} فئات بالضبط.`);
      return;
    }

    const invalidSelection = selectedCategories.find(
      (id) => !categoryAvailability[id]?.isSelectable,
    );

    if (invalidSelection) {
      event.preventDefault();
      setLocalError(
        "هناك فئة مختارة لم تعد متاحة، حدّث الاختيار ثم حاول مجددًا.",
      );
      return;
    }

    if (gamesRemaining <= 0) {
      event.preventDefault();
      setLocalError("لا توجد ألعاب متبقية في حسابك.");
      return;
    }

    setLocalError("");
  }

  const visibleError = localError || errorMessage;

  return (
    <form action={action} onSubmit={validateBeforeSubmit} className="space-y-4 md:space-y-5">
      <input
        type="hidden"
        name="selectedCategories"
        value={selectedCategories.join(",")}
      />

      <section className="mx-auto max-w-[1400px] rounded-[1.4rem] border border-white/10 bg-[#071126] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:rounded-[1.9rem] md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="text-cyan-300 text-sm">إعداد لعبة جديدة</div>
            <h1 className="mt-2 text-2xl font-black text-white md:text-4xl">
              جهّز اللعبة بسرعة
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 md:text-base md:leading-8">
              اختر اسم اللعبة، أضف أسماء الفريقين، ثم حدد ست فئات لتبدأ الجولة مباشرة.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 xl:max-w-[440px]">
            <SummaryCard label="الألعاب المتبقية" value={String(gamesRemaining)} />
            <SummaryCard label="الفئات المطلوبة" value={String(REQUIRED_CATEGORY_COUNT)} />
            <SummaryCard
              label="نمط الأسئلة"
              value={selectionMode === "dynamic" ? "بدون تكرار" : "قابلة للتكرار"}
              accent="cyan"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-4 xl:grid-cols-[0.95fr_0.75fr]">
        <div className="rounded-[1.4rem] border border-white/10 bg-[#071126] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:rounded-[1.8rem] md:p-5">
          <div className="mb-4">
            <div className="text-cyan-300 text-sm">الخطوة الأولى</div>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              بيانات اللعبة
            </h2>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                اسم اللعبة
              </label>
              <input
                name="gameName"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="مثال: تحدي الأذكياء"
                className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 md:h-13 md:text-base"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  الفريق الأول
                </label>
                <input
                  name="teamOne"
                  value={teamOne}
                  onChange={(e) => setTeamOne(e.target.value)}
                  placeholder="اسم الفريق الأول"
                  className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 md:h-13 md:text-base"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  الفريق الثاني
                </label>
                <input
                  name="teamTwo"
                  value={teamTwo}
                  onChange={(e) => setTeamTwo(e.target.value)}
                  placeholder="اسم الفريق الثاني"
                  className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 md:h-13 md:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[1.4rem] border border-white/10 bg-[#071126] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:rounded-[1.8rem] md:p-5">
          <div className="text-cyan-300 text-sm">ملخص سريع</div>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
            جاهزية اللعبة
          </h2>

          <div className="mt-4 grid gap-3">
            <SummaryCard
              label="الفئات المختارة"
              value={`${selectedCount} / ${REQUIRED_CATEGORY_COUNT}`}
            />
            <SummaryCard
              label="حالة الاختيار"
              value={isReadyToSubmit ? "جاهز للبدء" : `باقي ${remainingToSelect}`}
            />
            <SummaryCard
              label="نوع السحب"
              value={
                selectionMode === "dynamic"
                  ? "بدون تكرار للبريميوم"
                  : "قابل للتكرار للمجاني"
              }
            />
          </div>

          <div className="mt-4 rounded-[1.2rem] border border-cyan-400/20 bg-cyan-400/10 p-4">
            <div className="text-sm font-black text-cyan-100 md:text-base">
              {isReadyToSubmit
                ? "تم اختيار العدد المطلوب. اضغط ابدأ اللعبة."
                : `اختر ${remainingToSelect} فئات إضافية للمتابعة.`}
            </div>
          </div>
        </section>
      </section>

      <section className="mx-auto max-w-[1400px] rounded-[1.4rem] border border-white/10 bg-[#071126] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:rounded-[1.8rem] md:p-5">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-cyan-300 text-sm">الخطوة الثانية</div>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              اختر الفئات
            </h2>
            <p className="mt-2 text-sm text-white/70 md:text-base">
              اضغط على البطاقة نفسها لاختيار الفئة أو إلغاء اختيارها.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <div className="text-xs text-white/60 md:text-sm">عدد المختار</div>
            <div className="mt-1 text-lg font-black text-white md:text-2xl">
              {selectedCount} / {REQUIRED_CATEGORY_COUNT}
            </div>
          </div>
        </div>

        <div className="space-y-7">
          {groupedSections.map((section) => {
            const theme = getSectionTheme(section.slug);

            return (
              <section key={section.id} className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className={[
                        "inline-flex rounded-full border px-3 py-1 text-sm font-bold",
                        theme.badge,
                      ].join(" ")}
                    >
                      {section.name}
                    </div>

                    <div className="rounded-full border border-white/10 bg-[#0f1b3d] px-3 py-1 text-sm font-bold text-white/85">
                      {section.categories.length} فئات
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0f1b3d] px-4 py-2 text-sm text-white/75 md:max-w-xl">
                    {section.description || "قسم رئيسي يضم مجموعة من الفئات الجاهزة للعب."}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {section.categories.map((category) => {
                    const active = selectedCategories.includes(category.id);

                    return (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        active={active}
                        infoOpen={openInfoId === category.id}
                        onToggle={() => toggleCategory(category.id)}
                        onInfoClick={handleInfoClick}
                        theme={theme}
                        availability={
                          categoryAvailability[category.id] ?? {
                            availableGames: 0,
                            isSelectable: false,
                            mode: selectionMode,
                            easyCount: 0,
                            mediumCount: 0,
                            hardCount: 0,
                          }
                        }
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}

          {uncategorized.length > 0 ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-bold text-white">
                    فئات بدون قسم
                  </div>

                  <div className="rounded-full border border-white/10 bg-[#0f1b3d] px-3 py-1 text-sm font-bold text-white/85">
                    {uncategorized.length} فئات
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0f1b3d] px-4 py-2 text-sm text-white/75 md:max-w-xl">
                  هذه الفئات غير مربوطة بقسم رئيسي لكنها متاحة للاختيار واللعب.
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {uncategorized.map((category) => {
                  const active = selectedCategories.includes(category.id);

                  return (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      active={active}
                      infoOpen={openInfoId === category.id}
                      onToggle={() => toggleCategory(category.id)}
                      onInfoClick={handleInfoClick}
                      theme={sectionThemes.default}
                      availability={
                        categoryAvailability[category.id] ?? {
                          availableGames: 0,
                          isSelectable: false,
                          mode: selectionMode,
                          easyCount: 0,
                          mediumCount: 0,
                          hardCount: 0,
                        }
                      }
                    />
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        {visibleError ? (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-100">
            {visibleError}
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-[1400px] rounded-[1.4rem] border border-white/10 bg-[#071126] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:rounded-[1.8rem] md:p-5">
        <div className="mb-4">
          <div className="text-cyan-300 text-sm">الخطوة الأخيرة</div>
          <h3 className="mt-2 text-2xl font-black text-white md:text-3xl">
            ابدأ الجولة
          </h3>
          <p className="mt-2 text-sm text-white/70 md:text-base">
            بعد اختيار 6 فئات وإدخال بيانات اللعبة، يمكنك البدء مباشرة.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 text-base font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 md:px-8 md:text-lg"
          disabled={!isReadyToSubmit || gamesRemaining <= 0}
        >
          ابدأ اللعبة
        </button>
      </section>
    </form>
  );
}

function CategoryCard({
  category,
  active,
  infoOpen,
  onToggle,
  onInfoClick,
  theme,
  availability,
}: {
  category: Category;
  active: boolean;
  infoOpen: boolean;
  onToggle: () => void;
  onInfoClick: (event: ReactMouseEvent, categoryId: string) => void;
  theme: {
    badge: string;
    glow: string;
  };
  availability: CategoryAvailability;
}) {
  const badge = getAvailabilityBadge(availability);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!availability.isSelectable}
      className={[
        "group relative overflow-hidden rounded-[1.25rem] border bg-[#09132c] text-right shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-all duration-200",
        active
          ? "border-cyan-300/40 ring-2 ring-cyan-400/30"
          : "border-white/10 hover:-translate-y-0.5 hover:border-white/20",
        !availability.isSelectable ? "cursor-not-allowed opacity-75" : "",
      ].join(" ")}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${theme.glow}`}
      />

      <button
        type="button"
        onClick={(event) => onInfoClick(event, category.id)}
        className="absolute right-2 top-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-lg font-black text-white shadow-lg"
        aria-label={`عرض وصف ${category.name}`}
      >
        i
      </button>

      <div
        className={[
          "absolute left-2 top-2 z-20 rounded-full border px-2 py-1 text-[10px] font-bold md:px-2.5 md:text-[11px]",
          badge.className,
        ].join(" ")}
      >
        {badge.text}
      </div>

      {active ? (
        <div className="absolute bottom-[3.9rem] left-2 z-20 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-100">
          تم الاختيار
        </div>
      ) : null}

      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-900 text-3xl text-white/25">
              ✨
            </div>
          )}
        </div>

        {!availability.isSelectable ? (
          <div className="absolute inset-0 bg-slate-950/35" />
        ) : null}

        {infoOpen ? (
          <div className="absolute inset-x-2 top-11 z-20 rounded-[1rem] border border-white/10 bg-slate-950/95 p-3 text-white shadow-2xl">
            <div className="text-sm font-black md:text-base">{category.name}</div>
            <p className="mt-2 line-clamp-4 text-[11px] leading-5 text-white/75 md:text-xs md:leading-6">
              {category.description || "لا يوجد وصف متاح لهذه الفئة حاليًا."}
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <MiniStat label="200" value={availability.easyCount} />
              <MiniStat label="400" value={availability.mediumCount} />
              <MiniStat label="600" value={availability.hardCount} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative px-3 py-3 text-center">
        <div className="line-clamp-2 min-h-[2.8rem] text-base font-black text-white md:text-lg">
          {category.name}
        </div>

        <div className="mt-2 text-[11px] text-white/50">
          {active ? "اضغط لإلغاء الاختيار" : "اضغط لاختيار الفئة"}
        </div>
      </div>
    </button>
  );
}