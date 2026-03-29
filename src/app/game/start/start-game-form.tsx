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
    iconBg: string;
    iconText: string;
  }
> = {
  general: {
    badge: "border-orange-400/30 bg-orange-500/10 text-orange-200",
    glow: "from-orange-400/10 via-orange-300/5 to-transparent",
    iconBg: "bg-orange-400/10 border-orange-300/20",
    iconText: "text-orange-100",
  },
  islamic: {
    badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    glow: "from-emerald-400/10 via-lime-300/5 to-transparent",
    iconBg: "bg-emerald-400/10 border-emerald-300/20",
    iconText: "text-emerald-100",
  },
  sports: {
    badge: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
    glow: "from-cyan-400/10 via-sky-300/5 to-transparent",
    iconBg: "bg-cyan-400/10 border-cyan-300/20",
    iconText: "text-cyan-100",
  },
  entertainment: {
    badge: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200",
    glow: "from-fuchsia-400/10 via-pink-300/5 to-transparent",
    iconBg: "bg-fuchsia-400/10 border-fuchsia-300/20",
    iconText: "text-fuchsia-100",
  },
  default: {
    badge: "border-white/15 bg-white/5 text-white/85",
    glow: "from-slate-400/10 via-slate-300/5 to-transparent",
    iconBg: "bg-white/5 border-white/10",
    iconText: "text-white/85",
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

function SparkIcon({ className = "h-5 w-5" }: { className?: string }) {
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

function GamepadIcon({ className = "h-5 w-5" }: { className?: string }) {
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

function UsersIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M4 19a5 5 0 0 1 10 0" />
      <path d="M14 19a4 4 0 0 1 6 0" />
    </svg>
  );
}

function GridIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function InfoIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function TicketIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M4 7a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4V7Z" />
      <path d="M12 8v8" />
    </svg>
  );
}

function CheckListIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M9 6h10" />
      <path d="M9 12h10" />
      <path d="M9 18h10" />
      <path d="m4 6 1.2 1.2L7.8 4.8" />
      <path d="m4 12 1.2 1.2L7.8 10.8" />
      <path d="m4 18 1.2 1.2L7.8 16.8" />
    </svg>
  );
}

function LayersIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
    </svg>
  );
}

function RepeatIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M17 2v5h-5" />
      <path d="M7 22v-5h5" />
      <path d="M20 9a7 7 0 0 0-12-4L7 7" />
      <path d="M4 15a7 7 0 0 0 12 4l1-2" />
    </svg>
  );
}

function SummaryCard({
  label,
  value,
  accent = "default",
  icon,
}: {
  label: string;
  value: string;
  accent?: "default" | "cyan" | "orange";
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={[
        "rounded-[1rem] border px-4 py-3 text-center shadow-[0_8px_18px_rgba(0,0,0,0.16)]",
        accent === "cyan"
          ? "border-cyan-300/20 bg-cyan-400/10"
          : accent === "orange"
            ? "border-orange-300/20 bg-orange-400/10"
            : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      <div className="mb-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-white/55">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-lg font-black text-white md:text-xl">{value}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[0.9rem] border border-white/10 bg-white/5 px-3 py-2.5 text-center">
      <div className="mb-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-white/50">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-base font-black text-white">{value}</div>
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
    <form
      action={action}
      onSubmit={validateBeforeSubmit}
      className="mx-auto max-w-[1500px] space-y-5 px-2 md:px-4"
    >
      <input
        type="hidden"
        name="selectedCategories"
        value={selectedCategories.join(",")}
      />

      {/* Header */}
      <section className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-glow absolute -right-10 top-0 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="hero-glow absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-violet-400/10 blur-3xl" />
        </div>

        <div className="relative grid gap-4 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div className="text-center xl:text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
              <GamepadIcon className="h-4 w-4" />
              <span>إعداد لعبة جديدة</span>
            </div>

            <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">
              جهّز اللعبة بسرعة
            </h1>

            <p className="mt-3 text-sm leading-7 text-white/72 md:text-base">
              اختر اسم اللعبة، أضف أسماء الفريقين، ثم حدد ست فئات لتبدأ الجولة
              مباشرة.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <SummaryCard
              label="منع التكرار"
              value={selectionMode === "dynamic" ? "بدون تكرار" : "تكرار مسموح"}
              icon={<RepeatIcon className="h-3.5 w-3.5" />}
            />
            <SummaryCard
              label="عدد المختار حاليًا"
              value={`${selectedCount} / ${REQUIRED_CATEGORY_COUNT}`}
              icon={<CheckListIcon className="h-3.5 w-3.5" />}
            />
            <SummaryCard
              label="عدد الفئات المطلوبة"
              value={String(REQUIRED_CATEGORY_COUNT)}
              icon={<LayersIcon className="h-3.5 w-3.5" />}
            />
            <SummaryCard
              label="الألعاب المتبقية"
              value={String(gamesRemaining)}
              accent="cyan"
              icon={<TicketIcon className="h-3.5 w-3.5" />}
            />
          </div>
        </div>
      </section>

      {/* Summary + Inputs */}
      <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        {/* Summary */}
        <section className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.24)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2.5 text-cyan-100">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-white/45">
                ملخص سريع
              </div>
              <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
                جاهزية اللعبة
              </h2>
            </div>
          </div>

          <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-sm font-black text-white/65">
              {isReadyToSubmit
                ? "تم اختيار العدد المطلوب. اضغط ابدأ اللعبة."
                : `اختر ${remainingToSelect} فئات إضافية للمتابعة.`}
            </div>
          </div>

          <div className="mt-4 grid gap-2.5">
            <SummaryCard
              label="اسم اللعبة"
              value={gameName.trim() || "-"}
              icon={<SparkIcon className="h-3.5 w-3.5" />}
            />
            <SummaryCard
              label="الفريق الأول"
              value={teamOne.trim() || "-"}
              accent="cyan"
              icon={<UsersIcon className="h-3.5 w-3.5" />}
            />
            <SummaryCard
              label="الفريق الثاني"
              value={teamTwo.trim() || "-"}
              accent="orange"
              icon={<UsersIcon className="h-3.5 w-3.5" />}
            />
          </div>

          {visibleError ? (
            <div className="mt-4 rounded-[1rem] border border-red-500/30 bg-[#34161b] px-4 py-4 text-sm font-bold text-red-200">
              {visibleError}
            </div>
          ) : null}
        </section>

        {/* Inputs */}
        <section className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.24)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2.5 text-cyan-100">
              <SparkIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-white/45">
                الخطوة الأولى
              </div>
              <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
                بيانات اللعبة
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <div className="mb-2 text-sm font-black text-white/80">
                اسم اللعبة
              </div>
              <input
                name="gameName"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="مثال: تحدي الأذكياء"
                className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 md:h-12 md:text-base"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-black text-white/80">
                الفريق الأول
              </div>
              <input
                name="teamOne"
                value={teamOne}
                onChange={(e) => setTeamOne(e.target.value)}
                placeholder="اسم الفريق الأول"
                className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 md:h-12 md:text-base"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-black text-white/80">
                الفريق الثاني
              </div>
              <input
                name="teamTwo"
                value={teamTwo}
                onChange={(e) => setTeamTwo(e.target.value)}
                placeholder="اسم الفريق الثاني"
                className="h-11 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 md:h-12 md:text-base"
              />
            </label>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MiniStat
              label="الحالة"
              value={isReadyToSubmit ? "جاهزة" : "قيد الإعداد"}
              icon={<SparkIcon className="h-3.5 w-3.5" />}
            />
            <MiniStat
              label="المتبقي"
              value={remainingToSelect}
              icon={<LayersIcon className="h-3.5 w-3.5" />}
            />
            <MiniStat
              label="عدد المختار"
              value={`${selectedCount} / ${REQUIRED_CATEGORY_COUNT}`}
              icon={<CheckListIcon className="h-3.5 w-3.5" />}
            />
          </div>

          <div className="mt-5 flex justify-start">
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.1rem] bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 md:text-base"
            >
              ابدأ اللعبة
            </button>
          </div>
        </section>
      </div>

      {/* Categories Full Width */}
      <section className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.24)]">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2.5 text-cyan-100">
              <GridIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-white/45">
                الخطوة الثانية
              </div>
              <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
                اختر الفئات
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MiniStat
              label="عدد المختار"
              value={`${selectedCount} / ${REQUIRED_CATEGORY_COUNT}`}
              icon={<CheckListIcon className="h-3.5 w-3.5" />}
            />
            <MiniStat
              label="المتبقي"
              value={remainingToSelect}
              icon={<LayersIcon className="h-3.5 w-3.5" />}
            />
            <MiniStat
              label="الحالة"
              value={isReadyToSubmit ? "جاهزة" : "قيد الإعداد"}
              icon={<SparkIcon className="h-3.5 w-3.5" />}
            />
          </div>
        </div>

        <p className="mb-5 text-sm leading-6 text-white/70">
          اضغط على البطاقة نفسها لاختيار الفئة أو إلغاء اختيارها. يجب اختيار{" "}
          {REQUIRED_CATEGORY_COUNT} فئات بالضبط قبل بدء اللعبة.
        </p>

        <div className="space-y-5">
          {groupedSections.map((section) => {
            const theme = getSectionTheme(section.slug);

            return (
              <div
                key={section.id}
                className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${theme.badge}`}
                    >
                      <SparkIcon className="h-4 w-4" />
                      <span>{section.name}</span>
                    </div>

                    <div className="mt-3 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white/70">
                      {section.description ||
                        "قسم رئيسي يضم مجموعة من الفئات الجاهزة للعب."}
                    </div>
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/70">
                    {section.categories.length} فئات
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              </div>
            );
          })}

          {uncategorized.length > 0 ? (
            <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-black text-white/85">
                    <GridIcon className="h-4 w-4" />
                    <span>فئات بدون قسم</span>
                  </div>

                  <div className="mt-3 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white/70">
                    هذه الفئات غير مربوطة بقسم رئيسي لكنها متاحة للاختيار واللعب.
                  </div>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/70">
                  {uncategorized.length} فئات
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            </div>
          ) : null}
        </div>
      </section>

      <style>{`
        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }

        .hero-glow {
          animation: glowPulse 4.6s ease-in-out infinite;
        }
      `}</style>
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
    iconBg: string;
    iconText: string;
  };
  availability: CategoryAvailability;
}) {
  const badge = getAvailabilityBadge(availability);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "group relative overflow-hidden rounded-[1.2rem] border p-3 text-right shadow-[0_10px_20px_rgba(0,0,0,0.16)] transition duration-300",
        active
          ? "border-cyan-300/30 bg-[linear-gradient(180deg,rgba(21,53,94,0.95)_0%,rgba(7,17,40,0.98)_100%)] shadow-[0_18px_36px_rgba(34,211,238,0.10)]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] hover:-translate-y-1 hover:border-white/20",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-radial from-white/10 via-transparent to-transparent opacity-80" />

      <button
        type="button"
        onClick={(event) => onInfoClick(event, category.id)}
        className="absolute left-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/20 bg-sky-500 text-white shadow-lg"
        aria-label={`عرض وصف ${category.name}`}
      >
        <InfoIcon className="h-4 w-4" />
      </button>

      <div className="relative">
        <div className="mb-3 flex items-center justify-start">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${badge.className}`}
          >
            <span>{badge.text}</span>
          </div>
        </div>

        {active ? (
          <div className="mb-3 flex justify-center">
            <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black text-cyan-100">
              تم الاختيار
            </div>
          </div>
        ) : null}

        <div className="mb-4 flex justify-center">
          {category.image_url ? (
            <div className="h-20 w-20 overflow-hidden rounded-[1rem] border border-white/10 bg-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.16)]">
              <img
                src={category.image_url}
                alt={category.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`inline-flex h-20 w-20 items-center justify-center rounded-[1rem] border ${theme.iconBg} ${theme.iconText} shadow-[0_8px_16px_rgba(0,0,0,0.16)]`}
            >
              <SparkIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="text-base font-black text-white md:text-lg">
            {category.name}
          </h3>
          <p className="mt-2 text-xs font-bold text-white/45">
            {active ? "اضغط لإلغاء الاختيار" : "اضغط لاختيار الفئة"}
          </p>
        </div>

        {!availability.isSelectable ? (
          <div className="mt-4 rounded-[0.95rem] border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-200">
            لا توجد أسئلة كافية لبدء لعبة كاملة
          </div>
        ) : null}

        {infoOpen ? (
          <div className="mt-4 rounded-[0.95rem] border border-white/10 bg-white/5 p-3 text-sm leading-7 text-white/75">
            <div className="mb-2 font-black text-white">{category.name}</div>
            <div>
              {category.description || "لا يوجد وصف متاح لهذه الفئة حاليًا."}
            </div>
          </div>
        ) : null}
      </div>
    </button>
  );
}