import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AdminLayoutProps = {
  children: ReactNode;
};

type SidebarItem = {
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
    | "games";
};

const sidebarItems: SidebarItem[] = [
  { label: "الرئيسية", href: "/admin", icon: "home" },
  { label: "الأقسام الرئيسية", href: "/admin/sections", icon: "sections" },
  { label: "الفئات", href: "/admin/categories", icon: "categories" },
  { label: "الأسئلة", href: "/admin/questions", icon: "questions" },
  { label: "رفع أسئلة دفعة واحدة", href: "/admin/questions/import", icon: "upload" },
  { label: "إضافة قسم جديد", href: "/admin/sections/new", icon: "add" },
  { label: "إضافة فئة جديدة", href: "/admin/categories/new", icon: "add" },
  { label: "إضافة سؤال جديد", href: "/admin/questions/new", icon: "add" },
  { label: "إدارة برا السالفة", href: "/admin/bara-alsalfah", icon: "bara" },
  { label: "فئات برا السالفة", href: "/admin/bara-alsalfah/categories", icon: "categories" },
  { label: "إضافة عنصر برا السالفة", href: "/admin/bara-alsalfah/new", icon: "add" },
  { label: "الأعضاء", href: "/admin/users", icon: "users" },
  { label: "الألعاب المنتهية", href: "/admin/games", icon: "games" },
];

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
    | "games";
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
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10.5V20h14v-9.5" />
        </svg>
      );
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
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V6" />
          <path d="m8 10 4-4 4 4" />
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
          <circle cx="12" cy="8" r="3" />
          <path d="M7 20a5 5 0 0 1 10 0" />
          <path d="M18.5 5.5h.01" />
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
          <path d="M8 12h2" />
          <path d="M9 11v2" />
          <path d="M16 12h.01" />
          <path d="M18 12h.01" />
        </svg>
      );
    default:
      return null;
  }
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
    <div className="min-h-screen bg-[#020817] px-4 py-6 text-white md:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="order-2 xl:order-1">
          <div className="sticky top-24 rounded-[2rem] border border-white/10 bg-[#071126] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="text-cyan-300">التنقل السريع</div>
            <h2 className="mt-2 text-3xl font-black text-white">الإدارة</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              اختر القسم الذي تريد العمل عليه.
            </p>

            <div className="mt-5 space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/85">
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-bold text-cyan-300">نصيحة سريعة</div>
              <p className="mt-2 text-sm leading-7 text-white/70">
                لرفع كمية كبيرة من الأسئلة، استخدم صفحة الاستيراد الجماعي بدل
                الإضافة اليدوية سؤالًا سؤالًا.
              </p>
            </div>
          </div>
        </aside>

        <div className="order-1 space-y-6 xl:order-2">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_35%),linear-gradient(180deg,#071126_0%,#061020_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-cyan-300">لوحة الإدارة</div>
                <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">
                  أهلاً بك في لوحة التحكم
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-8 text-white/75 md:text-base">
                  من هنا يمكنك إدارة الموقع بالكامل بطريقة مرتبة وواضحة، مع وصول
                  سريع للأقسام، الفئات، الأسئلة، والألعاب.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white">
                  {profile?.username || "admin"}
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <Icon name="home" className="h-4 w-4" />
                  الرجوع للموقع
                </Link>
              </div>
            </div>
          </section>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}