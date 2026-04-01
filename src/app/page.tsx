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
      soft: "border-orange-300/20 bg-orange-400/10 text-orange-100",
      button:
        "bg-[linear-gradient(180deg,rgba(251,146,60,0.18)_0%,rgba(249,115,22,0.14)_100%)] text-orange-100 hover:bg-[linear-gradient(180deg,rgba(251,146,60,0.24)_0%,rgba(249,115,22,0.18)_100%)]",
      glow:
        "group-hover:shadow-[0_24px_50px_rgba(249,115,22,0.18)]",
      hero:
        "from-orange-400/18 via-orange-300/8 to-transparent",
    };
  }

  if (accent === "violet") {
    return {
      soft: "border-violet-300/20 bg-violet-400/10 text-violet-100",
      button:
        "bg-[linear-gradient(180deg,rgba(167,139,250,0.18)_0%,rgba(139,92,246,0.14)_100%)] text-violet-100 hover:bg-[linear-gradient(180deg,rgba(167,139,250,0.24)_0%,rgba(139,92,246,0.18)_100%)]",
      glow:
        "group-hover:shadow-[0_24px_50px_rgba(139,92,246,0.18)]",
      hero:
        "from-violet-400/18 via-violet-300/8 to-transparent",
    };
  }

  return {
    soft: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    button:
      "bg-[linear-gradient(180deg,rgba(34,211,238,0.18)_0%,rgba(14,165,233,0.14)_100%)] text-cyan-100 hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.24)_0%,rgba(14,165,233,0.18)_100%)]",
    glow:
      "group-hover:shadow-[0_24px_50px_rgba(34,211,238,0.18)]",
    hero:
      "from-cyan-400/18 via-cyan-300/8 to-transparent",
  };
}

function FeatureCard({ item }: { item: FeatureItem }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.95)_100%)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1">
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
        "group relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1",
        styles.glow,
      ].join(" ")}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${styles.hero}`} />

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${styles.soft}`}
        >
          {getGameIcon(card.icon)}
          <span>{card.badge}</span>
        </div>

        <div className={`inline-flex rounded-2xl border p-2.5 ${styles.soft}`}>
          {getGameIcon(card.icon)}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-white/5">
        <img
          src={card.image}
          alt={card.title}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="mt-5">
        <div className="text-xs font-black text-white/48">{card.subtitle}</div>
        <h3 className="mt-2 text-2xl font-black text-white">{card.title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/70">{card.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/65">
            جماعي
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/65">
            سريع
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/65">
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
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function ModeCard({ card }: { card: GameCardItem }) {
  const styles = getAccentClasses(card.accent);

  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.94)_0%,rgba(6,12,28,0.96)_100%)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
      <div className={`mb-4 inline-flex rounded-2xl border p-3 ${styles.soft}`}>
        {getGameIcon(card.icon)}
      </div>

      <h3 className="text-2xl font-black text-white">{card.title}</h3>
      <div className="mt-2 text-sm font-bold text-white/50">{card.subtitle}</div>

      <p className="mt-4 text-sm leading-7 text-white/70">{card.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/65">
          {card.title === "لمتكم" ? "فئات ونقاط" : card.title === "برا السالفة" ? "لعبة اجتماعية" : "كلمات وتلميحات"}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/65">
          {card.title === "Codenames" ? "4 لاعبين+" : "جلسة جماعية"}
        </span>
      </div>
    </div>
  );
}

function StepLine() {
  const items = [
    {
      n: "01",
      title: "اختر اللعبة",
      desc: "ابدأ من نوع الجلسة التي تناسبكم الآن.",
    },
    {
      n: "02",
      title: "ابدأ مباشرة",
      desc: "افتح اللعبة وجهّز الجولة خلال ثوانٍ.",
    },
    {
      n: "03",
      title: "استمتع بالتجربة",
      desc: "تنافس، اكتشف، وواصل اللعب بسهولة.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.n}
          className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.95)_100%)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
        >
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-sm font-black text-cyan-100">
            {item.n}
          </div>
          <h3 className="mt-4 text-lg font-black text-white">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/70">{item.desc}</p>
        </div>
      ))}
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
        <section className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,18,40,0.98)_0%,rgba(4,10,26,0.99)_100%)] px-5 py-10 shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:px-8 md:py-14 xl:px-12 xl:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="hero-glow absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="hero-glow absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="hero-glow absolute bottom-0 left-0 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100 shadow-[0_8px_24px_rgba(34,211,238,0.12)]">
              <SparkIcon className="h-4 w-4" />
              <span>منصة ألعاب عربية جماعية</span>
            </div>

            <div className="mt-7 flex justify-center">
              <div className="hero-logo-frame relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(15,26,55,0.96)_0%,rgba(8,16,36,0.96)_100%)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:p-5">
                <div className="absolute inset-0 rounded-[inherit] border border-white/5" />
                <img
  src={heroLogo}
  alt="شعار لمتكم"
  className="h-[160px] w-[160px] object-contain md:h-[220px] md:w-[220px]"
/>
              </div>
            </div>

            <h1 className="mt-7 text-5xl font-black leading-none text-white md:text-7xl xl:text-[5.5rem]">
              الجمعه عليكم
            </h1>

            <div className="hero-ribbon mt-4 inline-flex rotate-[-2deg] items-center justify-center rounded-[1.4rem] border border-cyan-300/20 bg-cyan-500 px-6 py-4 shadow-[0_16px_40px_rgba(34,211,238,0.22)] md:px-10 md:py-5">
              <span className="text-2xl font-black tracking-tight text-white md:text-5xl">
                والفعاليات علينا
              </span>
            </div>

            <p className="mt-7 max-w-3xl text-base leading-8 text-white/72 md:text-lg">
              منصّة لمتكم تجمع الألعاب الجماعية في تجربة واحدة واضحة وسريعة،
              تتيح لك اللعب مع الأصدقاء، إنشاء الجولات، التنافس ضمن فرق،
              والاستمتاع بألعاب تعتمد على الذكاء والتفاعل على جميع الأجهزة.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/games"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.25rem] bg-cyan-500 px-7 py-4 text-base font-black text-slate-950 transition hover:bg-cyan-400"
              >
                جرّب لمتكم
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

            <div className="mt-10 grid w-full max-w-4xl gap-3 md:grid-cols-4">
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
                  أسلوب اللعب
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-center">
                <div className="mb-2 inline-flex rounded-2xl border border-violet-300/20 bg-violet-400/10 p-2 text-violet-100">
                  <SparkIcon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-black text-white">مرنة</div>
                <div className="mt-1 text-xs font-bold text-white/55">
                  للجلسات والفعاليات
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-center">
                <div className="mb-2 inline-flex rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-2 text-emerald-100">
                  <MobileIcon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-black text-white">مناسبة</div>
                <div className="mt-1 text-xs font-bold text-white/55">
                  لكل الأجهزة
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
              <GamesIcon className="h-4 w-4" />
              <span>أنواع اللعب داخل المنصة</span>
            </div>

            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
              ثلاث تجارب مختلفة داخل لمتكم
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/68 md:text-base">
              كل لعبة داخل المنصة تقدم أجواء مختلفة، من الأسئلة والنقاط، إلى
              اللعب الاجتماعي وكشف الشخص المختلف، وصولًا إلى ألعاب الكلمات
              والتلميحات.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {gameCards.map((card) => (
              <ModeCard key={`mode-${card.title}`} card={card} />
            ))}
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
              <SparkIcon className="h-4 w-4" />
              <span>لماذا المنصة؟</span>
            </div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
              تجربة متكاملة مصممة لتجمعكم وتبقيكم في أجواء اللعب
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
                اختر اللعبة التي تناسب جلستكم
              </h2>
            </div>

            <Link
              href="/games"
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
              ابدأ الجلسة خلال دقائق
            </h2>
          </div>

          <StepLine />
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
            © {new Date().getFullYear()} لمتكم — جميع الحقوق محفوظة.
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

        .hero-glow {
          animation: glowPulse 4.6s ease-in-out infinite;
        }

        .hero-logo-frame {
          animation: heroFloat 5.4s ease-in-out infinite;
        }

        .hero-ribbon {
          box-shadow:
            0 16px 40px rgba(34, 211, 238, 0.22),
            inset 0 1px 0 rgba(255,255,255,0.15);
        }
      `}</style>
    </div>
  );
}