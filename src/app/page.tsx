import Link from "next/link";
import { getViewer } from "../lib/auth/viewer";

type GameAccent = "cyan" | "orange" | "violet" | "emerald";

type GameCardItem = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image: string;
  badge: string;
  accent: Exclude<GameAccent, "emerald">;
  players: string;
  difficulty: string;
};

type FeatureItem = {
  icon: string;
  title: string;
  description: string;
  accent: GameAccent;
};

type UseCaseItem = {
  title: string;
  description: string;
  accent: GameAccent;
};

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

const gameCards: GameCardItem[] = [
  {
    title: "لمتكم",
    subtitle: "أسئلة وأجوبة",
    description:
      "لوحة لعب احترافية بين فريقين بفئات وصور ونقاط وتجربة مصممة للشاشات الكبيرة والجلسات الحماسية.",
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
      "لعبة اجتماعية ممتعة حيث يكون شخص واحد فقط خارج السالفة ويحاول كشف الكلمة قبل الجميع.",
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
      "لعبة فرق تعتمد على الذكاء والتلميحات والتنسيق السريع مع تجربة جماعية حماسية ومتجددة.",
    href: "/games/codenames/",
    image: "https://b.top4top.io/p_374101e3s1.png",
    badge: "لعبة تكتيكية",
    accent: "violet",
    players: "4+ لاعبين",
    difficulty: "تكتيكي",
  },
];

const featureCards: FeatureItem[] = [
  {
    icon: "⚡",
    title: "بدء سريع جدًا",
    description:
      "من الصفحة الرئيسية إلى اللعبة خلال ثوانٍ، بدون خطوات مربكة أو إعدادات معقدة.",
    accent: "cyan",
  },
  {
    icon: "🖥️",
    title: "مظهر جاهز للعرض",
    description:
      "الواجهة مصممة لتظهر بشكل ممتاز على شاشة التلفاز أو اللابتوب أو الهاتف.",
    accent: "orange",
  },
  {
    icon: "🎯",
    title: "تجارب مختلفة",
    description:
      "كل لعبة داخل المنصة تعطي أسلوب لعب مختلف حتى لا تصبح الجلسة مكررة أو مملة.",
    accent: "violet",
  },
  {
    icon: "📱",
    title: "سلاسة على الموبايل",
    description:
      "الصفحة والبطاقات والأزرار كلها مبنية لتبقى واضحة ومريحة حتى على الشاشات الصغيرة.",
    accent: "emerald",
  },
];

const useCases: UseCaseItem[] = [
  {
    title: "جلسات الأصدقاء",
    description:
      "مناسبة للضحك، التحدي، واللعب السريع بدون تجهيز طويل.",
    accent: "cyan",
  },
  {
    title: "العائلة والتجمعات",
    description:
      "واجهة واضحة وألعاب سهلة الدخول تعطي جوًا أجمل للجلسة.",
    accent: "orange",
  },
  {
    title: "النوادي والجامعات",
    description:
      "مناسبة للفعاليات والمسابقات الصغيرة والعروض الجماعية.",
    accent: "violet",
  },
];

const stats = [
  { value: "3", label: "ألعاب جاهزة الآن", accent: "cyan" as GameAccent },
  { value: "فوري", label: "بدء اللعب", accent: "orange" as GameAccent },
  { value: "Responsive", label: "لكل الأجهزة", accent: "violet" as GameAccent },
  { value: "جماعي", label: "أسلوب التجربة", accent: "emerald" as GameAccent },
];

const accent = {
  cyan: {
    line: "bg-cyan-400",
    chip: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
    soft: "border-cyan-400/14 bg-cyan-400/[0.05]",
    title: "text-cyan-300",
    button:
      "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_10px_30px_rgba(34,211,238,0.28)]",
    glow: "shadow-[0_22px_60px_rgba(34,211,238,0.10)]",
  },
  orange: {
    line: "bg-orange-400",
    chip: "border-orange-400/20 bg-orange-400/8 text-orange-300",
    soft: "border-orange-400/14 bg-orange-400/[0.05]",
    title: "text-orange-300",
    button:
      "bg-orange-500 text-white hover:bg-orange-400 shadow-[0_10px_30px_rgba(249,115,22,0.28)]",
    glow: "shadow-[0_22px_60px_rgba(249,115,22,0.10)]",
  },
  violet: {
    line: "bg-violet-400",
    chip: "border-violet-400/20 bg-violet-400/8 text-violet-300",
    soft: "border-violet-400/14 bg-violet-400/[0.05]",
    title: "text-violet-300",
    button:
      "bg-violet-500 text-white hover:bg-violet-400 shadow-[0_10px_30px_rgba(139,92,246,0.28)]",
    glow: "shadow-[0_22px_60px_rgba(139,92,246,0.10)]",
  },
  emerald: {
    line: "bg-emerald-400",
    chip: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
    soft: "border-emerald-400/14 bg-emerald-400/[0.05]",
    title: "text-emerald-300",
    button:
      "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_10px_30px_rgba(52,211,153,0.28)]",
    glow: "shadow-[0_22px_60px_rgba(52,211,153,0.10)]",
  },
};

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
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ControllerIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M8 12h2M9 11v2M16.5 12h.01M18.5 12h.01" />
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

function ScreenIcon({ className = "h-4 w-4" }: { className?: string }) {
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white/45">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
}

function HeroMiniCard({
  title,
  subtitle,
  image,
  badge,
  accentKey,
}: {
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  accentKey: Exclude<GameAccent, "emerald">;
}) {
  const a = accent[accentKey];

  return (
    <div
      className={`overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(160deg,rgba(12,20,44,0.95)_0%,rgba(4,8,22,0.98)_100%)] ${a.glow}`}
    >
      <div className={`h-[2px] w-full ${a.line} opacity-70`} />
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="h-32 w-full object-cover sm:h-36"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,10,24,0.90)] via-transparent to-transparent" />
        <div className="absolute bottom-3 right-3">
          <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${a.chip}`}>
            {badge}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-lg font-black text-white">{title}</div>
        <div className="mt-1 text-xs font-bold text-white/45">{subtitle}</div>
      </div>
    </div>
  );
}

function GameCard({ card }: { card: GameCardItem }) {
  const a = accent[card.accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,42,0.96)_0%,rgba(4,8,22,0.99)_100%)] transition duration-300 hover:-translate-y-1 ${a.glow}`}
    >
      <div className={`h-[2px] w-full ${a.line} opacity-70`} />

      <div className="relative overflow-hidden">
        <img
          src={card.image}
          alt={card.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(5,10,24,0.94)] via-[rgba(5,10,24,0.18)] to-transparent" />
        <div className="absolute bottom-4 right-4">
          <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black backdrop-blur-sm ${a.chip}`}>
            {card.badge}
          </span>
        </div>
      </div>

      <div className="flex flex-col p-5">
        <div className={`mb-1 text-[11px] font-bold uppercase tracking-widest ${a.title}`}>
          {card.subtitle}
        </div>
        <h3 className="text-2xl font-black text-white">{card.title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/50">{card.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${a.soft} ${a.title}`}>
            <UsersIcon className="h-3 w-3" />
            {card.players}
          </span>
          <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] font-bold text-white/40">
            {card.difficulty}
          </span>
          <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] font-bold text-white/40">
            جاهزة الآن
          </span>
        </div>

        <Link
          href={card.href}
          className={`mt-5 inline-flex items-center justify-between rounded-xl px-5 py-3 text-sm font-black transition active:scale-[0.98] ${a.button}`}
        >
          <span>ابدأ اللعبة</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function FeatureCard({ item }: { item: FeatureItem }) {
  const a = accent[item.accent];

  return (
    <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-5 transition duration-200 hover:bg-white/[0.045]">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-2xl ${a.soft}`}>
        {item.icon}
      </div>
      <h3 className="text-lg font-black text-white">{item.title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/45">{item.description}</p>
    </div>
  );
}

function StatCard({
  value,
  label,
  accentKey,
}: {
  value: string;
  label: string;
  accentKey: GameAccent;
}) {
  const a = accent[accentKey];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
      <div className={`h-[2px] w-full ${a.line} opacity-65`} />
      <div className="px-4 py-4">
        <div className={`text-2xl font-black ${a.title}`}>{value}</div>
        <div className="mt-1 text-sm font-bold text-white/40">{label}</div>
      </div>
    </div>
  );
}

function UseCaseCard({ item }: { item: UseCaseItem }) {
  const a = accent[item.accent];

  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,42,0.96)_0%,rgba(4,8,22,0.99)_100%)] p-6">
      <div className={`absolute inset-x-0 top-0 h-[2px] ${a.line} opacity-70`} />
      <div className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-black ${a.chip}`}>
        {item.title}
      </div>
      <p className="text-sm leading-7 text-white/50">{item.description}</p>
    </div>
  );
}

export default async function HomePage() {
  const viewer = await getViewer();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.45)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.06),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.05),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <section className="relative overflow-hidden rounded-[2.8rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_52%,rgba(6,12,30,1)_100%)]">
          <div className="pointer-events-none absolute -top-36 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[90px]" />
          <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-orange-500/8 blur-[70px]" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-violet-500/8 blur-[70px]" />

          <div className="grid gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-12 xl:px-14 xl:py-14">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-black text-cyan-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                </span>
                منصة ألعاب جماعية مصممة للجلسات
              </div>

              <h1 className="mt-6 text-[2.2rem] font-black leading-[1.02] text-white sm:text-[3rem] lg:text-[4.4rem]">
                خلي الجلسة
                <span className="block bg-gradient-to-l from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent">
                  ألعب وأرتب وأمتع
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-white/55 md:text-base md:leading-9">
                لمتكم منصة ألعاب جماعية حديثة تعطيك تجربة أنيقة وسريعة وممتعة من أول لحظة.
                اختر اللعبة، ابدأ الجلسة، وخلّ المنافسة والحماس يشتغلوا مباشرة على أي جهاز.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,0.30)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  <ControllerIcon className="h-4 w-4" />
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
                    الدخول إلى الحساب
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
                      className="inline-flex items-center rounded-xl border border-white/8 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-white/55 transition hover:bg-white/8 hover:text-white"
                    >
                      تسجيل الدخول
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {[
                  "بدء سريع",
                  "متوافق مع التلفاز",
                  "واجهة مريحة للموبايل",
                  "ألعاب جماعية متنوعة",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/8 bg-white/[0.035] px-3.5 py-1.5 text-[11px] font-bold text-white/40"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-full space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <div className="relative overflow-hidden rounded-[2.2rem] border border-cyan-400/14 bg-[linear-gradient(160deg,rgba(10,20,48,0.98)_0%,rgba(4,8,22,0.99)_100%)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.10),transparent_70%)]" />
                      <div className="absolute inset-5 rounded-[1.6rem] border border-cyan-400/8" />
                      <div className="relative flex flex-col items-center justify-center gap-4 py-7 text-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-[1.8rem] border border-cyan-400/18 bg-cyan-400/8">
                          <img
                            src={heroLogo}
                            alt="لمتكم"
                            className="h-16 w-16 object-contain"
                          />
                        </div>
                        <div>
                          <div className="text-2xl font-black text-white sm:text-3xl">
                            منصة جاهزة للجلسة
                          </div>
                          <div className="mt-2 text-sm leading-7 text-white/45">
                            ألعاب سريعة، تصميم أنيق، وتجربة أكثر احترافية من أول نظرة
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {gameCards.map((card) => (
                    <HeroMiniCard
                      key={card.title}
                      title={card.title}
                      subtitle={card.subtitle}
                      image={card.image}
                      badge={card.badge}
                      accentKey={card.accent}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((item) => (
            <StatCard
              key={item.label}
              value={item.value}
              label={item.label}
              accentKey={item.accent}
            />
          ))}
        </section>

        <section className="mt-16">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>الألعاب الحالية</SectionLabel>
              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
                ألعاب جاهزة تعطي الجلسة شخصية
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
                كل لعبة هنا لها طابعها الخاص، لكن كلها تشترك في شيء واحد: تجربة واضحة، جميلة، وسهلة البدء.
              </p>
            </div>

            <Link
              href="/games"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/60 transition hover:bg-white/8 hover:text-white"
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

        <section className="mt-16">
          <SectionLabel>ماذا يميز المنصة؟</SectionLabel>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
            شكل Premium وتجربة أسلس
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
            الواجهة مبنية لتبدو قوية بصريًا، وتبقى سهلة الاستخدام وسريعة على كل المقاسات.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionLabel>مصممة لمناسبات مختلفة</SectionLabel>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
            تناسب أي نوع جلسة
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
            سواء كانت جلسة أصدقاء أو فعالية أو جمعة عائلية، ستجد لعبة مناسبة بسرعة.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <UseCaseCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionLabel>كيف تبدأ؟</SectionLabel>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
            الطريق إلى اللعب بسيط
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "اختر اللعبة",
                description: "ابدأ من الصفحة الرئيسية أو من صفحة الألعاب حسب مزاج الجلسة.",
                accentKey: "cyan" as GameAccent,
              },
              {
                num: "02",
                title: "جهز الجولة",
                description: "اختر الفئات أو أنشئ الغرفة ثم ادعُ اللاعبين خلال ثوانٍ.",
                accentKey: "orange" as GameAccent,
              },
              {
                num: "03",
                title: "ابدأ واستمتع",
                description: "كل شيء مصمم ليكون واضحًا واحترافيًا أثناء اللعب على أي شاشة.",
                accentKey: "violet" as GameAccent,
              },
            ].map((step) => {
              const a = accent[step.accentKey];

              return (
                <div
                  key={step.num}
                  className="relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,42,0.96)_0%,rgba(4,8,22,0.99)_100%)] p-6"
                >
                  <div className={`absolute inset-x-0 top-0 h-[2px] ${a.line} opacity-70`} />
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-base font-black ${a.soft} ${a.title}`}>
                    {step.num}
                  </div>
                  <h3 className="text-lg font-black text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/45">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-16">
          <div className="relative overflow-hidden rounded-[2.3rem] border border-white/8 bg-[linear-gradient(135deg,rgba(8,16,40,0.99)_0%,rgba(4,8,22,1)_100%)]">
            <div className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-[60px]" />
            <div className="pointer-events-none absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-violet-500/8 blur-[60px]" />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />

            <div className="relative grid gap-8 px-6 py-10 md:grid-cols-[1fr_auto] md:items-center md:px-10">
              <div>
                <SectionLabel>جاهز تبدأ؟</SectionLabel>
                <h3 className="mt-4 text-2xl font-black text-white md:text-3xl">
                  ادخل عالم الألعاب الجماعية بشكل أجمل
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
                  الصفحة الرئيسية الآن يجب أن تعطي إحساس منصة ألعاب فعلية، لا مجرد موقع عادي. هذا التصميم يضع الألعاب في الواجهة ويبرز الهوية والحماس والاحترافية.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Link
                  href="/games"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  استكشف الألعاب
                  <ArrowLeft className="h-4 w-4" />
                </Link>

                {!viewer.isLoggedIn && (
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/6 px-7 py-3.5 text-sm font-black text-white/70 transition hover:bg-white/10"
                  >
                    إنشاء حساب مجاني
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-16 overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(6,12,30,0.97)_0%,rgba(3,6,16,0.99)_100%)]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

          <div className="px-6 py-8 md:px-10">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div className="flex flex-col items-center gap-3 md:items-start">
                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="h-10 w-auto object-contain opacity-75"
                />
                <p className="text-xs text-white/25">
                  منصة ألعاب جماعية للجلسات والفعاليات والتجمعات
                </p>
              </div>

              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-white/30">
                {[
                  { label: "الرئيسية", href: "/" },
                  { label: "الألعاب", href: "/games" },
                  { label: "الباقات", href: "/pricing" },
                  { label: "الحساب", href: viewer.isLoggedIn ? "/account" : "/login" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition hover:text-white/55"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-6 h-px bg-white/5" />

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