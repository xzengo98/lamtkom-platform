import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AdminLayoutProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon:
    | "home"
    | "sections"
    | "categories"
    | "questions"
    | "upload"
    | "add"
    | "bara"
    | "users"
    | "games"
    | "codenames"
    | "notifications";
};

type NavGroup = {
  title: string;
  subtitle: string;
  icon: "home" | "questions" | "bara" | "codenames" | "users";
  items: NavItem[];
};

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: NavItem["icon"];
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
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 9.5V20h14V9.5" />
        </svg>
      );

    case "sections":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="5" rx="1.5" />
          <rect x="4" y="14" width="10" height="5" rx="1.5" />
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
          <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="m8 8 4-4 4 4" />
          <path d="M4 20h16" />
        </svg>
      );

    case "add":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );

    case "bara":
      return (
        <svg {...common}>
          <path d="M12 3c4 0 7 3 7 7 0 5-7 11-7 11S5 15 5 10c0-4 3-7 7-7Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M4 19a5 5 0 0 1 10 0" />
          <path d="M14.5 19a4.5 4.5 0 0 1 5 0" />
        </svg>
      );

    case "games":
      return (
        <svg {...common}>
          <rect x="3" y="8" width="18" height="8" rx="4" />
          <path d="M8 12h2" />
          <path d="M9 11v2" />
          <path d="M15.5 12h.01" />
          <path d="M17.5 12h.01" />
        </svg>
      );

    case "codenames":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
          <path d="M8 17h7" />
        </svg>
      );

    case "notifications":
      return (
        <svg {...common}>
          <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5H4.5L6 16.5Z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );

    default:
      return null;
  }
}

function GroupIcon({
  name,
  className = "h-5 w-5",
}: {
  name: NavGroup["icon"];
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
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 9.5V20h14V9.5" />
        </svg>
      );

    case "questions":
      return (
        <svg {...common}>
          <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "bara":
      return (
        <svg {...common}>
          <path d="M12 3c4 0 7 3 7 7 0 5-7 11-7 11S5 15 5 10c0-4 3-7 7-7Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      );

    case "codenames":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
          <path d="M8 17h7" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M4 19a5 5 0 0 1 10 0" />
          <path d="M14.5 19a4.5 4.5 0 0 1 5 0" />
        </svg>
      );

    default:
      return null;
  }
}

const navGroups: NavGroup[] = [
  {
    title: "عام",
    subtitle: "الصفحات الأساسية",
    icon: "home",
    items: [
      { label: "الرئيسية", href: "/admin", icon: "home" },
      { label: "الأعضاء", href: "/admin/users", icon: "users" },
      { label: "الألعاب المنتهية", href: "/admin/games", icon: "games" },
      { label: "الإشعارات", href: "/admin/notifications", icon: "notifications" },
      { label: "الكوبونات", href: "/admin/coupons", icon: "categories" },
    ],
  },
  {
    title: "لمتكم",
    subtitle: "الأقسام والفئات والأسئلة",
    icon: "questions",
    items: [
      { label: "الأقسام الرئيسية", href: "/admin/sections", icon: "sections" },
      { label: "الفئات", href: "/admin/categories", icon: "categories" },
      { label: "الأسئلة", href: "/admin/questions", icon: "questions" },
      {
        label: "رفع أسئلة دفعة واحدة",
        href: "/admin/questions/import",
        icon: "upload",
      },
      { label: "إضافة قسم جديد", href: "/admin/sections/new", icon: "add" },
      { label: "إضافة فئة جديدة", href: "/admin/categories/new", icon: "add" },
      { label: "إضافة سؤال جديد", href: "/admin/questions/new", icon: "add" },
    ],
  },
  {
    title: "برا السالفة",
    subtitle: "الإدارة الخاصة باللعبة",
    icon: "bara",
    items: [
      { label: "إدارة برا السالفة", href: "/admin/bara-alsalfah", icon: "bara" },
      {
        label: "فئات برا السالفة",
        href: "/admin/bara-alsalfah/categories",
        icon: "categories",
      },
      {
        label: "إضافة عنصر برا السالفة",
        href: "/admin/bara-alsalfah/new",
        icon: "add",
      },
    ],
  },
  {
    title: "Codenames",
    subtitle: "لوحة اللعبة الخاصة",
    icon: "codenames",
    items: [
      {
        label: "لوحة تحكم Codenames",
        href: "/admin/codenames",
        icon: "codenames",
      },
    ],
  },
];

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, username")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-[1260px] px-4 py-5 md:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-black text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              لوحة التحكم
            </div>

            <h2 className="mt-4 text-2xl font-black text-white">الإدارة</h2>

            <p className="mt-2 text-sm leading-7 text-white/55">
             الوصول السريع :
            </p>
          </div>

          {navGroups.map((group) => (
            <div
              key={group.title}
              className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.16)]"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-300">
                  <GroupIcon name={group.icon} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white">{group.title}</h3>
                  <p className="mt-1 text-xs leading-6 text-white/40">{group.subtitle}</p>
                </div>
              </div>

              <div className="space-y-2">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-sm font-bold text-white/72 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.08] hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70">
                      <Icon name={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/75 transition hover:bg-white/[0.08] hover:text-white"
          >
            الرجوع للموقع
          </Link>
        </aside>

        <section className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.20)] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-[11px] font-black text-orange-300">
                  مركز الإدارة
                </div>

                <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                  تحكم كامل
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-8 text-white/55">
                 لوحة لإدارة المنصة بالكامل.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-300">
                  مركز موحد
                </span>
                <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-black text-violet-300">
                  إدارة منظمة
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-white/65">
                  {profile?.username || "admin"}
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-0">{children}</div>
        </section>
      </div>
    </div>
  );
}