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
    | "codenames";
};

type NavGroup = {
  title: string;
  subtitle: string;
  icon: "home" | "questions" | "bara" | "codenames" | "users";
  defaultOpen?: boolean;
  items: NavItem[];
};

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "home"
    | "sections"
    | "categories"
    | "questions"
    | "upload"
    | "add"
    | "bara"
    | "users"
    | "games"
    | "codenames";
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
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V20h13V9.5" />
        </svg>
      );

    case "sections":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="4" rx="1.5" />
          <rect x="4" y="10" width="16" height="4" rx="1.5" />
          <rect x="4" y="15" width="16" height="4" rx="1.5" />
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
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.75 9.25a2.5 2.5 0 1 1 4.1 2c-.75.6-1.35 1.05-1.35 2" />
          <path d="M12 16.5h.01" />
        </svg>
      );

    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V5" />
          <path d="m7.5 9.5 4.5-4.5 4.5 4.5" />
          <path d="M5 19h14" />
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
          <circle cx="9" cy="8" r="3" />
          <path d="M4 19a5 5 0 0 1 10 0" />
          <path d="M18 8h.01" />
          <path d="M16.5 15.5c1.5-.3 2.8-1.2 3.5-2.5" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M14.5 18.5a4 4 0 0 1 6 0" />
        </svg>
      );

    case "games":
      return (
        <svg {...common}>
          <rect x="3.5" y="8" width="17" height="8.5" rx="4.25" />
          <path d="M8 10.5v4M6 12.5h4M15.5 11.25h.01M17.5 13.25h.01" />
        </svg>
      );

    case "codenames":
      return (
        <svg {...common}>
          <path d="M7 7h10" />
          <path d="M7 12h6" />
          <path d="M7 17h10" />
          <rect x="4" y="4" width="16" height="16" rx="2.5" />
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
    defaultOpen: true,
    items: [
      { label: "الرئيسية", href: "/admin", icon: "home" },
      { label: "الأعضاء", href: "/admin/users", icon: "users" },
      { label: "الألعاب المنتهية", href: "/admin/games", icon: "games" },
    ],
  },
  {
    title: "لمتكم",
    subtitle: "الأقسام والفئات والأسئلة",
    icon: "questions",
    defaultOpen: true,
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

function GroupIcon({
  name,
  className = "h-5 w-5",
}: {
  name: NavGroup["icon"];
  className?: string;
}) {
  return <Icon name={name} className={className} />;
}

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.06),transparent_20%),linear-gradient(180deg,#020617_0%,#020b1d_40%,#010617_100%)] text-white">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-6 px-4 py-5 md:px-6 xl:flex-row xl:items-start">
        <aside className="w-full xl:sticky xl:top-4 xl:max-w-[360px]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.30)]">
            <div className="mb-5">
              <div className="text-sm font-black text-cyan-300">لوحة التحكم</div>
              <h2 className="mt-2 text-3xl font-black text-white">الإدارة</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                اختر اللعبة أو القسم الذي تريد العمل عليه، وستظهر لك الأزرار
                الخاصة به بشكل منظم وواضح.
              </p>
            </div>

            <div className="space-y-4">
              {navGroups.map((group) => (
                <details
                  key={group.title}
                  open={group.defaultOpen}
                  className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 transition hover:bg-white/5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                        <GroupIcon name={group.icon} className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-lg font-black text-white">
                          {group.title}
                        </div>
                        <div className="truncate text-xs font-bold text-white/45">
                          {group.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition group-open:rotate-180">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </summary>

                  <div className="grid gap-3 border-t border-white/10 px-4 py-4">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(24,36,68,0.96)_0%,rgba(13,22,46,0.96)_100%)] px-4 py-3.5 text-sm font-black text-white transition hover:-translate-y-[1px] hover:border-cyan-300/20 hover:bg-[linear-gradient(180deg,rgba(31,47,88,0.98)_0%,rgba(16,28,57,0.98)_100%)]"
                      >
                        <span>{item.label}</span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/65">
                          <Icon name={item.icon} className="h-4 w-4" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.28)] md:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
                  لوحة الإدارة
                </div>
                <h1 className="text-3xl font-black text-white md:text-4xl">
                  أهلاً بك في لوحة التحكم
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
                  من هنا يمكنك إدارة الموقع بالكامل بطريقة مرتبة وواضحة، مع وصول
                  سريع للأقسام والفئات والأسئلة وأقسام الألعاب المختلفة.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/80">
                  {profile?.username || "admin"}
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  الرجوع للموقع
                </Link>
              </div>
            </div>
          </div>

          <div>{children}</div>
        </section>
      </div>
    </main>
  );
}