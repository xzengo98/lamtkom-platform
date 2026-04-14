import Link from "next/link";
import { getViewer } from "../lib/auth/viewer";

// ─── Types ────────────────────────────────────────────────────────────────────
type GameCardItem = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image: string;
  badge: string;
  accent: "cyan" | "orange" | "violet";
  players: string;
  difficulty: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

const gameCards: GameCardItem[] = [
  {
    title: "لمتكم",
    subtitle: "أسئلة وأجوبة",
    description:
      "لعبة الفئات والأسئلة الكلاسيكية بين فريقين. اختر فئاتك، راكم النقاط، وتوّج الأذكياء.",
    href: "/game/start",
    image: "https://a.top4top.io/p_3738qob7g1.png",
    badge: "الأكثر لعبًا",
    accent: "cyan",
    players: "2 فرق",
    difficulty: "متنوع",
  },
  {
    title: "برا السالفة",
    subtitle: "اكتشف المتخفي",
    description:
      "شخص واحد فقط لا يعرف الكلمة — هل تستطيع كشفه قبل أن يُضلّل الجميع؟",
    href: "/game/bara-alsalfah",
    image: "https://l.top4top.io/p_373887e151.png",
    badge: "الأكثر إثارة",
    accent: "orange",
    players: "3+ لاعبين",
    difficulty: "اجتماعي",
  },
  {
    title: "Codenames",
    subtitle: "كلمات وتلميحات",
    description:
      "تلميح واحد يوجّه فريقك لاكتشاف كلماتك — لكن احذر من الكلمة القاتلة.",
    href: "/games/codenames/",
    image: "https://b.top4top.io/p_374101e3s1.png",
    badge: "جديد",
    accent: "violet",
    players: "4+ لاعبين",
    difficulty: "تكتيكي",
  },
];

const features = [
  {
    icon: "⚡",
    title: "بدء فوري",
    description: "لا تثبيت، لا تعقيد — ابدأ لعبتك في ثوانٍ من أي جهاز.",
    color: "cyan",
  },
  {
    icon: "🖥️",
    title: "مثالي للشاشة الكبيرة",
    description: "صمّمنا الواجهة لتكون واضحة من مسافة بعيدة أمام المجموعة.",
    color: "orange",
  },
  {
    icon: "📱",
    title: "متوافق مع الهاتف",
    description: "التحكم والتصويت والمتابعة — كل شيء يعمل بسلاسة على الموبايل.",
    color: "violet",
  },
  {
    icon: "🔄",
    title: "أسئلة لا تتكرر",
    description: "نظام ذكي يتتبع الأسئلة المُستخدمة لضمان تجربة جديدة في كل جولة.",
    color: "emerald",
  },
];

const howItWorksSteps = [
  {
    num: "١",
    title: "اختر لعبتك",
    description: "ثلاث تجارب مختلفة تناسب كل جلسة وكل مجموعة.",
    accent: "cyan",
  },
  {
    num: "٢",
    title: "سمّ فريقيك",
    description: "أضف أسماء الفرق وابدأ الإعدادات في لحظات.",
    accent: "orange",
  },
  {
    num: "٣",
    title: "تنافسوا وتمتعوا",
    description: "اجمعوا النقاط، ضحكوا كثيراً، وكرروا.",
    accent: "violet",
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function ArrowLeft({ className = "h-4 w-4" }: { className?: string }) {
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

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
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
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M3 20a5 5 0 0 1 10 0" />
      <path d="M11 20a5 5 0 0 1 10 0" />
    </svg>
  );
}

function ZapIcon({ className = "h-4 w-4" }: { className?: string }) {
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

// ─── Accent config ────────────────────────────────────────────────────────────
const accentConfig = {
  cyan: {
    bar: "bg-cyan-400",
    badge: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
    btn: "bg-cyan-500 hover:bg-cyan-400 shadow-[0_4px_24px_rgba(34,211,238,0.30)]",
    glow: "group-hover:shadow-[0_24px_60px_rgba(34,211,238,0.14)]",
    tag: "border-cyan-400/15 bg-cyan-400/6 text-cyan-400/70",
    pill: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
    num: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    feat: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
  },
  orange: {
    bar: "bg-orange-400",
    badge: "border-orange-400/25 bg-orange-400/10 text-orange-300",
    btn: "bg-orange-500 hover:bg-orange-400 shadow-[0_4px_24px_rgba(249,115,22,0.30)]",
    glow: "group-hover:shadow-[0_24px_60px_rgba(249,115,22,0.14)]",
    tag: "border-orange-400/15 bg-orange-400/6 text-orange-400/70",
    pill: "border-orange-400/20 bg-orange-400/8 text-orange-300",
    num: "border-orange-400/30 bg-orange-400/10 text-orange-300",
    feat: "border-orange-400/20 bg-orange-400/8 text-orange-300",
  },
  violet: {
    bar: "bg-violet-400",
    badge: "border-violet-400/25 bg-violet-400/10 text-violet-300",
    btn: "bg-violet-500 hover:bg-violet-400 shadow-[0_4px_24px_rgba(139,92,246,0.30)]",
    glow: "group-hover:shadow-[0_24px_60px_rgba(139,92,246,0.14)]",
    tag: "border-violet-400/15 bg-violet-400/6 text-violet-400/70",
    pill: "border-violet-400/20 bg-violet-400/8 text-violet-300",
    num: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    feat: "border-violet-400/20 bg-violet-400/8 text-violet-300",
  },
  emerald: {
    bar: "bg-emerald-400",
    badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    btn: "bg-emerald-500 hover:bg-emerald-400 shadow-[0_4px_24px_rgba(52,211,153,0.30)]",
    glow: "group-hover:shadow-[0_24px_60px_rgba(52,211,153,0.14)]",
    tag: "border-emerald-400/15 bg-emerald-400/6 text-emerald-400/70",
    pill: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
    num: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    feat: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white/45">
      <span className="h-1 w-1 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
}

function GameCard({ card }: { card: GameCardItem }) {
  const a = accentConfig[card.accent];

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.97)_0%,rgba(5,10,24,0.99)_100%)] transition duration-300 hover:-translate-y-1 ${a.glow}`}
    >
      <div className={`h-[2px] w-full ${a.bar} opacity-70`} />

      <div className="relative overflow-hidden">
        <img
          src={card.image}
          alt={card.title}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(5,10,24,0.92)] via-[rgba(5,10,24,0.20)] to-transparent" />

        <div className="absolute bottom-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black backdrop-blur-sm ${a.badge}`}
          >
            <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${a.bar}`} />
            {card.badge}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className={`mb-1 text-[11px] font-bold uppercase tracking-widest ${a.tag}`}>
          {card.subtitle}
        </div>
        <h3 className="text-2xl font-black text-white">{card.title}</h3>
        <p className="mt-2.5 flex-1 text-sm leading-7 text-white/50">
          {card.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${a.tag}`}
          >
            <UsersIcon className="h-3 w-3" />
            {card.players}
          </span>
          <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] font-bold text-white/40">
            {card.difficulty}
          </span>
          <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] font-bold text-white/40">
            مجاني
          </span>
        </div>

        <Link
          href={card.href}
          className={`mt-4 inline-flex w-full items-center justify-between rounded-xl px-5 py-3 text-sm font-black text-white transition active:scale-[0.98] ${a.btn}`}
        >
          <span>العب الآن</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const viewer = await getViewer();
  const activeCount = gameCards.length;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="relative mb-5 overflow-hidden rounded-[2.8rem] border border-white/8">
          <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_50%,rgba(6,12,30,1)_100%)]" />
          <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/12 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-600/8 blur-[60px]" />
          <div className="pointer-events-none absolute -right-16 top-8 h-64 w-64 rounded-full bg-orange-500/6 blur-[50px]" />

          <div className="pointer-events-none absolute left-8 top-8 h-2 w-2 rounded-full bg-cyan-400/40" />
          <div className="pointer-events-none absolute right-8 top-8 h-1.5 w-1.5 rounded-full bg-violet-400/35" />
          <div className="pointer-events-none absolute bottom-8 left-8 h-1.5 w-1.5 rounded-full bg-orange-400/30" />
          <div className="pointer-events-none absolute bottom-8 right-8 h-2 w-2 rounded-full bg-cyan-400/25" />

          <div className="relative grid gap-0 xl:grid-cols-[1.1fr_auto]">
            <div className="flex flex-col items-center px-6 py-14 text-center xl:items-start xl:px-14 xl:py-18 xl:text-right">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/25 bg-cyan-400/8 px-5 py-2.5 text-xs font-bold text-cyan-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                {activeCount} ألعاب متاحة الآن
                <span className="h-3.5 w-px bg-cyan-400/30" />
                <span className="text-cyan-400/60">مجانية للجميع</span>
              </div>

              <div className="mb-7 xl:hidden">
                <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-[1.8rem] border border-cyan-400/18 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.10),transparent_70%)]">
                  <img
                    src={heroLogo}
                    alt="لمتكم"
                    className="h-20 w-20 object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.20)]"
                  />
                </div>
              </div>

              <h1 className="text-[2.4rem] font-black leading-[1.04] tracking-tight text-white sm:text-[3.2rem] xl:text-[4.8rem]">
                الجمعه عليكم
              </h1>
              <div className="mt-3 xl:mt-4">
                <span className="inline-block rounded-[1rem] bg-gradient-to-l from-cyan-500 to-cyan-400 px-7 py-2 text-[1.6rem] font-black text-slate-950 shadow-[0_0_48px_rgba(34,211,238,0.30)] sm:px-9 sm:text-[2.2rem] xl:text-[2.8rem]">
                  والفعاليات علينا
                </span>
              </div>

              <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-white/50 xl:mx-0 xl:max-w-xl xl:text-base xl:leading-9">
                منصّة العاب جماعية للجلسات والتجمعات — ثلاث تجارب مختلفة تبدأ في ثوانٍ، بدون تثبيت ولا تعقيد.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3 xl:justify-start">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-[0_4px_30px_rgba(34,211,238,0.32)] transition hover:bg-cyan-400 hover:shadow-[0_4px_40px_rgba(34,211,238,0.42)] active:scale-[0.98]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <rect x="4" y="8" width="16" height="8" rx="3" />
                    <path d="M8 12h2M9 11v2M16.5 12h.01M18.5 12h.01" />
                  </svg>
                  استكشف الألعاب
                </Link>

                {viewer.isLoggedIn ? (
                  <Link
                    href="/account"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-6 py-3.5 text-sm font-black text-white/80 transition hover:bg-white/10"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/15 text-[10px] font-black text-cyan-300">
                      {(viewer.username || "م").slice(0, 1).toUpperCase()}
                    </span>
                    أهلًا {viewer.username || "بك"}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center rounded-xl border border-white/10 bg-white/6 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
                    >
                      إنشاء حساب
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center rounded-xl border border-white/6 bg-white/3 px-6 py-3.5 text-sm font-bold text-white/55 transition hover:bg-white/7 hover:text-white"
                    >
                      تسجيل الدخول
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2 xl:justify-start">
                {[
                  { icon: <CheckIcon className="h-3 w-3" />, label: "مجاني للبدء" },
                  { icon: <UsersIcon className="h-3 w-3" />, label: "للجلسات الجماعية" },
                  { icon: <ZapIcon className="h-3 w-3" />, label: "يعمل فوراً" },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.035] px-3.5 py-1.5 text-[11px] font-bold text-white/40"
                  >
                    {pill.icon}
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden items-center justify-center px-10 py-16 xl:flex">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2.6rem] bg-cyan-400/5 blur-2xl" />
                <div className="relative flex h-[310px] w-[310px] items-center justify-center overflow-hidden rounded-[2.4rem] border border-cyan-400/16 bg-[linear-gradient(160deg,rgba(10,20,48,0.98)_0%,rgba(4,8,22,0.99)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.60)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.09),transparent_68%)]" />
                  <div className="absolute inset-7 rounded-[2rem] border border-cyan-400/8" />
                  <div className="absolute left-5 top-5 h-2.5 w-2.5 rounded-full bg-cyan-400/35" />
                  <div className="absolute right-5 top-5 h-2 w-2 rounded-full bg-violet-400/30" />
                  <div className="absolute bottom-5 left-5 h-2 w-2 rounded-full bg-orange-400/28" />
                  <div className="absolute bottom-5 right-5 h-2.5 w-2.5 rounded-full bg-cyan-400/20" />
                  <img
                    src={heroLogo}
                    alt="شعار لمتكم"
                    className="relative h-[220px] w-[220px] object-contain drop-shadow-[0_0_40px_rgba(34,211,238,0.22)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { value: "3", label: "ألعاب متاحة", color: accentConfig.cyan, icon: "🎮" },
              { value: "جماعي", label: "أسلوب اللعب", color: accentConfig.orange, icon: "👥" },
              { value: "مرنة", label: "للجميع", color: accentConfig.violet, icon: "⭐" },
              { value: "متوافقة", label: "مع كل الأجهزة", color: accentConfig.emerald, icon: "📱" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`overflow-hidden rounded-2xl border ${
                  stat.color.pill.split(" ").find((c) => c.startsWith("border-")) ||
                  "border-white/8"
                } bg-gradient-to-br ${
                  stat.color.bar === "bg-cyan-400"
                    ? "from-cyan-400/6 to-transparent"
                    : stat.color.bar === "bg-orange-400"
                      ? "from-orange-400/6 to-transparent"
                      : stat.color.bar === "bg-violet-400"
                        ? "from-violet-400/6 to-transparent"
                        : "from-emerald-400/6 to-transparent"
                }`}
              >
                <div className={`h-[2px] w-full ${stat.color.bar} opacity-55`} />
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white/35">{stat.label}</span>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  <div
                    className={`mt-2 text-2xl font-black ${
                      stat.color.bar === "bg-cyan-400"
                        ? "text-cyan-300"
                        : stat.color.bar === "bg-orange-400"
                          ? "text-orange-300"
                          : stat.color.bar === "bg-violet-400"
                            ? "text-violet-300"
                            : "text-emerald-300"
                    }`}
                  >
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>الألعاب الحالية</SectionLabel>
              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
                اختر اللعبة التي تناسب جلستكم
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-white/45">
                ثلاث تجارب مختلفة — من الأسئلة والنقاط إلى الكشف الاجتماعي وألعاب الكلمات.
              </p>
            </div>
            <Link
              href="/games"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white"
            >
              جميع الألعاب
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {gameCards.map((card) => (
              <GameCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <SectionLabel>كيف تعمل المنصة؟</SectionLabel>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
            ثلاث خطوات للبدء
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/45">
            بدون تثبيت، بدون تسجيل إلزامي — فقط اختر، سمّ، وابدأ.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {howItWorksSteps.map((step, i) => {
              const a = accentConfig[step.accent as keyof typeof accentConfig];
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,42,0.94)_0%,rgba(4,8,22,0.98)_100%)] p-6 transition duration-200 hover:-translate-y-0.5"
                >
                  <div className={`absolute inset-x-0 top-0 h-[2px] ${a.bar} opacity-60`} />
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl font-black ${a.num}`}
                    >
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/45">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <SectionLabel>لماذا لمتكم؟</SectionLabel>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
            مصممة لجلستكم
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/45">
            كل قرار في التصميم مبني على تجربة حقيقية مع مجموعات حقيقية.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((f, i) => {
              const a = accentConfig[f.color as keyof typeof accentConfig];
              const borderHover =
                f.color === "cyan"
                  ? "hover:border-cyan-400/20"
                  : f.color === "orange"
                    ? "hover:border-orange-400/20"
                    : f.color === "violet"
                      ? "hover:border-violet-400/20"
                      : "hover:border-emerald-400/20";

              return (
                <div
                  key={i}
                  className={`group rounded-2xl border border-white/8 bg-white/[0.025] p-5 transition duration-200 hover:bg-white/[0.04] ${borderHover}`}
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border text-2xl ${a.feat}`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-base font-black text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/45">{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(8,16,40,0.99)_0%,rgba(4,8,22,1)_100%)]">
            <div className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-[60px]" />
            <div className="pointer-events-none absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-violet-500/8 blur-[60px]" />
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />

            <div className="relative grid gap-8 px-8 py-12 md:grid-cols-[1fr_auto] md:items-center md:gap-12 md:px-12">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  {gameCards.map((g) => (
                    <div
                      key={g.title}
                      className={`overflow-hidden rounded-xl border ${
                        accentConfig[g.accent].badge
                          .split(" ")
                          .find((c) => c.startsWith("border-")) || "border-white/10"
                      }`}
                    >
                      <img src={g.image} alt={g.title} className="h-12 w-12 object-cover" />
                    </div>
                  ))}
                  <div className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs font-black text-white/40">
                    + المزيد قريباً
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white md:text-3xl">
                  منصة واحدة — تجارب لا تنتهي
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-white/50">
                  لمتكم ليست مجرد لعبة أسئلة — إنها مساحة متكاملة للألعاب الجماعية تكبر مع مجتمعها. ألعاب جديدة في الطريق.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Link
                  href="/games"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-[0_4px_24px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  استكشف الألعاب
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/6 px-7 py-3.5 text-sm font-black text-white/70 transition hover:bg-white/10"
                >
                  الباقات والأسعار
                </Link>
              </div>
            </div>
          </div>
        </section>

        {!viewer.isLoggedIn && (
          <section className="mb-16">
            <div className="relative overflow-hidden rounded-[2.2rem] border border-cyan-400/18 bg-[linear-gradient(135deg,rgba(6,14,36,0.99)_0%,rgba(3,7,20,1)_100%)]">
              <div className="pointer-events-none absolute -left-16 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-[50px]" />
              <div className="pointer-events-none absolute -right-16 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-violet-500/8 blur-[50px]" />
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

              <div className="relative flex flex-col items-center gap-6 px-8 py-12 text-center md:flex-row md:justify-between md:text-right md:px-12">
                <div>
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-1.5 text-xs font-bold text-cyan-300">
                    <span className="h-1 w-1 rounded-full bg-cyan-400" />
                    انضم مجاناً
                  </div>
                  <h3 className="text-2xl font-black text-white md:text-3xl">
                    جهّز جلستك القادمة الآن
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-7 text-white/45">
                    حساب مجاني — ألعاب غير محدودة — بدون بطاقة ائتمان.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 active:scale-[0.98]"
                  >
                    إنشاء حساب مجاني
                  </Link>
                  <Link
                    href="/games"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/6 px-8 py-4 text-sm font-black text-white/70 transition hover:bg-white/10"
                  >
                    جرّب بدون تسجيل
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(6,12,30,0.97)_0%,rgba(3,6,16,0.99)_100%)]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

          <div className="px-7 py-9 md:px-10">
            <div className="flex flex-col items-center gap-7 md:flex-row md:justify-between">
              <div className="flex flex-col items-center gap-3 md:items-start">
                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="h-10 w-auto object-contain opacity-70"
                />
                <p className="text-xs text-white/25">منصة ألعاب جماعية للجلسات والتجمعات</p>
              </div>

              <nav className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm font-bold text-white/30">
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
                    className="transition hover:text-white/60"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-7 h-px bg-white/5" />

            <div className="mt-5 flex flex-col items-center gap-3 text-xs text-white/18 md:flex-row md:justify-between">
              <span>© {new Date().getFullYear()} لمتكم — جميع الحقوق محفوظة.</span>
              <div className="flex gap-6">
                <Link href="/terms" className="transition hover:text-white/40">
                  الشروط والأحكام
                </Link>
                <Link href="/privacy" className="transition hover:text-white/40">
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