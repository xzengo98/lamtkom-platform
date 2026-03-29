"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  username: string | null;
};

type GameCardItem = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image: string;
  active: boolean;
  badge: string;
};

const gameCards: GameCardItem[] = [
  {
    title: "لمّتنا",
    subtitle: "أسئلة وأجوبة",
    description:
      "اللعبة الرئيسية المبنية على الفئات والأسئلة والنقاط، مناسبة للعب الجماعي بين فريقين وبنظام واضح وسريع.",
    href: "/game/start",
    image: "https://a.top4top.io/p_3738qob7g1.png",
    active: true,
    badge: "متاحة الآن",
  },
  {
    title: "برا السالفة",
    subtitle: "لعبة جماعية",
    description:
      "لعبة اجتماعية ممتعة يختار فيها النظام شخصًا واحدًا فقط يكون برا السالفة، والباقي يحاولون كشفه.",
    href: "/game/bara-alsalfah",
    image: "https://l.top4top.io/p_373887e151.png",
    active: true,
    badge: "متاحة الآن",
  },
  {
    title: "قريبًا",
    subtitle: "ألعاب أخرى",
    description:
      "قسم مخصص للألعاب القادمة داخل المنصة. سيتم إضافة ألعاب جديدة بنفس روح لمّتنا وبنفس الجودة.",
    href: "#",
    image: "https://i.top4top.io/p_3738ncix61.png",
    active: false,
    badge: "قريبًا",
  },
];

const featureItems = [
  {
    title: "ألعاب جماعية عربية",
    description:
      "تجربة مصممة لتناسب الجلسات والمجموعات واللعب المشترك بشكل واضح وسلس.",
  },
  {
    title: "واجهة أنيقة وسريعة",
    description:
      "تنقل بسيط، تجربة حديثة، وشكل احترافي مناسب للهاتف والكمبيوتر.",
  },
  {
    title: "أكثر من لعبة داخل منصة واحدة",
    description:
      "ابدأ بلعبة لمّتنا أو برا السالفة، ومع الوقت ستنضم ألعاب جديدة للمنصة.",
  },
  {
    title: "مناسبة للترفيه والفعاليات",
    description:
      "يمكن استخدام المنصة في الجلسات الخاصة، اللقاءات، المسابقات، والأنشطة الجماعية.",
  },
];

const steps = [
  {
    number: "01",
    title: "اختر اللعبة",
    description: "ابدأ باللعبة التي تناسب جلستك أو فريقك.",
  },
  {
    number: "02",
    title: "جهّز الجولة",
    description: "اختر الإعدادات المناسبة وابدأ اللعب بسرعة.",
  },
  {
    number: "03",
    title: "استمتع بالمنافسة",
    description: "تابع النتائج وشارك جو التحدي مع الجميع.",
  },
];

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-extrabold tracking-wide text-cyan-100">
      {children}
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    </svg>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.07]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
        <SparkIcon />
      </div>
      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="mt-3 text-sm leading-8 text-white/70">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.07]">
      <div className="text-sm font-black tracking-[0.2em] text-cyan-300">
        {number}
      </div>
      <h3 className="mt-3 text-2xl font-black text-white">{title}</h3>
      <p className="mt-3 text-sm leading-8 text-white/70">{description}</p>
    </div>
  );
}

function GameCard({ card }: { card: GameCardItem }) {
  return (
    <div
      className={[
        "group overflow-hidden rounded-[2rem] border shadow-[0_25px_60px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1",
        card.active
          ? "border-white/10 bg-white/5 hover:border-cyan-300/20 hover:bg-white/[0.07]"
          : "border-white/5 bg-white/[0.03] opacity-90",
      ].join(" ")}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/35 to-transparent" />
        <img
          src={card.image}
          alt={card.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />

        <div className="absolute right-4 top-4">
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-black",
              card.active
                ? "border border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                : "border border-amber-300/20 bg-amber-400/10 text-amber-100",
            ].join(" ")}
          >
            {card.badge}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="text-sm font-bold text-cyan-300">{card.subtitle}</div>
        <h3 className="mt-2 text-3xl font-black text-white">{card.title}</h3>
        <p className="mt-4 text-sm leading-8 text-white/70">{card.description}</p>

        {card.active ? (
          <Link
            href={card.href}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
          >
            افتح اللعبة
            <ArrowLeftIcon />
          </Link>
        ) : (
          <div className="mt-6 inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70">
            قريبًا
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const activeGamesCount = gameCards.filter((card) => card.active).length;

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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_20%),linear-gradient(180deg,#020617_0%,#071126_40%,#020617_100%)] text-white">
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-10 md:px-6 md:pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-[fadeInUp_0.7s_ease-out]">
            <SectionBadge>منصة عربية للألعاب الجماعية</SectionBadge>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
              لمّتنا
              <br />
              منصة ألعاب عربية
              <br />
              بتجربة أجمل وأكثر حماسًا
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
              منصة تجمع أكثر من لعبة في مكان واحد، بتجربة عربية أنيقة وسهلة
              الاستخدام. ابدأ الآن بلعبة الأسئلة والأجوبة أو لعبة برا السالفة،
              ومع الوقت ستنضم ألعاب جديدة للمنصة.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 text-base font-black text-slate-950 transition hover:bg-cyan-400"
              >
                استعرض الألعاب
                <ArrowLeftIcon />
              </Link>

              {loading ? (
                <div className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white/70">
                  جارٍ تحميل حالتك...
                </div>
              ) : isLoggedIn ? (
                <Link
                  href="/account"
                  className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-base font-bold text-white transition hover:bg-white/10"
                >
                  أهلاً {username || "بك"} — حسابي
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-base font-bold text-white transition hover:bg-white/10"
                  >
                    إنشاء حساب جديد
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-base font-bold text-white transition hover:bg-white/10"
                  >
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 transition duration-300 hover:border-cyan-300/20 hover:bg-white/[0.07]">
                <div className="text-sm font-bold text-white/55">
                  الألعاب المتاحة الآن
                </div>
                <div className="mt-2 text-3xl font-black text-white">
                  {activeGamesCount}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 transition duration-300 hover:border-cyan-300/20 hover:bg-white/[0.07]">
                <div className="text-sm font-bold text-white/55">
                  أسلوب المنصة
                </div>
                <div className="mt-2 text-2xl font-black text-cyan-100">
                  جماعي
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 transition duration-300 hover:border-cyan-300/20 hover:bg-white/[0.07]">
                <div className="text-sm font-bold text-white/55">الهدف</div>
                <div className="mt-2 text-2xl font-black text-emerald-100">
                  متعة وتنافس
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-[fadeInUp_0.9s_ease-out]">
            <div className="absolute inset-0 rounded-[2.5rem] bg-cyan-400/10 blur-3xl" />
            <div className="relative">
              <img
                src="https://f.top4top.io/p_3739zf7hj1.png"
                alt="معاينة داخل المنصة"
                className="mx-auto h-auto w-full max-w-[640px] rounded-[2rem] object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.35)] animate-[floatY_6s_ease-in-out_infinite]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <SectionBadge>الألعاب الحالية</SectionBadge>
            <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
              اختر اللعبة التي تريدها
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-white/70">
              صفحة مخصصة للألعاب الحالية داخل المنصة، مع تصميم يوضح كل لعبة
              بشكل مستقل وسهل وواضح.
            </p>
          </div>

          <Link
            href="/games"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
          >
            صفحة الألعاب
            <ArrowLeftIcon />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {gameCards.map((card) => (
            <GameCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-8">
          <SectionBadge>لماذا لمّتنا؟</SectionBadge>
          <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
            منصة مبنية للمتعة والوضوح
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-white/70">
            لمّتنا ليست مجرد صفحة ألعاب عادية، بل منصة عربية تحاول تقديم تجربة
            جماعية جميلة وسلسة من أول لحظة.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureItems.map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-8">
          <SectionBadge>كيف تبدأ؟</SectionBadge>
          <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
            ثلاث خطوات واضحة للبدء
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <StepCard
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_25%),linear-gradient(180deg,#071126_0%,#020817_100%)] p-6 shadow-[0_35px_90px_rgba(0,0,0,0.3)] md:p-10 transition duration-300 hover:border-cyan-300/20">
          <div className="max-w-3xl">
            <SectionBadge>ابدأ الآن</SectionBadge>
            <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
              جاهز تبدأ أول جولة؟
            </h2>
            <p className="mt-4 text-base leading-8 text-white/75 md:text-lg">
              استعرض الألعاب الحالية وابدأ مباشرة، أو أنشئ حسابك لتجربة أكثر
              تنظيمًا واستمرارية داخل المنصة.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 text-base font-black text-slate-950 transition hover:bg-cyan-400"
              >
                ابدأ الآن
                <ArrowLeftIcon />
              </Link>

              {!loading && !isLoggedIn ? (
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-base font-bold text-white transition hover:bg-white/10"
                >
                  إنشاء حساب
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-md">
              <div className="text-2xl font-black text-white">لمّتنا</div>
              <p className="mt-3 text-sm leading-7 text-white/65">
                منصة ألعاب عربية تجمع أكثر من تجربة في مكان واحد، بتصميم جميل
                ومناسب للجلسات واللعب الجماعي.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm font-bold text-white/75">
              <Link href="/" className="transition hover:text-white">
                الرئيسية
              </Link>
              <Link href="/pricing" className="transition hover:text-white">
                الباقات
              </Link>
              <Link href="/terms" className="transition hover:text-white">
                الشروط والأحكام
              </Link>
              <Link href="/privacy" className="transition hover:text-white">
                الخصوصية
              </Link>
              <Link href="/about" className="transition hover:text-white">
                من نحن
              </Link>
            </div>
          </div>

          <div className="mt-6 text-sm text-white/45">
            © {new Date().getFullYear()} لمّتنا — جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>

      <style>{`
  @keyframes floatY {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(28px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
    </main>
  );
}