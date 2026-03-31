import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Tone = "cyan" | "orange" | "emerald" | "slate";

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
    <div className={`rounded-[24px] border p-5 shadow-xl ${classes.card}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-semibold text-white/60">{label}</span>
      </div>
      <div className={`text-4xl font-black ${classes.soft}`}>{value}</div>
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
    <Link
      href={href}
      className={`group rounded-[24px] border p-5 transition shadow-xl ${classes.button}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-2xl">
          {icon}
        </div>
        {badge ? (
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/75">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="text-xl font-black text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>

      <div className="mt-5 inline-flex rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-white/85 transition group-hover:bg-black/30">
        فتح
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
    <div className="mb-6">
      <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70">
        {badge}
      </div>
      <h2 className="mt-4 text-3xl font-black text-white">{title}</h2>
      <p className="mt-2 max-w-3xl text-white/65">{description}</p>
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
    activeGamesResult,

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
    supabase.from("game_sessions").select("*", { count: "exact", head: true }).eq("status", "active"),

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
    activeGames: activeGamesResult.count ?? 0,

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
      description: "استعرض الأقسام الرئيسية وعدّلها أو ادخل عليها مباشرة.",
      href: "/admin/sections",
      tone: "orange",
      icon: "🧩",
    },
    {
      title: "إضافة قسم جديد",
      description: "أنشئ قسمًا رئيسيًا جديدًا للعبة لمتكم.",
      href: "/admin/sections/new",
      tone: "orange",
      icon: "➕",
    },
    {
      title: "إدارة الفئات",
      description: "تحكم في الفئات الحالية واعرض تفاصيلها بسرعة.",
      href: "/admin/categories",
      tone: "cyan",
      icon: "📚",
    },
    {
      title: "إضافة فئة جديدة",
      description: "أضف فئة جديدة واربطها بالقسم المناسب.",
      href: "/admin/categories/new",
      tone: "cyan",
      icon: "➕",
    },
    {
      title: "إدارة الأسئلة",
      description: "فلترة، تعديل، حذف، ومراجعة الأسئلة الحالية بسهولة.",
      href: "/admin/questions",
      tone: "emerald",
      icon: "❓",
    },
    {
      title: "رفع أسئلة دفعة واحدة",
      description: "استورد عددًا كبيرًا من الأسئلة دفعة واحدة.",
      href: "/admin/questions/import",
      tone: "emerald",
      icon: "⬆️",
    },
  ];

  const baraActions: ActionCardProps[] = [
    {
      title: "إدارة برا السالفة",
      description: "الصفحة الرئيسية لإدارة لعبة برا السالفة.",
      href: "/admin/bara-alsalfah",
      tone: "cyan",
      icon: "🎭",
    },
    {
      title: "إدارة الفئات",
      description: "تحكم بالأقسام والفئات الخاصة بلعبة برا السالفة.",
      href: "/admin/bara-alsalfah/categories",
      tone: "orange",
      icon: "🗂️",
    },
    {
      title: "إضافة قسم أو فئة",
      description: "أنشئ قسمًا أو فئة جديدة للعبة برا السالفة.",
      href: "/admin/bara-alsalfah/categories/new",
      tone: "orange",
      icon: "➕",
    },
    {
      title: "إضافة عنصر جديد",
      description: "أضف الجواب الصحيح والخيارات الخاطئة للعبة.",
      href: "/admin/bara-alsalfah/new",
      tone: "emerald",
      icon: "✨",
    },
  ];

  const codenamesActions: ActionCardProps[] = [
    {
      title: "إدارة Codenames",
      description: "لوحة إدارة الكلمات والغرف الخاصة بلعبة Codenames.",
      href: "/admin/codenames",
      tone: "cyan",
      icon: "🕵️",
      badge: "جديد",
    },
    {
      title: "إدارة الكلمات",
      description: "إضافة، تعديل، حذف، وتفعيل كلمات اللعبة.",
      href: "/admin/codenames/words",
      tone: "orange",
      icon: "📝",
    },
    {
      title: "رفع جماعي",
      description: "رفع مجموعة كلمات دفعة واحدة إلى بنك كلمات Codenames.",
      href: "/admin/codenames/upload",
      tone: "emerald",
      icon: "⬆️",
    },
    {
      title: "إدارة الغرف",
      description: "متابعة الغرف والجلسات الحالية والمنتهية الخاصة باللعبة.",
      href: "/admin/codenames/rooms",
      tone: "slate",
      icon: "🚪",
    },
  ];

  const systemActions: ActionCardProps[] = [
    {
      title: "الأعضاء",
      description: "استعرض المستخدمين وحالاتهم داخل النظام.",
      href: "/admin/users",
      tone: "slate",
      icon: "👤",
    },
    {
      title: "ألعاب لمتكم المنتهية",
      description: "راجع الجلسات والألعاب السابقة الخاصة باللعبة الرئيسية.",
      href: "/admin/games",
      tone: "slate",
      icon: "🏁",
    },
    {
      title: "الألعاب غير المكتملة",
      description: "ادخل لإدارة الألعاب النشطة أو غير المكتملة وحذفها عند الحاجة.",
      href: "/admin/games",
      tone: "slate",
      icon: "🧹",
      badge: "تنظيف",
    },
    {
      title: "الرجوع للموقع",
      description: "افتح الواجهة الرئيسية للموقع.",
      href: "/",
      tone: "slate",
      icon: "↩️",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="space-y-10">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70">
            لوحة التحكم الرئيسية
          </div>
          <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">Admin Dashboard</h1>
          <p className="mt-3 max-w-3xl text-white/65">
            صفحة موحدة لإدارة ألعاب المنصة: لمتكم، برا السالفة، و Codenames، مع
            وصول سريع لأهم الصفحات والإحصائيات.
          </p>
        </div>

        <section>
          <SectionHeader
            badge="إحصائيات لمتكم"
            title="إدارة لمتكم"
            description="إدارة لعبة الأسئلة والأجوبة الرئيسية مع كل الأدوات اليومية الخاصة بالأقسام والفئات والأسئلة."
          />

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="الأقسام الرئيسية" value={stats.sections} tone="orange" icon="🧩" />
            <StatCard label="الفئات" value={stats.categories} tone="cyan" icon="📚" />
            <StatCard label="الفئات المفعّلة" value={stats.activeCategories} tone="emerald" icon="✅" />
            <StatCard label="الأسئلة" value={stats.questions} tone="slate" icon="❓" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lammatnaActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            badge="إحصائيات برا السالفة"
            title="إدارة برا السالفة"
            description="إدارة الأقسام والفئات والعناصر الخاصة بلعبة برا السالفة. ملاحظة: إحصائيات الجلسات نفسها غير متاحة حاليًا لأنها لا تُحفظ في جدول sessions بعد."
          />

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard label="أقسام برا السالفة" value={stats.baraSections} tone="orange" icon="🗂️" />
            <StatCard label="فئات برا السالفة" value={stats.baraCategories} tone="cyan" icon="📂" />
            <StatCard label="العناصر المفعّلة" value={stats.baraItems} tone="emerald" icon="🎭" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {baraActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            badge="إحصائيات Codenames"
            title="إدارة Codenames"
            description="تم دمج خيارات Codenames الرئيسية داخل لوحة التحكم نفسها لتسهيل الوصول للكلمات والغرف والرفع الجماعي."
          />

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="كل الكلمات" value={stats.codenamesWords} tone="orange" icon="📝" />
            <StatCard label="الكلمات المفعّلة" value={stats.codenamesActiveWords} tone="cyan" icon="✅" />
            <StatCard label="كل الغرف" value={stats.codenamesRooms} tone="slate" icon="🚪" />
            <StatCard label="الغرف النشطة" value={stats.codenamesActiveRooms} tone="emerald" icon="🟢" />
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <StatCard label="غرف الانتظار" value={stats.codenamesWaitingRooms} tone="slate" icon="⏳" />
            <StatCard label="الغرف المنتهية" value={stats.codenamesFinishedRooms} tone="slate" icon="🏁" />
            <StatCard label="الغرف الجارية" value={stats.codenamesActiveRooms} tone="emerald" icon="🎯" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {codenamesActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            badge="إحصائيات النظام"
            title="إدارة النظام"
            description="صفحات عامة لإدارة المستخدمين والجلسات العامة والحركة داخل المنصة."
          />

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <StatCard label="الأعضاء" value={stats.users} tone="slate" icon="👤" />
            <StatCard label="ألعاب منتهية" value={stats.completedGames} tone="orange" icon="🏁" />
            <StatCard label="ألعاب نشطة" value={stats.activeGames} tone="cyan" icon="🟢" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {systemActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}