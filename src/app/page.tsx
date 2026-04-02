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

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

const gameCards: GameCardItem[] = [
  {
    title: "لمتكم",
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
      "لعبة Codenames الشهيرة ولكن بشكل جديد، وللبدء تحتاج إلى 4 لاعبين كحد أدنى.",
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
    title: "واجهة سريعة وواضحة",
    description:
      "كل شيء مصمم ليكون مباشرًا وسهلًا بدون تعقيد، لتبدأ اللعب خلال ثوانٍ.",
    icon: "speed",
  },
  {
    title: "مثالية للجلسات والتجمعات",
    description:
      "مناسبة للشاشات الكبيرة والجلسات العائلية والفعاليات والتنافس بين الفرق.",
    icon: "screen",
  },
  {
    title: "جاهزة لكل الأجهزة",
    description:
      "تجربة سلسة على الهاتف والتابلت والكمبيوتر بنفس وضوح التصميم.",
    icon: "mobile",
  },
  {
    title: "منصة تضم أكثر من تجربة",
    description:
      "ليست لعبة واحدة فقط، بل مساحة متكاملة لألعاب جماعية متنوعة.",
    icon: "games",
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
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M12 12 16.5 7.5" />
      <path d="M12 12h.01" />
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
      <rect x="3" y="5" width="18" height="12" rx="2.5" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
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
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
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
      soft: "border-orange-300/20 bg-orange-400/10 text-orange-100",
      button:
        "bg-[linear-gradient(180deg,rgba(251,146,60,0.18)_0%,rgba(249,115,22,0.14)_100%)] text-orange-100 hover:bg-[linear-gradient(180deg,rgba(251,146,60,0.24)_0%,rgba(249,115,22,0.18)_100%)]",
      glow: "group-hover:shadow-[0_24px_50px_rgba(249,115,22,0.18)]",
      hero: "from-orange-400/18 via-orange-300/8 to-transparent",
    };
  }

  if (accent === "violet") {
    return {
      soft: "border-violet-300/20 bg-violet-400/10 text-violet-100",
      button:
        "bg-[linear-gradient(180deg,rgba(167,139,250,0.18)_0%,rgba(139,92,246,0.14)_100%)] text-violet-100 hover:bg-[linear-gradient(180deg,rgba(167,139,250,0.24)_0%,rgba(139,92,246,0.18)_100%)]",
      glow: "group-hover:shadow-[0_24px_50px_rgba(139,92,246,0.18)]",
      hero: "from-violet-400/18 via-violet-300/8 to-transparent",
    };
  }

  return {
    soft: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    button:
      "bg-[linear-gradient(180deg,rgba(34,211,238,0.18)_0%,rgba(14,165,233,0.14)_100%)] text-cyan-100 hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.24)_0%,rgba(14,165,233,0.18)_100%)]",
    glow: "group-hover:shadow-[0_24px_50px_rgba(34,211,238,0.18)]",
    hero: "from-cyan-400/18 via-cyan-300/8 to-transparent",
  };
}

function FeatureCard({ item }: { item: FeatureItem }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.20)]">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
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
      className={`group overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 ${styles.glow}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${styles.soft}`}>
          {getGameIcon(card.icon)}
          <span>{card.badge}</span>
        </div>

        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${styles.soft}`}>
          {getGameIcon(card.icon)}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/5">
        <img
          src={card.image}
          alt={card.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="mt-5">
        <div className="text-xs font-black tracking-[0.12em] text-white/45">
          {card.subtitle}
        </div>
        <h3 className="mt-2 text-2xl font-black text-white">{card.title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/72">{card.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-white/70">
            جماعي
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-white/70">
            سريع
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-white/70">
            مناسب للجلسات
          </span>
        </div>
      </div>

      <div className="mt-5">
        <Link
          href={card.href}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] px-5 py-3.5 text-sm font-black transition ${styles.button}`}
        >
          افتح اللعبة
          <ArrowLeftIcon />
        </Link>
      </div>
    </div>
  );
}

function ModeCard({ card }: { card: GameCardItem }) {
  const styles = getAccentClasses(card.accent);

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${styles.soft}`}>
        {getGameIcon(card.icon)}
      </div>

      <h3 className="text-xl font-black text-white">{card.title}</h3>
      <div className="mt-1 text-sm font-bold text-white/45">{card.subtitle}</div>

      <p className="mt-3 text-sm leading-7 text-white/70">{card.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-white/70">
          {card.title === "لمتكم"
            ? "فئات ونقاط"
            : card.title === "برا السالفة"
              ? "لعبة اجتماعية"
              : "كلمات وتلميحات"}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-white/70">
          {card.title === "Codenames" ? "4 لاعبين+" : "جلسة جماعية"}
        </span>
      </div>
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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Hero - preserved */}
        <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.98)_0%,rgba(6,12,28,0.99)_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-8 xl:p-10">
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:26px_26px]" />

          <div className="relative text-center">
            <div className="mb-6 flex justify-center">
              <img
                src={heroLogo}
                alt="شعار لمتكم"
                className="h-[82px] w-auto object-contain md:h-[95px]"
              />
            </div>

            <h1 className="text-[2.5rem] font-black leading-[1.05] text-white md:text-[5rem]">
              الجمعه عليكم
            </h1>

            <div className="mt-4 flex justify-center">
              <div className="rounded-[1.5rem] bg-cyan-400 px-6 py-3 text-[1.65rem] font-black leading-none text-white shadow-[0_0_35px_rgba(34,211,238,0.30)] md:px-10 md:py-4 md:text-[3rem]">
                والفعاليات علينا
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-4xl text-sm leading-8 text-white/75 md:text-base">
              منصّة لمتكم تجمع الألعاب الجماعية في تجربة واحدة واضحة وسريعة، تتيح
              لك اللعب مع الأصدقاء، إنشاء الجولات، التنافس ضمن فرق، والاستمتاع
              بألعاب تعتمد على الذكاء والتفاعل على جميع الأجهزة.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/games"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                جرّب لمتكم
              </Link>

              {loading ? (
                <span className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70">
                  جارٍ تحميل حالتك...
                </span>
              ) : isLoggedIn ? (
                <Link
                  href="/account"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  أهلًا {username || "بك"} — حسابي
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                  >
                    إنشاء حساب جديد
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                  >
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-400/10 p-4 text-center shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
              <div className="text-2xl font-black text-white">{activeGamesCount}</div>
              <div className="mt-1 text-xs font-black text-cyan-100">الألعاب المتاحة الآن</div>
            </div>

            <div className="rounded-[1.5rem] border border-orange-300/20 bg-orange-400/10 p-4 text-center shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
              <div className="text-2xl font-black text-white">جماعي</div>
              <div className="mt-1 text-xs font-black text-orange-100">أسلوب اللعب</div>
            </div>

            <div className="rounded-[1.5rem] border border-violet-300/20 bg-violet-400/10 p-4 text-center shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
              <div className="text-2xl font-black text-white">مرنة</div>
              <div className="mt-1 text-xs font-black text-violet-100">للجلسات والفعاليات</div>
            </div>

            <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-4 text-center shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
              <div className="text-2xl font-black text-white">مناسبة</div>
              <div className="mt-1 text-xs font-black text-emerald-100">لكل الأجهزة</div>
            </div>
          </div>
        </section>

        {/* Modes */}
        <section className="mt-10">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              أنواع اللعب داخل المنصة
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              ثلاث تجارب مختلفة داخل لمتكم
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
              كل لعبة داخل المنصة تقدم أجواء مختلفة، من الأسئلة والنقاط، إلى اللعب
              الاجتماعي وكشف الشخص المختلف، وصولًا إلى ألعاب الكلمات والتلميحات.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {gameCards.map((card) => (
              <ModeCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-10">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              لماذا المنصة؟
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              تجربة متكاملة مصممة لتجمعكم وتبقيكم في أجواء اللعب
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        {/* Games cards */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
                الألعاب الحالية
              </div>
              <h2 className="text-2xl font-black text-white md:text-3xl">
                اختر اللعبة التي تناسب جلستكم
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
                صفحة الألعاب تعرض كل التجارب الحالية في مكان واحد، بواجهة أوضح
                وأخف وأكثر مناسبة للهاتف والشاشات الكبيرة.
              </p>
            </div>

            <Link
              href="/games"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              صفحة الألعاب
              <ArrowLeftIcon />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {gameCards.map((card) => (
              <GameCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        {/* Footer links */}
        <footer className="mt-12 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.94)_0%,rgba(6,12,28,0.98)_100%)] px-5 py-6 text-center shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <div className="flex flex-wrap justify-center gap-3 text-sm font-black text-white/75">
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
            <Link href="/contact" className="transition hover:text-white">
              اتصل بنا
            </Link>
          </div>

          <div className="mt-4 text-sm font-bold text-white/45">
            © {new Date().getFullYear()} لمتكم — جميع الحقوق محفوظة.
          </div>
        </footer>
      </div>
    </main>
  );
}