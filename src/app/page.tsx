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

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

const games: GameItem[] = [
  {
    title: "لمتكم",
    subtitle: "فئات وأسئلة",
    description:
      "لعبة جماعية بين فريقين تعتمد على الفئات والصور والنقاط، ومصممة لتظهر بشكل قوي على الشاشات والجلسات.",
    href: "/game/start",
    image: "https://a.top4top.io/p_3738qob7g1.png",
    players: "2 فرق",
    accent: "cyan",
  },
  {
    title: "برا السالفة",
    subtitle: "اكتشف المتخفي",
    description:
      "شخص واحد فقط لا يعرف الكلمة. اسألوا، شكّوا، وصوّتوا قبل أن يكشفكم أو يكتشف الإجابة.",
    href: "/game/bara-alsalfah",
    image: "https://l.top4top.io/p_373887e151.png",
    players: "3+ لاعبين",
    accent: "orange",
  },
  {
    title: "Codenames",
    subtitle: "كلمات وتلميحات",
    description:
      "تجربة جماعية سريعة تعتمد على التلميحات والتركيز والربط الذكي بين الكلمات داخل الفريق.",
    href: "/games/codenames/",
    image: "https://b.top4top.io/p_374101e3s1.png",
    players: "4+ لاعبين",
    accent: "violet",
  },
];

const accents = {
  cyan: {
    soft: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    text: "text-cyan-300",
    line: "bg-cyan-400",
    button:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_18px_50px_rgba(34,211,238,0.22)]",
    glow: "shadow-[0_24px_70px_rgba(34,211,238,0.12)]",
  },
  orange: {
    soft: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    text: "text-orange-300",
    line: "bg-orange-400",
    button:
      "bg-orange-400 text-slate-950 hover:bg-orange-300 shadow-[0_18px_50px_rgba(251,146,60,0.22)]",
    glow: "shadow-[0_24px_70px_rgba(251,146,60,0.12)]",
  },
  violet: {
    soft: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    text: "text-violet-300",
    line: "bg-violet-400",
    button:
      "bg-violet-400 text-slate-950 hover:bg-violet-300 shadow-[0_18px_50px_rgba(167,139,250,0.22)]",
    glow: "shadow-[0_24px_70px_rgba(167,139,250,0.12)]",
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

function GamepadIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <rect x="3" y="8" width="18" height="8" rx="4" />
      <path d="M8 12h2M9 11v2M15.5 12h.01M17.5 12h.01" />
    </svg>
  );
}

function UsersIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M4 19a5 5 0 0 1 10 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M14.5 19a4.5 4.5 0 0 1 5 0" />
    </svg>
  );
}

function SparkIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
    </svg>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-extrabold tracking-[0.2em] text-white/50">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
      {label}
    </span>
  );
}

function HeroChip({
  title,
  accent,
}: {
  title: string;
  accent: Accent;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-center text-xs font-black backdrop-blur-sm",
        accents[accent].soft,
      )}
    >
      {title}
    </div>
  );
}

function PrimaryGameCard({ game }: { game: GameItem }) {
  const accent = accents[game.accent];

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,32,0.98)_0%,rgba(7,11,21,1)_100%)]",
        accent.glow,
      )}
    >
      <div className={cn("h-[2px] w-full", accent.line)} />

      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black",
                  accent.soft,
                )}
              >
                <GamepadIcon className="h-3.5 w-3.5" />
                {game.subtitle}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/45">
                {game.players}
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-black text-white sm:text-4xl">
              {game.title}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-8 text-white/58 sm:text-base">
              {game.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["صور", "فئات", "نقاط", "عرض قوي"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/45"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={game.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black transition active:scale-[0.98]",
                accent.button,
              )}
            >
              ابدأ اللعبة
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[20rem] overflow-hidden lg:min-h-full">
          <img
            src={game.image}
            alt={game.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b15] via-[#070b1520] to-transparent lg:bg-gradient-to-l lg:from-[#070b1505] lg:via-[#070b1515] lg:to-[#070b15]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.10),transparent_55%)]" />
        </div>
      </div>
    </article>
  );
}

function OverlayGameCard({ game }: { game: GameItem }) {
  const accent = accents[game.accent];

  return (
    <article
      className={cn(
        "group relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/10",
        accent.glow,
      )}
    >
      <img
        src={game.image}
        alt={game.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050812] via-[#05081270] to-[#05081220]" />
      <div className={cn("absolute inset-x-0 top-0 h-[2px]", accent.line)} />

      <div className="relative flex h-full flex-col justify-end p-6">
        <span
          className={cn(
            "mb-4 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black",
            accent.soft,
          )}
        >
          <SparkIcon className="h-3.5 w-3.5" />
          {game.subtitle}
        </span>

        <h3 className="text-3xl font-black text-white">{game.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
          {game.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold text-white/50">
            <UsersIcon className="h-3.5 w-3.5" />
            {game.players}
          </span>

          <Link
            href={game.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition active:scale-[0.98]",
              accent.button,
            )}
          >
            العب الآن
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompactGameCard({ game }: { game: GameItem }) {
  const accent = accents[game.accent];

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,32,0.98)_0%,rgba(7,11,21,1)_100%)]",
        accent.glow,
      )}
    >
      <div className={cn("h-[2px] w-full", accent.line)} />

      <div className="p-5 sm:p-6">
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
          <img
            src={game.image}
            alt={game.title}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black",
              accent.soft,
            )}
          >
            <GamepadIcon className="h-3.5 w-3.5" />
            {game.subtitle}
          </span>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/45">
            {game.players}
          </span>
        </div>

        <h3 className="mt-4 text-2xl font-black text-white">{game.title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/58">{game.description}</p>

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

export default async function HomePage() {
  const viewer = await getViewer();

  const isLoggedIn = Boolean(viewer?.isLoggedIn);
  const viewerName =
    typeof viewer?.username === "string" && viewer.username.trim().length > 0
      ? viewer.username.trim()
      : "بك";

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.10),transparent_26%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.10),transparent_22%),linear-gradient(180deg,#050916_0%,#060d1a_36%,#030712_100%)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-5 py-10 shadow-[0_40px_120px_rgba(0,0,0,0.40)] sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <SectionLabel label="3 ألعاب جاهزة الآن" />

            <div className="mt-7 flex h-40 w-40 items-center justify-center rounded-[2.3rem] border border-cyan-400/15 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_70%)] shadow-[0_20px_80px_rgba(34,211,238,0.08)] sm:h-52 sm:w-52 sm:rounded-[2.8rem]">
              <img
                src={heroLogo}
                alt="لمتكم"
                className="h-28 w-28 object-contain drop-shadow-[0_0_36px_rgba(34,211,238,0.24)] sm:h-36 sm:w-36"
              />
            </div>

            <h1 className="mt-8 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
              لمتكم
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/60 sm:text-base sm:leading-9">
              منصة ألعاب عربية للجلسات والفعاليات تضم ألعابًا جماعية جاهزة للبدء
              بشكل سريع وواضح وأنيق.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_18px_50px_rgba(34,211,238,0.22)] transition hover:bg-cyan-300 active:scale-[0.98]"
              >
                استكشف الألعاب
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>

              {isLoggedIn ? (
                <Link
                  href="/account"
                  className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/[0.10]"
                >
                  أهلاً {viewerName}
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/[0.10]"
                  >
                    إنشاء حساب
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-xl border border-white/10 bg-transparent px-6 py-3.5 text-sm font-bold text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>

            <div className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
              <HeroChip title="فئات وأسئلة" accent="cyan" />
              <HeroChip title="كشف المتخفي" accent="orange" />
              <HeroChip title="كلمات وتلميحات" accent="violet" />
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel label="ألعاب المنصة" />
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                اختر اللعبة المناسبة للجلسة
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

          <div className="space-y-5">
            <PrimaryGameCard game={games[0]} />

            <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
              <OverlayGameCard game={games[1]} />
              <CompactGameCard game={games[2]} />
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,14,24,0.98)_0%,rgba(6,10,18,1)_100%)] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
            <div className="pointer-events-none absolute" />

            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <SectionLabel label="ابدأ الآن" />
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                ثلاث ألعاب
                <span className="block text-cyan-300">وجلسة واحدة ما تنسى</span>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-8 text-white/58 sm:text-base">
                ادخل، اختر اللعبة، وابدأ مباشرة.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_18px_50px_rgba(34,211,238,0.22)] transition hover:bg-cyan-300 active:scale-[0.98]"
                >
                  استكشف الألعاب
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>

                {!isLoggedIn && (
                  <Link
                    href="/register"
                    className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/[0.10]"
                  >
                    إنشاء حساب مجاني
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-20 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

          <div className="px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div className="flex flex-col items-center gap-3 md:items-start">
                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="h-11 w-auto object-contain opacity-85"
                />
                <p className="text-xs text-white/28">
                  منصة ألعاب عربية للجلسات والتجمعات
                </p>
              </div>

              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-white/38">
                {[
                  { label: "الرئيسية", href: "/" },
                  { label: "الألعاب", href: "/games" },
                  { label: "الباقات", href: "/pricing" },
                  { label: "الدخول", href: "/login" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition hover:text-white/75"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-7 h-px bg-white/5" />

            <div className="mt-5 flex flex-col items-center gap-3 text-xs text-white/20 md:flex-row md:justify-between">
              <span>© {new Date().getFullYear()} لمتكم — جميع الحقوق محفوظة.</span>
              <div className="flex gap-5">
                <Link href="/terms" className="transition hover:text-white/45">
                  الشروط والأحكام
                </Link>
                <Link href="/privacy" className="transition hover:text-white/45">
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