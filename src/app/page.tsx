import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الرئيسية",
  description:
    "لمتكم منصة ألعاب عربية للجلسات والتجمعات تضم ألعابًا جماعية مثل لمتكم وبرا السالفة وCodenames.",
};

import Link from "next/link";
import { getViewer } from "../lib/auth/viewer";

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

const heroLogo = "/logo.png";

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
    description: "تنافسوا، واجمعوا النقاط، وتنتهي اللعبة بانتصار اعلى فريق حصل على نقاط.",
    icon: "trophy",
  },
];

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
};

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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function UsersIcon({ className = "h-6 w-6" }: { className?: string }) {
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
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M4 19a5 5 0 0 1 10 0" />
      <path d="M14.5 19a4.5 4.5 0 0 1 5 0" />
    </svg>
  );
}

function TargetIcon({ className = "h-6 w-6" }: { className?: string }) {
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
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

function LinkIcon({ className = "h-6 w-6" }: { className?: string }) {
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
      <rect x="6" y="8" width="12" height="8" rx="4" />
      <path d="M9 12h.01M15 12h.01" />
      <path d="M12 9.5v5" />
    </svg>
  );
}

function TrophyIcon({ className = "h-6 w-6" }: { className?: string }) {
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
      <path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" />
      <path d="M6 6H4a2 2 0 0 0 2 2" />
      <path d="M18 6h2a2 2 0 0 1-2 2" />
      <path d="M12 11v4" />
      <path d="M9 19h6" />
      <path d="M10 15h4v4h-4z" />
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
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-extrabold tracking-[0.2em] text-white/55">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
      {label}
    </span>
  );
}

function HeroGamePill({
  title,
  accent,
}: {
  title: string;
  accent: Accent;
}) {
  const styles = {
    cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    orange: "border-orange-400/30 bg-orange-400/10 text-orange-300",
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border px-5 py-4 text-center text-sm font-black shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-sm transition hover:-translate-y-0.5",
        styles[accent],
      )}
    >
      {title}
    </div>
  );
}

function GameCard({ game }: { game: GameItem }) {
  const accent = accents[game.accent];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1">
      <div className={cn("h-[2px] w-full", accent.line)} />

      <div className="relative h-52 overflow-hidden sm:h-56">
        <img
          src={game.image}
          alt={game.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07101f] via-[#07101f66] to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black",
              accent.soft,
            )}
          >
            {game.subtitle}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/50">
            {game.players}
          </span>
        </div>

        <h3 className="mt-4 text-2xl font-black text-white">{game.title}</h3>

        <p className="mt-3 flex-1 text-sm leading-8 text-white/62">
          {game.description}
        </p>

        <div className="mt-6">
          <Link
            href={game.href}
            className={cn(
              "inline-flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-black transition active:scale-[0.98]",
              accent.button,
            )}
          >
            <span>ابدأ اللعبة</span>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function StepCard({ step }: { step: StepItem }) {
  const accent =
    stepAccentMap[step.number as keyof typeof stepAccentMap] ??
    stepAccentMap["1"];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(10,18,34,0.98)_100%)] px-5 pb-6 pt-8 text-center shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm transition duration-300 hover:-translate-y-1",
        accent.border,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-80",
          accent.cardGlow,
        )}
      />

      <div
        className={cn(
          "absolute right-4 top-4 rotate-[10deg] rounded-2xl border px-3 py-2 text-lg font-black leading-none",
          accent.number,
        )}
      >
        {step.number}
      </div>

      <div
        className={cn(
          "mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border sm:h-20 sm:w-20",
          accent.iconWrap,
        )}
      >
        <StepIcon icon={step.icon} className="h-8 w-8" />
      </div>

      <h3 className={cn("mt-6 text-2xl font-black", accent.title)}>
        {step.title}
      </h3>

      <p className="mt-4 text-sm leading-8 text-white/68 sm:text-base">
        {step.description}
      </p>

      <div className={cn("mx-auto mt-6 h-1 w-14 rounded-full", accent.line)} />
    </div>
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
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#030712_0%,#07101f_38%,#030712_100%)] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.09),transparent_24%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.10),transparent_22%),linear-gradient(180deg,#040816_0%,#07101f_40%,#030712_100%)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl overflow-hidden rounded-[2.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-6 py-12 shadow-[0_40px_120px_rgba(0,0,0,0.40)] sm:px-10 sm:py-16 lg:px-12 lg:py-18">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/6 to-transparent" />

          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <SectionLabel label="3 العاب مختلفة متاحة على المنصة" />

            <div className="relative mt-8">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl" />
              <img
                src={heroLogo}
                alt="لمتكم"
                className="relative mx-auto w-[250px] rotate-[-7deg] object-contain drop-shadow-[14px_16px_0_rgba(8,15,30,0.95)] sm:w-[340px] lg:w-[470px]"
              />
            </div>

            <h1 className="mt-8 text-3xl font-black leading-[1.15] text-white sm:text-5xl lg:text-6xl">
              خلّينا اللمة عليكم
              <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(34,211,238,0.18)]">
                والفعاليات علينا
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-sm font-bold leading-8 text-white/72 sm:text-lg sm:leading-9">
              منصة ألعاب عربية للجلسات و التجمعات نقدم لكم الفعاليات على شكل ألعاب
              اختار ما يناسبك وابدء فورا.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-7 py-4 text-sm font-black text-slate-950 shadow-[0_18px_50px_rgba(34,211,238,0.22)] transition hover:bg-cyan-300 active:scale-[0.98]"
              >
                استكشف الألعاب
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>

              {isLoggedIn ? (
                <Link
                  href="/account"
                  className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-7 py-4 text-sm font-black text-white transition hover:bg-white/[0.10]"
                >
                  أهلاً {viewerName}
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-7 py-4 text-sm font-black text-white transition hover:bg-white/[0.10]"
                  >
                    إنشاء حساب
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-xl border border-white/10 bg-transparent px-7 py-4 text-sm font-bold text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 grid w-full max-w-4xl gap-3 sm:grid-cols-3">
              <HeroGamePill title="فئات وأسئلة" accent="cyan" />
              <HeroGamePill title="كشف المتخفي" accent="orange" />
              <HeroGamePill title="كلمات وتلميحات" accent="violet" />
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel label="ألعاب المنصة" />
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                اختر اللعبة المناسبة
              </h2>
            </div>

            <Link
              href="/games"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white/75 transition hover:bg-white/[0.08] hover:text-white"
            >
              جميع الألعاب
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.title} game={game} />
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl overflow-hidden rounded-[2.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-6 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.24)] sm:px-8 sm:py-12 lg:px-10">
          <div className="pointer-events-none absolute left-0 top-0 h-52 w-52 rounded-full bg-cyan-500/8 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-52 w-52 rounded-full bg-violet-500/8 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.03] to-transparent" />

          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-black sm:text-5xl">
                <span className="bg-gradient-to-r from-white via-cyan-100 to-violet-100 bg-clip-text text-transparent">
                  كيف تلعب لعبة لمتكم؟
                </span>
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-white/55 sm:text-base">
                خطوات بسيطة وواضحة لتبدأ الجولة بشكل جميل ومنظم وحماسي.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step) => (
                <StepCard key={step.number} step={step} />
              ))}
            </div>

            <div className="mx-auto mt-8 max-w-5xl">
              <Link
                href="/game/start"
                className="flex w-full items-center justify-center rounded-[1.7rem] border border-cyan-300/20 bg-[linear-gradient(90deg,#f5f0d7_0%,#f8f3df_50%,#ede4be_100%)] px-6 py-4 text-xl font-black text-[#18212f] shadow-[0_14px_28px_rgba(0,0,0,0.14)] transition hover:brightness-105"
              >
                ابدأ اللعب الآن
              </Link>
            </div>
          </div>
        </section>

        <footer className="mx-auto mt-14 max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

          <div className="px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div className="flex flex-col items-center gap-3 md:items-start">
                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="h-12 w-auto object-contain opacity-90"
                />
                <p className="text-xs text-white/35">
                  منصة ألعاب عربية للجلسات والتجمعات
                </p>
              </div>

              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-white/50">
                {[
                  { label: "الرئيسية", href: "/" },
                  { label: "الألعاب", href: "/games" },
                  { label: "الباقات", href: "/pricing" },
                  { label: "من نحن", href: "/about" },
                  { label: "اتصل بنا", href: "/contact" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-7 h-px bg-white/5" />

            <div className="mt-5 flex flex-col items-center gap-3 text-xs text-white/25 md:flex-row md:justify-between">
              <span>© {new Date().getFullYear()} لمتكم — جميع الحقوق محفوظة.</span>
              <div className="flex gap-5">
                <Link href="/terms" className="transition hover:text-white/70">
                  الشروط والأحكام
                </Link>
                <Link href="/privacy" className="transition hover:text-white/70">
                  الخصوصية
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}