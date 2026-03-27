"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  username: string | null;
};

const gameCards = [
  {
    title: "لمّتنا",
    subtitle: "أسئلة وأجوبة",
    description:
      "اللعبة الرئيسية المبنية على الفئات والأسئلة والنقاط، مناسبة للعب الجماعي بين فريقين وبنظام واضح وسريع.",
    href: "/game/start",
    image: "https://a.top4top.io/p_3738qob7g1.png",
    active: true,
  },
  {
    title: "برا السالفة",
    subtitle: "لعبة جماعية",
    description:
      "لعبة اجتماعية ممتعة يختار فيها النظام شخصًا واحدًا فقط يكون برا السالفة، والباقي يحاولون كشفه.",
    href: "/game/bara-alsalfah",
    image: "https://l.top4top.io/p_373887e151.png",
    active: true,
  },
  {
    title: "قريبًا",
    subtitle: "ألعاب أخرى",
    description:
      "قسم مخصص للألعاب القادمة داخل المنصة. سيتم إضافة ألعاب جديدة بنفس روح لمّتنا وبنفس الجودة.",
    href: "#",
    image: "https://i.top4top.io/p_3738ncix61.png",
    active: false,
  },
];

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
        {description}
      </p>
    </div>
  );
}

export default function HomePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
        setUsername(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      const typedProfile = profile as Profile | null;

      setIsLoggedIn(true);
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
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <section className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_35%),linear-gradient(180deg,#071126_0%,#061020_100%)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100">
                منصة عربية للألعاب الجماعية
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
                لمّتنا
                <span className="block text-cyan-300">
                  منصة ألعاب عربية
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
                منصة تجمع أكثر من لعبة في مكان واحد، بتجربة عربية أنيقة وسهلة
                الاستخدام. ابدأ الآن بلعبة الأسئلة والأجوبة أو لعبة برا السالفة،
                ومع الوقت ستنضم ألعاب جديدة للمنصة.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/games"
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  استعرض الألعاب
                </Link>

                {loading ? (
                  <div className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white/75">
                    جارٍ تحميل حالتك...
                  </div>
                ) : isLoggedIn ? (
                  <>
                    <div className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white">
                      أهلاً {username || "بك"}
                    </div>
                    <Link
                      href="/account"
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      حسابي
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      إنشاء حساب جديد
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      تسجيل الدخول
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 text-center">
                <div className="text-sm text-white/60">الألعاب المتاحة الآن</div>
                <div className="mt-2 text-4xl font-black text-white">2</div>
              </div>

              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 text-center">
                <div className="text-sm text-white/60">أسلوب المنصة</div>
                <div className="mt-2 text-2xl font-black text-cyan-300">
                  جماعي
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 text-center">
                <div className="text-sm text-white/60">الهدف</div>
                <div className="mt-2 text-2xl font-black text-white">
                  متعة وتنافس
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-cyan-300">الألعاب الحالية</div>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                اختر اللعبة التي تريدها
              </h2>
            </div>

            <Link
              href="/games"
              className="hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 md:inline-flex"
            >
              صفحة الألعاب
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {gameCards.map((card, index) =>
              card.active ? (
                <Link
                  key={index}
                  href={card.href}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#071126] shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition hover:-translate-y-1 hover:border-cyan-300/30"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071126] via-[#071126]/35 to-transparent" />
                    <div className="absolute bottom-4 right-4 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100">
                      متاحة الآن
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-cyan-300">{card.subtitle}</div>
                    <h3 className="mt-2 text-3xl font-black">{card.title}</h3>
                    <p className="mt-4 leading-8 text-white/70">
                      {card.description}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition group-hover:bg-cyan-400">
                      افتح اللعبة
                      <span>←</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  key={index}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#071126] opacity-95 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071126] via-[#071126]/35 to-transparent" />
                    <div className="absolute bottom-4 right-4 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-100">
                      قريبًا
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-cyan-300">{card.subtitle}</div>
                    <h3 className="mt-2 text-3xl font-black">{card.title}</h3>
                    <p className="mt-4 leading-8 text-white/70">
                      {card.description}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/80">
                      قريبًا
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <FeatureCard
            title="ألعاب متعددة"
            description="المنصة لم تعد خاصة بلعبة واحدة فقط، بل أصبحت قاعدة لألعاب جماعية متنوعة داخل نفس الستايل."
          />
          <FeatureCard
            title="تجربة عربية مرتبة"
            description="تصميم عربي واضح، مناسب للموبايل وسطح المكتب، مع تجربة لعب سهلة وسريعة بين الأصدقاء أو الفرق."
          />
          <FeatureCard
            title="قابلة للتوسع"
            description="يمكن إضافة ألعاب جديدة لاحقًا بسهولة مع الحفاظ على نفس الهوية البصرية والهيكل العام للموقع."
          />
        </section>
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#071126] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-6">
  <div className="flex flex-wrap gap-2">
    <Link
      href="/"
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-slate-200 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
    >
      الرئيسية
    </Link>
    <Link
      href="/pricing"
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-slate-200 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
    >
      الباقات
    </Link>
    <Link
      href="/terms"
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-slate-200 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
    >
      الشروط والأحكام
    </Link>

    <Link
      href="/privacy"
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-slate-200 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
    >
      الخصوصية
    </Link>

    <Link
      href="/about"
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-slate-200 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
    >
      من نحن
    </Link>
  </div>

  <div className="mt-4 border-t border-white/10 pt-4 text-center text-[10px] text-slate-500 sm:mt-5 sm:text-xs lg:text-sm">
    © {new Date().getFullYear()} لمّتنا — جميع الحقوق محفوظة.
  </div>
</section>
      </main>
    </div>
  );
}