// src/app/game/start/start-game-form.tsx
"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
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
    ring: string;
    glow: string;
    chip: string;
  }
> = {
  general: {
    badge: "border-orange-400/30 bg-orange-500/10 text-orange-200",
    ring: "hover:border-orange-300/40",
    glow: "from-orange-400/10 via-orange-300/5 to-transparent",
    chip: "bg-orange-500 text-white",
  },
  islamic: {
    badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    ring: "hover:border-emerald-300/40",
    glow: "from-emerald-400/10 via-lime-300/5 to-transparent",
    chip: "bg-emerald-500 text-white",
  },
  sports: {
    badge: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
    ring: "hover:border-cyan-300/40",
    glow: "from-cyan-400/10 via-sky-300/5 to-transparent",
    chip: "bg-cyan-500 text-slate-950",
  },
  entertainment: {
    badge: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200",
    ring: "hover:border-fuchsia-300/40",
    glow: "from-fuchsia-400/10 via-pink-300/5 to-transparent",
    chip: "bg-fuchsia-500 text-white",
  },
  default: {
    badge: "border-white/15 bg-white/5 text-white/85",
    ring: "hover:border-white/25",
    glow: "from-slate-400/10 via-slate-300/5 to-transparent",
    chip: "bg-slate-200 text-slate-950",
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
        "rounded-[1.35rem] border p-4 text-center shadow-[0_14px_30px_rgba(0,0,0,0.2)]",
        accent === "cyan"
          ? "border-cyan-400/20 bg-cyan-400/10"
          : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      <div className="text-xs text-white/60 md:text-sm">{label}</div>
      <div className="mt-2 text-2xl font-black text-white md:text-3xl">
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
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
      <div className="text-[10px] font-bold text-white/50">{label}</div>
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
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_35%),linear-gradient(180deg,#071126_0%,#061020_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="text-cyan-300">إعداد لعبة جديدة</div>
            <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">
              جهّز اللعبة خلال دقائق
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 md:text-base md:leading-8">
              اختر اسم اللعبة، أضف أسماء الفريقين، ثم حدّد ست فئات لتبدأ الجولة
              مباشرة.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              label="الألعاب المتبقية"
              value={String(gamesRemaining)}
              accent="cyan"
            />
            <SummaryCard
              label="الفئات المطلوبة"
              value={String(REQUIRED_CATEGORY_COUNT)}
            />
            <SummaryCard
              label="نمط الأسئلة"
              value={
                selectionMode === "dynamic" ? "بدون تكرار" : "ثابتة"
              }
            />
            <SummaryCard
              label="حالة الاختيار"
              value={isReadyToSubmit ? "جاهز" : `${selectedCount}/${REQUIRED_CATEGORY_COUNT}`}
            />
          </div>
        </div>

        {selectionMode === "dynamic" ? (
          <div className="mt-5 rounded-[1.3rem] border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-7 text-cyan-100">
            حسابك يعمل الآن بنمط <strong>الأسئلة العشوائية بدون تكرار</strong>.
            يظهر على كل فئة عدد الألعاب المتبقية بشكل واضح.
          </div>
        ) : (
          <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
            حسابك يعمل الآن بنمط <strong>الأسئلة الثابتة</strong>، وستظهر لك نفس
            المجموعة الثابتة في كل مرة طالما الفئة مكتملة.
          </div>
        )}

        {visibleError ? (
          <div className="mt-5 rounded-[1.3rem] border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-100">
            {visibleError}
          </div>
        ) : null}
      </section>

      <form action={action} onSubmit={validateBeforeSubmit} className="space-y-6">
        <input
          type="hidden"
          name="selectedCategories"
          value={selectedCategories.join(",")}
        />

        <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="text-cyan-300">الخطوة الأولى</div>
            <h2 className="mt-2 text-3xl font-black text-white">
              اختر اسم اللعبة وأسماء الفرق
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  اسم اللعبة
                </label>
                <input
                  name="gameName"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="مثال: تحدي الأذكياء"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-cyan-400/50"
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
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-cyan-400/50"
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
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-cyan-400/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="text-cyan-300">ملخص الإعداد</div>
            <h2 className="mt-2 text-3xl font-black text-white">
              جاهزية اللعبة
            </h2>

            <div className="mt-6 space-y-4">
              <SummaryCard
                label="الفئات المختارة"
                value={`${selectedCount} / ${REQUIRED_CATEGORY_COUNT}`}
                accent="cyan"
              />
              <SummaryCard
                label="المتبقي"
                value={String(remainingToSelect)}
              />
            </div>

            <div className="mt-6 rounded-[1.3rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
              {isReadyToSubmit
                ? "تم اختيار العدد المطلوب. يمكنك الآن بدء اللعبة."
                : `اختر ${remainingToSelect} فئات إضافية للمتابعة.`}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-cyan-300">الخطوة الثانية</div>
              <h2 className="mt-2 text-3xl font-black text-white">
                اختر {REQUIRED_CATEGORY_COUNT} فئات
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                يظهر على كل بطاقة عدد الألعاب المتبقية بخلفية واضحة وغير شفافة.
              </p>
            </div>

            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-100">
              {selectedCategories.length} / {REQUIRED_CATEGORY_COUNT}
            </div>
          </div>

          <div className="mt-8 space-y-8">
            {groupedSections.map((section) => {
              const theme = getSectionTheme(section.slug);

              return (
                <section key={section.id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div
                        className={`rounded-full border px-4 py-2 text-sm font-bold ${theme.badge}`}
                      >
                        {section.name}
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white">
                        {section.categories.length} فئات
                      </div>
                    </div>

                    <div className="text-sm text-white/60">
                      {section.description || "قسم رئيسي للفئات"}
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white">
                      فئات بدون قسم
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white">
                      {uncategorized.length} فئات
                    </div>
                  </div>

                  <div className="text-sm text-white/60">
                    هذه الفئات غير مربوطة بقسم رئيسي.
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

            {groupedSections.length === 0 && uncategorized.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-center text-white/70">
                لا توجد أقسام أو فئات جاهزة حاليًا.
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="text-cyan-300">الخطوة الأخيرة</div>
          <h3 className="mt-2 text-3xl font-black text-white">
            جاهز لبدء اللعبة؟
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
            بعد التأكد من اسم اللعبة، أسماء الفرق، واختيار 6 فئات، يمكنك بدء
            الجولة مباشرة.
          </p>

          <button
            type="submit"
            disabled={!isReadyToSubmit || gamesRemaining <= 0}
            className="mt-6 rounded-[1.4rem] bg-cyan-500 px-8 py-4 text-lg font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ابدأ اللعبة
          </button>
        </section>
      </form>
    </div>
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
    ring: string;
    glow: string;
    chip: string;
  };
  availability: CategoryAvailability;
}) {
  const badge = getAvailabilityBadge(availability);

  function handleCardKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!availability.isSelectable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  }

  return (
    <div
      role="button"
      tabIndex={availability.isSelectable ? 0 : -1}
      onClick={() => {
        if (availability.isSelectable) onToggle();
      }}
      onKeyDown={handleCardKeyDown}
      className={[
        "group relative overflow-hidden rounded-[1.6rem] border bg-[#09132c] text-right shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition-all duration-200",
        active
          ? "border-cyan-300/40 ring-2 ring-cyan-400/30"
          : `border-white/10 ${theme.ring}`,
        !availability.isSelectable ? "cursor-not-allowed opacity-75" : "",
      ].join(" ")}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${theme.glow}`}
      />

      <button
        type="button"
        onClick={(event) => onInfoClick(event, category.id)}
        className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-lg font-black text-white shadow-lg"
        aria-label={`عرض وصف ${category.name}`}
      >
        i
      </button>

      <div
        className={[
          "absolute left-3 top-3 z-20 rounded-full border px-3 py-1 text-[11px] font-bold",
          badge.className,
        ].join(" ")}
      >
        {badge.text}
      </div>

      {active ? (
        <div
          className={`absolute bottom-[4.5rem] left-3 z-20 rounded-full px-3 py-1 text-[11px] font-black shadow-lg ${theme.chip}`}
        >
          تم الاختيار
        </div>
      ) : null}

      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-900 text-4xl text-white/25">
            ✨
          </div>
        )}

        {!availability.isSelectable ? (
          <div className="absolute inset-0 bg-slate-950/40" />
        ) : null}
      </div>

      {infoOpen ? (
        <div className="absolute inset-0 z-30 flex items-end bg-slate-950/90 p-4 text-right">
          <div className="w-full rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
            <div className="text-lg font-black text-white">
              {category.name}
            </div>

            <p className="mt-2 text-sm leading-7 text-white/75">
              {category.description || "لا يوجد وصف متاح لهذه الفئة حاليًا."}
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <MiniStat label="200" value={availability.easyCount} />
              <MiniStat label="400" value={availability.mediumCount} />
              <MiniStat label="600" value={availability.hardCount} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative px-4 py-4 text-center">
        <div className="text-lg font-black text-white md:text-xl">
          {category.name}
        </div>

        <div className="mt-2 text-xs text-white/50">
          {active ? "اضغط لإلغاء الاختيار" : "اضغط لاختيار الفئة"}
        </div>
      </div>
    </div>
  );
}