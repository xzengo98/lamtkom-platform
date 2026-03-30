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
  accent: "cyan" | "orange" | "violet";
  icon: "quiz" | "social" | "spark";
};

type FeatureItem = {
  title: string;
  description: string;
  icon: "speed" | "screen" | "mobile" | "games";
};

type StepItem = {
  step: string;
  title: string;
  description: string;
};

const heroMockupImage = "https://f.top4top.io/p_3739zf7hj1.png";

const gameCards: GameCardItem[] = [
  {
    title: "لمّتنا",
    subtitle: "أسئلة وأجوبة",
    description:
      "اللعبة الرئيسية المبنية على الفئات والأسئلة والنقاط، مناسبة للعب الجماعي بين فريقين وبواجهة واضحة وسريعة.",
    href: "/game/start",
    image: "https://a.top4top.io/p_3738qob7g1.png",
    active: true,
    badge: "متاحة الآن",
    accent: "cyan",
    icon: "quiz",
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
    accent: "orange",
    icon: "social",
  },
  {
    title: "Codenames",
    subtitle: "لعبة جماعية",
    description:
      "لعبة Codenames الشهيرة ولكن بشكل جديد , لبدء اللعبة تحتاج كحد ادنى الى 4 لاعبين",
    href: "/games/codenames/",
    image: "https://b.top4top.io/p_374101e3s1.png",
    active: true,
    badge: "متاحة الآن",
    accent: "violet",
    icon: "spark",
  },
];

const features: FeatureItem[] = [
  {
    title: "واجهة منظمة وسريعة",
    description:
      "كل شيء واضح من أول نظرة سواء في بدء اللعبة أو أثناء اللعب أو عند انتهاء الجولة.",
    icon: "speed",
  },
  {
    title: "جاهزة للعرض",
    description:
      "تجربة مناسبة للشاشات الكبيرة والعرض المباشر داخل الجلسات والمناسبات والمسابقات.",
    icon: "screen",
  },
  {
    title: "مناسبة للهاتف",
    description:
      "التصميم يبقى مريحًا على الهاتف، مع تجربة أفضل في التنقل واللعب ومتابعة النتائج.",
    icon: "mobile",
  },
  {
    title: "أكثر من لعبة",
    description:
      "المنصة ليست لعبة واحدة فقط، بل مكان ينمو تدريجيًا ليضم أكثر من تجربة جماعية.",
    icon: "games",
  },
];

const steps: StepItem[] = [
  {
    step: "01",
    title: "اختر اللعبة",
    description: "ابدأ من اللعبة التي تناسب جلستك الحالية داخل المنصة.",
  },
  {
    step: "02",
    title: "ابدأ الجولة",
    description: "جهّز اللاعبين أو الفرق ثم افتح اللوحة وابدأ اللعب مباشرة.",
  },
  {
    step: "03",
    title: "تابع النتيجة",
    description: "احسب النقاط وشاهد الفائز النهائي ضمن تجربة انيقة وواضحة.",
  },
];

function QuizIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11h6" />
      <path d="M9 15h4" />
      <path d="M7 4h10a2 2 0 0 1 2 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function SocialIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M3 20a5 5 0 0 1 10 0" />
      <path d="M11 20a5 5 0 0 1 10 0" />
    </svg>
  );
}

function SparkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
    </svg>
  );
}

function SpeedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14a8 8 0 1 1 16 0" />
      <path d="m12 12 4-4" />
      <path d="M12 12 9 16" />
    </svg>
  );
}

function ScreenIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </svg>
  );
}

function MobileIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

function GamesIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="8" width="16" height="8" rx="3" />
      <path d="M8 12h2" />
      <path d="M9 11v2" />
      <path d="M16.5 12h.01" />
      <path d="M18.5 12h.01" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function getGameIcon(icon: GameCardItem["icon"]) {
  if (icon === "quiz") return <QuizIcon className="h-5 w-5" />;
  if (icon === "social") return <SocialIcon className="h-5 w-5" />;
  return <SparkIcon className="h-5 w-5" />;
}

function getFeatureIcon(icon: FeatureItem["icon"]) {
  if (icon === "speed") return <SpeedIcon className="h-5 w-5" />;
  if (icon === "screen") return <ScreenIcon className="h-5 w-5" />;
  if (icon === "mobile") return <MobileIcon className="h-5 w-5" />;
  return <GamesIcon className="h-5 w-5" />;
}

function getAccentClasses(accent: GameCardItem["accent"]) {
  if (accent === "orange") {
    return {
      badge: "border-orange-300/20 bg-orange-400/10 text-orange-100",
      card: "hover:shadow-[0_22px_40px_rgba(251,146,60,0.12)]",
      icon: "border-orange-300/20 bg-orange-400/10 text-orange-100",
      button: "bg-orange-400/10 text-orange-100 hover:bg-orange-400/15",
    };
  }

  if (accent === "violet") {
    return {
      badge: "border-violet-300/20 bg-violet-400/10 text-violet-100",
      card: "hover:shadow-[0_22px_40px_rgba(167,139,250,0.12)]",
      icon: "border-violet-300/20 bg-violet-400/10 text-violet-100",
      button: "bg-violet-400/10 text-violet-100 hover:bg-violet-400/15",
    };
  }

  return {
    badge: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    card: "hover:shadow-[0_22px_40px_rgba(34,211,238,0.12)]",
    icon: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    button: "bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15",
  };
}

function FeatureCard({ item }: { item: FeatureItem }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.95)_100%)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-[linear-gradient(180deg,rgba(20,34,64,0.98)_0%,rgba(8,14,32,0.98)_100%)]">
      <div className="mb-4 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-100">
        {getFeatureIcon(item.icon)}
      </div>
      <h3 className="text-lg font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/70">{item.description}</p>
    </div>
  );
}

function GameCard({ card }: { card: GameCardItem }) {
  const styles = getAccentClasses(card.accent);

  return (
    <div
      className={[
        "group rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.95)_100%)] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1",
        styles.card,
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${styles.badge}`}
        >
          {getGameIcon(card.icon)}
          <span>{card.badge}</span>
        </div>
        <div className={`inline-flex rounded-2xl border p-2.5 ${styles.icon}`}>
          {getGameIcon(card.icon)}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/5">
        <img
          src={card.image}
          alt={card.title}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-5">
        <div className="text-xs font-black tracking-[0.18em] text-white/50">
          {card.subtitle}
        </div>
        <h3 className="mt-2 text-2xl font-black text-white">{card.title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/70">{card.description}</p>
      </div>

      <div className="mt-5">
        {card.active ? (
          <Link
            href={card.href}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] px-5 py-3.5 text-sm font-black transition ${styles.button}`}
          >
            افتح اللعبة
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        ) : (
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-black text-white/50">
            قريبًا
          </div>
        )}
      </div>
    </div>
  );
}

function StepCard({ item }: { item: StepItem }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.95)_100%)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-sm font-black text-cyan-100">
        {item.step}
      </div>
      <h3 className="mt-4 text-lg font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/70">{item.description}</p>
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

  const activeGamesCount = gameCards.filter((item) => item.active).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_20%),linear-gradient(180deg,#020617_0%,#020b1d_35%,#010617_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:p-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="hero-glow absolute -right-10 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="hero-glow absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            {/* النص أولًا على سطح المكتب */}
            <div className="order-2 lg:order-1 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
                <GamesIcon className="h-4 w-4" />
                <span>منصة عربية للألعاب الجماعية</span>
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl xl:text-6xl">
                لمّتنا
                <span className="block text-cyan-200">منصة ألعاب عربية</span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 lg:mx-0">
                منصة تجمع أكثر من لعبة في مكان واحد، بتجربة عربية أنيقة وسهلة
                الاستخدام. ابدأ الآن بلعبة الأسئلة والأجوبة أو لعبة برا السالفة،
                ومع الوقت ستنضم ألعاب جديدة للمنصة.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/games"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.25rem] bg-cyan-500 px-6 py-4 text-base font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  استعرض الألعاب
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>

                {loading ? (
                  <div className="inline-flex min-h-14 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/5 px-6 py-4 text-base font-black text-white/60">
                    جارٍ تحميل حالتك...
                  </div>
                ) : isLoggedIn ? (
                  <Link
                    href="/account"
                    className="inline-flex min-h-14 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/5 px-6 py-4 text-base font-black text-white transition hover:bg-white/10"
                  >
                    أهلًا {username || "بك"} — حسابي
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/register"
                      className="inline-flex min-h-14 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/5 px-6 py-4 text-base font-black text-white transition hover:bg-white/10"
                    >
                      إنشاء حساب جديد
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex min-h-14 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/5 px-6 py-4 text-base font-black text-white transition hover:bg-white/10"
                    >
                      تسجيل الدخول
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-center">
                  <div className="mb-2 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2 text-cyan-100">
                    <GamesIcon className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {activeGamesCount}
                  </div>
                  <div className="mt-1 text-xs font-bold text-white/55">
                    الألعاب المتاحة الآن
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-center">
                  <div className="mb-2 inline-flex rounded-2xl border border-orange-300/20 bg-orange-400/10 p-2 text-orange-100">
                    <SocialIcon className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-black text-white">جماعي</div>
                  <div className="mt-1 text-xs font-bold text-white/55">
                    أسلوب المنصة
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-center">
                  <div className="mb-2 inline-flex rounded-2xl border border-violet-300/20 bg-violet-400/10 p-2 text-violet-100">
                    <SparkIcon className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-black text-white">تسلية</div>
                  <div className="mt-1 text-xs font-bold text-white/55">
                    الهدف
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-center">
                  <div className="mb-2 inline-flex rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-2 text-emerald-100">
                    <MobileIcon className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-black text-white">مرن</div>
                  <div className="mt-1 text-xs font-bold text-white/55">
                    لجميع الشاشات
                  </div>
                </div>
              </div>
            </div>

            {/* الصورة ثانيًا على سطح المكتب وأولى على الهاتف */}
            <div className="order-1 lg:order-2">
              <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 p-2 shadow-[0_14px_32px_rgba(0,0,0,0.25)]">
                <img
                  src={heroMockupImage}
                  alt="معاينة من داخل منصة لمّتنا"
                  className="w-full rounded-[1.4rem] object-cover hero-float"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
              <SparkIcon className="h-4 w-4" />
              <span>ما الذي يميز المنصة؟</span>
            </div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
              تجربة انيقة وواضحة منذ البداية وحتى النهاية
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-5 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
                <GamesIcon className="h-4 w-4" />
                <span>الألعاب الحالية</span>
              </div>
              <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
                اختر اللعبة التي تريدها
              </h2>
            </div>

            <Link
              href="/game/start"
              className="inline-flex items-center gap-2 rounded-[1.15rem] border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              صفحة الألعاب
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {gameCards.map((card) => (
              <GameCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
              <SpeedIcon className="h-4 w-4" />
              <span>كيف تبدأ بسرعة؟</span>
            </div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
              ثلاث خطوات بسيطة وواضحة
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((item) => (
              <StepCard key={item.step} item={item} />
            ))}
          </div>
        </section>

        <footer className="mt-10 rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.95)_100%)] p-5 text-center shadow-[0_14px_30px_rgba(0,0,0,0.22)] md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/10"
            >
              الرئيسية
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/10"
            >
              الباقات
            </Link>
            <Link
              href="/terms"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/10"
            >
              الشروط والأحكام
            </Link>
            <Link
              href="/privacy"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/10"
            >
              الخصوصية
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/10"
            >
              من نحن
            </Link>
          </div>

          <div className="text-sm font-bold text-white/50">
            © {new Date().getFullYear()} لمّتنا — جميع الحقوق محفوظة.
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes heroFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }

        .hero-float {
          animation: heroFloat 5.4s ease-in-out infinite;
        }

        .hero-glow {
          animation: glowPulse 4.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}