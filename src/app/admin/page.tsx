import type { ReactNode } from "react";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

function toneClasses(tone: Tone) {
  switch (tone) {
    case "cyan":
      return {
        bar: "bg-cyan-400",
        stat: "border-cyan-400/15 bg-cyan-400/6",
        num: "text-cyan-300",
        lbl: "text-cyan-400/60",
        iconBg: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        badge: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
        button: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/[0.18]",
        glow: "hover:shadow-[0_18px_42px_rgba(34,211,238,0.08)]",
      };
    case "orange":
      return {
        bar: "bg-orange-400",
        stat: "border-orange-400/15 bg-orange-400/6",
        num: "text-orange-300",
        lbl: "text-orange-400/60",
        iconBg: "border-orange-400/20 bg-orange-400/10 text-orange-300",
        badge: "border-orange-400/25 bg-orange-400/10 text-orange-300",
        button: "border-orange-400/20 bg-orange-400/10 text-orange-200 hover:bg-orange-400/[0.18]",
        glow: "hover:shadow-[0_18px_42px_rgba(249,115,22,0.08)]",
      };
    case "emerald":
      return {
        bar: "bg-emerald-400",
        stat: "border-emerald-400/15 bg-emerald-400/6",
        num: "text-emerald-300",
        lbl: "text-emerald-400/60",
        iconBg: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
        button: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/[0.18]",
        glow: "hover:shadow-[0_18px_42px_rgba(52,211,153,0.08)]",
      };
    case "violet":
      return {
        bar: "bg-violet-400",
        stat: "border-violet-400/15 bg-violet-400/6",
        num: "text-violet-300",
        lbl: "text-violet-400/60",
        iconBg: "border-violet-400/20 bg-violet-400/10 text-violet-300",
        badge: "border-violet-400/25 bg-violet-400/10 text-violet-300",
        button: "border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/[0.18]",
        glow: "hover:shadow-[0_18px_42px_rgba(167,139,250,0.08)]",
      };
    default:
      return {
        bar: "bg-white/25",
        stat: "border-white/8 bg-white/4",
        num: "text-white/85",
        lbl: "text-white/42",
        iconBg: "border-white/10 bg-white/5 text-white/60",
        badge: "border-white/10 bg-white/5 text-white/60",
        button: "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
        glow: "hover:shadow-[0_18px_42px_rgba(255,255,255,0.04)]",
      };
  }
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function StatCard({ label, value, tone = "slate", icon }: StatCardProps) {
  const c = toneClasses(tone);

  return (
    <div
      className={`overflow-hidden rounded-[1.5rem] border ${c.stat} p-4 shadow-[0_12px_34px_rgba(0,0,0,0.14)]`}
    >
      <div className={`mb-3 h-[2px] w-full rounded-full ${c.bar} opacity-70`} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-xs font-black ${c.lbl}`}>{label}</p>
          <p className={`mt-2 text-2xl font-black ${c.num}`}>{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-lg ${c.iconBg}`}
        >
          {icon}
        </div>
      </div>
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
    <section className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-4 shadow-[0_16px_45px_rgba(0,0,0,0.16)]">
      <div className={`mb-4 h-[2px] w-full rounded-full ${c.bar} opacity-70`} />
      <h3 className="text-lg font-black text-white">{label}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
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
    <article
      className={`group overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-5 transition duration-300 ${c.glow}`}
    >
      <div className={`mb-4 h-[2px] w-full rounded-full ${c.bar} opacity-70`} />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-lg ${c.iconBg}`}>
          {icon}
        </div>

        {badge ? (
          <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${c.badge}`}>
            {badge}
          </span>
        ) : null}
      </div>

      <h3 className="text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/55">{description}</p>

      <div className="mt-5">
        <Link
          href={href}
          className={`inline-flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-black transition ${c.button}`}
        >
          فتح الصفحة
          <ArrowIcon />
        </Link>
      </div>
    </article>
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
      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-black text-white/60">
        {badge}
      </span>
      <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-white/55">{description}</p>
    </div>
  );
}

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();

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
    supabase.from("categories").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("questions").select("*", { count: "exact", head: true }),
    supabase.from("bara_sections").select("*", { count: "exact", head: true }),
    supabase.from("bara_categories").select("*", { count: "exact", head: true }),
    supabase.from("bara_items").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("game_sessions").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("codenames_word_bank").select("*", { count: "exact", head: true }),
    supabase.from("codenames_word_bank").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("codenames_rooms").select("*", { count: "exact", head: true }),
    supabase.from("codenames_rooms").select("*", { count: "exact", head: true }).eq("status", "waiting"),
    supabase.from("codenames_rooms").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("codenames_rooms").select("*", { count: "exact", head: true }).eq("status", "finished"),
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
      icon: "🗂️",
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
      icon: "🧩",
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
      icon: "🧠",
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
    <main className="space-y-6 text-white">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.20)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-black text-cyan-300">
              لوحة التحكم الرئيسية
            </span>

            <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
              نظرة عامة
              <span className="mr-2 text-white/72">على المنصة</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-8 text-white/55">
              وصول سريع إلى الإحصائيات وأهم صفحات الإدارة بدون Hero ضخم أو فراغات زائدة.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
              <div className="text-lg font-black text-cyan-300">{stats.users}</div>
              <div className="mt-1 text-[11px] font-bold text-white/45">عضو</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
              <div className="text-lg font-black text-orange-300">{stats.completedGames}</div>
              <div className="mt-1 text-[11px] font-bold text-white/45">لعبة مكتملة</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
              <div className="text-lg font-black text-emerald-300">{stats.questions}</div>
              <div className="mt-1 text-[11px] font-bold text-white/45">سؤال</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <StatGroup label="لمتكم" tone="cyan">
          <StatCard label="الأقسام" value={stats.sections} tone="orange" icon="🗂️" />
          <StatCard label="الفئات" value={stats.categories} tone="cyan" icon="🧩" />
          <StatCard label="الفئات النشطة" value={stats.activeCategories} tone="cyan" icon="✅" />
          <StatCard label="الأسئلة" value={stats.questions} tone="emerald" icon="❓" />
        </StatGroup>

        <StatGroup label="برا السالفة" tone="orange">
          <StatCard label="الأقسام" value={stats.baraSections} tone="orange" icon="🗂️" />
          <StatCard label="الفئات" value={stats.baraCategories} tone="cyan" icon="🧩" />
          <StatCard label="العناصر النشطة" value={stats.baraItems} tone="emerald" icon="✨" />
          <StatCard label="الألعاب المكتملة" value={stats.completedGames} tone="slate" icon="🏁" />
        </StatGroup>

        <StatGroup label="Codenames" tone="violet">
          <StatCard label="الكلمات" value={stats.codenamesWords} tone="violet" icon="🔤" />
          <StatCard label="الكلمات النشطة" value={stats.codenamesActiveWords} tone="emerald" icon="✅" />
          <StatCard label="الغرف" value={stats.codenamesRooms} tone="cyan" icon="🚪" />
          <StatCard label="الغرف النشطة" value={stats.codenamesActiveRooms} tone="orange" icon="⚡" />
        </StatGroup>

        <StatGroup label="النظام" tone="slate">
          <StatCard label="الأعضاء" value={stats.users} tone="slate" icon="👥" />
          <StatCard label="غرف الانتظار" value={stats.codenamesWaitingRooms} tone="slate" icon="⏳" />
          <StatCard label="الغرف المنتهية" value={stats.codenamesFinishedRooms} tone="slate" icon="🏁" />
          <StatCard label="الجلسات المكتملة" value={stats.completedGames} tone="slate" icon="📊" />
        </StatGroup>
      </div>

      <section>
        <SectionHeader
          badge="لمتكم"
          title="إدارة لعبة لمتكم"
          description="أهم الصفحات الخاصة بالأقسام والفئات والأسئلة، مع وصول أسرع ومساحات أهدأ."
        />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {lammatnaActions.map((item) => (
            <ActionCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          badge="برا السالفة"
          title="إدارة برا السالفة"
          description="الوصول المباشر إلى الأقسام والفئات والعناصر الخاصة باللعبة."
        />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {baraActions.map((item) => (
            <ActionCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          badge="Codenames"
          title="إدارة Codenames"
          description="الكلمات، الغرف، ورفع البيانات في مكان مرتب وواضح."
        />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {codenamesActions.map((item) => (
            <ActionCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          badge="النظام"
          title="إدارة النظام"
          description="الوصول إلى المستخدمين والألعاب المكتملة والرجوع السريع للموقع."
        />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {systemActions.map((item) => (
            <ActionCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <footer className="pt-2 text-center text-xs text-white/28">
        لمتكم Admin — {new Date().getFullYear()}
      </footer>
    </main>
  );
}