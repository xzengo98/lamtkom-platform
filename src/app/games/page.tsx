import Link from "next/link";
import type { ReactNode } from "react";

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

function LightningIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function getGameIcon(icon: GameCardItem["icon"]) {
  if (icon === "quiz") return <QuizIcon className="h-5 w-5" />;
  if (icon === "social") return <SocialIcon className="h-5 w-5" />;
  return <SparkIcon className="h-5 w-5" />;
}

function getAccentClasses(accent: GameCardItem["accent"]) {
  if (accent === "orange") {
    return {
      badge: "border-orange-300/20 bg-orange-400/10 text-orange-100",
      cardGlow:
        "group-hover:shadow-[0_28px_70px_rgba(249,115,22,0.18)] group-hover:border-orange-300/15",
      icon: "border-orange-300/20 bg-orange-400/10 text-orange-100",
      button:
        "bg-[linear-gradient(180deg,rgba(251,146,60,0.20)_0%,rgba(249,115,22,0.14)_100%)] text-orange-100 hover:bg-[linear-gradient(180deg,rgba(251,146,60,0.28)_0%,rgba(249,115,22,0.20)_100%)]",
      panel:
        "from-orange-400/16 via-orange-300/8 to-transparent",
      ring: "shadow-[0_0_0_1px_rgba(251,146,60,0.14)]",
    };
  }

  if (accent === "violet") {
    return {
      badge: "border-violet-300/20 bg-violet-400/10 text-violet-100",
      cardGlow:
        "group-hover:shadow-[0_28px_70px_rgba(168,85,247,0.18)] group-hover:border-violet-300/15",
      icon: "border-violet-300/20 bg-violet-400/10 text-violet-100",
      button:
        "bg-[linear-gradient(180deg,rgba(167,139,250,0.20)_0%,rgba(139,92,246,0.14)_100%)] text-violet-100 hover:bg-[linear-gradient(180deg,rgba(167,139,250,0.28)_0%,rgba(139,92,246,0.20)_100%)]",
      panel:
        "from-violet-400/16 via-violet-300/8 to-transparent",
      ring: "shadow-[0_0_0_1px_rgba(167,139,250,0.14)]",
    };
  }

  return {
    badge: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    cardGlow:
      "group-hover:shadow-[0_28px_70px_rgba(34,211,238,0.18)] group-hover:border-cyan-300/15",
    icon: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    button:
      "bg-[linear-gradient(180deg,rgba(34,211,238,0.18)_0%,rgba(14,165,233,0.14)_100%)] text-cyan-100 hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.26)_0%,rgba(14,165,233,0.18)_100%)]",
    panel:
      "from-cyan-400/16 via-cyan-300/8 to-transparent",
    ring: "shadow-[0_0_0_1px_rgba(34,211,238,0.14)]",
  };
}

function FeatureMiniCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  accent: "cyan" | "orange" | "violet" | "emerald";
}) {
  const palette =
    accent === "orange"
      ? "border-orange-300/20 bg-orange-400/10 text-orange-100"
      : accent === "violet"
        ? "border-violet-300/20 bg-violet-400/10 text-violet-100"
        : accent === "emerald"
          ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
          : "border-cyan-300/20 bg-cyan-400/10 text-cyan-100";

  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
      <div className={`mx-auto mb-3 inline-flex rounded-2xl border p-2.5 ${palette}`}>
        {icon}
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-xs font-bold text-white/55">{title}</div>
    </div>
  );
}

function GameCard({ card }: { card: GameCardItem }) {
  const styles = getAccentClasses(card.accent);

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.30)] transition duration-300 hover:-translate-y-1",
        styles.cardGlow,
        styles.ring,
      ].join(" ")}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${styles.panel}`} />

      <div className="relative">
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

        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
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

          <h2 className="mt-2 text-2xl font-black text-white">{card.title}</h2>

          <p className="mt-3 text-sm leading-7 text-white/72">
            {card.description}
          </p>
        </div>

        <div className="mt-5">
          {card.active ? (
            <Link
              href={card.href}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] px-5 py-3.5 text-sm font-black transition ${styles.button}`}
            >
              ابدأ اللعبة
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          ) : (
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-black text-white/50">
              قريبًا
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GamesPage() {
  const activeGamesCount = gameCards.filter((card) => card.active).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_20%),linear-gradient(180deg,#020617_0%,#020b1d_35%,#010617_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
        <section className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.97)_0%,rgba(6,12,28,0.99)_100%)] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.36)] md:p-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="hero-glow absolute -right-12 top-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="hero-glow absolute left-0 bottom-0 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl" />
            <div className="hero-glow absolute right-1/3 bottom-6 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
          </div>

          <div className="relative">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
                <GamesIcon className="h-4 w-4" />
                <span>مكتبة الألعاب</span>
              </div>

              <h1 className="mt-5 text-4xl font-black text-white md:text-6xl">
                كل ألعاب لمتكم
                <span className="block bg-[linear-gradient(90deg,#67e8f9_0%,#c084fc_50%,#fb923c_100%)] bg-clip-text text-transparent">
                  في صفحة واحدة
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-white/72">
                تصفّح الألعاب الحالية داخل المنصة، واختر التجربة التي تناسب جلستك:
                أسئلة وتحديات، ألعاب اجتماعية، أو ألعاب كلمات وتلميحات بتصميم واضح
                وسريع ومتوافق مع كل الشاشات.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
              <FeatureMiniCard
                title="الألعاب المتاحة الآن"
                value={String(activeGamesCount)}
                icon={<GamesIcon className="h-4 w-4" />}
                accent="cyan"
              />
              <FeatureMiniCard
                title="أسلوب اللعب"
                value="جماعي"
                icon={<SocialIcon className="h-4 w-4" />}
                accent="orange"
              />
              <FeatureMiniCard
                title="إيقاع التجربة"
                value="سريع"
                icon={<LightningIcon className="h-4 w-4" />}
                accent="violet"
              />
              <FeatureMiniCard
                title="الهدف"
                value="متعة"
                icon={<QuizIcon className="h-4 w-4" />}
                accent="emerald"
              />
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {gameCards.map((card) => (
                <div
                  key={`hero-${card.title}`}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "inline-flex rounded-2xl border p-2.5",
                        getAccentClasses(card.accent).icon,
                      ].join(" ")}
                    >
                      {getGameIcon(card.icon)}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-base font-black text-white">
                        {card.title}
                      </div>
                      <div className="truncate text-sm text-white/60">
                        {card.subtitle}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-white/65">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-black tracking-[0.14em] text-cyan-200/70">
                الألعاب الحالية
              </div>
              <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">
                اختر طابع الجلسة الذي يناسبكم
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-white/65 md:text-left">
              كل لعبة هنا لها أسلوب مختلف، لكن كلها مبنية لتكون خفيفة، جماعية،
              وسهلة البدء بدون تعقيد.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {gameCards.map((card) => (
              <GameCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <section className="mt-9 rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.95)_100%)] p-5 text-center shadow-[0_14px_30px_rgba(0,0,0,0.22)] md:p-7">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black text-cyan-100">
              <SparkIcon className="h-4 w-4" />
              <span>جاهز للبدء؟</span>
            </div>

            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
              ابدأ جلستك التالية من هنا
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
              سواء كنتم تريدون تحدي أسئلة، لعبة اجتماعية تكشف الشخص المختلف، أو
              جولة كلمات وتلميحات، ستجدون كل ذلك هنا في مكان واحد.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/game/start"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.25rem] bg-cyan-500 px-6 py-4 text-base font-black text-slate-950 transition hover:bg-cyan-400"
              >
                ابدأ لعبة لمتكم
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>

              <Link
                href="/game/bara-alsalfah"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.25rem] border border-white/10 bg-white/5 px-6 py-4 text-base font-black text-white transition hover:bg-white/10"
              >
                ابدأ برا السالفة
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>

              <Link
                href="/games/codenames/"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.25rem] border border-violet-300/20 bg-violet-400/10 px-6 py-4 text-base font-black text-violet-100 transition hover:bg-violet-400/15"
              >
                افتح Codenames
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.06);
          }
        }

        .hero-glow {
          animation: glowPulse 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}