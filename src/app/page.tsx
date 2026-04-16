import Link from "next/link";
import { getViewer } from "../lib/auth/viewer";

type Accent = "cyan" | "orange" | "violet";

type GameCardItem = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image: string;
  badge: string;
  accent: Accent;
  players: string;
  difficulty: string;
};

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

const gameCards: GameCardItem[] = [
  {
    title: "لمتكم",
    subtitle: "أسئلة وأجوبة",
    description:
      "لوحة لعب بين فريقين بفئات وصور ونقاط وتجربة مصممة للجلسات والعروض على الشاشة الكبيرة.",
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
      "شخص واحد فقط لا يعرف الكلمة. هل تستطيع كشفه قبل أن يضلل الجميع؟",
    href: "/game/bara-alsalfah",
    image: "https://l.top4top.io/p_373887e151.png",
    badge: "الأكثر حماسًا",
    accent: "orange",
    players: "3+ لاعبين",
    difficulty: "اجتماعي",
  },
  {
    title: "Codenames",
    subtitle: "كلمات وتلميحات",
    description:
      "لعبة فرق تعتمد على الذكاء والتلميحات والتنسيق السريع مع تجربة جماعية قوية.",
    href: "/games/codenames/",
    image: "https://b.top4top.io/p_374101e3s1.png",
    badge: "تكتيكية",
    accent: "violet",
    players: "4+ لاعبين",
    difficulty: "تكتيكي",
  },
];

const accentStyles = {
  cyan: {
    line: "bg-cyan-400",
    badge: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    chip: "border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-200",
    glow: "shadow-[0_18px_50px_rgba(34,211,238,0.10)]",
    button:
      "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_10px_30px_rgba(34,211,238,0.25)]",
    soft: "from-cyan-400/10 to-transparent",
  },
  orange: {
    line: "bg-orange-400",
    badge: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    chip: "border-orange-400/15 bg-orange-400/[0.06] text-orange-200",
    glow: "shadow-[0_18px_50px_rgba(249,115,22,0.10)]",
    button:
      "bg-orange-500 text-white hover:bg-orange-400 shadow-[0_10px_30px_rgba(249,115,22,0.25)]",
    soft: "from-orange-400/10 to-transparent",
  },
  violet: {
    line: "bg-violet-400",
    badge: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    chip: "border-violet-400/15 bg-violet-400/[0.06] text-violet-200",
    glow: "shadow-[0_18px_50px_rgba(139,92,246,0.10)]",
    button:
      "bg-violet-500 text-white hover:bg-violet-400 shadow-[0_10px_30px_rgba(139,92,246,0.25)]",
    soft: "from-violet-400/10 to-transparent",
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

function SparklesIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="m12 3 1.6 4.1L18 8.7l-4.4 1.6L12 14.5l-1.6-4.2L6 8.7l4.4-1.6L12 3Z" />
      <path d="m19 15 .8 2 .2.2 2 .8-2 .8-.2.2-.8 2-.8-2-.2-.2-2-.8 2-.8.2-.2.8-2Z" />
      <path d="m5 15 .8 2 .2.2 2 .8-2 .8-.2.2-.8 2-.8-2-.2-.2-2-.8 2-.8.2-.2.8-2Z" />
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

function TrophyIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h2a2 2 0 0 1 2 2c0 2.5-2 4-4 4" />
      <path d="M7 5H5a2 2 0 0 0-2 2c0 2.5 2 4 4 4" />
    </svg>
  );
}

function MobileIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
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
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold tracking-wide text-white/50">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
}

function StatPill({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm font-bold text-white/40">{label}</div>
    </div>
  );
}

function HeroPreviewCard({
  card,
  compact = false,
}: {
  card: GameCardItem;
  compact?: boolean;
}) {
  const a = accentStyles[card.accent];

  return (
    <div
      className={`group overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(160deg,rgba(11,19,43,0.96)_0%,rgba(4,8,22,0.99)_100%)] ${a.glow}`}
    >
      <div className={`h-[2px] w-full ${a.line} opacity-70`} />
      <div className="relative">
        <img
          src={card.image}
          alt={card.title}
          className={compact ? "h-36 w-full object-cover" : "h-44 w-full object-cover"}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,8,22,0.92)] via-[rgba(4,8,22,0.15)] to-transparent" />
        <div className="absolute bottom-3 right-3">
          <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${a.badge}`}>
            {card.badge}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-lg font-black text-white">{card.title}</div>
        <div className="mt-1 text-xs font-bold text-white/45">{card.subtitle}</div>
      </div>
    </div>
  );
}

function GameCard({ card }: { card: GameCardItem }) {
  const a = accentStyles[card.accent];

  return (
    <div
      className={`group overflow-hidden rounded-[2.1rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,42,0.97)_0%,rgba(4,8,22,0.995)_100%)] transition duration-300 hover:-translate-y-1 ${a.glow}`}
    >
      <div className={`h-[2px] w-full ${a.line} opacity-70`} />

      <div className="relative overflow-hidden">
        <img
          src={card.image}
          alt={card.title}
          className="h-60 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,8,22,0.95)] via-[rgba(4,8,22,0.18)] to-transparent" />
        <div className="absolute bottom-4 right-4">
          <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${a.badge}`}>
            {card.badge}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
          {card.subtitle}
        </div>
        <h3 className="text-2xl font-black text-white">{card.title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/50">{card.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${a.chip}`}>
            <UsersIcon className="h-3 w-3" />
            {card.players}
          </span>
          <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/40">
            {card.difficulty}
          </span>
        </div>

        <Link
          href={card.href}
          className={`mt-5 inline-flex w-full items-center justify-between rounded-xl px-5 py-3 text-sm font-black transition active:scale-[0.98] ${a.button}`}
        >
          <span>العب الآن</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function PremiumFeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-5 transition duration-200 hover:bg-white/[0.045]">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/80">
        {icon}
      </div>
      <h3 className="text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/45">{description}</p>
    </div>
  );
}

export default async function HomePage() {
  const viewer = await getViewer();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.45)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.08),transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <section className="relative overflow-hidden rounded-[2.8rem] border border-white/8 bg-[linear-gradient(145deg,rgba(7,15,39,1)_0%,rgba(3,7,20,1)_55%,rgba(6,12,30,1)_100%)]">
          <div className="pointer-events-none absolute -top-36 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[95px]" />
          <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-orange-500/8 blur-[70px]" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-violet-500/8 blur-[70px]" />

          <div className="grid gap-10 px-5 py-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-10 xl:px-12">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-300">
                <SparklesIcon className="h-4 w-4" />
                منصة ألعاب جماعية بتجربة premium
              </div>

              <h1 className="mt-6 text-[2.3rem] font-black leading-[1.02] text-white sm:text-[3.2rem] lg:text-[4.8rem]">
                موقع ألعاب
                <span className="block bg-gradient-to-l from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent">
                  للجلسات والفعاليات
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-white/55 md:text-base md:leading-9">
                لمتكم ليست مجرد صفحة فيها روابط ألعاب، بل منصة مصممة لتجعل شكل الجلسة
                نفسها أفخم، أوضح، وأكثر حماسًا. افتح اللعبة، اعرضها على الشاشة، وابدأ
                التجربة مباشرة بشكل يليق بالموقع.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.30)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  <ControllerIcon className="h-4 w-4" />
                  استكشف الألعاب
                </Link>

                {viewer.isLoggedIn ? (
                  <Link
                    href="/account"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3.5 text-sm font-black text-white/85 transition hover:bg-white/10"
                  >
                    الدخول إلى الحساب
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
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

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatPill value="3" label="ألعاب جاهزة" />
                <StatPill value="Responsive" label="لكل المقاسات" />
                <StatPill value="سريع" label="بدء فوري" />
                <StatPill value="Premium" label="ستايل احترافي" />
              </div>
            </div>

            <div className="flex items-center">
              <div className="grid w-full gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(9,18,42,0.98)_0%,rgba(4,8,22,0.995)_100%)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_68%)]" />
                    <div className="pointer-events-none absolute inset-5 rounded-[1.7rem] border border-cyan-400/8" />

                    <div className="relative grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[1.8rem] border border-cyan-400/18 bg-cyan-400/10 sm:mx-0">
                        <img
                          src={heroLogo}
                          alt="لمتكم"
                          className="h-16 w-16 object-contain"
                        />
                      </div>

                      <div className="text-center sm:text-right">
                        <div className="text-2xl font-black text-white sm:text-3xl">
                          عالم ألعاب أنيق وسلس
                        </div>
                        <div className="mt-2 text-sm leading-7 text-white/45">
                          واجهة أقوى، ألعاب أوضح، وقيمة بصرية أعلى من أول ثانية
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <HeroPreviewCard card={gameCards[0]} />
                <HeroPreviewCard card={gameCards[1]} />
                <div className="sm:col-span-2">
                  <HeroPreviewCard card={gameCards[2]} compact />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>واجهة ألعاب فعلية</SectionLabel>
              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
                اختر اللعبة المناسبة للجلسة
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
                بطاقات أكبر، حضور أقوى للصور، وهوية بصرية أوضح تجعل الصفحة الرئيسية
                تبدو كمنصة ألعاب حقيقية وليس مجرد Landing Page عادي.
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
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(8,16,38,0.98)_0%,rgba(4,8,22,0.99)_100%)] p-6 md:p-7">
              <SectionLabel>لماذا الصفحة الجديدة أفضل؟</SectionLabel>
              <h2 className="mt-4 text-2xl font-black text-white md:text-3xl">
                إعادة بناء فعلية وليست تعديل بسيط
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-white/50">
                التركيز هنا لم يعد فقط على نصوص ووصف، بل على حضور الألعاب نفسها داخل الصفحة:
                صور أكبر، تقسيمات أنظف، هيرو أقوى، وشعور premium أوضح يناسب هوية منصة ألعاب.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <PremiumFeatureCard
                  icon={<ControllerIcon className="h-5 w-5" />}
                  title="هوية ألعاب أوضح"
                  description="الألعاب أصبحت في قلب الصفحة بدل أن تكون مجرد قسم عابر."
                />
                <PremiumFeatureCard
                  icon={<TrophyIcon className="h-5 w-5" />}
                  title="شكل أكثر فخامة"
                  description="الظلال، التدرجات، والمساحات تعطي إحساس منصة أكثر احترافية."
                />
                <PremiumFeatureCard
                  icon={<ScreenIcon className="h-5 w-5" />}
                  title="عرض أقوى على الشاشات"
                  description="التصميم يعطي حضورًا بصريًا ممتازًا على اللابتوب والتلفاز."
                />
                <PremiumFeatureCard
                  icon={<MobileIcon className="h-5 w-5" />}
                  title="مريح للموبايل"
                  description="الترتيب يبقى واضحًا وسلسًا حتى على الشاشات الصغيرة."
                />
              </div>
            </div>

            <div className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(8,16,38,0.98)_0%,rgba(4,8,22,0.99)_100%)] p-6 md:p-7">
              <SectionLabel>مناسبات الاستخدام</SectionLabel>
              <h2 className="mt-4 text-2xl font-black text-white md:text-3xl">
                لكل نوع جلسة
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "جلسات الأصدقاء",
                    text: "ابدأ بسرعة، تنافس، وخلّ الجو كله ألعاب وتحدي.",
                    accent: "cyan" as Accent,
                  },
                  {
                    title: "العائلة والتجمعات",
                    text: "واجهة واضحة تسهّل اللعب حتى مع مجموعات كبيرة.",
                    accent: "orange" as Accent,
                  },
                  {
                    title: "الفعاليات والنوادي",
                    text: "تجربة مناسبة للعرض والتنظيم والحماس الجماعي.",
                    accent: "violet" as Accent,
                  },
                ].map((item) => {
                  const a = accentStyles[item.accent];
                  return (
                    <div
                      key={item.title}
                      className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-white/[0.03]"
                    >
                      <div className={`h-[2px] w-full ${a.line} opacity-70`} />
                      <div className="p-5">
                        <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${a.badge}`}>
                          {item.title}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/45">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/8 bg-[linear-gradient(135deg,rgba(7,14,34,0.99)_0%,rgba(3,7,20,1)_100%)]">
            <div className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-[60px]" />
            <div className="pointer-events-none absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-violet-500/8 blur-[60px]" />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />

            <div className="relative flex flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
              <div>
                <SectionLabel>ابدأ الآن</SectionLabel>
                <h3 className="mt-4 text-2xl font-black text-white md:text-3xl">
                  الجلسة الجاية تحتاج منصة أجمل
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
                  ادخل عالم الألعاب الجماعية بتصميم أقوى، حضور بصري أفضل، وتجربة أكثر سلاسة ووضوحًا من البداية حتى اللعب.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
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
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-7 py-3.5 text-sm font-black text-white/75 transition hover:bg-white/10"
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
                  { label: viewer.isLoggedIn ? "الحساب" : "الدخول", href: viewer.isLoggedIn ? "/account" : "/login" },
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