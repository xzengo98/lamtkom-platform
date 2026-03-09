"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  games_remaining: number;
  username: string | null;
};

export default function HomePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gamesRemaining, setGamesRemaining] = useState(0);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setIsLoggedIn(false);
        setGamesRemaining(0);
        setUsername(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("games_remaining, username")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      const typedProfile = profile as Profile | null;

      setIsLoggedIn(true);
      setGamesRemaining(typedProfile?.games_remaining ?? 0);
      setUsername(typedProfile?.username ?? null);
      setLoading(false);
    }

    loadState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadState();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.8rem] border border-white/10 bg-white/5 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.8)]">
          <div className="bg-gradient-to-l from-cyan-400/10 via-transparent to-transparent px-8 py-16 md:px-14">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-bold text-cyan-300">
                منصة عربية متكاملة لألعاب المعلومات
              </div>

              <h1 className="text-5xl font-black leading-tight md:text-7xl">
                منصة ألعاب أسئلة عربية
                <span className="mt-4 block text-cyan-400">
                  احترافية وسهلة الإدارة
                </span>
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-300">
                أنشئ جولات أسئلة تفاعلية بين فريقين، رتّب الأقسام والفئات
                والأسئلة من لوحة تحكم احترافية، وابدأ اللعب بطريقة أنيقة وسريعة
                تناسب الفعاليات، المدارس، المسابقات، والمناسبات الخاصة.
              </p>

              {loading ? (
                <div className="mt-10 text-slate-400">جارٍ تحميل حالتك...</div>
              ) : isLoggedIn ? (
                <div className="mt-10 space-y-6">
                  <div className="text-lg text-slate-300">
                    أهلاً{" "}
                    <span className="font-black text-cyan-300">
                      {username || "بك"}
                    </span>
                    {" • "}
                    عدد الألعاب المتبقية:{" "}
                    <span className="font-black text-cyan-300">
                      {gamesRemaining}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link
                      href="/game/start"
                      className="rounded-[2rem] bg-cyan-400 px-8 py-4 text-xl font-black text-slate-950"
                    >
                      ابدأ الآن
                    </Link>

                    <Link
                      href="/account"
                      className="rounded-[2rem] border border-white/10 px-8 py-4 text-xl font-black text-slate-200"
                    >
                      حسابي
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/register"
                    className="rounded-[2rem] bg-cyan-400 px-8 py-4 text-xl font-black text-slate-950"
                  >
                    إنشاء حساب جديد
                  </Link>

                  <Link
                    href="/login"
                    className="rounded-[2rem] border border-white/10 px-8 py-4 text-xl font-black text-slate-200"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-black">إدارة احترافية</h3>
            <p className="mt-3 leading-8 text-slate-300">
              تحكم كامل بالأقسام الرئيسية والفئات والأسئلة من واجهة إدارة واضحة
              وسريعة.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-black">لعب بين فريقين</h3>
            <p className="mt-3 leading-8 text-slate-300">
              جهّز اسم اللعبة والفريقين وابدأ لوحة لعب مرتبة وملائمة للمسابقات.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h3 className="text-2xl font-black">جاهزة للتطوير</h3>
            <p className="mt-3 leading-8 text-slate-300">
              بنية مرنة تسمح بإضافة نتائج، جلسات محفوظة، أرصدة، وباقات استخدام لاحقًا.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}