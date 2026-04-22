import Link from "next/link";
import type { ReactNode } from "react";

type PlanFeature = {
  text: string;
};

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

const heroLogo = "/logo.webp";

const plans: Plan[] = [
  {
    name: "الخطة المجانية",
    badge: "للتجربة",
    price: "0JD",
    description:
      "مناسبة للتجربة الأولى والتعرّف على أسلوب اللعب داخل المنصة قبل الانتقال إلى خطة أعلى.",
    cta: "ابدأ مجانًا",
    href: "/signup",
    features: [
      { text: "إنشاء حساب والبدء مباشرة" },
      { text: "الوصول إلى تجربة المنصة الأساسية" },
      { text: "مناسبة للجلسات الخفيفة والتجربة الأولى" },
      { text: "متابعة الألعاب غير المكتملة من الحساب" },
    ],
  },
  {
    name: "Premium",
    badge: "الأكثر طلبًا",
    price: "10JD",
    description:
      "الخيار الأنسب للمستخدم الذي يريد تجربة أقوى من المجانية مع استخدام مستمر ومزايا أفضل أثناء اللعب.",
    highlight: "تمنع تكرار الأسئلة وتناسب الاستخدام المتكرر للأفراد والمجموعات الصغيرة",
    cta: "اشترِ الآن",
    href: "/payment?plan=featured",
    featured: true,
    features: [
      { text: "تجربة استخدام أقوى من الخطة المجانية" },
      { text: "منع تكرار الأسئلة في لعبة لمتكم" },
      { text: "أنسب للجلسات المستمرة واللعب المتكرر" },
      { text: "متابعة الجولات غير المكتملة بسهولة" },
    ],
  },
  {
    name: "VIP",
    badge: "الأعلى",
    price: "20JD",
    description:
      "الخطة الأعلى للمستخدم الذي يريد أفضل تجربة ممكنة داخل المنصة مع مرونة كاملة واستخدام غير محدود للعبة لمتكم.",
    highlight: "جميع مزايا Premium بالإضافة إلى ألعاب غير محدودة في لمتكم",
    cta: "اشترِ الآن",
    href: "/payment?plan=premium",
    features: [
      { text: "كل مزايا Premium كاملة" },
      { text: "ألعاب غير محدودة للعبة لمتكم" },
      { text: "منع تكرار الأسئلة أثناء الاستخدام" },
      { text: "أنسب للاستخدام المكثف والاحترافي" },
    ],
  },
  {
    name: "شراء ألعاب منفردة",
    badge: "مرن",
    price: "1 JD / لعبة",
    description:
      "إذا لم تكن بحاجة إلى باقة كاملة، يمكنك شراء عدد ألعاب محدد خاص بلعبة لمتكم فقط حسب حاجتك.",
    cta: "اشترِ الآن",
    href: "/payment?plan=games",
    features: [
      { text: "شراء عدد ألعاب حسب الحاجة فقط" },
      { text: "مخصص للعبة لمتكم" },
      { text: "مناسب للتفعيل المحدود أو السريع" },
      { text: "السعر 1 JD لكل لعبة واحدة" },
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
      "لا، يمكنك البدء بالخطة المجانية أولًا، وبعدها اختيار الخطة التي تناسب استخدامك.",
  },
  {
    question: "ما الفرق بين Premium و VIP؟",
    answer:
      "Premium يعطيك تجربة أقوى ومنع تكرار الأسئلة، بينما VIP يقدم نفس الفكرة بمستوى أعلى مع ألعاب غير محدودة للعبة لمتكم.",
  },
  {
    question: "هل أستطيع شراء عدد ألعاب فقط؟",
    answer:
      "نعم، يوجد خيار شراء ألعاب منفردة للعبة لمتكم بسعر 1 JD لكل لعبة واحدة.",
  },
  {
    question: "هل الباقات مخصصة للعبة واحدة فقط؟",
    answer:
      "الباقات تخدم استخدام المنصة بشكل عام، لكن خيار شراء الألعاب المنفردة مخصص للعبة لمتكم فقط.",
  },
];

const planCfg = [
  {
    bar: "bg-white/25",
    badge: "border-white/12 bg-white/6 text-white/55",
    price: "text-white",
    check: "text-white/35",
    btn: "border border-white/12 bg-white/6 text-white/70 hover:bg-white/10 hover:text-white",
    card: "border-white/8 bg-[linear-gradient(160deg,rgba(14,22,46,0.92)_0%,rgba(5,10,24,0.98)_100%)]",
    glow: "",
    icon: "",
  },
  {
    bar: "bg-cyan-400",
    badge: "border-cyan-400/30 bg-cyan-400/12 text-cyan-300",
    price: "text-cyan-300",
    check: "text-cyan-400",
    btn: "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_4px_24px_rgba(34,211,238,0.32)]",
    card: "border-cyan-400/28 bg-[linear-gradient(160deg,rgba(6,22,56,0.98)_0%,rgba(3,10,28,0.99)_100%)]",
    glow: "shadow-[0_28px_72px_rgba(34,211,238,0.13)]",
    icon: "★",
  },
  {
    bar: "bg-violet-400",
    badge: "border-violet-400/25 bg-violet-400/10 text-violet-300",
    price: "text-violet-300",
    check: "text-violet-400",
    btn: "border border-violet-400/22 bg-violet-400/10 text-violet-200 hover:bg-violet-400/18",
    card: "border-violet-400/16 bg-[linear-gradient(160deg,rgba(18,10,48,0.94)_0%,rgba(5,10,24,0.98)_100%)]",
    glow: "shadow-[0_24px_60px_rgba(139,92,246,0.09)]",
    icon: "♛",
  },
  {
    bar: "bg-emerald-400",
    badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    price: "text-emerald-300",
    check: "text-emerald-400",
    btn: "border border-emerald-400/22 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/18",
    card: "border-emerald-400/16 bg-[linear-gradient(160deg,rgba(5,24,20,0.94)_0%,rgba(5,10,24,0.98)_100%)]",
    glow: "shadow-[0_24px_60px_rgba(52,211,153,0.09)]",
    icon: "",
  },
];

const gameAcc = [
  {
    bar: "bg-cyan-400",
    card: "border-cyan-400/14",
    badge: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
    icon: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
    tag: "border-cyan-400/15 bg-cyan-400/6 text-cyan-400/80",
  },
  {
    bar: "bg-orange-400",
    card: "border-orange-400/14",
    badge: "border-orange-400/20 bg-orange-400/8 text-orange-300",
    icon: "border-orange-400/20 bg-orange-400/8 text-orange-300",
    tag: "border-orange-400/15 bg-orange-400/6 text-orange-400/80",
  },
  {
    bar: "bg-violet-400",
    card: "border-violet-400/14",
    badge: "border-violet-400/20 bg-violet-400/8 text-violet-300",
    icon: "border-violet-400/20 bg-violet-400/8 text-violet-300",
    tag: "border-violet-400/15 bg-violet-400/6 text-violet-400/80",
  },
];

const faqNumColors = [
  "border-cyan-400/20 bg-cyan-400/8 text-cyan-400",
  "border-orange-400/20 bg-orange-400/8 text-orange-400",
  "border-violet-400/20 bg-violet-400/8 text-violet-400",
  "border-emerald-400/20 bg-emerald-400/8 text-emerald-400",
];

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ShieldIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
    </svg>
  );
}

function HomeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      <path d="M3 12 12 4l9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/8 px-4 py-2 text-xs font-black text-cyan-300">
      {children}
    </div>
  );
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const c = planCfg[index] ?? planCfg[0];
  const isFeatured = plan.featured ?? false;

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-5 transition-all duration-300 hover:-translate-y-1 ${c.card} ${c.glow}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${c.bar}`} />

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-2xl">{c.icon}</div>
        <div className={`rounded-full border px-3 py-1 text-xs font-black ${c.badge}`}>
          {plan.badge}
        </div>
      </div>

      <h3 className="mt-5 text-2xl font-black text-white">{plan.name}</h3>

      <p className="mt-3 min-h-[72px] text-sm leading-8 text-white/58">
        {plan.description}
      </p>

      <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4">
        <div className="text-xs font-bold text-white/35">السعر</div>
        <div className={`mt-2 text-4xl font-black ${c.price}`}>{plan.price}</div>
      </div>

      {plan.highlight ? (
        <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/70">
          {plan.highlight}
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {plan.features.map((f) => (
          <div key={f.text} className="flex items-start gap-3">
            <div className={`mt-1 ${c.check}`}>
              <CheckIcon className="h-4 w-4" />
            </div>
            <div className="text-sm leading-7 text-white/70">{f.text}</div>
          </div>
        ))}
      </div>

      <Link
        href={plan.href}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${c.btn}`}
      >
        {plan.cta}
        <ArrowIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

function FaqCard({ item, index }: { item: FaqItem; index: number }) {
  const color = faqNumColors[index % faqNumColors.length];

  return (
    <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-black ${color}`}
        >
          {index + 1}
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-black text-white">{item.question}</h3>
          <div className="mt-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-black text-white/50">
            ج
          </div>
          <p className="mt-3 text-sm leading-8 text-white/58">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(34,211,238,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.35)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="overflow-hidden rounded-[2.6rem] border border-white/10 bg-[linear-gradient(160deg,rgba(7,14,34,0.98)_0%,rgba(3,8,22,0.99)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
          <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="text-sm font-bold text-white/35">
                الرئيسية / الباقات والخطط
              </div>

              <div className="mt-4">
                <SectionBadge>الباقات والأسعار</SectionBadge>
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
                اختر الخطة المناسبة
                <span className="mt-2 block bg-gradient-to-l from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent">
                  لتجربة لمتكم
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-white/58 md:text-base">
                خطط واضحة تناسب الجميع — سواء أردت البدء مجانًا، أو الترقية إلى
                Premium، أو الحصول على VIP، أو شراء ألعاب منفردة للعبة لمتكم.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { label: "ابدأ مجانًا بدون بطاقة", jsx: <ShieldIcon /> },
                  { label: "دفع آمن ومضمون", jsx: <ShieldIcon /> },
                  { label: "3 تجارب لعب متاحة", jsx: <ShieldIcon /> },
                ].map((p) => (
                  <div
                    key={p.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/60"
                  >
                    {p.jsx}
                    {p.label}
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  ابدأ مجانًا
                  <ArrowIcon className="h-4 w-4" />
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]"
                >
                  <HomeIcon className="h-4 w-4" />
                  الرئيسية
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative flex h-[250px] w-[250px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/14 bg-[linear-gradient(160deg,rgba(11,23,49,0.98)_0%,rgba(6,12,28,0.99)_100%)] shadow-[0_26px_70px_rgba(0,0,0,0.32)] sm:h-[290px] sm:w-[290px]">
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_68%)]" />
                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="relative h-[170px] w-[170px] object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.18)] sm:h-[200px] sm:w-[200px]"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 px-6 py-8 md:px-8">
            <div className="mb-6">
              <SectionBadge>الباقات المتاحة</SectionBadge>
              <h2 className="mt-4 text-3xl font-black text-white">
                خطط واضحة تناسب طريقة استخدامك
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-white/58 md:text-base">
                تم تنظيم الخطط لتغطي التجربة الأولى، الاستخدام المستمر، الاستخدام
                الاحترافي، أو شراء ألعاب منفردة حسب الحاجة.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan, i) => (
                <PlanCard key={plan.name} plan={plan} index={i} />
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {[
                { label: "0JD", val: "للتجربة", color: "text-white/60" },
                { label: "10JD", val: "Premium", color: "text-cyan-300" },
                { label: "20JD", val: "VIP", color: "text-violet-300" },
                { label: "1JD / لعبة", val: "مرن", color: "text-emerald-300" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-center"
                >
                  <div className={`text-2xl font-black ${item.color}`}>{item.label}</div>
                  <div className="mt-2 text-sm font-bold text-white/45">{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2.6rem] border border-white/10 bg-[linear-gradient(160deg,rgba(7,14,34,0.98)_0%,rgba(3,8,22,0.99)_100%)] px-6 py-8 shadow-[0_40px_120px_rgba(0,0,0,0.30)] md:px-8">
          <SectionBadge>ماذا تشمل المنصة؟</SectionBadge>
          <h2 className="mt-4 text-3xl font-black text-white">
            المنصة تضم أكثر من تجربة لعب
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-white/58 md:text-base">
            الباقات تخدم استخدام المنصة ككل، مع وجود خيار مستقل أيضًا لشراء ألعاب
            منفردة للعبة لمتكم.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {games.map((item, i) => {
              const a = gameAcc[i] ?? gameAcc[0];
              return (
                <div
                  key={item.title}
                  className={`overflow-hidden rounded-[2rem] border bg-[linear-gradient(160deg,rgba(14,22,46,0.92)_0%,rgba(5,10,24,0.98)_100%)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)] ${a.card}`}
                >
                  <div className={`h-1 w-full rounded-full ${a.bar}`} />
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${a.badge}">
                    داخل المنصة
                  </div>
                  <h3 className="mt-4 text-2xl font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-8 text-white/58">
                    {item.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.points.map((point) => (
                      <div
                        key={point}
                        className={`rounded-full border px-3 py-1 text-xs font-black ${a.tag}`}
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2.6rem] border border-white/10 bg-[linear-gradient(160deg,rgba(7,14,34,0.98)_0%,rgba(3,8,22,0.99)_100%)] px-6 py-8 shadow-[0_40px_120px_rgba(0,0,0,0.30)] md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionBadge>أسئلة شائعة</SectionBadge>
              <h2 className="mt-4 text-3xl font-black text-white">
                كل ما يحتاجه الزائر قبل اختيار الخطة
              </h2>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/55">
              {faqs.length} سؤال
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {faqs.map((item, i) => (
              <FaqCard key={item.question} item={item} index={i} />
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[1.8rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-sm">
          <div className="font-bold text-white/35">
            لمتكم © {new Date().getFullYear()}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-white/45">
            <Link href="/terms" className="transition hover:text-white">
              الشروط
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              الخصوصية
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}