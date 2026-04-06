import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = "cyan" | "orange" | "emerald" | "slate" | "violet";

type StatCardProps = {
  label: string;
  value: number | string;
  tone?: Tone;
  icon: string;
};

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  tone?: Tone;
  icon: string;
  badge?: string;
};

// ─── Tone system ──────────────────────────────────────────────────────────────

function toneClasses(tone: Tone) {
  switch (tone) {
    case "cyan":
      return {
        bar:    "bg-cyan-400",
        stat:   "border-cyan-400/15 bg-cyan-400/6",
        num:    "text-cyan-300",
        lbl:    "text-cyan-400/60",
        iconBg: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        badge:  "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
        button: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/[0.18]",
        glow:   "hover:shadow-[0_20px_48px_rgba(34,211,238,0.10)]",
      };
    case "orange":
      return {
        bar:    "bg-orange-400",
        stat:   "border-orange-400/15 bg-orange-400/6",
        num:    "text-orange-300",
        lbl:    "text-orange-400/60",
        iconBg: "border-orange-400/20 bg-orange-400/10 text-orange-300",
        badge:  "border-orange-400/25 bg-orange-400/10 text-orange-300",
        button: "border-orange-400/20 bg-orange-400/10 text-orange-200 hover:bg-orange-400/[0.18]",
        glow:   "hover:shadow-[0_20px_48px_rgba(249,115,22,0.10)]",
      };
    case "emerald":
      return {
        bar:    "bg-emerald-400",
        stat:   "border-emerald-400/15 bg-emerald-400/6",
        num:    "text-emerald-300",
        lbl:    "text-emerald-400/60",
        iconBg: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        badge:  "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
        button: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/[0.18]",
        glow:   "hover:shadow-[0_20px_48px_rgba(52,211,153,0.10)]",
      };
    case "violet":
      return {
        bar:    "bg-violet-400",
        stat:   "border-violet-400/15 bg-violet-400/6",
        num:    "text-violet-300",
        lbl:    "text-violet-400/60",
        iconBg: "border-violet-400/20 bg-violet-400/10 text-violet-300",
        badge:  "border-violet-400/25 bg-violet-400/10 text-violet-300",
        button: "border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/[0.18]",
        glow:   "hover:shadow-[0_20px_48px_rgba(167,139,250,0.10)]",
      };
    default: // slate
      return {
        bar:    "bg-white/25",
        stat:   "border-white/8 bg-white/4",
        num:    "text-white/80",
        lbl:    "text-white/40",
        iconBg: "border-white/10 bg-white/5 text-white/55",
        badge:  "border-white/10 bg-white/5 text-white/55",
        button: "border-white/10 bg-white/5 text-white/65 hover:bg-white/10",
        glow:   "hover:shadow-[0_20px_48px_rgba(255,255,255,0.04)]",
      };
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function GridIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function UsersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" />
      <path d="M3 20a5 5 0 0 1 10 0" /><path d="M11 20a5 5 0 0 1 10 0" />
    </svg>
  );
}

function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function TrophyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M5 6H3a2 2 0 0 0 2 4h2M19 6h2a2 2 0 0 1-2 4h-2" />
    </svg>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, tone = "slate", icon }: StatCardProps) {
  const c = toneClasses(tone);

  return (
    <div className={`rounded-2xl border ${c.stat} px-4 py-4`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className={`text-xs font-bold ${c.lbl}`}>{label}</span>
        <span className="text-base leading-none">{icon}</span>
      </div>
      <div className={`text-2xl font-black ${c.num}`}>{value}</div>
    </div>
  );
}

// ─── StatGroup ────────────────────────────────────────────────────────────────

function StatGroup({
  label,
  tone = "slate",
  children,
}: {
  label: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  const c = toneClasses(tone);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(160deg,rgba(16,27,52,0.80)_0%,rgba(6,12,28,0.90)_100%)]">
      {/* Colored top bar */}
      <div className={`h-[2px] w-full ${c.bar} opacity-70`} />

      {/* Group label */}
      <div className="flex items-center gap-2 border-b border-white/6 px-4 py-3">
        <span className={`text-xs font-black tracking-widest uppercase ${c.lbl}`}>
          {label}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

// ─── ActionCard ───────────────────────────────────────────────────────────────

function ActionCard({
  title,
  description,
  href,
  tone = "slate",
  icon,
  badge,
}: ActionCardProps) {
  const c = toneClasses(tone);

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-white/8
        bg-[linear-gradient(160deg,rgba(18,28,55,0.95)_0%,rgba(8,14,32,0.98)_100%)]
        shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 ${c.glow}`}
    >
      {/* Colored top bar */}
      <div className={`h-[2px] w-full ${c.bar} opacity-60`} />

      <div className="flex flex-1 flex-col p-5">
        {/* Icon row */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${c.iconBg}`}>
            {icon}
          </div>

          {badge ? (
            <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${c.badge}`}>
              {badge}
            </span>
          ) : null}
        </div>

        {/* Text */}
        <h3 className="text-base font-black text-white md:text-lg">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-7 text-white/50">{description}</p>

        {/* CTA — full width with arrow */}
        <div className="mt-5">
          <Link
            href={href}
            className={`inline-flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-black transition duration-200 active:scale-[0.98] ${c.button}`}
          >
            <span>فتح الصفحة</span>
            <ArrowIcon className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white/50">
        <span className="h-1 w-1 rounded-full bg-cyan-400" />
        {badge}
      </span>
      <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-white/50 md:text-base">
        {description}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();

  // ── Data fetching — completely unchanged ──
  const [
    sectionsResult,
    categoriesResult,
    activeCategoriesResult,
    questionsResult,
    baraSectionsResult,
    baraCategoriesResult,
    baraItemsResult,
    usersResult,
    completedGamesResult,
    codenamesWordsResult,
    codenamesActiveWordsResult,
    codenamesRoomsResult,
    codenamesWaitingRoomsResult,
    codenamesActiveRoomsResult,
    codenamesFinishedRoomsResult,
  ] = await Promise.all([
    supabase.from("category_sections").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("questions").select("*", { count: "exact", head: true }),
    supabase.from("bara_sections").select("*", { count: "exact", head: true }),
    supabase.from("bara_categories").select("*", { count: "exact", head: true }),
    supabase
      .from("bara_items")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("game_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase.from("codenames_word_bank").select("*", { count: "exact", head: true }),
    supabase
      .from("codenames_word_bank")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("codenames_rooms").select("*", { count: "exact", head: true }),
    supabase
      .from("codenames_rooms")
      .select("*", { count: "exact", head: true })
      .eq("status", "waiting"),
    supabase
      .from("codenames_rooms")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("codenames_rooms")
      .select("*", { count: "exact", head: true })
      .eq("status", "finished"),
  ]);

  // ── Stats object — completely unchanged ──
  const stats = {
    sections:                sectionsResult.count ?? 0,
    categories:              categoriesResult.count ?? 0,
    activeCategories:        activeCategoriesResult.count ?? 0,
    questions:               questionsResult.count ?? 0,
    baraSections:            baraSectionsResult.count ?? 0,
    baraCategories:          baraCategoriesResult.count ?? 0,
    baraItems:               baraItemsResult.count ?? 0,
    users:                   usersResult.count ?? 0,
    completedGames:          completedGamesResult.count ?? 0,
    codenamesWords:          codenamesWordsResult.count ?? 0,
    codenamesActiveWords:    codenamesActiveWordsResult.count ?? 0,
    codenamesRooms:          codenamesRoomsResult.count ?? 0,
    codenamesWaitingRooms:   codenamesWaitingRoomsResult.count ?? 0,
    codenamesActiveRooms:    codenamesActiveRoomsResult.count ?? 0,
    codenamesFinishedRooms:  codenamesFinishedRoomsResult.count ?? 0,
  };

  // ── Action arrays — completely unchanged ──
  const lammatnaActions: ActionCardProps[] = [
    {
      title: "إدارة الأقسام الرئيسية",
      description: "استعراض الأقسام الرئيسية وتعديلها بسرعة.",
      href: "/admin/sections",
      tone: "orange",
      icon: "🧱",
    },
    {
      title: "إضافة قسم جديد",
      description: "إنشاء قسم جديد للعبة لمتكم.",
      href: "/admin/sections/new",
      tone: "orange",
      icon: "➕",
    },
    {
      title: "إدارة الفئات",
      description: "التحكم بالفئات الحالية وعرض تفاصيلها.",
      href: "/admin/categories",
      tone: "cyan",
      icon: "🗂️",
    },
    {
      title: "إضافة فئة جديدة",
      description: "إضافة فئة جديدة وربطها بالقسم المناسب.",
      href: "/admin/categories/new",
      tone: "cyan",
      icon: "➕",
    },
    {
      title: "إدارة الأسئلة",
      description: "فلترة وتعديل وحذف ومراجعة الأسئلة.",
      href: "/admin/questions",
      tone: "emerald",
      icon: "❓",
    },
    {
      title: "رفع أسئلة دفعة واحدة",
      description: "استيراد عدد كبير من الأسئلة بسهولة.",
      href: "/admin/questions/import",
      tone: "emerald",
      icon: "⬆️",
    },
  ];

  const baraActions: ActionCardProps[] = [
    {
      title: "إدارة برا السالفة",
      description: "الدخول إلى الصفحة الرئيسية لإدارة اللعبة.",
      href: "/admin/bara-alsalfah",
      tone: "cyan",
      icon: "🎭",
    },
    {
      title: "إدارة الفئات",
      description: "إدارة الأقسام والفئات الخاصة باللعبة.",
      href: "/admin/bara-alsalfah/categories",
      tone: "orange",
      icon: "🗂️",
    },
    {
      title: "إضافة قسم أو فئة",
      description: "إنشاء قسم أو فئة جديدة لبرا السالفة.",
      href: "/admin/bara-alsalfah/categories/new",
      tone: "orange",
      icon: "➕",
    },
    {
      title: "إضافة عنصر جديد",
      description: "إضافة الجواب الصحيح والخيارات الخاطئة.",
      href: "/admin/bara-alsalfah/new",
      tone: "emerald",
      icon: "✨",
    },
  ];

  const codenamesActions: ActionCardProps[] = [
    {
      title: "إدارة Codenames",
      description: "لوحة الكلمات والغرف الخاصة باللعبة.",
      href: "/admin/codenames",
      tone: "cyan",
      icon: "🧩",
      badge: "جديد",
    },
    {
      title: "إدارة الكلمات",
      description: "إضافة وتعديل وتفعيل كلمات اللعبة.",
      href: "/admin/codenames/words",
      tone: "orange",
      icon: "🔤",
    },
    {
      title: "رفع جماعي",
      description: "رفع بنك كلمات كامل دفعة واحدة.",
      href: "/admin/codenames/upload",
      tone: "emerald",
      icon: "⬆️",
    },
    {
      title: "إدارة الغرف",
      description: "متابعة الغرف الحالية والمنتهية.",
      href: "/admin/codenames/rooms",
      tone: "violet",
      icon: "🚪",
    },
  ];

  const systemActions: ActionCardProps[] = [
    {
      title: "الأعضاء",
      description: "استعراض المستخدمين وحالاتهم داخل النظام.",
      href: "/admin/users",
      tone: "slate",
      icon: "👥",
    },
    {
      title: "الألعاب المكتملة",
      description: "مراجعة الجلسات والألعاب المكتملة.",
      href: "/admin/games",
      tone: "slate",
      icon: "🏁",
    },
    {
      title: "الرجوع للموقع",
      description: "فتح الواجهة الرئيسية للموقع.",
      href: "/",
      tone: "slate",
      icon: "↩️",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_55%,rgba(10,18,40,1)_100%)]">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-64 rounded-full bg-violet-500/7 blur-2xl" />

          <div className="relative px-7 py-10 md:px-10 md:py-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

              {/* Left — text */}
              <div>
                {/* Admin badge */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-bold text-cyan-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                  </span>
                  لوحة التحكم الرئيسية
                </div>

                <h1 className="text-3xl font-black text-white md:text-5xl xl:text-[3.2rem]">
                  Admin Dashboard
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-8 text-white/50 md:text-base">
                  صفحة موحدة لإدارة لمتكم، برا السالفة، وCodenames، مع وصول سريع وواضح لأهم الصفحات والإحصائيات.
                </p>

                {/* Quick metric pills */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/60">
                    <UsersIcon className="h-4 w-4" />
                    {stats.users} عضو
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/6 px-4 py-2 text-sm font-bold text-emerald-300/70">
                    <TrophyIcon className="h-4 w-4" />
                    {stats.completedGames} لعبة مكتملة
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/15 bg-orange-400/6 px-4 py-2 text-sm font-bold text-orange-300/70">
                    <GridIcon className="h-4 w-4" />
                    {stats.questions} سؤال
                  </div>
                </div>
              </div>

              {/* Right — shield icon */}
              <div className="hidden xl:flex xl:justify-end">
                <div className="flex h-[160px] w-[160px] items-center justify-center rounded-[2rem] border border-cyan-400/12 bg-[linear-gradient(160deg,rgba(14,24,50,0.96)_0%,rgba(7,13,30,0.98)_100%)] shadow-[0_20px_50px_rgba(0,0,0,0.40)]">
                  <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_70%)]" />
                  <ShieldIcon className="h-16 w-16 text-cyan-400/40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats — grouped by game ────────────────────────────────────────── */}
        <SectionHeader
          badge="إحصائيات سريعة"
          title="نظرة عامة على النظام"
          description="كل الأرقام المهمة مجمّعة حسب كل لعبة لقراءة أوضح وأسرع."
        />

        <div className="space-y-3">

          {/* لمتكم */}
          <StatGroup label="لمتكم" tone="orange">
            <StatCard label="أقسام"        value={stats.sections}         tone="orange"  icon="🧱" />
            <StatCard label="فئات"         value={stats.categories}       tone="cyan"    icon="🗂️" />
            <StatCard label="فئات مفعلة"   value={stats.activeCategories} tone="emerald" icon="✅" />
            <StatCard label="أسئلة"        value={stats.questions}        tone="emerald" icon="❓" />
          </StatGroup>

          {/* برا السالفة */}
          <StatGroup label="برا السالفة" tone="cyan">
            <StatCard label="أقسام"        value={stats.baraSections}    tone="cyan"    icon="🎭" />
            <StatCard label="فئات"         value={stats.baraCategories}  tone="orange"  icon="🗂️" />
            <StatCard label="عناصر نشطة"   value={stats.baraItems}       tone="emerald" icon="✨" />
          </StatGroup>

          {/* Codenames */}
          <StatGroup label="Codenames" tone="violet">
            <StatCard label="كلمات"        value={stats.codenamesWords}         tone="violet"  icon="🔤" />
            <StatCard label="كلمات مفعلة"  value={stats.codenamesActiveWords}   tone="emerald" icon="✅" />
            <StatCard label="كل الغرف"     value={stats.codenamesRooms}         tone="violet"  icon="🚪" />
            <StatCard label="انتظار"        value={stats.codenamesWaitingRooms}  tone="slate"   icon="⏳" />
            <StatCard label="نشطة"         value={stats.codenamesActiveRooms}   tone="cyan"    icon="⚡" />
            <StatCard label="منتهية"        value={stats.codenamesFinishedRooms} tone="orange"  icon="🎯" />
          </StatGroup>

          {/* النظام */}
          <StatGroup label="النظام" tone="slate">
            <StatCard label="الأعضاء"      value={stats.users}          tone="slate" icon="👥" />
            <StatCard label="ألعاب مكتملة" value={stats.completedGames} tone="slate" icon="🏁" />
          </StatGroup>

        </div>

        {/* ── Actions — لمتكم ────────────────────────────────────────────────── */}
        <div className="mt-12">
          <SectionHeader
            badge="لمتكم"
            title="إدارة اللعبة الرئيسية"
            description="كل ما يخص الأقسام والفئات والأسئلة الخاصة بلعبة لمتكم."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lammatnaActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* ── Actions — برا السالفة ──────────────────────────────────────────── */}
        <div className="mt-12">
          <SectionHeader
            badge="برا السالفة"
            title="إدارة لعبة برا السالفة"
            description="الدخول السريع إلى أقسام اللعبة وفئاتها وعناصرها."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {baraActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* ── Actions — Codenames ────────────────────────────────────────────── */}
        <div className="mt-12">
          <SectionHeader
            badge="Codenames"
            title="إدارة لعبة Codenames"
            description="الوصول إلى الكلمات، الرفع الجماعي، والغرف الحالية والمنتهية."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {codenamesActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* ── Actions — النظام ───────────────────────────────────────────────── */}
        <div className="mt-12">
          <SectionHeader
            badge="عام"
            title="أدوات النظام"
            description="الصفحات العامة المهمة بدون تكرار أو عناصر غير ضرورية."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {systemActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-between border-t border-white/6 pt-6 text-xs font-bold text-white/25">
          <span>لمتكم Admin — {new Date().getFullYear()}</span>
          <Link href="/" className="transition hover:text-white/50">
            الرجوع للموقع ←
          </Link>
        </div>

      </div>
    </main>
  );
}
