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
    sectionBadge: string;
    sectionGlow: string;
    cardAccent: string;
    cardSurface: string;
    titleBar: string;
    availability: string;
    selectedRing: string;
    info: string;
    iconTint: string;
    iconBg: string;
    countBadge: string;
  }
> = {
  general: {
    sectionBadge: "border-orange-300/25 bg-orange-400/10 text-orange-100",
    sectionGlow: "from-orange-400/10 via-orange-300/5 to-transparent",
    cardAccent: "from-orange-500/90 to-orange-600/95",
    cardSurface: "from-[#302010] to-[#191109]",
    titleBar: "bg-[linear-gradient(180deg,#e18942_0%,#c36023_100%)] text-white",
    availability: "border-orange-300/25 bg-[#13263b] text-orange-100",
    selectedRing:
      "ring-4 ring-orange-300/70 shadow-[0_0_0_3px_rgba(253,186,116,0.22),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-orange-100",
    iconBg: "bg-[#112945]",
    countBadge: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  },
  islamic: {
    sectionBadge: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    sectionGlow: "from-emerald-400/10 via-emerald-300/5 to-transparent",
    cardAccent: "from-emerald-500/90 to-emerald-600/95",
    cardSurface: "from-[#17352a] to-[#0f211c]",
    titleBar: "bg-[linear-gradient(180deg,#2dbd8c_0%,#1c9b74_100%)] text-white",
    availability: "border-emerald-300/25 bg-[#13263b] text-emerald-100",
    selectedRing:
      "ring-4 ring-emerald-300/70 shadow-[0_0_0_3px_rgba(110,231,183,0.22),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-emerald-100",
    iconBg: "bg-[#112945]",
    countBadge: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  },
  sports: {
    sectionBadge: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
    sectionGlow: "from-cyan-400/10 via-cyan-300/5 to-transparent",
    cardAccent: "from-cyan-500/90 to-sky-600/95",
    cardSurface: "from-[#123452] to-[#0b1f32]",
    titleBar: "bg-[linear-gradient(180deg,#1798df_0%,#0b7fca_100%)] text-white",
    availability: "border-cyan-300/25 bg-[#13263b] text-cyan-100",
    selectedRing:
      "ring-4 ring-cyan-300/70 shadow-[0_0_0_3px_rgba(103,232,249,0.22),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-cyan-100",
    iconBg: "bg-[#112945]",
    countBadge: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
  },
  entertainment: {
    sectionBadge: "border-violet-300/25 bg-violet-400/10 text-violet-100",
    sectionGlow: "from-violet-400/10 via-fuchsia-300/5 to-transparent",
    cardAccent: "from-violet-500/90 to-fuchsia-600/95",
    cardSurface: "from-[#2a1940] to-[#191126]",
    titleBar: "bg-[linear-gradient(180deg,#8f67ff_0%,#6f47ec_100%)] text-white",
    availability: "border-violet-300/25 bg-[#13263b] text-violet-100",
    selectedRing:
      "ring-4 ring-violet-300/70 shadow-[0_0_0_3px_rgba(196,181,253,0.22),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-violet-100",
    iconBg: "bg-[#112945]",
    countBadge: "border-violet-300/20 bg-violet-400/10 text-violet-100",
  },
  default: {
    sectionBadge: "border-white/15 bg-white/5 text-white/90",
    sectionGlow: "from-slate-300/10 via-slate-200/5 to-transparent",
    cardAccent: "from-slate-500/90 to-slate-700/95",
    cardSurface: "from-[#1d2742] to-[#101828]",
    titleBar: "bg-[linear-gradient(180deg,#2497dd_0%,#1280c9_100%)] text-white",
    availability: "border-white/15 bg-[#13263b] text-white",
    selectedRing:
      "ring-4 ring-white/60 shadow-[0_0_0_3px_rgba(255,255,255,0.14),0_18px_36px_rgba(0,0,0,0.28)]",
    info: "bg-[#ca4327] text-white",
    iconTint: "text-white",
    iconBg: "bg-[#112945]",
    countBadge: "border-white/10 bg-white/5 text-white",
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
      text: "لعبة واحدة",
      className: "border-cyan-300/25 bg-[#13263b] text-cyan-100",
    };
  }

  return {
    text: formatAvailableGamesLabel(availability.availableGames),
    className: "border-emerald-400/30 bg-[#0f2e2a] text-emerald-200",
  };
}

function GamepadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M4 19a5 5 0 0 1 10 0" />
      <path d="M14 19a4 4 0 0 1 6 0" />
    </svg>
  );
}

function GridIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function InfoIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function TicketIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4V7Z" />
      <path d="M12 8v8" />
    </svg>
  );
}

function SparkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
    </svg>
  );
}

function MosqueIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20h14" />
      <path d="M7 20v-7h10v7" />
      <path d="M9 13V9l3-2 3 2v4" />
      <path d="M18 20V8l-2-2" />
      <path d="M6 20V10l2-2" />
      <path d="M12 5h.01" />
    </svg>
  );
}

function GlobeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function FilmIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
    </svg>
  );
}

function TrophyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M5 6H3a3 3 0 0 0 3 3" />
      <path d="M19 6h2a3 3 0 0 1-3 3" />
    </svg>
  );
}

function getSectionIcon(slug: string) {
  if (slug === "islamic") return <MosqueIcon className="h-5 w-5" />;
  if (slug === "sports") return <TrophyIcon className="h-5 w-5" />;
  if (slug === "entertainment") return <FilmIcon className="h-5 w-5" />;
  return <GlobeIcon className="h-5 w-5" />;
}

function SummaryBadge({
  label,
  value,
  accent = "default",
  icon,
}: {
  label: string;
  value: string;
  accent?: "default" | "cyan" | "orange" | "emerald";
  icon?: React.ReactNode;
}) {
  const tone =
    accent === "cyan"
      ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
      : accent === "orange"
      ? "border-orange-300/20 bg-orange-400/10 text-orange-100"
      : accent === "emerald"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
      : "border-white/10 bg-white/5 text-white";

  return (
    <div className={`rounded-[1rem] border px-4 py-3 text-center shadow-[0_8px_18px_rgba(0,0,0,0.16)] ${tone}`}>
      <div className="mb-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-white/60">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-lg font-black md:text-xl">{value}</div>
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
        categories: safeCategories.filter((category) => category.section_id === section.id),
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
        "هذه الفئة غير متاحة حاليًا ولا تحتوي على عدد كافٍ من الأسئلة لبدء لعبة جديدة."
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
      (id) => !categoryAvailability[id]?.isSelectable
    );

    if (invalidSelection) {
      event.preventDefault();
      setLocalError("هناك فئة مختارة لم تعد متاحة، حدّث الاختيار ثم حاول مجددًا.");
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
className="mx-auto max-w-[1650px] space-y-6 px-2 md:px-4"    >
      <input type="hidden" name="selectedCategories" value={selectedCategories.join(",")} />

      {/* Top setup */}
      <section className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.28)] md:p-6">
        <div className="grid gap-5 xl:grid-cols-[1fr_1.25fr] xl:items-center">
          <div className="order-2 xl:order-1">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1rem] border border-white/10 bg-[#121d38] p-4">
                <div className="mb-2 text-sm font-black text-white/70">اسم اللعبة</div>
                <input
                  name="gameName"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="مثال: تحدي الأذكياء"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none transition focus:border-cyan-400/50"
                />
              </div>

              <div className="rounded-[1rem] border border-cyan-300/20 bg-cyan-500/10 p-4">
                <div className="mb-2 text-sm font-black text-cyan-100">الفريق الأول</div>
                <input
                  name="teamOne"
                  value={teamOne}
                  onChange={(e) => setTeamOne(e.target.value)}
                  placeholder="اسم الفريق الأول"
                  className="w-full rounded-2xl border border-cyan-300/10 bg-[#0b1733] px-4 py-4 text-white outline-none transition focus:border-cyan-300/50"
                />
              </div>

              <div className="rounded-[1rem] border border-orange-300/20 bg-orange-500/10 p-4">
                <div className="mb-2 text-sm font-black text-orange-100">الفريق الثاني</div>
                <input
                  name="teamTwo"
                  value={teamTwo}
                  onChange={(e) => setTeamTwo(e.target.value)}
                  placeholder="اسم الفريق الثاني"
                  className="w-full rounded-2xl border border-orange-300/10 bg-[#24150d] px-4 py-4 text-white outline-none transition focus:border-orange-300/50"
                />
              </div>
            </div>
          </div>

          <div className="order-1 xl:order-2 text-right">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="submit"
                disabled={!isReadyToSubmit || gamesRemaining <= 0}
                className="inline-flex min-h-[56px] items-center justify-center rounded-[1.1rem] border border-cyan-300/20 bg-cyan-500 px-7 py-3 text-base font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ابدأ اللعبة
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
                <GamepadIcon className="h-4 w-4" />
                <span>إعداد اللعبة</span>
              </div>
            </div>

            <h1 className="mt-4 text-3xl font-black text-white md:text-5xl">
              جهّز الجولة قبل البدء
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
              اختر اسم اللعبة وأسماء الفرق ثم انتقل لاختيار 6 فئات بطريقة عرض واضحة
              ومناسبة للعب الجماعي.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <SummaryBadge
                label="الفئات المطلوبة"
                value={String(REQUIRED_CATEGORY_COUNT)}
                icon={<GridIcon className="h-3.5 w-3.5" />}
              />
              <SummaryBadge
                label="المختار حاليًا"
                value={`${selectedCount}/${REQUIRED_CATEGORY_COUNT}`}
                accent="cyan"
                icon={<SparkIcon className="h-3.5 w-3.5" />}
              />
              <SummaryBadge
                label="الألعاب المتبقية"
                value={String(gamesRemaining)}
                accent="orange"
                icon={<TicketIcon className="h-3.5 w-3.5" />}
              />
            </div>
          </div>
        </div>

        {visibleError ? (
          <div className="mt-5 rounded-[1rem] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
            {visibleError}
          </div>
        ) : null}
      </section>

      {/* Categories */}
      <section className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.04),transparent_24%),linear-gradient(180deg,#08152f_0%,#08162f_100%)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.28)] md:p-6">
        <div className="mb-7 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
            <GridIcon className="h-4 w-4" />
            <span>اختيار الفئات</span>
          </div>

          <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
            اختر الفئات
          </h2>

          <p className="mt-3 text-sm text-white/65 md:text-base">
            اختر {REQUIRED_CATEGORY_COUNT} فئات لبدء المسابقة
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-base font-black text-white/85">
            المختار: <span className="text-cyan-300">{selectedCount}</span> / {REQUIRED_CATEGORY_COUNT}
          </div>
        </div>

        <div className="space-y-10">
          {groupedSections.map((section) => {
            const theme = getSectionTheme(section.slug);

            return (
              <div key={section.id} className="relative">
                <div
                  className={`pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br ${theme.sectionGlow} opacity-80 blur-3xl`}
                />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className={`rounded-full border px-4 py-2 text-xs font-black ${theme.countBadge}`}>
                      {section.categories.length} فئة فرعية
                    </div>

                    <div className="text-right">
                      <div className="flex flex-row-reverse items-center justify-end gap-3">
                        <div className={`relative flex h-14 w-14 items-center justify-center rounded-[1rem] border border-white/10 ${theme.iconBg} ${theme.iconTint} shadow-[0_8px_20px_rgba(0,0,0,0.18)]`}>
                          <div className="absolute inset-[5px] rounded-[0.8rem] border border-white/10" />
                          <div className="relative z-10">{getSectionIcon(section.slug)}</div>
                        </div>

                        <h3 className="text-3xl font-black text-white md:text-5xl">
                          {section.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {section.categories.map((category) => {
                      const availability =
                        categoryAvailability[category.id] ?? {
                          availableGames: 0,
                          isSelectable: false,
                          mode: selectionMode,
                          easyCount: 0,
                          mediumCount: 0,
                          hardCount: 0,
                        };

                      const active = selectedCategories.includes(category.id);
                      const badge = getAvailabilityBadge(availability);
                      const infoOpen = openInfoId === category.id;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`group relative w-[calc(50%-0.5rem)] min-w-[150px] max-w-[180px] shrink-0 rounded-[1.6rem] border border-black/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-0 text-right shadow-[0_16px_32px_rgba(0,0,0,0.26)] transition duration-200 hover:-translate-y-1 sm:w-[172px] ${
                            active ? `${theme.selectedRing} scale-[1.015]` : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(event) => handleInfoClick(event, category.id)}
                            className={`absolute left-[-10px] top-[-12px] z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#08162f] text-lg font-black shadow-lg ${theme.info}`}
                            aria-label={`عرض وصف ${category.name}`}
                          >
                            i
                          </button>

                          <div
                            className={`absolute right-2 top-2 z-20 rounded-full border px-3 py-1 text-[11px] font-black ${badge.className}`}
                          >
                            {badge.text}
                          </div>

                          {active ? (
                            <div className="absolute bottom-2 left-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950 shadow-lg">
                              ✓
                            </div>
                          ) : null}

                          <div className="relative h-[148px] overflow-hidden rounded-t-[1.55rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]">
                            {category.image_url ? (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className={`h-full w-full bg-gradient-to-b ${theme.cardAccent} opacity-80`} />
                            )}

                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_58%)]" />
                          </div>

                          <div
                            className={`relative rounded-b-[1.55rem] border-t-4 border-black/30 px-4 py-3 text-center ${theme.titleBar}`}
                          >
                            <div className="text-[1.1rem] font-black leading-tight text-white">
                              {category.name}
                            </div>
                          </div>

                          {active ? (
                            <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] border-[3px] border-white/15" />
                          ) : null}

                          {infoOpen ? (
                            <div className="absolute inset-x-2 bottom-[72px] z-30 rounded-[1rem] border border-white/10 bg-slate-950/95 p-3 text-right shadow-2xl">
                              <div className="mb-1 text-sm font-black text-white">
                                {category.name}
                              </div>
                              <div className="text-xs leading-6 text-white/70">
                                {category.description || "لا يوجد وصف متاح لهذه الفئة حاليًا."}
                              </div>
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {uncategorized.length > 0 ? (
            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white">
                  {uncategorized.length} فئة فرعية
                </div>

                <div className="text-right">
                  <div className="flex flex-row-reverse items-center justify-end gap-3">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-[1rem] border border-white/10 bg-[#112945] text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                      <div className="absolute inset-[5px] rounded-[0.8rem] border border-white/10" />
                      <div className="relative z-10">
                        <GlobeIcon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="text-3xl font-black text-white md:text-5xl">
                      فئات بدون قسم
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {uncategorized.map((category) => {
                  const theme = getSectionTheme("default");
                  const availability =
                    categoryAvailability[category.id] ?? {
                      availableGames: 0,
                      isSelectable: false,
                      mode: selectionMode,
                      easyCount: 0,
                      mediumCount: 0,
                      hardCount: 0,
                    };

                  const active = selectedCategories.includes(category.id);
                  const badge = getAvailabilityBadge(availability);
                  const infoOpen = openInfoId === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`group relative w-[calc(50%-0.5rem)] min-w-[150px] max-w-[180px] shrink-0 rounded-[1.6rem] border border-black/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-0 text-right shadow-[0_16px_32px_rgba(0,0,0,0.26)] transition duration-200 hover:-translate-y-1 sm:w-[172px] ${
                        active ? `${theme.selectedRing} scale-[1.015]` : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(event) => handleInfoClick(event, category.id)}
                        className={`absolute left-[-10px] top-[-12px] z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#08162f] text-lg font-black shadow-lg ${theme.info}`}
                        aria-label={`عرض وصف ${category.name}`}
                      >
                        i
                      </button>

                      <div
                        className={`absolute right-2 top-2 z-20 rounded-full border px-3 py-1 text-[11px] font-black ${badge.className}`}
                      >
                        {badge.text}
                      </div>

                      {active ? (
                        <div className="absolute bottom-2 left-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950 shadow-lg">
                          ✓
                        </div>
                      ) : null}

                      <div className="relative h-[148px] overflow-hidden rounded-t-[1.55rem]">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className={`h-full w-full bg-gradient-to-b ${theme.cardAccent} opacity-80`} />
                        )}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_58%)]" />
                      </div>

                      <div
                        className={`relative rounded-b-[1.55rem] border-t-4 border-black/30 px-4 py-3 text-center ${theme.titleBar}`}
                      >
                        <div className="text-[1.1rem] font-black leading-tight text-white">
                          {category.name}
                        </div>
                      </div>

                      {infoOpen ? (
                        <div className="absolute inset-x-2 bottom-[72px] z-30 rounded-[1rem] border border-white/10 bg-slate-950/95 p-3 text-right shadow-2xl">
                          <div className="mb-1 text-sm font-black text-white">
                            {category.name}
                          </div>
                          <div className="text-xs leading-6 text-white/70">
                            {category.description || "لا يوجد وصف متاح لهذه الفئة حاليًا."}
                          </div>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {groupedSections.length === 0 && uncategorized.length === 0 ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-8 text-center text-white/60">
              لا توجد أقسام أو فئات جاهزة حاليًا.
            </div>
          ) : null}
        </div>
      </section>

      <style>{`
        input::placeholder {
          opacity: 0.7;
        }
      `}</style>
    </form>
  );
}