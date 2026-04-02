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
        card: "border-cyan-400/20 bg-cyan-400/10",
        soft: "text-cyan-100",
        button: "border-cyan-300/20 bg-cyan-400/10 hover:bg-cyan-400/15",
      };
    case "orange":
      return {
        card: "border-orange-400/20 bg-orange-400/10",
        soft: "text-orange-100",
        button: "border-orange-300/20 bg-orange-400/10 hover:bg-orange-400/15",
      };
    case "emerald":
      return {
        card: "border-emerald-400/20 bg-emerald-400/10",
        soft: "text-emerald-100",
        button: "border-emerald-300/20 bg-emerald-400/10 hover:bg-emerald-400/15",
      };
    case "violet":
      return {
        card: "border-violet-400/20 bg-violet-400/10",
        soft: "text-violet-100",
        button: "border-violet-300/20 bg-violet-400/10 hover:bg-violet-400/15",
      };
    default:
      return {
        card: "border-white/10 bg-white/5",
        soft: "text-white",
        button: "border-white/10 bg-white/5 hover:bg-white/10",
      };
  }
}

function StatCard({ label, value, tone = "slate", icon }: StatCardProps) {
  const classes = toneClasses(tone);

  return (
    <div
      className={`rounded-[1.6rem] border p-4 shadow-[0_12px_28px_rgba(0,0,0,0.20)] backdrop-blur-sm ${classes.card}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className={`text-sm font-black ${classes.soft}`}>{label}</div>
        <div className="text-2xl">{icon}</div>
      </div>

      <div className="text-3xl font-black text-white">{value}</div>
    </div>
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
  const classes = toneClasses(tone);

  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,28,52,0.95)_0%,rgba(7,13,29,0.98)_100%)] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.24)] transition hover:-translate-y-[2px]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
          {icon}
        </div>

        {badge ? (
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-black ${classes.card} ${classes.soft}`}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/65">{description}</p>

      <div className="mt-5">
        <Link
          href={href}
          className={`inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-black text-white transition ${classes.button}`}
        >
          فتح
        </Link>
      </div>
    </div>
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
      <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
        {badge}
      </div>
      <h2 className="text-2xl font-black text-white md:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
        {description}
      </p>
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
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="relative mb-8 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-8">
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.20)_1px,transparent_1px)] [background-size:26px_26px]" />

          <div className="relative">
            <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              لوحة التحكم الرئيسية
            </div>

            <h1 className="text-3xl font-black text-white md:text-5xl">
              Admin Dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
              صفحة موحدة لإدارة لمتكم، برا السالفة، وCodenames، مع وصول سريع
              وواضح لأهم الصفحات والإحصائيات .
            </p>
          </div>
        </div>

        <SectionHeader
          badge="إحصائيات سريعة"
          title="نظرة عامة على النظام"
          description="كل الأرقام المهمة في مكان واحد، بعرض أنظف وأوضح وأسهل للمتابعة اليومية."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="أقسام لمتكم" value={stats.sections} tone="orange" icon="🧱" />
          <StatCard label="فئات لمتكم" value={stats.categories} tone="cyan" icon="🗂️" />
          <StatCard label="الفئات المفعلة" value={stats.activeCategories} tone="emerald" icon="✅" />
          <StatCard label="أسئلة لمتكم" value={stats.questions} tone="emerald" icon="❓" />
          <StatCard label="الأعضاء" value={stats.users} tone="slate" icon="👥" />

          <StatCard label="أقسام برا السالفة" value={stats.baraSections} tone="cyan" icon="🎭" />
          <StatCard label="فئات برا السالفة" value={stats.baraCategories} tone="orange" icon="🗂️" />
          <StatCard label="عناصر برا السالفة" value={stats.baraItems} tone="emerald" icon="✨" />
          <StatCard label="ألعاب مكتملة" value={stats.completedGames} tone="slate" icon="🏁" />
          <StatCard label="كلمات Codenames" value={stats.codenamesWords} tone="orange" icon="🔤" />

          <StatCard label="كلمات مفعلة" value={stats.codenamesActiveWords} tone="emerald" icon="✅" />
          <StatCard label="غرف Codenames" value={stats.codenamesRooms} tone="violet" icon="🚪" />
          <StatCard label="غرف انتظار" value={stats.codenamesWaitingRooms} tone="slate" icon="⏳" />
          <StatCard label="غرف نشطة" value={stats.codenamesActiveRooms} tone="cyan" icon="⚡" />
          <StatCard label="غرف منتهية" value={stats.codenamesFinishedRooms} tone="orange" icon="🎯" />
        </div>

        <div className="mt-10">
          <SectionHeader
            badge="لمتكم"
            title="إدارة اللعبة الرئيسية"
            description="كل ما يخص الأقسام والفئات والأسئلة الخاصة بلعبة لمتكم."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {lammatnaActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <SectionHeader
            badge="برا السالفة"
            title="إدارة لعبة برا السالفة"
            description="الدخول السريع إلى أقسام اللعبة وفئاتها وعناصرها."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {baraActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <SectionHeader
            badge="Codenames"
            title="إدارة لعبة Codenames"
            description="الوصول إلى الكلمات، الرفع الجماعي، والغرف الحالية والمنتهية."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {codenamesActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <SectionHeader
            badge="عام"
            title="أدوات النظام"
            description="الصفحات العامة المهمة بدون تكرار أو عناصر غير ضرورية."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {systemActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}