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
  if (count === 1) return "متبقية لعبة واحدة";
  if (count === 2) return "متبقي لعبتان";
  if (count >= 3 && count <= 10) return `متبقي ${count} ألعاب`;
  return `متبقي ${count} لعبة`;
}

function getAvailabilityBadge(availability: CategoryAvailability) {
  if (!availability.isSelectable) {
    return {
      text: "غير متاحة",
      className:
        "border-red-500/30 bg-slate-950/95 text-red-200 shadow-lg shadow-red-900/20",
    };
  }

  if (availability.mode === "fixed") {
    return {
      text: "متاحة الآن",
      className:
        "border-white/20 bg-slate-950/95 text-white shadow-lg shadow-black/20",
    };
  }

  return {
    text: formatAvailableGamesLabel(availability.availableGames),
    className:
      "border-emerald-400/30 bg-slate-950/95 text-emerald-200 shadow-lg shadow-emerald-900/20",
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
        "rounded-[1.25rem] border p-3 md:rounded-[1.5rem] md:p-4",
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
          "text-xl md:text-2xl",
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
      <div className="text-[10px] text-white/60 md:text-xs">{label}</div>
      <div className="mt-1 text-sm font-black text-white md:text-base">
        {value}
      </div>
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
    <form action={action} onSubmit={validateBeforeSubmit} className="space-y-5 md:space-y-6">
      <input
        type="hidden"
        name="selectedCategories"
        value={selectedCategories.join(",")}
      />

      <section className="rounded-[1.5rem] border border-white/10 bg-[#071126] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:rounded-[2rem] md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="text-cyan-300 text-sm">إعداد لعبة جديدة</div>
            <h1 className="mt-2 text-2xl font-black text-white md:text-5xl">
              جهّز اللعبة خلال دقائق
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 md:text-lg md:leading-8">
              اختر اسم اللعبة، أضف أسماء الفريقين، ثم حدد ست فئات لتبدأ الجولة
              مباشرة.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 xl:max-w-[470px]">
            <SummaryCard
              label="الألعاب المتبقية"
              value={String(gamesRemaining)}
            />
            <SummaryCard
              label="الفئات المطلوبة"
              value={String(REQUIRED_CATEGORY_COUNT)}
            />
            <SummaryCard
              label="نمط الأسئلة"
              value={selectionMode === "dynamic" ? "بدون تكرار" : "قابلة للتكرار"}
              accent="cyan"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-[#071126] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:rounded-[2rem] md:p-6">
          <div className="mb-5">
            <div className="text-cyan-300 text-sm">الخطوة الأولى</div>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              اختر اسم اللعبة وأسماء الفرق
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
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 md:h-14 md:text-base"
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
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 md:h-14 md:text-base"
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
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 md:h-14 md:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[1.5rem] border border-white/10 bg-[#071126] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:rounded-[2rem] md:p-6">
          <div className="text-cyan-300 text-sm">ملخص الإعداد</div>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
            جاهزية اللعبة
          </h2>

          <div className="mt-5 grid gap-4">
            <SummaryCard
              label="الألعاب المتبقية"
              value={String(gamesRemaining)}
            />
            <SummaryCard
              label="حالة الاختيار"
              value={isReadyToSubmit ? "جاهز للبدء" : "أكمل اختيار الفئات"}
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

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75 md:rounded-[1.5rem] md:text-base md:leading-8">
            {selectionMode === "dynamic" ? (
              <p>
                حسابك يعمل الآن بنمط <strong className="text-white">عشوائي بدون تكرار</strong>.
                كل فئة تُظهر عدد الألعاب المتبقية الفعلي، ولن تُستخدم نفس الأسئلة
                مرة أخرى.
              </p>
            ) : (
              <p>
                حسابك يعمل الآن بنمط <strong className="text-white">الأسئلة الثابتة</strong>.
                قد تتكرر الأسئلة في الحساب المجاني.
              </p>
            )}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-cyan-400/20 bg-cyan-400/10 p-4 md:rounded-[1.5rem]">
            <div className="text-base font-black text-cyan-100 md:text-lg">
              {isReadyToSubmit
                ? "تم اختيار العدد المطلوب. يمكنك الآن بدء اللعبة."
                : `اختر ${remainingToSelect} فئات إضافية للمتابعة.`}
            </div>
          </div>
        </section>
      </section>

      <section className="rounded-[1.5rem] border border-white/10 bg-[#071126] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:rounded-[2rem] md:p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-cyan-300 text-sm">الخطوة الثانية</div>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              اختر {REQUIRED_CATEGORY_COUNT} فئات
            </h2>
            <p className="mt-3 text-sm text-white/70 md:text-base">
              كل بطاقة تعرض حالة الفئة، وعدد الجولات المتاحة، ومخزون الأسئلة.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <div className="text-sm text-white/60">الفئات المختارة</div>
            <div className="mt-1 text-xl font-black text-white md:text-2xl">
              {selectedCount} / {REQUIRED_CATEGORY_COUNT}
            </div>
          </div>
        </div>

        <div className="space-y-7">
          {groupedSections.map((section) => {
            const theme = getSectionTheme(section.slug);

            return (
              <section key={section.id} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div
                      className={[
                        "inline-flex rounded-full border px-3 py-1 text-sm font-bold",
                        theme.badge,
                      ].join(" ")}
                    >
                      {section.name}
                    </div>
                    <p className="mt-2 text-sm text-white/65 md:text-base">
                      {section.description || "قسم رئيسي للفئات"}
                    </p>
                  </div>

                  <div className="text-sm text-white/50">
                    {section.categories.length} فئات
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                <div>
                  <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-bold text-white">
                    فئات بدون قسم
                  </div>
                  <p className="mt-2 text-sm text-white/65 md:text-base">
                    هذه الفئات غير مربوطة بقسم رئيسي.
                  </p>
                </div>

                <div className="text-sm text-white/50">
                  {uncategorized.length} فئات
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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

      <section className="rounded-[1.5rem] border border-white/10 bg-[#071126] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:rounded-[2rem] md:p-6">
        <div className="mb-4">
          <div className="text-cyan-300 text-sm">الخطوة الأخيرة</div>
          <h3 className="mt-2 text-2xl font-black text-white md:text-3xl">
            جاهز لبدء اللعبة؟
          </h3>
          <p className="mt-3 text-sm text-white/70 md:text-base">
            بعد التأكد من اسم اللعبة وأسماء الفرق واختيار 6 فئات، يمكنك بدء الجولة
            مباشرة.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 text-base font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 md:px-8 md:py-4 md:text-lg"
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
    <div
      className={[
        "group relative overflow-hidden rounded-[1.5rem] border bg-[#09132c] shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition-all duration-200",
        active
          ? "border-cyan-300/40 ring-2 ring-cyan-400/30"
          : "border-white/10 hover:-translate-y-0.5 hover:border-white/20",
        !availability.isSelectable ? "opacity-80" : "",
      ].join(" ")}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${theme.glow}`}
      />

      <button
        type="button"
        onClick={(event) => onInfoClick(event, category.id)}
        className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-lg font-black text-white shadow-lg md:h-9 md:w-9 md:text-xl"
        aria-label={`عرض وصف ${category.name}`}
      >
        i
      </button>

      <div
        className={[
          "absolute left-3 top-3 z-20 rounded-full border px-2.5 py-1 text-[11px] font-bold md:px-3 md:text-xs",
          badge.className,
        ].join(" ")}
      >
        {badge.text}
      </div>

      {active ? (
        <div className="absolute bottom-[4.3rem] left-3 z-20 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-bold text-cyan-100 md:bottom-[4.6rem] md:px-3 md:text-xs">
          تم الاختيار
        </div>
      ) : null}

      <div className="relative">
        <div className="h-40 overflow-hidden sm:h-44 md:h-48">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-900 text-4xl text-white/25 md:text-5xl">
              ✨
            </div>
          )}
        </div>

        {!availability.isSelectable ? (
          <div className="absolute inset-0 bg-slate-950/35" />
        ) : null}

        {infoOpen ? (
          <div className="absolute inset-x-3 top-12 z-20 rounded-[1.25rem] border border-white/10 bg-slate-950/95 p-3 text-white shadow-2xl md:rounded-[1.5rem] md:p-4">
            <div className="text-base font-black md:text-lg">{category.name}</div>
            <p className="mt-2 text-xs leading-6 text-white/75 md:text-sm md:leading-7">
              {category.description || "لا يوجد وصف متاح لهذه الفئة حاليًا."}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="200" value={availability.easyCount} />
              <MiniStat label="400" value={availability.mediumCount} />
              <MiniStat label="600" value={availability.hardCount} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative px-3 py-3 text-center md:px-4 md:py-4">
        <div className="text-lg font-black text-white md:text-xl">
          {category.name}
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={!availability.isSelectable}
          className={[
            "mt-3 inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold transition md:text-sm",
            active
              ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              : availability.isSelectable
                ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40",
          ].join(" ")}
        >
          {active ? "إلغاء الاختيار" : "اختيار الفئة"}
        </button>
      </div>
    </div>
  );
}