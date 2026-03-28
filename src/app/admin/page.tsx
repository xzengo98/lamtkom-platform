import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  tone?: "cyan" | "orange" | "emerald" | "slate";
  icon:
    | "sections"
    | "categories"
    | "questions"
    | "add"
    | "upload"
    | "bara"
    | "users"
    | "games"
    | "back";
};

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "sections"
    | "categories"
    | "questions"
    | "add"
    | "upload"
    | "bara"
    | "users"
    | "games"
    | "back";
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    className,
  };

  switch (name) {
    case "sections":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="4" rx="1.5" />
          <rect x="3" y="10" width="18" height="4" rx="1.5" />
          <rect x="3" y="16" width="18" height="4" rx="1.5" />
        </svg>
      );
    case "categories":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "questions":
      return (
        <svg {...common}>
          <path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-.8.8-1.8 1.4-1.8 2.8" />
          <circle cx="12" cy="17.5" r="0.7" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "add":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V6" />
          <path d="m8 10 4-4 4 4" />
          <path d="M5 19h14" />
        </svg>
      );
    case "bara":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M7 20a5 5 0 0 1 10 0" />
          <path d="M18.5 5.5h.01" />
          <path d="M19 3v1.5" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M4 19a5 5 0 0 1 10 0" />
          <circle cx="18" cy="9" r="2" />
          <path d="M16 19a4 4 0 0 1 4-4" />
        </svg>
      );
    case "games":
      return (
        <svg {...common}>
          <rect x="4" y="8" width="16" height="8" rx="3" />
          <path d="M8 12h.01" />
          <path d="M16 12h.01" />
          <path d="M7 12h2" />
          <path d="M8 11v2" />
        </svg>
      );
    case "back":
      return (
        <svg {...common}>
          <path d="M15 18l-6-6 6-6" />
          <path d="M9 12h10" />
        </svg>
      );
    default:
      return null;
  }
}

function StatCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "cyan" | "orange" | "emerald" | "slate";
}) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    orange: "border-orange-400/20 bg-orange-400/10 text-orange-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    slate: "border-white/10 bg-white/5 text-white",
  };

  return (
    <div
      className={`rounded-[1.6rem] border p-5 shadow-[0_14px_40px_rgba(0,0,0,0.25)] ${tones[tone]}`}
    >
      <div className="text-sm font-bold text-white/65">{label}</div>
      <div className="mt-3 text-4xl font-black">{value}</div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  tone = "slate",
  icon,
}: QuickAction) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 hover:border-cyan-300/35 hover:bg-cyan-400/15",
    orange:
      "border-orange-400/20 bg-orange-400/10 hover:border-orange-300/35 hover:bg-orange-400/15",
    emerald:
      "border-emerald-400/20 bg-emerald-400/10 hover:border-emerald-300/35 hover:bg-emerald-400/15",
    slate: "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
  };

  return (
    <Link
      href={href}
      className={`group rounded-[1.5rem] border p-5 transition ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white/85">
          <Icon name={icon} />
        </div>

        <div className="flex-1">
          <div className="text-xl font-black text-white">{title}</div>
          <p className="mt-3 text-sm leading-7 text-white/70">{description}</p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-white/80 transition group-hover:bg-white/15">
          فتح
        </div>
      </div>
    </Link>
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
    supabase
      .from("game_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const sectionsCount = sectionsResult.count ?? 0;
  const categoriesCount = categoriesResult.count ?? 0;
  const activeCategoriesCount = activeCategoriesResult.count ?? 0;
  const questionsCount = questionsResult.count ?? 0;

  const baraSectionsCount = baraSectionsResult.count ?? 0;
  const baraCategoriesCount = baraCategoriesResult.count ?? 0;
  const baraItemsCount = baraItemsResult.count ?? 0;

  const usersCount = usersResult.count ?? 0;
  const completedGamesCount = completedGamesResult.count ?? 0;
  const activeGamesCount = activeGamesResult.count ?? 0;

  const lammatnaActions: QuickAction[] = [
    {
      title: "إدارة الأقسام الرئيسية",
      description: "استعرض الأقسام الرئيسية وعدّلها أو ادخل عليها مباشرة.",
      href: "/admin/sections",
      tone: "orange",
      icon: "sections",
    },
    {
      title: "إضافة قسم جديد",
      description: "أنشئ قسمًا رئيسيًا جديدًا للعبة لمّتنا.",
      href: "/admin/sections/new",
      tone: "orange",
      icon: "add",
    },
    {
      title: "إدارة الفئات",
      description: "تحكم في الفئات الحالية واعرض تفاصيلها بسرعة.",
      href: "/admin/categories",
      tone: "cyan",
      icon: "categories",
    },
    {
      title: "إضافة فئة جديدة",
      description: "أضف فئة جديدة واربطها بالقسم المناسب.",
      href: "/admin/categories/new",
      tone: "cyan",
      icon: "add",
    },
    {
      title: "إدارة الأسئلة",
      description: "فلترة، تعديل، حذف، ومراجعة الأسئلة الحالية بسهولة.",
      href: "/admin/questions",
      tone: "emerald",
      icon: "questions",
    },
    {
      title: "إضافة سؤال جديد",
      description: "أضف سؤالًا فرديًا مع كل بياناته بسرعة.",
      href: "/admin/questions/new",
      tone: "emerald",
      icon: "add",
    },
    {
      title: "رفع أسئلة دفعة واحدة",
      description: "استورد عددًا كبيرًا من الأسئلة دفعة واحدة.",
      href: "/admin/questions/import",
      tone: "emerald",
      icon: "upload",
    },
  ];

  const baraActions: QuickAction[] = [
    {
      title: "إدارة برا السالفة",
      description: "الصفحة الرئيسية لإدارة لعبة برا السالفة.",
      href: "/admin/bara-alsalfah",
      tone: "cyan",
      icon: "bara",
    },
    {
      title: "إدارة فئات برا السالفة",
      description: "تحكم بالأقسام والفئات الخاصة بلعبة برا السالفة.",
      href: "/admin/bara-alsalfah/categories",
      tone: "orange",
      icon: "categories",
    },
    {
      title: "إضافة قسم / فئة",
      description: "أنشئ قسمًا أو فئة جديدة للعبة برا السالفة.",
      href: "/admin/bara-alsalfah/categories/new",
      tone: "orange",
      icon: "add",
    },
    {
      title: "إضافة عنصر جديد",
      description: "أضف الكلمة الصحيحة والخيارات الخاطئة للعبة.",
      href: "/admin/bara-alsalfah/new",
      tone: "emerald",
      icon: "add",
    },
  ];

  const systemActions: QuickAction[] = [
    {
      title: "الأعضاء",
      description: "استعرض المستخدمين وحالاتهم داخل النظام.",
      href: "/admin/users",
      tone: "slate",
      icon: "users",
    },
    {
      title: "الألعاب المنتهية",
      description: "راجع الجلسات والألعاب المنتهية السابقة.",
      href: "/admin/games",
      tone: "slate",
      icon: "games",
    },
    {
      title: "الرجوع للموقع",
      description: "افتح الواجهة الرئيسية للموقع.",
      href: "/",
      tone: "slate",
      icon: "back",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-5">
          <div className="text-cyan-300">إحصائيات لمّتنا</div>
          <h2 className="mt-2 text-3xl font-black text-white">
            إدارة لمّتنا
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
            إدارة لعبة الأسئلة والأجوبة الرئيسية مع جميع أدواتها اليومية.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="الأقسام الرئيسية" value={sectionsCount} tone="orange" />
          <StatCard label="إجمالي الفئات" value={categoriesCount} tone="cyan" />
          <StatCard label="الفئات المفعلة" value={activeCategoriesCount} tone="emerald" />
          <StatCard label="إجمالي الأسئلة" value={questionsCount} tone="slate" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lammatnaActions.map((item) => (
            <ActionCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-5">
          <div className="text-cyan-300">إحصائيات برا السالفة</div>
          <h2 className="mt-2 text-3xl font-black text-white">
            إدارة برا السالفة
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
            كل ما تحتاجه لإدارة الأقسام والفئات والعناصر الخاصة بلعبة برا السالفة.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {baraActions.map((item) => (
            <ActionCard key={item.href} {...item} />
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="أقسام برا السالفة" value={baraSectionsCount} tone="orange" />
          <StatCard label="فئات برا السالفة" value={baraCategoriesCount} tone="cyan" />
          <StatCard label="العناصر المتاحة" value={baraItemsCount} tone="emerald" />
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-5">
          <div className="text-cyan-300">إحصائيات النظام</div>
          <h2 className="mt-2 text-3xl font-black text-white">
            إدارة النظام
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
            صفحات عامة لإدارة الأعضاء والجلسات والحركة العامة داخل المنصة.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {systemActions.map((item) => (
            <ActionCard key={item.href} {...item} />
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="عدد الأعضاء" value={usersCount} tone="cyan" />
          <StatCard label="الألعاب المنتهية" value={completedGamesCount} tone="orange" />
          <StatCard label="الألعاب النشطة" value={activeGamesCount} tone="emerald" />
        </div>
      </section>
    </div>
  );
}