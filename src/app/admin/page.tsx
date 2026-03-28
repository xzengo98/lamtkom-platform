import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  tone?: "cyan" | "orange" | "emerald" | "slate";
};

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
    <div className={`rounded-[1.6rem] border p-5 shadow-[0_14px_40px_rgba(0,0,0,0.25)] ${tones[tone]}`}>
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
}: QuickAction) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 hover:border-cyan-300/35 hover:bg-cyan-400/15",
    orange: "border-orange-400/20 bg-orange-400/10 hover:border-orange-300/35 hover:bg-orange-400/15",
    emerald: "border-emerald-400/20 bg-emerald-400/10 hover:border-emerald-300/35 hover:bg-emerald-400/15",
    slate: "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
  };

  return (
    <Link
      href={href}
      className={`group rounded-[1.5rem] border p-5 transition ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
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
  ] = await Promise.all([
    supabase.from("category_sections").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("questions").select("*", { count: "exact", head: true }),
  ]);

  const sectionsCount = sectionsResult.count ?? 0;
  const categoriesCount = categoriesResult.count ?? 0;
  const activeCategoriesCount = activeCategoriesResult.count ?? 0;
  const questionsCount = questionsResult.count ?? 0;

  const lammatnaActions: QuickAction[] = [
    {
      title: "إدارة الأقسام الرئيسية",
      description: "استعرض الأقسام الرئيسية وعدّلها أو ادخل عليها مباشرة.",
      href: "/admin/sections",
      tone: "orange",
    },
    {
      title: "إضافة قسم جديد",
      description: "أنشئ قسمًا رئيسيًا جديدًا للعبة لمّتنا.",
      href: "/admin/sections/new",
      tone: "orange",
    },
    {
      title: "إدارة الفئات",
      description: "تحكم في الفئات الحالية واعرض تفاصيلها بسرعة.",
      href: "/admin/categories",
      tone: "cyan",
    },
    {
      title: "إضافة فئة جديدة",
      description: "أضف فئة جديدة واربطها بالقسم المناسب.",
      href: "/admin/categories/new",
      tone: "cyan",
    },
    {
      title: "إدارة الأسئلة",
      description: "فلترة، تعديل، حذف، ومراجعة الأسئلة الحالية بسهولة.",
      href: "/admin/questions",
      tone: "emerald",
    },
    {
      title: "إضافة سؤال جديد",
      description: "أضف سؤالًا فرديًا مع كل بياناته بسرعة.",
      href: "/admin/questions/new",
      tone: "emerald",
    },
    {
      title: "رفع أسئلة دفعة واحدة",
      description: "استورد عددًا كبيرًا من الأسئلة دفعة واحدة.",
      href: "/admin/questions/import",
      tone: "emerald",
    },
  ];

  const baraActions: QuickAction[] = [
    {
      title: "إدارة برا السالفة",
      description: "الصفحة الرئيسية لإدارة لعبة برا السالفة.",
      href: "/admin/bara-alsalfah",
      tone: "cyan",
    },
    {
      title: "إدارة فئات برا السالفة",
      description: "تحكم بالأقسام والفئات الخاصة بلعبة برا السالفة.",
      href: "/admin/bara-alsalfah/categories",
      tone: "orange",
    },
    {
      title: "إضافة قسم / فئة لبرا السالفة",
      description: "أنشئ قسمًا أو فئة جديدة للعبة برا السالفة.",
      href: "/admin/bara-alsalfah/categories/new",
      tone: "orange",
    },
    {
      title: "إضافة عنصر برا السالفة",
      description: "أضف كلمة صحيحة وخياراتها الخاطئة للعبة.",
      href: "/admin/bara-alsalfah/new",
      tone: "emerald",
    },
  ];

  const systemActions: QuickAction[] = [
    {
      title: "الأعضاء",
      description: "استعرض المستخدمين وحالاتهم داخل النظام.",
      href: "/admin/users",
      tone: "slate",
    },
    {
      title: "الألعاب المنتهية",
      description: "راجع الجلسات والألعاب المنتهية السابقة.",
      href: "/admin/games",
      tone: "slate",
    },
    {
      title: "الرجوع للموقع",
      description: "افتح الواجهة الرئيسية للموقع.",
      href: "/",
      tone: "slate",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_35%),linear-gradient(180deg,#071126_0%,#061020_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-cyan-300">لوحة التحكم</div>
            <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">
              إدارة الموقع بشكل احترافي
            </h1>
            <p className="mt-4 text-sm leading-8 text-white/75 md:text-base">
              من هنا يمكنك إدارة ألعاب المنصة، الأقسام، الفئات، الأسئلة،
              والمحتوى العام بسرعة ووضوح، مع وصول مباشر لأهم الصفحات اليومية.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/questions/import"
              className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              رفع أسئلة دفعة واحدة
            </Link>
            <Link
              href="/admin/questions/new"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              إضافة سؤال جديد
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              الرجوع للموقع
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="الأقسام الرئيسية" value={sectionsCount} tone="orange" />
        <StatCard label="إجمالي الفئات" value={categoriesCount} tone="cyan" />
        <StatCard label="الفئات المفعلة" value={activeCategoriesCount} tone="emerald" />
        <StatCard label="إجمالي الأسئلة" value={questionsCount} tone="slate" />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-5">
          <div className="text-cyan-300">إدارة لمّتنا</div>
          <h2 className="mt-2 text-3xl font-black text-white">
            الأدوات الأساسية
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
            أهم الصفحات التي تحتاجها يوميًا لإدارة لعبة لمّتنا الرئيسية.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lammatnaActions.map((item) => (
            <ActionCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-5">
          <div className="text-cyan-300">إدارة برا السالفة</div>
          <h2 className="mt-2 text-3xl font-black text-white">
            اللعبة الثانية
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
            كل ما تحتاجه لإدارة أقسام وفئات ومحتوى لعبة برا السالفة.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {baraActions.map((item) => (
            <ActionCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-5">
          <div className="text-cyan-300">إدارة النظام</div>
          <h2 className="mt-2 text-3xl font-black text-white">
            صفحات عامة
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
            صفحات مهمة لإدارة المستخدمين، الجلسات، والتنقل السريع.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {systemActions.map((item) => (
            <ActionCard key={item.href} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}