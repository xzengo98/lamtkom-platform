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

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

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
    description: "كل فريق يختار فئاته لتبدأ الجولة بتحدي مناسب وممتع.",
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
    description: "تنافسوا، اجمعوا النقاط، واستمتعوا بجلسة حماسية مليئة بالمرح.",
    icon: "trophy",
  },
];

const accents = {
  cyan: {
    line: "bg-cyan-400",
    soft: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    button:
      "bg-cyan-300 text-[#182012] hover:bg-cyan-200 shadow-[0_18px_40px_rgba(103,232,249,0.18)]",
  },
  orange: {
    line: "bg-orange-300",
    soft: "border-orange-300/20 bg-orange-300/10 text-orange-200",
    button:
      "bg-orange-300 text-[#182012] hover:bg-orange-200 shadow-[0_18px_40px_rgba(253,186,116,0.18)]",
  },
  violet: {
    line: "bg-violet-300",
    soft: "border-violet-300/20 bg-violet-300/10 text-violet-200",
    button:
      "bg-violet-300 text-[#182012] hover:bg-violet-200 shadow-[0_18px_40px_rgba(196,181,253,0.18)]",
  },
};

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
    <span className="inline-flex items-center gap-2 rounded-full border border-[#d9d1ad]/15 bg-[#efe7c5]/[0.05] px-4 py-2 text-[11px] font-extrabold tracking-[0.2em] text-[#efe7c5]/70">
      <span className="h-1.5 w-1.5 rounded-full bg-[#efe7c5]/80" />
      {label}
    </span>
  );
}

function GameCard({ game }: { game: GameItem }) {
  const accent = accents[game.accent];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#d8cfaa]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.20)] transition duration-300 hover:-translate-y-1">
      <div className={cn("h-[2px] w-full", accent.line)} />

      <div className="relative h-60 overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#202914] via-[#20291450] to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black",
              accent.soft,
            )}
          >
            {game.subtitle}
          </span>
          <span className="rounded-full border border-[#d8cfaa]/12 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-[#efe7c5]/60">
            {game.players}
          </span>
        </div>

        <h3 className="mt-4 text-2xl font-black text-[#f6f0d8]">{game.title}</h3>

        <p className="mt-3 flex-1 text-sm leading-8 text-[#efe7c5]/68">
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
  return (
    <div className="relative rounded-[2rem] border border-[#d9d1ad]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.025)_100%)] px-6 pb-7 pt-9 text-center shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
      <div className="absolute right-4 top-4 rotate-[10deg] rounded-2xl border border-[#cfc7a4] bg-[#f3eed7] px-3 py-2 text-lg font-black leading-none text-[#202914] shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
        {step.number}
      </div>

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d9d1ad]/18 bg-[#efe7c5]/[0.07] text-[#f2ebd0]">
        <StepIcon icon={step.icon} className="h-8 w-8" />
      </div>

      <h3 className="mt-7 text-2xl font-black text-[#f6f0d8]">{step.title}</h3>

      <p className="mt-4 text-base leading-8 text-[#efe7c5]/68">
        {step.description}
      </p>

      <div className="mx-auto mt-7 h-1 w-14 rounded-full bg-[#d8cfaa]/35" />
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#d8cfaa_0%,#cfc79d_100%)] text-[#f7f1d9]">
      <div className="relative mx-auto max-w-[1700px] px-4 pb-10 pt-6 md:px-8">
        <section className="relative overflow-hidden rounded-[2.8rem] border-2 border-[#28311b] bg-[radial-gradient(circle_at_top,#6b7d3b_0%,#586a31_40%,#29341a_100%)] px-6 py-12 shadow-[0_20px_60px_rgba(32,41,20,0.28)] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute left-8 top-10 h-24 w-24 rounded-full bg-[#f1e9ca]/10" />
          <div className="pointer-events-none absolute bottom-10 right-10 h-28 w-28 rounded-full bg-[#f1e9ca]/12 blur-sm" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-80 -translate-x-1/2 rounded-full bg-[#f1e9ca]/6 blur-3xl" />

          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <SectionLabel label="3 ألعاب جاهزة الآن" />

            <div className="mt-10">
              <img
                src={heroLogo}
                alt="لمتكم"
                className="mx-auto w-[280px] rotate-[-7deg] object-contain drop-shadow-[14px_16px_0_rgba(32,41,20,0.88)] sm:w-[380px] lg:w-[560px]"
              />
            </div>

            <p className="mt-10 max-w-4xl text-lg font-extrabold leading-9 text-[#f4eed6] sm:text-2xl sm:leading-[1.8]">
              منصة ألعاب عربية تجمع التحدي والمتعة والمعرفة
              <br className="hidden sm:block" />
              في تجربة واحدة واضحة وأنيقة
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-xl bg-[#efe7c5] px-7 py-4 text-sm font-black text-[#202914] shadow-[0_14px_30px_rgba(0,0,0,0.12)] transition hover:bg-[#f6f0d8] active:scale-[0.98]"
              >
                استكشف الألعاب
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>

              {isLoggedIn ? (
                <Link
                  href="/account"
                  className="inline-flex items-center rounded-xl border border-[#efe7c5]/18 bg-[#efe7c5]/[0.07] px-7 py-4 text-sm font-black text-[#f6f0d8] transition hover:bg-[#efe7c5]/[0.12]"
                >
                  أهلاً {viewerName}
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center rounded-xl border border-[#efe7c5]/18 bg-[#efe7c5]/[0.07] px-7 py-4 text-sm font-black text-[#f6f0d8] transition hover:bg-[#efe7c5]/[0.12]"
                  >
                    إنشاء حساب
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-xl border border-[#efe7c5]/14 bg-transparent px-7 py-4 text-sm font-bold text-[#efe7c5]/72 transition hover:bg-[#efe7c5]/[0.07] hover:text-[#f6f0d8]"
                  >
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel label="ألعاب المنصة" />
              <h2 className="mt-4 text-3xl font-black text-[#263019] sm:text-4xl">
                اختر اللعبة المناسبة
              </h2>
            </div>

            <Link
              href="/games"
              className="inline-flex items-center gap-2 rounded-xl border border-[#2b341d]/10 bg-[#f3edd2]/60 px-5 py-3 text-sm font-black text-[#263019] transition hover:bg-[#f6f0d8]"
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

        <section className="mt-16 overflow-hidden rounded-[2.8rem] border-2 border-[#28311b] bg-[radial-gradient(circle_at_top,#697b3a_0%,#566830_45%,#253117_100%)] px-6 py-10 shadow-[0_20px_60px_rgba(32,41,20,0.20)] sm:px-10 sm:py-12 lg:px-12">
          <div className="pointer-events-none absolute" />

          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-black text-[#f5efd7] sm:text-6xl">
                كيف تلعب
                <span className="mr-3">استبقهم؟</span>
              </h2>
            </div>

            <div className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
              {steps.map((step) => (
                <StepCard key={step.number} step={step} />
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/game/start"
                className="flex w-full items-center justify-center rounded-[1.8rem] border border-[#d8cfaa]/25 bg-[#efe7c5] px-6 py-5 text-2xl font-black text-[#1f2914] shadow-[0_14px_28px_rgba(0,0,0,0.12)] transition hover:bg-[#f7f1d9]"
              >
                ابدأ اللعب الآن
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-14 overflow-hidden rounded-[2rem] border border-[#2c351d]/10 bg-[#2a351b]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#efe7c5]/35 to-transparent" />

          <div className="px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div className="flex flex-col items-center gap-3 md:items-start">
                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="h-12 w-auto object-contain opacity-90"
                />
                <p className="text-xs text-[#efe7c5]/45">
                  منصة ألعاب عربية للجلسات والتجمعات
                </p>
              </div>

              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-[#efe7c5]/55">
                {[
                  { label: "الرئيسية", href: "/" },
                  { label: "الألعاب", href: "/games" },
                  { label: "الباقات", href: "/pricing" },
                  { label: "الدخول", href: "/login" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition hover:text-[#f7f1d9]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-7 h-px bg-[#efe7c5]/8" />

            <div className="mt-5 flex flex-col items-center gap-3 text-xs text-[#efe7c5]/32 md:flex-row md:justify-between">
              <span>© {new Date().getFullYear()} لمتكم — جميع الحقوق محفوظة.</span>
              <div className="flex gap-5">
                <Link href="/terms" className="transition hover:text-[#f7f1d9]/70">
                  الشروط والأحكام
                </Link>
                <Link href="/privacy" className="transition hover:text-[#f7f1d9]/70">
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