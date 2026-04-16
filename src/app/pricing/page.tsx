import Link from "next/link";

// ─── Types (unchanged) ────────────────────────────────────────────────────────

type PlanFeature = { text: string };

type Plan = {
  name: string;
  badge: string;
  price: string;
  description: string;
  highlight?: string;
  cta: string;
  href: string;
  featured?: boolean;
  features: PlanFeature[];
};

type GameCard = {
  title: string;
  description: string;
  points: string[];
};

type FaqItem = {
  question: string;
  answer: string;
};

// ─── Data (unchanged) ─────────────────────────────────────────────────────────

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

const plans: Plan[] = [
  {
    name: "الخطة المجانية",
    badge: "للتجربة",
    price: "0 JD",
    description:
      "مناسبة لتجربة المنصة والتعرّف على طريقة اللعب قبل الانتقال إلى خطة أعلى.",
    cta: "ابدأ مجانًا",
    href: "/signup",
    features: [
      { text: "إنشاء حساب والبدء مباشرة" },
      { text: "الوصول للتجربة الأساسية" },
      { text: "مناسبة للتجربة الأولى" },
      { text: "متابعة الألعاب غير المكتملة من الحساب" },
    ],
  },
  {
    name: "الخطة المميزة",
    badge: "الأكثر طلبًا",
    price: "10 JD",
    description:
      "أفضل خيار للمستخدم الذي يريد لعبًا أكثر وتجربة أكثر استمرارية.",
    highlight: "مناسبة للأفراد والمجموعات الصغيرة والاستخدام المستمر",
    cta: "اشترِ الآن",
    href: "/payment?plan=featured",
    featured: true,
    features: [
      { text: "عدد ألعاب أكبر بحسب التفعيل" },
      { text: "أنسب للتجربة المستمرة" },
      { text: "متابعة الجولات غير المكتملة بسهولة" },
      { text: "استفادة أفضل من كامل تجربة المنصة" },
    ],
  },
  {
    name: "Premium خطة",
    badge: "احترافي",
    price: "20 JD",
    description:
      "خطة أعلى للمستخدم الذي يريد تجربة أقوى وأكثر مرونة واستخدامًا متقدمًا.",
    cta: "اشترِ الآن",
    href: "/payment?plan=premium",
    features: [
      { text: "مرونة أعلى في الاستخدام" },
      { text: "أنسب للتوسع أو الاستخدام الاحترافي" },
      { text: "حل مناسب للمهتمين بالتفعيل الكامل" },
      { text: "مستوى أعلى من الاستفادة من المنصة" },
    ],
  },
  {
    name: "شراء ألعاب منفردة",
    badge: "مرن",
    price: "1 JD / لعبة",
    description:
      "إذا كنت لا تريد شراء باقة كاملة، يمكنك شراء عدد ألعاب معين خاص بلعبة لمتكم فقط.",
    cta: "اشترِ الآن",
    href: "/payment?plan=games",
    features: [
      { text: "مرونة في شراء عدد الألعاب فقط" },
      { text: "مخصص للعبة لمتكم" },
      { text: "مناسب للمستخدم الذي يحتاج تفعيلًا محدودًا" },
      { text: "1 JD لكل لعبة واحدة" },
    ],
  },
];

const games: GameCard[] = [
  {
    title: "لعبة الأسئلة الرئيسية",
    description:
      "تجربة تنافسية منظمة مناسبة للعرض على الشاشات، مع فئات وأسئلة ونظام نقاط واضح بين الفرق.",
    points: ["لوحة لعب مرتبة", "فئات متعددة", "نظام نقاط", "مناسبة للفعاليات"],
  },
  {
    title: "برا السالفة",
    description:
      "لعبة اجتماعية تفاعلية داخل المنصة تضيف تنوعًا أكبر للتجربة، وتناسب الجلسات والمجموعات بشكل ممتع وسريع.",
    points: ["تجربة جماعية", "تفاعل مباشر", "مناسبة للجلسات", "تنوع داخل المنصة"],
  },
  {
    title: "Codenames",
    description:
      "تجربة كلمات وتلميحات تضيف بعدًا مختلفًا داخل المنصة، وتناسب من يريد أسلوب لعب جماعي يعتمد على التفكير والتعاون.",
    points: ["كلمات", "تلميحات", "فرق", "تعاون"],
  },
];

const faqs: FaqItem[] = [
  {
    question: "هل أحتاج الدفع قبل تجربة الموقع؟",
    answer:
      "لا، يمكن بدء التجربة أولًا من خلال الخطة المجانية، وبعدها اختيار الخطة المناسبة حسب استخدامك.",
  },
  {
    question: "هل أستطيع شراء عدد ألعاب فقط؟",
    answer:
      "نعم، تم إضافة خيار شراء ألعاب منفردة للعبة لمتكم بسعر 1 JD لكل لعبة واحدة.",
  },
  {
    question: "هل الباقات مخصصة للعبة واحدة فقط؟",
    answer:
      "لا، الباقات مخصصة للاستفادة من المنصة بشكل عام، بينما خيار شراء الألعاب المنفردة مخصص للعبة لمتكم فقط.",
  },
  {
    question: "هل المنصة مناسبة للفعاليات أو الجهات؟",
    answer:
      "نعم، تصميم المنصة مناسب للجلسات، الفعاليات، والعروض الجماعية بشكل واضح ومرتب.",
  },
];

// ─── Plan tone system ─────────────────────────────────────────────────────────

type PlanTone = "slate" | "cyan" | "violet" | "emerald";

type PlanStyles = {
  bar:      string;
  badge:    string;
  price:    string;
  check:    string;
  button:   string;
  card:     string;
  glow:     string;
  featured: boolean;
};

const planTones: PlanTone[] = ["slate", "cyan", "violet", "emerald"];

function getPlanTone(index: number): PlanTone {
  return planTones[index] ?? "slate";
}

function getPlanStyles(tone: PlanTone, featured: boolean): PlanStyles {
  if (featured) {
    return {
      bar:      "bg-cyan-400",
      badge:    "border-cyan-400/30 bg-cyan-400/12 text-cyan-300",
      price:    "text-cyan-300",
      check:    "text-cyan-400",
      button:   "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_4px_24px_rgba(34,211,238,0.30)]",
      card:     "border-cyan-400/25 bg-[linear-gradient(160deg,rgba(14,32,62,0.98)_0%,rgba(6,12,28,0.99)_100%)]",
      glow:     "shadow-[0_24px_64px_rgba(34,211,238,0.10)]",
      featured: true,
    };
  }

  const map: Record<PlanTone, PlanStyles> = {
    slate: {
      bar:    "bg-white/20",
      badge:  "border-white/10 bg-white/5 text-white/50",
      price:  "text-white/80",
      check:  "text-white/40",
      button: "border border-white/10 bg-white/6 text-white hover:bg-white/10",
      card:   "border-white/8 bg-[linear-gradient(160deg,rgba(16,26,52,0.90)_0%,rgba(6,12,28,0.98)_100%)]",
      glow:   "",
      featured: false,
    },
    cyan: {
      bar:    "bg-cyan-400",
      badge:  "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
      price:  "text-cyan-300",
      check:  "text-cyan-400",
      button: "border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/18",
      card:   "border-cyan-400/15 bg-[linear-gradient(160deg,rgba(14,28,56,0.94)_0%,rgba(6,12,28,0.98)_100%)]",
      glow:   "shadow-[0_20px_50px_rgba(34,211,238,0.08)]",
      featured: false,
    },
    violet: {
      bar:    "bg-violet-400",
      badge:  "border-violet-400/25 bg-violet-400/10 text-violet-300",
      price:  "text-violet-300",
      check:  "text-violet-400",
      button: "border border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/18",
      card:   "border-violet-400/15 bg-[linear-gradient(160deg,rgba(22,14,52,0.94)_0%,rgba(6,12,28,0.98)_100%)]",
      glow:   "shadow-[0_20px_50px_rgba(139,92,246,0.08)]",
      featured: false,
    },
    emerald: {
      bar:    "bg-emerald-400",
      badge:  "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
      price:  "text-emerald-300",
      check:  "text-emerald-400",
      button: "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/18",
      card:   "border-emerald-400/15 bg-[linear-gradient(160deg,rgba(8,32,26,0.94)_0%,rgba(6,12,28,0.98)_100%)]",
      glow:   "shadow-[0_20px_50px_rgba(52,211,153,0.08)]",
      featured: false,
    },
  };

  return map[tone];
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
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

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function QuizIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11h6M9 15h4" />
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

function WordIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
      <path d="M12 2v5h5M8 13h8M8 17h5" />
    </svg>
  );
}

function HomeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5" />
    </svg>
  );
}

function QuestionIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.75 9.25a2.5 2.5 0 1 1 4.1 2c-.75.6-1.35 1.05-1.35 2" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function ShieldIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6l-7-3Z" />
    </svg>
  );
}

// ─── SectionBadge ─────────────────────────────────────────────────────────────

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white/50">
      <span className="h-1 w-1 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const tone   = plan.featured ? "cyan" : getPlanTone(index);
  const styles = getPlanStyles(tone, plan.featured ?? false);

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1 ${styles.card} ${styles.glow}`}>
      {/* Top accent bar */}
      <div className={`h-[2px] w-full ${styles.bar} ${plan.featured ? "opacity-100" : "opacity-55"}`} />

      {/* Featured crown badge */}
      {plan.featured && (
        <div className="absolute left-4 top-0 -translate-y-full">
          <div className="rounded-b-xl bg-cyan-500 px-3 py-1 text-[10px] font-black text-slate-950">
            ★ الأكثر طلبًا
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Badge + plan name */}
        <div className="mb-5">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black ${styles.badge}`}>
            {plan.badge}
          </span>
          <h3 className="mt-2.5 text-xl font-black text-white">{plan.name}</h3>
          <p className="mt-1.5 text-sm leading-7 text-white/50">{plan.description}</p>
        </div>

        {/* Price block */}
        <div className={`mb-5 rounded-2xl border ${plan.featured ? "border-cyan-400/20 bg-cyan-400/8" : "border-white/8 bg-white/4"} px-4 py-4`}>
          <div className="text-xs font-bold text-white/35">السعر</div>
          <div className={`mt-1 text-3xl font-black leading-none ${styles.price}`}>
            {plan.price}
          </div>
          {plan.highlight && (
            <div className="mt-2 text-xs font-bold text-white/45">{plan.highlight}</div>
          )}
        </div>

        {/* Features list */}
        <div className="mb-6 flex-1 space-y-2.5">
          {plan.features.map((feature) => (
            <div key={feature.text} className="flex items-start gap-3">
              <div className={`mt-0.5 shrink-0 ${styles.check}`}>
                <CheckIcon className="h-4 w-4" />
              </div>
              <span className="text-sm leading-7 text-white/65">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={plan.href}
          className={`inline-flex w-full items-center justify-between rounded-xl px-5 py-3 text-sm font-black transition duration-200 active:scale-[0.98] ${styles.button}`}
        >
          <span>{plan.cta}</span>
          <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── GameFeatureCard ──────────────────────────────────────────────────────────

const gameStyles = [
  { bar: "bg-cyan-400",    badge: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",    card: "border-cyan-400/12",    icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",    tag: "border-cyan-400/15 bg-cyan-400/6 text-cyan-400/80" },
  { bar: "bg-orange-400",  badge: "border-orange-400/20 bg-orange-400/8 text-orange-300", card: "border-orange-400/12", icon: "border-orange-400/20 bg-orange-400/10 text-orange-300", tag: "border-orange-400/15 bg-orange-400/6 text-orange-400/80" },
  { bar: "bg-violet-400",  badge: "border-violet-400/20 bg-violet-400/8 text-violet-300", card: "border-violet-400/12", icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",  tag: "border-violet-400/15 bg-violet-400/6 text-violet-400/80" },
];

const gameIcons = [
  <QuizIcon className="h-5 w-5" />,
  <SocialIcon className="h-5 w-5" />,
  <WordIcon className="h-5 w-5" />,
];

function GameFeatureCard({ item, index }: { item: GameCard; index: number }) {
  const s = gameStyles[index] ?? gameStyles[0];
  const icon = gameIcons[index];

  return (
    <div className={`group relative overflow-hidden rounded-[1.8rem] border bg-[linear-gradient(160deg,rgba(16,26,52,0.90)_0%,rgba(6,12,28,0.97)_100%)] p-5 transition duration-300 hover:-translate-y-0.5 ${s.card}`}>
      {/* Accent bar */}
      <div className={`absolute inset-x-0 top-0 h-[2px] ${s.bar} opacity-60`} />

      {/* Icon + badge row */}
      <div className="mb-4 flex items-center gap-3">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${s.icon}`}>
          {icon}
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${s.badge}`}>
          داخل المنصة
        </span>
      </div>

      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-2.5 text-sm leading-7 text-white/55">{item.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.points.map((point) => (
          <span key={point} className={`rounded-full border px-2.5 py-1 text-xs font-bold ${s.tag}`}>
            {point}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── FaqCard ─────────────────────────────────────────────────────────────────

function FaqCard({ item, index }: { item: FaqItem; index: number }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-[linear-gradient(160deg,rgba(16,26,52,0.85)_0%,rgba(6,12,28,0.96)_100%)]">
      {/* Question */}
      <div className="flex items-start gap-3 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/8 text-xs font-black text-cyan-300">
          {index + 1}
        </div>
        <h3 className="text-base font-black text-white leading-7">{item.question}</h3>
      </div>
      {/* Divider */}
      <div className="h-px bg-white/6 mx-5 sm:mx-6" />
      {/* Answer */}
      <div className="flex items-start gap-3 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/4 text-xs font-bold text-white/30">
          ج
        </div>
        <p className="text-sm leading-7 text-white/55">{item.answer}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_55%,rgba(10,18,40,1)_100%)]">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/9 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-72 rounded-full bg-violet-500/7 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-72 rounded-full bg-emerald-500/5 blur-2xl" />

          <div className="relative grid gap-8 px-7 py-12 md:px-10 md:py-14 xl:grid-cols-[1fr_auto] xl:items-center xl:gap-14">

            {/* Left — text */}
            <div>
              {/* Breadcrumb */}
              <div className="mb-5 flex items-center gap-2 text-xs font-bold text-white/30">
                <Link href="/" className="flex items-center gap-1.5 transition hover:text-white/55">
                  <HomeIcon className="h-3.5 w-3.5" />
                  الرئيسية
                </Link>
                <span>/</span>
                <span className="text-white/50">الباقات والخطط</span>
              </div>

              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-bold text-cyan-300">
                <SparkIcon className="h-3.5 w-3.5" />
                الباقات والأسعار
              </div>

              <h1 className="text-3xl font-black leading-tight text-white md:text-5xl xl:text-[3.5rem]">
                اختر الخطة المناسبة
                <span className="mt-2 block bg-gradient-to-l from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  لتجربة لمتكم
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-8 text-white/50 md:text-base">
                خطط واضحة تناسب الجميع — سواء أردت البدء مجاناً، أو الترقية للاستخدام المستمر، أو شراء ألعاب منفردة.
              </p>

              {/* Trust pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { icon: <CheckIcon className="h-3.5 w-3.5" />, label: "ابدأ مجاناً بدون بطاقة" },
                  { icon: <ShieldIcon className="h-3.5 w-3.5" />, label: "دفع آمن ومضمون" },
                  { icon: <SparkIcon className="h-3.5 w-3.5" />, label: "3 ألعاب متاحة" },
                ].map((p) => (
                  <span key={p.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs font-bold text-white/40">
                    <span className="text-white/30">{p.icon}</span>
                    {p.label}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_4px_24px_rgba(34,211,238,0.25)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  ابدأ مجاناً
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  <HomeIcon className="h-4 w-4" />
                  الرئيسية
                </Link>
              </div>
            </div>

            {/* Right — logo card */}
            <div className="hidden xl:flex xl:justify-end">
              <div className="relative flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/12 bg-[linear-gradient(160deg,rgba(14,24,50,0.96)_0%,rgba(7,13,30,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.07),transparent_70%)]" />
                <div className="absolute inset-5 rounded-[1.5rem] border border-cyan-400/8" />
                <img
                  src={heroLogo}
                  alt="شعار لمتكم"
                  className="relative h-[155px] w-[155px] object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.14)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Plans ─────────────────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="mb-8">
            <SectionBadge>الباقات المتاحة</SectionBadge>
            <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
              خطط واضحة تناسب طريقة استخدامك
            </h2>
            <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
              تم تنظيم الخطط لتغطي الاحتياجات الأساسية، الاستخدام المستمر، الاحترافي، أو شراء ألعاب منفردة.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan, i) => (
              <PlanCard key={plan.name} plan={plan} index={i} />
            ))}
          </div>

          {/* Plan comparison hint strip */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/6 bg-white/[0.02]">
            <div className="grid grid-cols-2 divide-x divide-x-reverse divide-white/6 sm:grid-cols-4">
              {[
                { label: "مجاني",    val: "للتجربة",     color: "text-white/45"  },
                { label: "10 JD",    val: "الأشهر طلبًا", color: "text-cyan-300"  },
                { label: "20 JD",    val: "احترافي",      color: "text-violet-300" },
                { label: "1 JD/لعبة", val: "مرن",         color: "text-emerald-300" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-0.5 px-3 py-3 text-center">
                  <div className={`text-base font-black ${item.color}`}>{item.label}</div>
                  <div className="text-[11px] font-bold text-white/25">{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Games inside platform ──────────────────────────────────────────── */}
        <section className="mb-14">
          <SectionBadge>ماذا تشمل المنصة؟</SectionBadge>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
            المنصة تضم أكثر من تجربة لعب
          </h2>
          <p className="mt-2.5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
            الباقات تخدم استخدام المنصة ككل، مع وجود خيار مستقل أيضًا لشراء ألعاب منفردة للعبة لمتكم.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {games.map((item, i) => (
              <GameFeatureCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionBadge>أسئلة شائعة</SectionBadge>
              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
                كل ما يحتاجه الزائر قبل اختيار الخطة
              </h2>
            </div>
            <div className="shrink-0 rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-xs font-bold text-white/35">
              {faqs.length} سؤال
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((item, i) => (
              <FaqCard key={item.question} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────────────── */}
        <section className="mb-2">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(14,24,50,0.97)_0%,rgba(7,13,30,0.99)_100%)] px-7 py-10 md:px-12 md:py-12">
            {/* Blobs */}
            <div className="pointer-events-none absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-cyan-500/7 blur-2xl" />
            <div className="pointer-events-none absolute -right-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-violet-500/7 blur-2xl" />
            {/* Top line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

            <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-right">
              <div>
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3.5 py-1.5 text-xs font-bold text-cyan-300">
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  جاهز للبدء؟
                </span>
                <h3 className="mt-2 text-2xl font-black text-white md:text-3xl">
                  جرّب لمتكم مجاناً الآن
                </h3>
                <p className="mt-2 max-w-md text-sm leading-7 text-white/50">
                  ابدأ بالخطة المجانية بدون أي التزام — وعندما تكون مستعداً اختر الخطة التي تناسبك.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  إنشاء حساب مجاني
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/games"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/6 px-7 py-3.5 text-sm font-black text-white transition hover:bg-white/10 active:scale-[0.98]"
                >
                  تصفّح الألعاب
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer strip ──────────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between border-t border-white/6 pt-6 text-xs font-bold text-white/20">
          <span>لمتكم © {new Date().getFullYear()}</span>
          <div className="flex gap-5">
            <Link href="/terms"   className="transition hover:text-white/45">الشروط</Link>
            <Link href="/privacy" className="transition hover:text-white/45">الخصوصية</Link>
            <Link href="/contact" className="transition hover:text-white/45">تواصل معنا</Link>
          </div>
        </div>

      </div>
    </main>
  );
}