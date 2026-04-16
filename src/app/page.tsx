import Link from "next/link";
import { getViewer } from "../lib/auth/viewer";

type Accent = "cyan" | "orange" | "violet";

type GameItem = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image: string;
  accent: Accent;
  badge: string;
  players: string;
};

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

const games: GameItem[] = [
  {
    title: "لمتكم",
    subtitle: "أسئلة وأجوبة",
    description:
      "تجربة تنافسية بين فريقين مع فئات وصور ونقاط، مصممة لتظهر بشكل قوي على الشاشة الكبيرة وفي الجلسات الحماسية.",
    href: "/game/start",
    image: "https://a.top4top.io/p_3738qob7g1.png",
    accent: "cyan",
    badge: "الأكثر لعبًا",
    players: "2 فرق",
  },
  {
    title: "برا السالفة",
    subtitle: "اكتشف المتخفي",
    description:
      "واحد فقط لا يعرف الكلمة. اسألوا، ناقشوا، وصوّتوا قبل أن يكتشفكم أو يقلب الجولة عليكم.",
    href: "/game/bara-alsalfah",
    image: "https://l.top4top.io/p_373887e151.png",
    accent: "orange",
    badge: "الأكثر حماسًا",
    players: "3+ لاعبين",
  },
  {
    title: "Codenames",
    subtitle: "كلمات وتلميحات",
    description:
      "تلميح ذكي واحد قد يقود فريقك للفوز الكامل، أو يوقعه في الكلمة الخاطئة. لعبة جماعية بطابع تكتيكي واضح.",
    href: "/games/codenames/",
    image: "https://b.top4top.io/p_374101e3s1.png",
    accent: "violet",
    badge: "تكتيكية",
    players: "4+ لاعبين",
  },
];

const stats = [
  {
    value: "3",
    label: "ألعاب جاهزة",
    note: "ابدأ مباشرة",
    accent: "cyan" as Accent,
  },
  {
    value: "Responsive",
    label: "لكل المقاسات",
    note: "هاتف + شاشة",
    accent: "orange" as Accent,
  },
  {
    value: "سريع",
    label: "بدون تعقيد",
    note: "ابدأ خلال ثوانٍ",
    accent: "violet" as Accent,
  },
  {
    value: "Premium",
    label: "شكل أقوى",
    note: "واجهة منصة فعلية",
    accent: "cyan" as Accent,
  },
];

const features = [
  {
    title: "واجهة تبيع نفسها",
    description:
      "أول انطباع صار أوضح وأقوى: Hero حقيقي، بطاقات ألعاب فخمة، وتسلسل بصري يعطي ثقة من أول ثانية.",
    accent: "cyan" as Accent,
    icon: "spark",
  },
  {
    title: "مصممة للجلسات",
    description:
      "المحتوى، الأحجام، والمسافات مدروسة لتخدم اللعب الجماعي بدل أن تبدو كصفحة تعريفية عادية.",
    accent: "orange" as Accent,
    icon: "users",
  },
  {
    title: "مناسبة للتلفاز والموبايل",
    description:
      "الصفحة تعطي حضورًا قويًا على اللابتوب والشاشة الكبيرة، وتبقى مريحة وواضحة على الهاتف.",
    accent: "violet" as Accent,
    icon: "devices",
  },
  {
    title: "توجيه بصري أوضح",
    description:
      "كل قسم له هدف: تعريف، إبراز الألعاب، شرح الاستخدام، ثم دعوة واضحة للبدء أو التسجيل.",
    accent: "cyan" as Accent,
    icon: "bolt",
  },
];

const steps = [
  {
    num: "01",
    title: "اختر اللعبة",
    description:
      "ابدأ من التجربة المناسبة لجلسة اليوم: أسئلة، كشف المتخفي، أو تلميحات وكلمات.",
    accent: "cyan" as Accent,
  },
  {
    num: "02",
    title: "جهّز الجولة",
    description:
      "أدخل الفرق أو اللاعبين وحدد الإعدادات بسرعة، بدون خطوات متعبة أو واجهات مربكة.",
    accent: "orange" as Accent,
  },
  {
    num: "03",
    title: "ابدأ الحماس",
    description:
      "من أول شاشة، كل شيء مصمم ليعطي شعور منصة ألعاب حقيقية وليس مجرد صفحة جامدة.",
    accent: "violet" as Accent,
  },
];

const useCases = [
  {
    title: "للأصدقاء",
    description:
      "جلسات سريعة، تنافس، وضحك. الصفحة الجديدة تعطي شعورًا بالحماس قبل أن تبدأ أول جولة أصلًا.",
    accent: "cyan" as Accent,
  },
  {
    title: "للعائلة",
    description:
      "تقسيمات واضحة، ألعاب مفهومة، ومظهر أنيق يرفع قيمة التجربة بدون تعقيد أو ازدحام.",
    accent: "orange" as Accent,
  },
  {
    title: "للفعاليات",
    description:
      "الواجهة مناسبة للعرض على الشاشات والتجهيز السريع، وهذا مهم جدًا إذا كنت تريد شكلًا احترافيًا أمام الناس.",
    accent: "violet" as Accent,
  },
];

const accentStyles = {
  cyan: {
    line: "bg-cyan-400",
    soft: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
    button:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_16px_40px_rgba(34,211,238,0.22)]",
    glow: "shadow-[0_24px_80px_rgba(34,211,238,0.10)]",
    text: "text-cyan-300",
    ring: "border-cyan-400/20",
  },
  orange: {
    line: "bg-orange-400",
    soft: "bg-orange-400/10 text-orange-300 border-orange-400/20",
    button:
      "bg-orange-400 text-slate-950 hover:bg-orange-300 shadow-[0_16px_40px_rgba(251,146,60,0.22)]",
    glow: "shadow-[0_24px_80px_rgba(251,146,60,0.10)]",
    text: "text-orange-300",
    ring: "border-orange-400/20",
  },
  violet: {
    line: "bg-violet-400",
    soft: "bg-violet-400/10 text-violet-300 border-violet-400/20",
    button:
      "bg-violet-400 text-slate-950 hover:bg-violet-300 shadow-[0_16px_40px_rgba(167,139,250,0.22)]",
    glow: "shadow-[0_24px_80px_rgba(167,139,250,0.10)]",
    text: "text-violet-300",
    ring: "border-violet-400/20",
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

function SparkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
      <path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
      <path d="m5 14 .9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Z" />
    </svg>
  );
}

function UsersIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.9"
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

function DevicesIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="12" height="8" rx="2" />
      <path d="M9 17v2" />
      <path d="M6.5 19h5" />
      <rect x="17" y="7" width="4" height="10" rx="1.5" />
    </svg>
  );
}

function BoltIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2 4 14h6l-1 8 11-14h-6l-1-6Z" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
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

function SectionEyebrow({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-extrabold tracking-wide text-white/55">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
      {label}
    </span>
  );
}

function FeatureIcon({
  icon,
  className,
}: {
  icon: "spark" | "users" | "devices" | "bolt";
  className?: string;
}) {
  if (icon === "users") return <UsersIcon className={className} />;
  if (icon === "devices") return <DevicesIcon className={className} />;
  if (icon === "bolt") return <BoltIcon className={className} />;
  return <SparkIcon className={className} />;
}

function GameCard({
  game,
  featured = false,
}: {
  game: GameItem;
  featured?: boolean;
}) {
  const accent = accentStyles[game.accent];

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,30,0.98)_0%,rgba(6,10,20,1)_100%)] transition duration-300 hover:-translate-y-1",
        accent.glow,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-[2px]", accent.line)} />

      <div className={cn("relative overflow-hidden", featured ? "h-72 md:h-80" : "h-56")}>
        <img
          src={game.image}
          alt={game.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a13] via-[#060a1330] to-transparent" />

        <div className="absolute left-4 top-4">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black backdrop-blur",
              accent.soft,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", accent.line)} />
            {game.badge}
          </span>
        </div>
      </div>

      <div className={cn("relative flex flex-col", featured ? "p-7" : "p-5")}>
        <div className="mb-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold",
              accent.soft,
            )}
          >
            <GamepadIcon className="h-3.5 w-3.5" />
            {game.subtitle}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/45">
            {game.players}
          </span>
        </div>

        <h3 className={cn("font-black text-white", featured ? "text-3xl" : "text-2xl")}>
          {game.title}
        </h3>

        <p
          className={cn(
            "mt-3 text-white/55",
            featured ? "max-w-xl text-base leading-8" : "text-sm leading-7",
          )}
        >
          {game.description}
        </p>

        <div className="mt-6">
          <Link
            href={game.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition active:scale-[0.98]",
              accent.button,
            )}
          >
            ابدأ اللعبة
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const viewer = await getViewer();
  const activeCount = games.length;

  const viewerName =
    typeof viewer?.username === "string" && viewer.username.trim().length > 0
      ? viewer.username.trim()
      : "بك";

  const viewerInitial =
    typeof viewer?.username === "string" && viewer.username.trim().length > 0
      ? viewer.username.trim().slice(0, 1).toUpperCase()
      : "م";

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.10),transparent_20%),linear-gradient(180deg,#040816_0%,#07101f_38%,#030712_100%)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-5 py-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)] sm:px-7 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-52 w-[26rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="order-2 lg:order-1">
              <SectionEyebrow label="منصّة ألعاب عربية بطابع أقوى" />

              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl xl:text-7xl">
                الصفحة التي
                <span className="block text-white/90">تجعل الجلسة</span>
                <span className="mt-2 inline-flex rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 px-5 py-2 text-slate-950 shadow-[0_18px_60px_rgba(34,211,238,0.24)] sm:px-7 sm:py-3">
                  تبدو فعلًا كمنصة ألعاب
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-8 text-white/60 sm:text-base sm:leading-9">
                هذا التصميم الجديد مبني ليعطي انطباع احترافي من أول ثانية: Hero قوي،
                تقسيمات أوضح، إبراز حقيقي للألعاب، ومسار بصري مرتب يخلي الزائر يعرف
                مباشرة ماذا تقدم المنصة ولماذا يجب أن يبدأ.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_18px_50px_rgba(34,211,238,0.24)] transition hover:bg-cyan-300 active:scale-[0.98]"
                >
                  استكشف الألعاب
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>

                {viewer.isLoggedIn ? (
                  <Link
                    href="/account"
                    className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3.5 text-sm font-black text-white/85 transition hover:bg-white/[0.08]"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-black text-cyan-300">
                      {viewerInitial}
                    </span>
                    أهلاً {viewerName}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3.5 text-sm font-black text-white transition hover:bg-white/[0.1]"
                    >
                      إنشاء حساب مجاني
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center rounded-xl border border-white/10 bg-transparent px-5 py-3.5 text-sm font-bold text-white/65 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                    >
                      تسجيل الدخول
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {[
                  "بدء سريع",
                  "شكل احترافي",
                  "للشاشة والموبايل",
                  "ألعاب جماعية واضحة",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white/55"
                  >
                    <CheckIcon className="h-3.5 w-3.5 text-cyan-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-[38rem]">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-cyan-400/5 blur-3xl" />

                <div className="relative overflow-hidden rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,28,0.98)_0%,rgba(6,10,18,1)_100%)] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)] sm:p-5">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-white/40">واجهة المنصة</p>
                      <p className="mt-1 text-sm font-black text-white">
                        Hero + ألعاب + دعوات واضحة
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-400/80" />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.84fr]">
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,28,0.98)_0%,rgba(5,10,18,1)_100%)] p-6">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_45%)]" />
                      <div className="relative flex min-h-[22rem] flex-col justify-between">
                        <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-black text-cyan-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            {activeCount} ألعاب جاهزة الآن
                          </span>

                          <h2 className="mt-5 text-2xl font-black leading-tight text-white sm:text-3xl">
                            منصة ألعاب
                            <span className="block text-cyan-300">بهوية أقوى</span>
                          </h2>

                          <p className="mt-3 max-w-sm text-sm leading-7 text-white/55">
                            بدل Hero تقليدي، صار عندك حضور بصري فعلي يبيع الألعاب
                            ويشرح قيمة المنصة خلال ثوانٍ.
                          </p>
                        </div>

                        <div className="mt-8 flex items-center justify-center rounded-[2rem] border border-cyan-400/15 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_70%)] p-8">
                          <img
                            src={heroLogo}
                            alt="شعار لمتكم"
                            className="h-40 w-40 object-contain drop-shadow-[0_0_45px_rgba(34,211,238,0.2)]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {games.map((game) => {
                        const accent = accentStyles[game.accent];

                        return (
                          <div
                            key={game.title}
                            className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,28,0.98)_0%,rgba(6,10,18,1)_100%)] transition duration-300 hover:-translate-y-1"
                          >
                            <div className={cn("h-[2px] w-full", accent.line)} />
                            <div className="grid grid-cols-[5.5rem_1fr] gap-3 p-3">
                              <img
                                src={game.image}
                                alt={game.title}
                                className="h-[5.5rem] w-[5.5rem] rounded-2xl object-cover"
                                loading="lazy"
                              />
                              <div className="min-w-0 py-1">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black",
                                    accent.soft,
                                  )}
                                >
                                  {game.badge}
                                </span>
                                <h3 className="mt-2 truncate text-base font-black text-white">
                                  {game.title}
                                </h3>
                                <p className="mt-1 text-xs font-bold text-white/45">
                                  {game.subtitle}
                                </p>
                                <p className="mt-2 line-clamp-2 text-xs leading-6 text-white/55">
                                  {game.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      "أوضح من الصفحة الحالية",
                      "إبراز أقوى للألعاب",
                      "تنقل بصري أنظف",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-xs font-black text-white/60"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const accent = accentStyles[stat.accent];

            return (
              <div
                key={stat.label}
                className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04]"
              >
                <div className={cn("h-[2px] w-full", accent.line)} />
                <div className="px-5 py-5">
                  <p className="text-xs font-bold text-white/35">{stat.label}</p>
                  <div className={cn("mt-2 text-3xl font-black", accent.text)}>{stat.value}</div>
                  <p className="mt-2 text-sm text-white/45">{stat.note}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-20">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionEyebrow label="الألعاب" />
              <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
                واجهة تركز على الألعاب
                <span className="block text-white/75">بدل أن تخفيها</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-white/55 sm:text-base">
                هنا صارت الألعاب هي بطل الصفحة فعلًا، مع Card featured كبيرة وبطاقات
                ثانوية أنيقة، وهذا يعطيك شكل أقرب لمنصة ألعاب حقيقية.
              </p>
            </div>

            <Link
              href="/games"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white/75 transition hover:bg-white/[0.09] hover:text-white"
            >
              جميع الألعاب
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.16fr_0.84fr]">
            <GameCard game={games[0]} featured />
            <div className="grid gap-5">
              <GameCard game={games[1]} />
              <GameCard game={games[2]} />
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div>
              <SectionEyebrow label="القيمة البصرية" />
              <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
                لماذا هذا الشكل
                <span className="block text-cyan-300">أقوى بكثير؟</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-8 text-white/55 sm:text-base">
                لأن الصفحة الجديدة لا تعتمد على مجرد Hero وبعض الكروت. هي مبنية على
                ترتيب بصري حقيقي: تعريف واضح، إبراز الألعاب، قيمة المنصة، ثم دعوة
                نظيفة للبدء.
              </p>

              <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm leading-8 text-white/60">
                  الفكرة الأساسية هنا: الزائر يجب أن يفهم خلال ثوانٍ أن
                  <span className="font-black text-white"> لمتكم </span>
                  ليست صفحة عادية، بل منصة ألعاب جاهزة للاستخدام.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => {
                const accent = accentStyles[feature.accent];

                return (
                  <div
                    key={feature.title}
                    className="group rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.025)_100%)] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
                  >
                    <div
                      className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-2xl border",
                        accent.soft,
                      )}
                    >
                      <FeatureIcon icon={feature.icon as "spark" | "users" | "devices" | "bolt"} />
                    </div>
                    <h3 className="mt-5 text-lg font-black text-white">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/55">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-20">
          <SectionEyebrow label="كيف تعمل؟" />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black text-white md:text-4xl">
                ثلاث خطوات واضحة
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-white/55 sm:text-base">
                حتى الصفحة الرئيسية نفسها يجب أن تجعل رحلة المستخدم مباشرة وبسيطة.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map((step) => {
              const accent = accentStyles[step.accent];

              return (
                <div
                  key={step.num}
                  className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,28,0.98)_0%,rgba(6,10,18,1)_100%)] p-6"
                >
                  <div className={cn("absolute inset-x-0 top-0 h-[2px]", accent.line)} />
                  <div
                    className={cn(
                      "inline-flex rounded-2xl border px-4 py-2 text-lg font-black",
                      accent.soft,
                    )}
                  >
                    {step.num}
                  </div>
                  <h3 className="mt-5 text-xl font-black text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/55">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,14,24,0.98)_0%,rgba(6,10,18,1)_100%)] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute left-0 top-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <SectionEyebrow label="مناسبة لمن؟" />
                <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
                  مبنية لتخدم
                  <span className="block text-white/75">أنواع جلسات مختلفة</span>
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-8 text-white/55 sm:text-base">
                  سواء كنت تستهدف أصدقاء، عائلة، أو فعاليات أكبر، الصفحة الجديدة تعطي
                  صورة أقوى وثقة أعلى من أول زيارة.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {useCases.map((item) => {
                  const accent = accentStyles[item.accent];

                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5"
                    >
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-3 py-1 text-[11px] font-black",
                          accent.soft,
                        )}
                      >
                        {item.title}
                      </span>
                      <p className="mt-4 text-sm leading-7 text-white/60">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="overflow-hidden rounded-[2.5rem] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(6,14,28,1)_0%,rgba(4,8,16,1)_100%)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
            <div className="grid gap-6 px-6 py-10 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10 lg:py-12">
              <div>
                <SectionEyebrow label="ابدأ الآن" />
                <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
                  جهّز الصفحة الرئيسية
                  <span className="block text-cyan-300">لتكون على مستوى المنصة</span>
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-white/55 sm:text-base">
                  هذه النسخة ليست تحسينًا بسيطًا، بل إعادة بناء كاملة من الصفر
                  لتجعل الموقع يبدو أقوى، أوضح، وأفخم بصريًا.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/games"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-7 py-3.5 text-sm font-black text-slate-950 shadow-[0_18px_50px_rgba(34,211,238,0.24)] transition hover:bg-cyan-300 active:scale-[0.98]"
                >
                  استكشف الألعاب
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>

                {!viewer.isLoggedIn && (
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-7 py-3.5 text-sm font-black text-white transition hover:bg-white/[0.1]"
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
                <p className="text-xs text-white/30">
                  منصة ألعاب جماعية للجلسات والفعاليات والتجمعات
                </p>
              </div>

              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-white/40">
                {[
                  { label: "الرئيسية", href: "/" },
                  { label: "الألعاب", href: "/games" },
                  { label: "الباقات", href: "/pricing" },
                  { label: "من نحن", href: "/about" },
                  { label: "اتصل بنا", href: "/contact" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition hover:text-white/75"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-7 h-px bg-white/5" />

            <div className="mt-5 flex flex-col items-center gap-3 text-xs text-white/22 md:flex-row md:justify-between">
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