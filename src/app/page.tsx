import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getViewer } from "../lib/auth/viewer";
import { AnimateOnScroll, StatsBar, AnimatedOrbs } from "./home-client";
import HeroParticles from "@/components/home/hero-particles";

export const metadata: Metadata = {
  title: "الرئيسية",
  description:
    "لمتكم منصة ألعاب عربية للجلسات والتجمعات تضم ألعابًا جماعية مثل لمتكم وبرا السالفة وCodenames.",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://lamtkom.ads-shwaiter10.workers.dev";

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "لمتكم",
      url: siteUrl,
      logo: `${siteUrl}/icon`,
    },
    {
      "@type": "WebSite",
      name: "لمتكم",
      url: siteUrl,
      inLanguage: "ar",
      description: "منصة ألعاب عربية للجلسات والتجمعات تضم أكثر من لعبة في مكان واحد.",
    },
  ],
};

type Accent = "cyan" | "orange" | "violet";

type GameItem = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image: string;
  players: string;
  accent: Accent;
};

type StepItem = {
  number: string;
  title: string;
  description: string;
  icon: "users" | "target" | "link" | "trophy";
};

const heroLogo = "/logo.webp";

const games: GameItem[] = [
  {
    title: "لمتكم",
    subtitle: "فئات وأسئلة",
    description:
      "لعبة جماعية بين فريقين تعتمد على الفئات والصور والنقاط، بتجربة قوية وواضحة للجلسات والتحدي.",
    href: "/game/start",
    image: "https://a.top4top.io/p_3738qob7g1.png",
    players: "2 فرق",
    accent: "cyan",
  },
  {
    title: "برا السالفة",
    subtitle: "اكتشف المتخفي",
    description:
      "شخص واحد فقط لا يعرف الكلمة. اسألوا، حللوا، وصوّتوا قبل أن يعرف الجواب أو يضلل الجميع.",
    href: "/game/bara-alsalfah",
    image: "https://l.top4top.io/p_373887e151.png",
    players: "3+ لاعبين",
    accent: "orange",
  },
  {
    title: "Codenames",
    subtitle: "كلمات وتلميحات",
    description:
      "تجربة جماعية تعتمد على الذكاء والتركيز والتلميحات السريعة، وفيها طابع تنافسي ممتع بين الفريقين.",
    href: "/games/codenames/",
    image: "https://b.top4top.io/p_374101e3s1.png",
    players: "4+ لاعبين",
    accent: "violet",
  },
];

const steps: StepItem[] = [
  {
    number: "1",
    title: "جهز فريقك",
    description: "اختر من يلعب معك واجتمعوا في مكان واحد أو أمام نفس الشاشة.",
    icon: "users",
  },
  {
    number: "2",
    title: "اختاروا الفئات",
    description: "كل فريق يختار 3 فئات لتبدأ الجولة بتحدي بين الفريقين.",
    icon: "target",
  },
  {
    number: "3",
    title: "اربط اللعبة",
    description: "ابدأ اللعبة مباشرة واعرضها على التلفاز أو الشاشة بسهولة.",
    icon: "link",
  },
  {
    number: "4",
    title: "استمتع بالتحدي",
    description: "تنافسوا، واجمعوا النقاط، وتنتهي اللعبة بانتصار أعلى فريق حصل على نقاط.",
    icon: "trophy",
  },
];

const features = [
  {
    emoji: "⚡",
    title: "سريع وخفيف",
    desc: "لا تحميل ولا إعداد — ابدأ فوراً من المتصفح",
    color: "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300",
    glow: "rgba(34,211,238,0.08)",
  },
  {
    emoji: "💬",
    title: "بالعربي أصيل",
    desc: "محتوى وتجربة مصممة خصيصاً للمستخدم العربي",
    color: "border-violet-400/20 bg-violet-400/[0.06] text-violet-300",
    glow: "rgba(167,139,250,0.08)",
  },
  {
    emoji: "📺",
    title: "على الشاشة الكبيرة",
    desc: "اعرضها على التلفاز أو البروجيكتور بنقرة واحدة",
    color: "border-orange-400/20 bg-orange-400/[0.06] text-orange-300",
    glow: "rgba(251,146,60,0.08)",
  },
  {
    emoji: "🎉",
    title: "للجلسات والتجمعات",
    desc: "مثالي للعائلة والأصدقاء والفعاليات الاجتماعية",
    color: "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300",
    glow: "rgba(52,211,153,0.08)",
  },
] as const;

const accents = {
  cyan: {
    line: "bg-cyan-400",
    soft: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    button:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_18px_40px_rgba(34,211,238,0.20)]",
  },
  orange: {
    line: "bg-orange-400",
    soft: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    button:
      "bg-orange-400 text-slate-950 hover:bg-orange-300 shadow-[0_18px_40px_rgba(251,146,60,0.20)]",
  },
  violet: {
    line: "bg-violet-400",
    soft: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    button:
      "bg-violet-400 text-slate-950 hover:bg-violet-300 shadow-[0_18px_40px_rgba(167,139,250,0.20)]",
  },
} as const;

const stepAccentMap = {
  "1": {
    cardGlow: "from-cyan-500/12 via-transparent to-transparent",
    border: "border-cyan-400/18 hover:border-cyan-400/30",
    number:
      "border-cyan-200/20 bg-[linear-gradient(180deg,#cffafe_0%,#a5f3fc_100%)] text-slate-900 shadow-[0_12px_22px_rgba(34,211,238,0.18)]",
    iconWrap:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(34,211,238,0.10)]",
    title: "text-cyan-100",
    line: "bg-cyan-400/50",
  },
  "2": {
    cardGlow: "from-violet-500/12 via-transparent to-transparent",
    border: "border-violet-400/18 hover:border-violet-400/30",
    number:
      "border-violet-200/20 bg-[linear-gradient(180deg,#ede9fe_0%,#c4b5fd_100%)] text-slate-900 shadow-[0_12px_22px_rgba(167,139,250,0.18)]",
    iconWrap:
      "border-violet-400/20 bg-violet-400/10 text-violet-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(167,139,250,0.10)]",
    title: "text-violet-100",
    line: "bg-violet-400/50",
  },
  "3": {
    cardGlow: "from-orange-500/12 via-transparent to-transparent",
    border: "border-orange-400/18 hover:border-orange-400/30",
    number:
      "border-orange-200/20 bg-[linear-gradient(180deg,#ffedd5_0%,#fdba74_100%)] text-slate-900 shadow-[0_12px_22px_rgba(251,146,60,0.18)]",
    iconWrap:
      "border-orange-400/20 bg-orange-400/10 text-orange-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(251,146,60,0.10)]",
    title: "text-orange-100",
    line: "bg-orange-400/50",
  },
  "4": {
    cardGlow: "from-emerald-500/12 via-transparent to-transparent",
    border: "border-emerald-400/18 hover:border-emerald-400/30",
    number:
      "border-emerald-200/20 bg-[linear-gradient(180deg,#dcfce7_0%,#86efac_100%)] text-slate-900 shadow-[0_12px_22px_rgba(52,211,153,0.18)]",
    iconWrap:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(52,211,153,0.10)]",
    title: "text-emerald-100",
    line: "bg-emerald-400/50",
  },
} as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ArrowLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11A3.5 3.5 0 1 0 9.5 4a3.5 3.5 0 0 0 0 7ZM17 11a3 3 0 1 0 0-6m4 16v-2a4 4 0 0 0-3-3.87"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TargetIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function LinkIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 13a5 5 0 0 1 0-7l1.2-1.2a5 5 0 1 1 7.07 7.07L17 13M14 11a5 5 0 0 1 0 7l-1.2 1.2a5 5 0 1 1-7.07-7.07L7 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrophyIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Zm10 1h2a2 2 0 0 1 2 2c0 2.8-1.8 5-5 5M7 5H5a2 2 0 0 0-2 2c0 2.8 1.8 5 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepIcon({
  icon,
  className,
}: {
  icon: StepItem["icon"];
  className?: string;
}) {
  if (icon === "users") return <UsersIcon className={className} />;
  if (icon === "target") return <TargetIcon className={className} />;
  if (icon === "link") return <LinkIcon className={className} />;
  return <TrophyIcon className={className} />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-cyan-400" />
      {label}
    </div>
  );
}

function HeroGamePill({ title, accent }: { title: string; accent: Accent }) {
  const styles = {
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    orange: "border-orange-400/30 bg-orange-400/10 text-orange-300",
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold sm:text-sm",
        styles[accent],
      )}
    >
      {title}
    </span>
  );
}

function GameCard({ game }: { game: GameItem }) {
  const accent = accents[game.accent];

  return (
    <AnimateOnScroll>
      <article className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.92))] p-4 shadow-[0_25px_70px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-white/20">
        <div className={cn("absolute inset-x-0 top-0 h-1", accent.line)} />
        <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/50">
          <Image
            src={game.image}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", accent.soft)}>
            {game.subtitle}
          </span>
          <span className="text-xs font-semibold text-white/55">{game.players}</span>
        </div>

        <h3 className="mt-4 text-2xl font-black tracking-tight text-white">{game.title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/68">{game.description}</p>

        <div className="mt-6">
          <Link
            href={game.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition",
              accent.button,
            )}
          >
            ابدأ اللعبة
            <ArrowLeftIcon />
          </Link>
        </div>
      </article>
    </AnimateOnScroll>
  );
}

function StepCard({ step }: { step: StepItem }) {
  const accent = stepAccentMap[step.number as keyof typeof stepAccentMap] ?? stepAccentMap["1"];

  return (
    <AnimateOnScroll>
      <article
        className={cn(
          "relative overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.92))] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.35)] transition duration-300 hover:-translate-y-1",
          accent.border,
        )}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", accent.cardGlow)} />
        <div className="relative flex items-start gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-base font-black",
              accent.number,
            )}
          >
            {step.number}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <h3 className={cn("text-xl font-black", accent.title)}>{step.title}</h3>
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                  accent.iconWrap,
                )}
              >
                <StepIcon icon={step.icon} className="h-5 w-5" />
              </div>
            </div>

            <div className={cn("mt-4 h-px w-16", accent.line)} />
            <p className="mt-4 text-sm leading-7 text-white/68">{step.description}</p>
          </div>
        </div>
      </article>
    </AnimateOnScroll>
  );
}

export default async function HomePage() {
  const viewer = await getViewer();
  const isLoggedIn = Boolean(viewer?.isLoggedIn);
  const viewerName =
    typeof viewer?.username === "string" && viewer.username.trim().length > 0
      ? viewer.username.trim()
      : "بك";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <main className="relative overflow-hidden">
        <AnimatedOrbs />

        <section className="relative isolate overflow-hidden">
          <HeroParticles />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.09),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.22),transparent_28%)]" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
              <div className="order-2 lg:order-1">
                <AnimateOnScroll>
                  <SectionLabel label="منصة ألعاب عربية للجلسات" />
                </AnimateOnScroll>

                <AnimateOnScroll>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <HeroGamePill title="لمتكم" accent="cyan" />
                    <HeroGamePill title="برا السالفة" accent="orange" />
                    <HeroGamePill title="Codenames" accent="violet" />
                  </div>
                </AnimateOnScroll>

                <AnimateOnScroll>
                  <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
                    ألعاب جماعية عربية
                    <span className="block bg-gradient-to-l from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
                      للجلسات والتحدي والمتعة
                    </span>
                  </h1>
                </AnimateOnScroll>

                <AnimateOnScroll>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                    اجمع أصحابك أو عائلتك وابدؤوا التحدي فورًا. لمتكم تعطيكم أكثر من لعبة في
                    مكان واحد، بتجربة سريعة ومرتبة ومناسبة للشاشات الكبيرة والجلسات.
                  </p>
                </AnimateOnScroll>

                <AnimateOnScroll>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/games"
                      className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_18px_45px_rgba(34,211,238,0.24)] transition hover:bg-cyan-300"
                    >
                      استعرض الألعاب
                      <ArrowLeftIcon />
                    </Link>

                    <Link
                      href={isLoggedIn ? "/game/start" : "/register"}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-black text-white transition hover:border-white/20 hover:bg-white/[0.07]"
                    >
                      {isLoggedIn ? `ابدأ اللعب يا ${viewerName}` : "أنشئ حسابك الآن"}
                    </Link>
                  </div>
                </AnimateOnScroll>

                <div className="mt-10">
                  <StatsBar />
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <AnimateOnScroll>
                  <div className="relative mx-auto max-w-[560px]">
                    <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-cyan-400/12 blur-3xl" />
                    <div className="absolute -right-6 bottom-8 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />

                    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.9))] p-5 shadow-[0_35px_90px_rgba(2,6,23,0.52)]">
                      <div className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-white/50">منصة الجلسات العربية</p>
                          <p className="mt-1 text-sm font-black text-white">Lamtkom</p>
                        </div>
                        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-300">
                          جاهز للعب
                        </div>
                      </div>

                      <div className="relative mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.08),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.85),rgba(2,6,23,0.94))] p-6">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02))]" />

                        <div className="relative flex flex-col items-center text-center">
                          <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] border border-cyan-400/20 bg-white/[0.03] shadow-[0_0_35px_rgba(34,211,238,0.10)]">
                            <Image
                              src={heroLogo}
                              alt="شعار لمتكم"
                              width={88}
                              height={88}
                              priority
                              className="h-auto w-auto object-contain"
                            />
                          </div>

                          <h2 className="mt-5 text-2xl font-black text-white sm:text-3xl">لمتكم</h2>
                          <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
                            منصة ألعاب عربية للجلسات والتجمعات، تجمع أكثر من تجربة جماعية في
                            مكان واحد بشكل أنيق وسريع.
                          </p>

                          <div className="mt-6 grid w-full grid-cols-3 gap-3">
                            {games.map((game) => (
                              <div
                                key={game.title}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center"
                              >
                                <div className="text-[11px] font-bold text-white/45">{game.subtitle}</div>
                                <div className="mt-1 text-sm font-black text-white">{game.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <AnimateOnScroll>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionLabel label="ليش لمتكم؟" />
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">تجربة منظمة وراقية للجلسات</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                  كل شيء مصمم ليكون سهلًا وسريعًا وواضحًا، من لحظة الدخول وحتى بداية اللعب.
                </p>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <AnimateOnScroll key={feature.title}>
                <div
                  className={cn(
                    "relative overflow-hidden rounded-[26px] border p-5 shadow-[0_15px_40px_rgba(2,6,23,0.25)]",
                    feature.color,
                  )}
                  style={{ boxShadow: `0 10px 35px ${feature.glow}` }}
                >
                  <div className="text-2xl">{feature.emoji}</div>
                  <h3 className="mt-4 text-lg font-black text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/70">{feature.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <AnimateOnScroll>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionLabel label="الألعاب المتوفرة" />
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">اختر اللعبة المناسبة للجلسة</h2>
              </div>
              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                عرض كل الألعاب
                <ArrowLeftIcon />
              </Link>
            </div>
          </AnimateOnScroll>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.title} game={game} />
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <AnimateOnScroll>
            <div className="text-center">
              <SectionLabel label="كيف تبدأ؟" />
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">أربع خطوات وتبدأ الجلسة</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                التجربة بسيطة جدًا: جهز الفريق، اختر اللعبة، وابدأ التحدي خلال دقائق.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.92))] px-6 py-10 text-center shadow-[0_25px_80px_rgba(2,6,23,0.42)] sm:px-10 sm:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_bottom,rgba(167,139,250,0.08),transparent_30%)]" />
              <div className="relative">
                <h2 className="text-3xl font-black text-white sm:text-4xl">جاهز تبدأ الجلسة؟</h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                  ادخل الآن واختر لعبتك وابدأ التحدي بتجربة مرتبة وسريعة ومناسبة لكل جلسة.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={isLoggedIn ? "/game/start" : "/register"}
                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_18px_45px_rgba(34,211,238,0.24)] transition hover:bg-cyan-300"
                  >
                    {isLoggedIn ? "ابدأ اللعب الآن" : "أنشئ حسابك"}
                    <ArrowLeftIcon />
                  </Link>

                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-black text-white transition hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    عرض الباقات
                  </Link>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </section>
      </main>
    </>
  );
}
