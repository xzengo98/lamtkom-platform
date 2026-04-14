import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Tone = "cyan" | "orange" | "emerald" | "slate" | "violet";

type StatCardProps = {
  label: string;
  value: number | string;
  tone?: Tone;
  icon: ReactNode;
};

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  tone?: Tone;
  icon: ReactNode;
  badge?: string;
};

type ProfileRow = {
  role: string | null;
};

function toneClasses(tone: Tone) {
  switch (tone) {
    case "cyan":
      return {
        bar: "bg-cyan-400",
        stat: "border-cyan-400/15 bg-cyan-400/[0.06]",
        num: "text-cyan-300",
        lbl: "text-cyan-400/70",
        iconBg: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        badge: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
        button:
          "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/[0.18]",
        glow: "hover:shadow-[0_20px_48px_rgba(34,211,238,0.10)]",
      };
    case "orange":
      return {
        bar: "bg-orange-400",
        stat: "border-orange-400/15 bg-orange-400/[0.06]",
        num: "text-orange-300",
        lbl: "text-orange-400/70",
        iconBg: "border-orange-400/20 bg-orange-400/10 text-orange-300",
        badge: "border-orange-400/25 bg-orange-400/10 text-orange-300",
        button:
          "border-orange-400/20 bg-orange-400/10 text-orange-200 hover:bg-orange-400/[0.18]",
        glow: "hover:shadow-[0_20px_48px_rgba(249,115,22,0.10)]",
      };
    case "emerald":
      return {
        bar: "bg-emerald-400",
        stat: "border-emerald-400/15 bg-emerald-400/[0.06]",
        num: "text-emerald-300",
        lbl: "text-emerald-400/70",
        iconBg: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
        button:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/[0.18]",
        glow: "hover:shadow-[0_20px_48px_rgba(52,211,153,0.10)]",
      };
    case "violet":
      return {
        bar: "bg-violet-400",
        stat: "border-violet-400/15 bg-violet-400/[0.06]",
        num: "text-violet-300",
        lbl: "text-violet-400/70",
        iconBg: "border-violet-400/20 bg-violet-400/10 text-violet-300",
        badge: "border-violet-400/25 bg-violet-400/10 text-violet-300",
        button:
          "border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/[0.18]",
        glow: "hover:shadow-[0_20px_48px_rgba(167,139,250,0.10)]",
      };
    default:
      return {
        bar: "bg-white/20",
        stat: "border-white/10 bg-white/[0.04]",
        num: "text-white/85",
        lbl: "text-white/50",
        iconBg: "border-white/10 bg-white/[0.05] text-white/70",
        badge: "border-white/10 bg-white/[0.05] text-white/70",
        button: "border-white/10 bg-white/[0.05] text-white/75 hover:bg-white/10",
        glow: "hover:shadow-[0_20px_48px_rgba(255,255,255,0.04)]",
      };
  }
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function GridIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function UsersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.8-4.2" />
    </svg>
  );
}

function TrophyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h2a2 2 0 0 1 2 2c0 2.5-2 4-4 4" />
      <path d="M7 5H5a2 2 0 0 0-2 2c0 2.5 2 4 4 4" />
    </svg>
  );
}

function CubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z" />
      <path d="M12 20v-9" />
      <path d="m20 6.5-8 4.5-8-4.5" />
    </svg>
  );
}

function DatabaseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
    </svg>
  );
}

function StatCard({ label, value, tone = "slate", icon }: StatCardProps) {
  const c = toneClasses(tone);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 ${c.stat} ${c.glow}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`text-xs font-medium ${c.lbl}`}>{label}</span>
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${c.iconBg}`}
        >
          {icon}
        </span>
      </div>
      <div className={`text-2xl font-bold sm:text-3xl ${c.num}`}>{value}</div>
    </div>
  );
}

function StatGroup({
  label,
  tone = "slate",
  children,
}: {
  label: string;
  tone?: Tone;
  children: ReactNode;
}) {
  const c = toneClasses(tone);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
      <div className={`h-1 w-full ${c.bar}`} />
      <div className="border-b border-white/8 px-5 py-4">
        <h3 className="text-base font-bold text-white">{label}</h3>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

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
    <Link
      href={href}
      className={`group block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all duration-200 hover:-translate-y-0.5 ${c.glow}`}
    >
      <div className={`h-1 w-full ${c.bar}`} />

      <div className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${c.iconBg}`}
          >
            {icon}
          </span>

          {badge ? (
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${c.badge}`}
            >
              {badge}
            </span>
          ) : null}
        </div>

        <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
        <p className="mb-5 text-sm leading-6 text-white/65">{description}</p>

        <div
          className={`mt-auto inline-flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${c.button}`}
        >
          <span>فتح الصفحة</span>
          <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

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
    <div className="mb-5">
      <span className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/65">
        {badge}
      </span>
      <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      <p className="max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
        {description}
      </p>
    </div>
  );
}

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as ProfileRow | null;

  if (!typedProfile || typedProfile.role !== "admin") {
    redirect("/");
  }

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

  const stats = {
    sections: sectionsResult.count ?? 0,
    categories: categoriesResult.count ?? 0,
    activeCategories: activeCategoriesResult.count ?? 0,
    questions: questionsResult.count ?? 0,
    baraSections: baraSectionsResult.count ?? 0,
    baraCategories: baraCategoriesResult.count ?? 0,
    baraItems: baraItemsResult.count ?? 0,
    users: usersResult.count ?? 0,
    completedGames: completedGamesResult.count ?? 0,
    codenamesWords: codenamesWordsResult.count ?? 0,
    codenamesActiveWords: codenamesActiveWordsResult.count ?? 0,
    codenamesRooms: codenamesRoomsResult.count ?? 0,
    codenamesWaitingRooms: codenamesWaitingRoomsResult.count ?? 0,
    codenamesActiveRooms: codenamesActiveRoomsResult.count ?? 0,
    codenamesFinishedRooms: codenamesFinishedRoomsResult.count ?? 0,
  };

  const lammatnaActions: ActionCardProps[] = [
    {
      title: "إدارة الأقسام الرئيسية",
      description: "استعراض الأقسام الرئيسية وتعديلها بسرعة.",
      href: "/admin/sections",
      tone: "orange",
      icon: <GridIcon className="h-5 w-5" />,
    },
    {
      title: "إضافة قسم جديد",
      description: "إنشاء قسم جديد للعبة لمتكم.",
      href: "/admin/sections/new",
      tone: "orange",
      icon: <span className="text-lg">➕</span>,
    },
    {
      title: "إدارة الفئات",
      description: "التحكم بالفئات الحالية وعرض تفاصيلها.",
      href: "/admin/categories",
      tone: "cyan",
      icon: <CubeIcon className="h-5 w-5" />,
    },
    {
      title: "إضافة فئة جديدة",
      description: "إضافة فئة جديدة وربطها بالقسم المناسب.",
      href: "/admin/categories/new",
      tone: "cyan",
      icon: <span className="text-lg">➕</span>,
    },
    {
      title: "إدارة الأسئلة",
      description: "فلترة وتعديل وحذف ومراجعة الأسئلة.",
      href: "/admin/questions",
      tone: "emerald",
      icon: <span className="text-lg">❓</span>,
    },
    {
      title: "رفع أسئلة دفعة واحدة",
      description: "استيراد عدد كبير من الأسئلة بسهولة.",
      href: "/admin/questions/import",
      tone: "emerald",
      icon: <span className="text-lg">⬆️</span>,
    },
  ];

  const baraActions: ActionCardProps[] = [
    {
      title: "إدارة برا السالفة",
      description: "الدخول إلى الصفحة الرئيسية لإدارة اللعبة.",
      href: "/admin/bara-alsalfah",
      tone: "cyan",
      icon: <GridIcon className="h-5 w-5" />,
    },
    {
      title: "إدارة الفئات",
      description: "إدارة الأقسام والفئات الخاصة باللعبة.",
      href: "/admin/bara-alsalfah/categories",
      tone: "orange",
      icon: <CubeIcon className="h-5 w-5" />,
    },
    {
      title: "إضافة قسم أو فئة",
      description: "إنشاء قسم أو فئة جديدة لبرا السالفة.",
      href: "/admin/bara-alsalfah/categories/new",
      tone: "orange",
      icon: <span className="text-lg">➕</span>,
    },
    {
      title: "إضافة عنصر جديد",
      description: "إضافة الجواب الصحيح والخيارات الخاطئة.",
      href: "/admin/bara-alsalfah/new",
      tone: "emerald",
      icon: <span className="text-lg">✨</span>,
    },
  ];

  const codenamesActions: ActionCardProps[] = [
    {
      title: "إدارة Codenames",
      description: "لوحة الكلمات والغرف الخاصة باللعبة.",
      href: "/admin/codenames",
      tone: "cyan",
      icon: <GridIcon className="h-5 w-5" />,
      badge: "جديد",
    },
    {
      title: "إدارة الكلمات",
      description: "إضافة وتعديل وتفعيل كلمات اللعبة.",
      href: "/admin/codenames/words",
      tone: "orange",
      icon: <DatabaseIcon className="h-5 w-5" />,
    },
    {
      title: "رفع جماعي",
      description: "رفع بنك كلمات كامل دفعة واحدة.",
      href: "/admin/codenames/upload",
      tone: "emerald",
      icon: <span className="text-lg">⬆️</span>,
    },
    {
      title: "إدارة الغرف",
      description: "متابعة الغرف الحالية والمنتهية.",
      href: "/admin/codenames/rooms",
      tone: "violet",
      icon: <UsersIcon className="h-5 w-5" />,
    },
  ];

  const systemActions: ActionCardProps[] = [
    {
      title: "الأعضاء",
      description: "استعراض المستخدمين وحالاتهم داخل النظام.",
      href: "/admin/users",
      tone: "slate",
      icon: <UsersIcon className="h-5 w-5" />,
    },
    {
      title: "الألعاب المكتملة",
      description: "مراجعة الجلسات والألعاب المكتملة.",
      href: "/admin/games",
      tone: "slate",
      icon: <TrophyIcon className="h-5 w-5" />,
    },
    {
      title: "الرجوع للموقع",
      description: "فتح الواجهة الرئيسية للموقع.",
      href: "/",
      tone: "slate",
      icon: <span className="text-lg">↩️</span>,
    },
  ];

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-80px] h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-[-6%] top-[40px] h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[40%] h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8 lg:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.65fr]">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                  <ShieldIcon className="h-4 w-4" />
                  لوحة التحكم الرئيسية
                </span>

                <h1 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Admin Dashboard
                </h1>

                <p className="max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
                  صفحة موحدة لإدارة لمتكم، برا السالفة، وCodenames، مع وصول سريع
                  وواضح لأهم الصفحات والإحصائيات.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/80">
                    {stats.users} عضو
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/80">
                    {stats.completedGames} لعبة مكتملة
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/80">
                    {stats.questions} سؤال
                  </span>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.04] sm:h-48 sm:w-48">
                  <div className="absolute inset-4 rounded-[28px] border border-cyan-400/15 bg-cyan-400/5" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 sm:h-24 sm:w-24">
                    <ShieldIcon className="h-10 w-10 sm:h-12 sm:w-12" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 space-y-8">
            <SectionHeader
              badge="الإحصائيات"
              title="نظرة سريعة على المنصة"
              description="إحصائيات مقسمة حسب كل لعبة وقسم داخل النظام، حتى تصل بسرعة لأي جزء مهم داخل لوحة التحكم."
            />

            <div className="grid gap-6">
              <StatGroup label="لمتكم" tone="orange">
                <StatCard
                  label="الأقسام الرئيسية"
                  value={stats.sections}
                  tone="orange"
                  icon={<GridIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="الفئات"
                  value={stats.categories}
                  tone="cyan"
                  icon={<CubeIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="الفئات المفعلة"
                  value={stats.activeCategories}
                  tone="emerald"
                  icon={<ShieldIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="الأسئلة"
                  value={stats.questions}
                  tone="emerald"
                  icon={<DatabaseIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="الألعاب المكتملة"
                  value={stats.completedGames}
                  tone="violet"
                  icon={<TrophyIcon className="h-4 w-4" />}
                />
              </StatGroup>

              <StatGroup label="برا السالفة" tone="cyan">
                <StatCard
                  label="الأقسام"
                  value={stats.baraSections}
                  tone="cyan"
                  icon={<GridIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="الفئات"
                  value={stats.baraCategories}
                  tone="orange"
                  icon={<CubeIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="العناصر المفعلة"
                  value={stats.baraItems}
                  tone="emerald"
                  icon={<DatabaseIcon className="h-4 w-4" />}
                />
              </StatGroup>

              <StatGroup label="Codenames" tone="violet">
                <StatCard
                  label="كل الكلمات"
                  value={stats.codenamesWords}
                  tone="violet"
                  icon={<DatabaseIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="الكلمات المفعلة"
                  value={stats.codenamesActiveWords}
                  tone="emerald"
                  icon={<ShieldIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="كل الغرف"
                  value={stats.codenamesRooms}
                  tone="cyan"
                  icon={<UsersIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="غرف الانتظار"
                  value={stats.codenamesWaitingRooms}
                  tone="orange"
                  icon={<UsersIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="الغرف النشطة"
                  value={stats.codenamesActiveRooms}
                  tone="emerald"
                  icon={<UsersIcon className="h-4 w-4" />}
                />
                <StatCard
                  label="الغرف المنتهية"
                  value={stats.codenamesFinishedRooms}
                  tone="slate"
                  icon={<TrophyIcon className="h-4 w-4" />}
                />
              </StatGroup>

              <StatGroup label="النظام" tone="slate">
                <StatCard
                  label="الأعضاء"
                  value={stats.users}
                  tone="slate"
                  icon={<UsersIcon className="h-4 w-4" />}
                />
              </StatGroup>
            </div>
          </div>

          <div className="mt-10 space-y-10">
            <section>
              <SectionHeader
                badge="إدارة لمتكم"
                title="روابط الإدارة السريعة"
                description="الوصول المباشر إلى أقسام وفئات وأسئلة لعبة لمتكم."
              />
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {lammatnaActions.map((item) => (
                  <ActionCard key={item.href} {...item} />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader
                badge="إدارة برا السالفة"
                title="روابط اللعبة الاجتماعية"
                description="كل ما تحتاجه لإدارة أقسام وفئات وعناصر برا السالفة من مكان واحد."
              />
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {baraActions.map((item) => (
                  <ActionCard key={item.href} {...item} />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader
                badge="إدارة Codenames"
                title="الكلمات والغرف"
                description="متابعة بنك الكلمات وحالة الغرف الخاصة بلعبة Codenames."
              />
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {codenamesActions.map((item) => (
                  <ActionCard key={item.href} {...item} />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader
                badge="النظام"
                title="روابط عامة"
                description="صفحات الإدارة العامة الخاصة بالمستخدمين والجلسات والعودة للموقع."
              />
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {systemActions.map((item) => (
                  <ActionCard key={item.href} {...item} />
                ))}
              </div>
            </section>
          </div>

          <footer className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 py-6 text-sm text-white/55 sm:flex-row sm:items-center">
            <span>لمتكم Admin — {new Date().getFullYear()}</span>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/75 transition hover:text-white"
            >
              <span>الرجوع للموقع</span>
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}