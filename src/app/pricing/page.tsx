import Link from "next/link";

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
  accent: "basic" | "pro" | "events";
};

const plans: Plan[] = [
  {
    name: "الأساسي",
    price: "0",
    period: "ريال / شهرياً",
    description: "مجاني بالكامل للبدء",
    cta: "ابدأ مجاناً",
    href: "/register",
    accent: "basic",
    features: [
      "الوصول للألعاب الأساسية الـ 3",
      "لعب غير محدود",
      "تحديثات المحتوى الشهرية",
      "إنشاء فئات وأسئلة خاصة",
      "إزالة العلامة المائية للمنصة",
    ],
  },
  {
    name: "برو",
    price: "29",
    period: "ريال / شهرياً",
    description: "للتجمعات الدائمة والمميزة",
    cta: "اشترك الآن",
    href: "/payment?plan=pro",
    featured: true,
    accent: "pro",
    features: [
      "كل مميزات الأساسي",
      "إنشاء فئات وأسئلة مخصصة (Custom)",
      "حفظ نتائج الجولات وتاريخ الفرق",
      "أولوية الوصول للألعاب الجديدة",
      "بدون إعلانات",
    ],
  },
  {
    name: "الفعاليات",
    price: "99",
    period: "ريال / شهرياً",
    description: "للشركات والمبادرات والمدارس",
    cta: "تواصل للمبيعات",
    href: "/contact",
    accent: "events",
    features: [
      "كل مميزات برو",
      "استبدال الشعار بلوجو شركتك",
      "تخصيص ألوان المنصة لهويتك",
      "دعم فني مخصص",
      "شاشات توقف وإعلانات خاصة بين الجولات",
    ],
  },
];

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const isBasic = plan.accent === "basic";
  const isPro = plan.accent === "pro";
  const isEvents = plan.accent === "events";

  const cardClasses = isPro
    ? "border-violet-400/50 bg-[linear-gradient(180deg,rgba(33,28,64,0.96)_0%,rgba(8,12,30,0.98)_100%)] shadow-[0_25px_80px_rgba(139,92,246,0.18)]"
    : isEvents
      ? "border-white/10 bg-[linear-gradient(180deg,rgba(8,10,28,0.98)_0%,rgba(3,6,18,0.98)_100%)]"
      : "border-white/10 bg-[linear-gradient(180deg,rgba(8,10,28,0.98)_0%,rgba(3,6,18,0.98)_100%)]";

  const titleColor = isPro
    ? "text-violet-300"
    : isEvents
      ? "text-white"
      : "text-white";

  const buttonClasses = isPro
    ? "bg-[linear-gradient(90deg,#9b87f5_0%,#22d3ee_100%)] text-slate-950 hover:opacity-95"
    : "border border-white/10 bg-transparent text-white hover:bg-white/[0.04]";

  const iconColor = isPro
    ? "text-violet-300"
    : isEvents
      ? "text-violet-300"
      : "text-violet-300";

  return (
    <article
      className={[
        "relative flex h-full flex-col rounded-[28px] border px-7 pb-6 pt-10 transition duration-300",
        "hover:-translate-y-1",
        cardClasses,
      ].join(" ")}
    >
      {plan.featured ? (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-full bg-[linear-gradient(90deg,#a78bfa_0%,#22d3ee_100%)] px-5 py-2 text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(34,211,238,0.20)]">
            الأكثر شعبية
          </div>
        </div>
      ) : null}

      <div className="text-center">
        <h3 className={`text-[2rem] font-black ${titleColor}`}>{plan.name}</h3>

        <div className="mt-5 flex items-end justify-center gap-2">
          <span className="text-6xl font-black leading-none text-white">{plan.price}</span>
        </div>

        <p className="mt-2 text-xl font-semibold text-white/70">{plan.period}</p>
        <p className="mt-4 text-lg text-white/72">{plan.description}</p>
      </div>

      <div className="mt-10 space-y-5">
        {plan.features.map((feature, index) => {
          const isDisabled = isBasic && index >= 3;

          return (
            <div key={feature} className="flex items-start justify-between gap-4 text-right">
              <span
                className={[
                  "text-[1.12rem] leading-8",
                  isDisabled ? "text-white/45" : "text-white/92",
                ].join(" ")}
              >
                {feature}
              </span>

              <span className={`mt-1 shrink-0 ${isDisabled ? "text-white/40" : iconColor}`}>
                {isDisabled ? <XIcon /> : <CheckIcon />}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <Link
          href={plan.href}
          className={[
            "inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-xl font-black transition",
            buttonClasses,
          ].join(" ")}
        >
          {plan.cta}
        </Link>
      </div>
    </article>
  );
}

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.22),transparent_35%),radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_45%),linear-gradient(180deg,rgba(2,6,23,0.94),rgba(1,4,14,1))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.08]" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
            باقات تناسب كل جمعة
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70 sm:text-2xl">
            اختر الباقة المناسبة لاحتياجك. ابدأ مجاناً، ورقّي حسابك لمميزات أكثر وتخصيص أعلى.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          <div className="order-2 lg:order-1">
            <PlanCard plan={plans[2]} />
          </div>

          <div className="order-1 lg:order-2">
            <PlanCard plan={plans[1]} />
          </div>

          <div className="order-3 lg:order-3">
            <PlanCard plan={plans[0]} />
          </div>
        </div>
      </section>
    </main>
  );
}