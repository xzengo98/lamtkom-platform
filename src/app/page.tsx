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

// ─── Icons ───────────────────────────────────────────────────────────────────

function QuizIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11h6" /><path d="M9 15h4" />
      <path d="M7 4h10a2 2 0 0 1 2 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function SocialIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" />
      <path d="M3 20a5 5 0 0 1 10 0" /><path d="M11 20a5 5 0 0 1 10 0" />
    </svg>
  );
}

function SparkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
    </svg>
  );
}

function SpeedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M12 12 16.5 7.5" /><path d="M12 12h.01" />
    </svg>
  );
}

function ScreenIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="12" rx="2.5" /><path d="M8 21h8" /><path d="M12 17v4" />
    </svg>
  );
}

function MobileIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18h2" />
    </svg>
  );
}

function GamesIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="8" rx="3" />
      <path d="M8 12h2" /><path d="M9 11v2" /><path d="M16.5 12h.01" /><path d="M18.5 12h.01" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

type AccentKey = "cyan" | "orange" | "violet";

function getAccentClasses(accent: AccentKey) {
  const map = {
    cyan: {
      badge: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
      icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
      glow: "group-hover:shadow-[0_24px_60px_rgba(34,211,238,0.14)]",
      bar: "bg-cyan-400",
      button: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/18",
      subtitleColor: "text-cyan-400/70",
    },
    orange: {
      badge: "border-orange-400/25 bg-orange-400/10 text-orange-300",
      icon: "border-orange-400/20 bg-orange-400/10 text-orange-300",
      glow: "group-hover:shadow-[0_24px_60px_rgba(249,115,22,0.14)]",
      bar: "bg-orange-400",
      button: "border-orange-400/20 bg-orange-400/10 text-orange-200 hover:bg-orange-400/18",
      subtitleColor: "text-orange-400/70",
    },
    violet: {
      badge: "border-violet-400/25 bg-violet-400/10 text-violet-300",
      icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",
      glow: "group-hover:shadow-[0_24px_60px_rgba(139,92,246,0.14)]",
      bar: "bg-violet-400",
      button: "border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/18",
      subtitleColor: "text-violet-400/70",
    },
  };
  return map[accent];
}

const featureAccents = [
  { icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300", border: "hover:border-cyan-400/20" },
  { icon: "border-orange-400/20 bg-orange-400/10 text-orange-300", border: "hover:border-orange-400/20" },
  { icon: "border-violet-400/20 bg-violet-400/10 text-violet-300", border: "hover:border-violet-400/20" },
  { icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300", border: "hover:border-emerald-400/20" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white/50">
      <span className="h-1 w-1 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
}

function FeatureCard({ item, index }: { item: FeatureItem; index: number }) {
  const accent = featureAccents[index] ?? featureAccents[0];
  return (
    <div
      className={`group rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition duration-300 ${accent.border} hover:bg-white/[0.05]`}
    >
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${accent.icon}`}>
        {getFeatureIcon(item.icon)}
      </div>
      <h3 className="text-base font-black text-white">{item.title}</h3>
      <p className="mt-2.5 text-sm leading-7 text-white/55">{item.description}</p>
    </div>
  );
}

function GameCard({ card }: { card: GameCardItem }) {
  const styles = getAccentClasses(card.accent);

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(18,28,55,0.95)_0%,rgba(8,14,32,0.98)_100%)] shadow-[0_20px_50px_rgba(0,0,0,0.30)] transition duration-300 hover:-translate-y-1 ${styles.glow}`}
    >
      {/* Top accent bar */}
      <div className={`h-[2px] w-full ${styles.bar} opacity-60`} />

      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={card.image}
          alt={card.title}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {/* Gradient overlay on image */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,14,32,0.85)] via-transparent to-transparent" />
        {/* Badge overlay */}
        <div className="absolute bottom-3 right-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${styles.badge}`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            {card.badge}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className={`mb-1 text-xs font-bold tracking-widest uppercase ${styles.subtitleColor}`}>
          {card.subtitle}
        </div>
        <h3 className="text-xl font-black text-white">{card.title}</h3>
        <p className="mt-2.5 flex-1 text-sm leading-7 text-white/55">{card.description}</p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-bold text-white/50">
            جماعي
          </span>
          <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-bold text-white/50">
            سريع
          </span>
          <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-bold text-white/50">
            مناسب للجلسات
          </span>
        </div>

        {/* CTA */}
        <div className="mt-4">
          <Link
            href={card.href}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition duration-200 active:scale-[0.98] ${styles.button}`}
          >
            افتح اللعبة
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_55%,rgba(10,18,40,1)_100%)]">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-64 rounded-full bg-violet-500/8 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-64 rounded-full bg-cyan-400/6 blur-2xl" />

          <div className="relative px-6 py-10 text-center md:px-10 md:py-14 xl:py-16">

            {/* Live badge */}
            <div className="mb-7 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-bold text-cyan-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                {activeGamesCount} ألعاب متاحة الآن
              </span>
            </div>

            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <img
                src={heroLogo}
                alt="شعار لمتكم"
                className="h-28 w-auto object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.15)] md:h-36"
              />
            </div>

            {/* Headline */}
            <h1 className="text-[2.4rem] font-black leading-[1.1] tracking-tight text-white md:text-[4.5rem] xl:text-[5.5rem]">
              الجمعه عليكم
            </h1>

            <div className="mt-4 flex justify-center">
              <div className="rounded-2xl bg-gradient-to-l from-cyan-500 to-cyan-400 px-7 py-2.5 text-[1.6rem] font-black text-slate-950 shadow-[0_0_50px_rgba(34,211,238,0.22)] md:px-10 md:py-3 md:text-[2.8rem]">
                والفعاليات علينا
              </div>
            </div>

            {/* Subtitle */}
            <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-white/55 md:text-base md:leading-9">
              منصّة لمتكم تجمع الألعاب الجماعية في تجربة واحدة واضحة وسريعة، تتيح لك اللعب مع الأصدقاء،
              إنشاء الجولات، التنافس ضمن فرق، والاستمتاع بألعاب تعتمد على الذكاء والتفاعل.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {/* Primary */}
              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition duration-200 hover:bg-cyan-400 hover:shadow-[0_4px_36px_rgba(34,211,238,0.38)] active:scale-[0.98]"
              >
                <GamesIcon className="h-4 w-4" />
                جرّب لمتكم
              </Link>

              {/* Auth state */}
              {loading ? (
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-6 py-3.5 text-sm font-bold text-white/35">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/35" />
                  جارٍ تحميل حالتك...
                </span>
              ) : isLoggedIn ? (
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-6 py-3.5 text-sm font-black text-white transition duration-200 hover:bg-white/10"
                >
                  أهلًا {username || "بك"} — حسابي
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center rounded-xl border border-white/10 bg-white/6 px-6 py-3.5 text-sm font-black text-white transition duration-200 hover:bg-white/10"
                  >
                    إنشاء حساب
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-xl border border-white/6 bg-white/3 px-6 py-3.5 text-sm font-bold text-white/60 transition duration-200 hover:text-white hover:bg-white/7"
                  >
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Stats strip ───────────────────────────────────────────────── */}
        <section className="mt-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { value: String(activeGamesCount), label: "الألعاب المتاحة", color: "border-cyan-400/15 bg-cyan-400/6", num: "text-cyan-300", lbl: "text-cyan-400/60" },
              { value: "جماعي", label: "أسلوب اللعب", color: "border-orange-400/15 bg-orange-400/6", num: "text-orange-300", lbl: "text-orange-400/60" },
              { value: "مرنة", label: "للجلسات والفعاليات", color: "border-violet-400/15 bg-violet-400/6", num: "text-violet-300", lbl: "text-violet-400/60" },
              { value: "متوافقة", label: "مع جميع الأجهزة", color: "border-emerald-400/15 bg-emerald-400/6", num: "text-emerald-300", lbl: "text-emerald-400/60" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border ${stat.color} px-4 py-4 text-center`}
              >
                <div className={`text-xl font-black ${stat.num}`}>{stat.value}</div>
                <div className={`mt-1 text-xs font-bold ${stat.lbl}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Games ─────────────────────────────────────────────────────── */}
        <section className="mt-14">
          <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionBadge>الألعاب الحالية</SectionBadge>
              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
                اختر اللعبة التي تناسب جلستكم
              </h2>
              <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
                ثلاث تجارب مختلفة — من الأسئلة والنقاط، إلى اللعب الاجتماعي، وصولًا إلى ألعاب الكلمات والتلميحات.
              </p>
            </div>

            <Link
              href="/games"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white"
            >
              كل الألعاب
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {gameCards.map((card) => (
              <GameCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section className="mt-14">
          <SectionBadge>لماذا لمتكم؟</SectionBadge>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
            تجربة متكاملة مصممة لتجمعكم
          </h2>
          <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
            كل شيء في لمتكم مبني ليخدم اللحظة — سرعة البدء، وضوح الواجهة، وأجواء اللعب.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((item, i) => (
              <FeatureCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="mt-14 overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(14,24,48,0.95)_0%,rgba(6,12,28,0.98)_100%)]">
          {/* Top accent */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

          <div className="px-6 py-8 md:px-10">
            {/* Logo + nav */}
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <img src={heroLogo} alt="لمتكم" className="h-10 w-auto object-contain opacity-80" />

              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-white/45">
                {[
                  { label: "الرئيسية", href: "/" },
                  { label: "الألعاب", href: "/games" },
                  { label: "الباقات", href: "/pricing" },
                  { label: "من نحن", href: "/about" },
                  { label: "اتصل بنا", href: "/contact" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Divider */}
            <div className="mt-6 h-[1px] bg-white/6" />

            {/* Bottom row */}
            <div className="mt-5 flex flex-col items-center gap-3 text-xs text-white/30 md:flex-row md:justify-between">
              <span>© {new Date().getFullYear()} لمتكم — جميع الحقوق محفوظة.</span>
              <div className="flex gap-5">
                <Link href="/terms" className="transition hover:text-white/60">الشروط والأحكام</Link>
                <Link href="/privacy" className="transition hover:text-white/60">الخصوصية</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}