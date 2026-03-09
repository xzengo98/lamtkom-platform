"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  email: string | null;
  username: string | null;
  phone: string | null;
  role: string;
  games_remaining: number;
  games_played: number;
  created_at: string;
};

export default function AccountPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("email, username, phone, role, games_remaining, games_played, created_at")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      setProfile((data as Profile | null) ?? null);
      setLoading(false);
    }

    loadAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-white/10 bg-white/5 p-10 text-center">
          جارٍ تحميل بيانات الحساب...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black md:text-5xl">حسابي</h1>
              <p className="mt-3 text-slate-300">
                معلومات حسابك وإحصائيات استخدامك للمنصة.
              </p>
            </div>

            <Link
              href="/game/start"
              className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
            >
              إنشاء لعبة جديدة
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 text-center">
              <div className="text-sm text-slate-400">الألعاب المتبقية</div>
              <div className="mt-3 text-5xl font-black text-cyan-300">
                {profile?.games_remaining ?? 0}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 text-center">
              <div className="text-sm text-slate-400">عدد الألعاب التي لعبها</div>
              <div className="mt-3 text-5xl font-black text-cyan-300">
                {profile?.games_played ?? 0}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 text-center">
              <div className="text-sm text-slate-400">الدور</div>
              <div className="mt-3 text-3xl font-black text-white">
                {profile?.role ?? "user"}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 text-center">
              <div className="text-sm text-slate-400">تاريخ إنشاء الحساب</div>
              <div className="mt-3 text-lg font-bold text-white">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("ar-EG")
                  : "-"}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
              <div className="text-sm text-slate-400">اسم المستخدم</div>
              <div className="mt-3 text-2xl font-black">{profile?.username || "-"}</div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
              <div className="text-sm text-slate-400">البريد الإلكتروني</div>
              <div className="mt-3 text-2xl font-black break-all">
                {profile?.email || "-"}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 md:col-span-2">
              <div className="text-sm text-slate-400">رقم الهاتف</div>
              <div className="mt-3 text-2xl font-black">{profile?.phone || "-"}</div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-3 font-semibold text-red-300"
            >
              تسجيل الخروج
            </button>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-slate-300"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}