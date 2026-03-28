import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AdminLayoutProps = {
  children: ReactNode;
};

const sidebarItems = [
  { label: "الرئيسية", href: "/admin" },
  { label: "الأقسام الرئيسية", href: "/admin/sections" },
  { label: "الفئات", href: "/admin/categories" },
  { label: "الأسئلة", href: "/admin/questions" },
  { label: "رفع أسئلة دفعة واحدة", href: "/admin/questions/import" },
  { label: "إضافة قسم جديد", href: "/admin/sections/new" },
  { label: "إضافة فئة جديدة", href: "/admin/categories/new" },
  { label: "إضافة سؤال جديد", href: "/admin/questions/new" },
  { label: "إدارة برا السالفة", href: "/admin/bara-alsalfah" },
  { label: "فئات برا السالفة", href: "/admin/bara-alsalfah/categories" },
  { label: "إضافة عنصر برا السالفة", href: "/admin/bara-alsalfah/new" },
  { label: "الأعضاء", href: "/admin/users" },
  { label: "الألعاب المنتهية", href: "/admin/games" },
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
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  {item.label}
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
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
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