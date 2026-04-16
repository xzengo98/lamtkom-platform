import Link from "next/link";
import type { ReactNode } from "react";



const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

type GameCardItem = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image: string;
  active: boolean;
  badge: string;
  accent: "cyan" | "orange" | "violet" | "slate";
  icon: "quiz" | "social" | "spark" | "soon";
};

const gameCards: GameCardItem[] = [
  {
    title: "لمتكم",
    subtitle: "أسئلة وأجوبة",
    description:
      "اللعبة الرئيسية المبنية على الفئات والأسئلة والنقاط بين فريقين، مناسبة للمنافسة الجماعية بجلسة واضحة وسريعة.",
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
      "لعبة جماعية فيها فريقان، كل فريق عنده قائد يعطي كلمة تلميح مع رقم، والباقي يحاولون تخمين الكلمات الصحيحة على اللوحة.",
    href: "/games/codenames/",
    image: "https://b.top4top.io/p_374101e3s1.png",
    active: true,
    badge: "متاحة الآن",
    accent: "violet",
    icon: "spark",
  },
  {
    title: "لعبة جديدة",
    subtitle: "تحت الإنشاء",
    description:
      "نعمل حاليًا على إضافة تجربة جديدة داخل لمتكم لتمنحكم تنوعًا أكبر وأسلوب لعب مختلفًا قريبًا.",
    href: "#",
    image: "https://i.top4top.io/p_3738ncix61.png",
    active: false,
    badge: "قريبًا",
    accent: "slate",
    icon: "soon",
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function SoonIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" /><path d="M12 8v4l2.5 2.5" />
    </svg>
  );
}

function GamesIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="8" rx="3" />
      <path d="M8 12h2" /><path d="M9 11v2" />
      <path d="M16.5 12h.01" /><path d="M18.5 12h.01" />
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

function LightningIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function HomeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" /><path d="M5 10v11h14V10" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGameIcon(icon: GameCardItem["icon"]) {
  if (icon === "quiz")   return <QuizIcon className="h-5 w-5" />;
  if (icon === "social") return <SocialIcon className="h-5 w-5" />;
  if (icon === "spark")  return <SparkIcon className="h-5 w-5" />;
  return <SoonIcon className="h-5 w-5" />;
}

type AccentKey = "cyan" | "orange" | "violet" | "slate";

function getAccentClasses(accent: AccentKey) {
  const map = {
    cyan: {
      bar:    "bg-cyan-400",
      badge:  "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
      icon:   "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
      glow:   "group-hover:shadow-[0_28px_70px_rgba(34,211,238,0.14)]",
      button: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/18",
      sub:    "text-cyan-400/70",
    },
    orange: {
      bar:    "bg-orange-400",
      badge:  "border-orange-400/25 bg-orange-400/10 text-orange-300",
      icon:   "border-orange-400/20 bg-orange-400/10 text-orange-300",
      glow:   "group-hover:shadow-[0_28px_70px_rgba(249,115,22,0.14)]",
      button: "border-orange-400/20 bg-orange-400/10 text-orange-200 hover:bg-orange-400/18",
      sub:    "text-orange-400/70",
    },
    violet: {
      bar:    "bg-violet-400",
      badge:  "border-violet-400/25 bg-violet-400/10 text-violet-300",
      icon:   "border-violet-400/20 bg-violet-400/10 text-violet-300",
      glow:   "group-hover:shadow-[0_28px_70px_rgba(139,92,246,0.14)]",
      button: "border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/18",
      sub:    "text-violet-400/70",
    },
    slate: {
      bar:    "bg-white/20",
      badge:  "border-white/10 bg-white/5 text-white/50",
      icon:   "border-white/10 bg-white/5 text-white/40",
      glow:   "",
      button: "border-white/8 bg-white/4 text-white/35",
      sub:    "text-white/35",
    },
  };
  return map[accent];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white/50">
      <span className="h-1 w-1 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
}

function GameCard({ card }: { card: GameCardItem }) {
  const styles = getAccentClasses(card.accent);
  const isSoon  = !card.active;

  return (
    <div
      className={[
        "group relative flex flex-col overflow-hidden rounded-[1.8rem] border border-white/8",
        "bg-[linear-gradient(160deg,rgba(18,28,55,0.95)_0%,rgba(8,14,32,0.98)_100%)]",
        "shadow-[0_20px_50px_rgba(0,0,0,0.30)] transition duration-300",
        isSoon ? "opacity-70" : `hover:-translate-y-1 ${styles.glow}`,
      ].join(" ")}
    >
      {/* Top accent bar */}
      <div className={`h-[2px] w-full ${styles.bar} opacity-60`} />

      {/* Image area */}
      <div className="relative overflow-hidden">
        <img
          src={card.image}
          alt={card.title}
          className={[
            "h-48 w-full object-cover transition duration-500",
            isSoon ? "blur-[3px] saturate-50" : "group-hover:scale-[1.04]",
          ].join(" ")}
        />

        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,14,32,0.80)] via-transparent to-transparent" />

        {/* Badge overlay */}
        <div className="absolute bottom-3 right-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-sm ${styles.badge}`}>
            {isSoon ? (
              <SoonIcon className="h-3.5 w-3.5" />
            ) : (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            )}
            {card.badge}
          </span>
        </div>

        {/* Soon overlay */}
        {isSoon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/50 backdrop-blur-[1px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/40">
              <SoonIcon className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-white/40">جارٍ التطوير</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className={`mb-1 text-xs font-bold tracking-widest uppercase ${styles.sub}`}>
          {card.subtitle}
        </div>
        <h2 className={`text-xl font-black ${isSoon ? "text-white/40" : "text-white"}`}>
          {card.title}
        </h2>
        <p className={`mt-2.5 flex-1 text-sm leading-7 ${isSoon ? "text-white/30" : "text-white/55"}`}>
          {card.description}
        </p>

        {/* CTA */}
        <div className="mt-5">
          {card.active ? (
            <Link
              href={card.href}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition duration-200 active:scale-[0.98] ${styles.button}`}
            >
              ابدأ اللعبة
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          ) : (
            <div className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/6 bg-white/3 px-5 py-3 text-sm font-bold text-white/25">
              <SoonIcon className="h-4 w-4" />
              قريبًا
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GamesPage() {
  const activeGamesCount = gameCards.filter((card) => card.active).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_55%,rgba(10,18,40,1)_100%)]">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-64 rounded-full bg-violet-500/8 blur-2xl" />

          <div className="relative grid gap-8 px-7 py-10 md:px-10 md:py-12 xl:grid-cols-[1fr_auto] xl:items-center xl:gap-12">

            {/* Left: text */}
            <div>
              {/* Breadcrumb */}
              <div className="mb-5 flex items-center gap-2 text-xs font-bold text-white/35">
                <Link href="/" className="flex items-center gap-1.5 transition hover:text-white/60">
                  <HomeIcon className="h-3.5 w-3.5" />
                  الرئيسية
                </Link>
                <span>/</span>
                <span className="text-white/55">الألعاب</span>
              </div>

              {/* Live badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-bold text-cyan-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                مكتبة الألعاب — {activeGamesCount} ألعاب متاحة
              </div>

              <h1 className="text-3xl font-black leading-tight text-white md:text-5xl xl:text-[3.5rem]">
                كل ألعاب لمتكم
                <span className="mt-2 block bg-gradient-to-l from-cyan-400 via-violet-400 to-orange-400 bg-clip-text text-transparent">
                  في صفحة واحدة
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-8 text-white/55 md:text-base">
                تصفّح الألعاب الحالية داخل المنصة، واختر التجربة التي تناسب جلستك — أسئلة وتحديات، ألعاب اجتماعية، أو ألعاب كلمات وتلميحات.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/game/start"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_4px_24px_rgba(34,211,238,0.25)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  <GamesIcon className="h-4 w-4" />
                  ابدأ الآن
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  الرئيسية
                </Link>
              </div>
            </div>

            {/* Right: logo card */}
            <div className="hidden xl:flex xl:justify-end">
              <div className="relative flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/12 bg-[linear-gradient(160deg,rgba(14,24,50,0.96)_0%,rgba(7,13,30,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.40)]">
                {/* Inner glow */}
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.07),transparent_70%)]" />
                <img
                  src={heroLogo}
                  alt="شعار لمتكم"
                  className="h-[170px] w-[170px] object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ───────────────────────────────────────────────── */}
        <section className="mt-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { value: String(activeGamesCount), label: "الألعاب المتاحة", color: "border-cyan-400/15 bg-cyan-400/6", num: "text-cyan-300", lbl: "text-cyan-400/60" },
              { value: "جماعي",                  label: "أسلوب اللعب",     color: "border-orange-400/15 bg-orange-400/6", num: "text-orange-300", lbl: "text-orange-400/60" },
              { value: "سريع",                   label: "إيقاع التجربة",   color: "border-violet-400/15 bg-violet-400/6", num: "text-violet-300", lbl: "text-violet-400/60" },
              { value: "قريبًا",                 label: "لعبة جديدة",      color: "border-emerald-400/15 bg-emerald-400/6", num: "text-emerald-300", lbl: "text-emerald-400/60" },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-2xl border ${stat.color} px-4 py-4 text-center`}>
                <div className={`text-xl font-black ${stat.num}`}>{stat.value}</div>
                <div className={`mt-1 text-xs font-bold ${stat.lbl}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Games grid ────────────────────────────────────────────────── */}
        <section className="mt-14">
          <SectionBadge>الألعاب الحالية</SectionBadge>

          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
            اختر طابع الجلسة الذي يناسبكم
          </h2>
          <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
            كل لعبة هنا لها أسلوب مختلف، لكن كلها مبنية لتكون خفيفة وجماعية وسهلة البدء — بلا تعقيد.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {gameCards.map((card) => (
              <GameCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        {/* ── CTA banner ────────────────────────────────────────────────── */}
        <section className="mt-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(14,24,50,0.97)_0%,rgba(7,13,30,0.99)_100%)] px-7 py-8 md:px-10">
            <div className="pointer-events-none absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-2xl" />
            <div className="pointer-events-none absolute -right-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-violet-500/8 blur-2xl" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-black text-white md:text-2xl">
                  مستعدون للبدء؟
                </h3>
                <p className="mt-1.5 text-sm text-white/50">
                  اختر لعبة وابدأ الجلسة مع الأصدقاء الآن — لا حاجة لحساب.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/game/start"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_4px_24px_rgba(34,211,238,0.22)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  <GamesIcon className="h-4 w-4" />
                  جرّب لمتكم
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  الباقات
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}