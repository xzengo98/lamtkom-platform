import Link from "next/link";

type PlanFeature = {
  text: string;
};

type Plan = {
  name: string;
  badge: string;
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

const plans: Plan[] = [
  {
    name: "الخطة المجانية",
    badge: "للتجربة",
    description:
      "مناسبة لتجربة المنصة والتعرّف على طريقة اللعب والتنقل بين الصفحات قبل التوسع.",
    cta: "ابدأ مجانًا",
    href: "/signup",
    features: [
      { text: "إنشاء حساب والبدء مباشرة" },
      { text: "الوصول لتجربة المنصة الأساسية" },
      { text: "مناسبة للتجربة الفردية أو الأولى" },
      { text: "إمكانية متابعة الألعاب غير المكتملة من الحساب" },
    ],
  },
  {
    name: "الخطة المميزة",
    badge: "الأكثر طلبًا",
    description:
      "أفضل خيار للمستخدم الذي يريد لعبًا أكثر، تجربة أكثر استمرارية، واستخدامًا فعليًا للمنصة بشكل متكرر.",
    highlight: "مناسبة للأفراد والمجموعات الصغيرة والمهتمين بالاستخدام المستمر",
    cta: "استعرض خيارات التفعيل",
    href: "/signup",
    featured: true,
    features: [
      { text: "عدد ألعاب أكبر بحسب التفعيل" },
      { text: "أنسب للتجربة المستمرة وليس التجريب فقط" },
      { text: "متابعة الجولات غير المكتملة بسهولة" },
      { text: "استفادة أفضل من كامل تجربة الموقع والألعاب" },
    ],
  },
  {
    name: "الفعاليات والجهات",
    badge: "للمدارس والشركات",
    description:
      "حل مخصص للمدارس والفعاليات والمناسبات والجهات التي تريد استخدام المنصة ضمن تجربة جماعية أو عرض مباشر.",
    cta: "تواصل معنا",
    href: "/signup",
    features: [
      { text: "مناسبة للعروض الجماعية والمسابقات" },
      { text: "أنسب للمدارس والأنشطة والفعاليات" },
      { text: "إمكانية الاستخدام بطريقة منظمة أمام الحضور" },
      { text: "حل مرن بحسب طبيعة المناسبة أو الجهة" },
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
    title: "تجربة حساب متكاملة",
    description:
      "صفحة الحساب تساعد المستخدم على الرجوع إلى الألعاب غير المكتملة ومتابعة اللعب بدون فقدان التقدم.",
    points: ["متابعة الألعاب", "تنظيم أوضح", "سهولة الرجوع", "استخدام يومي أفضل"],
  },
];

const faqs: FaqItem[] = [
  {
    question: "هل أحتاج الدفع قبل تجربة الموقع؟",
    answer:
      "لا، يمكن بدء التجربة أولًا، وبعدها اختيار ما يناسبك إذا أردت استخدامًا أكبر أو أكثر استمرارية.",
  },
  {
    question: "هل الباقات مخصصة للعبة واحدة فقط؟",
    answer:
      "لا، الصفحة مبنية لتخدم المنصة ككل، بما يشمل الألعاب الحالية داخل الموقع وتجربة الحساب المرتبطة بها.",
  },
  {
    question: "هل المنصة مناسبة للمدارس أو المناسبات؟",
    answer:
      "نعم، تصميم المنصة مناسب للعروض والمسابقات والأنشطة الجماعية، خصوصًا عند تشغيلها أمام جمهور أو داخل فعالية.",
  },
  {
    question: "هل أستطيع الرجوع إلى لعبة لم تنتهِ؟",
    answer:
      "نعم، الألعاب غير المكتملة يمكن متابعتها لاحقًا من صفحة الحساب طالما كانت محفوظة ضمن حسابك.",
  },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={[
        "relative flex h-full flex-col rounded-[28px] border p-6 shadow-[0_18px_60px_rgba(15,23,42,0.28)] backdrop-blur",
        plan.featured
          ? "border-cyan-400/30 bg-gradient-to-b from-cyan-500/10 via-slate-900/95 to-slate-950/95"
          : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      {plan.featured ? (
        <div className="absolute inset-x-6 -top-3">
          <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/15 px-4 py-1 text-xs font-extrabold text-cyan-200">
            الأكثر توازنًا
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-200">
            {plan.badge}
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            {plan.name}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {plan.description}
          </p>
        </div>

        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
            plan.featured
              ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-200"
              : "border-white/10 bg-white/5 text-slate-200",
          ].join(" ")}
        >
          <SparkIcon />
        </div>
      </div>

      {plan.highlight ? (
        <div className="mb-6 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 px-4 py-3 text-sm leading-7 text-cyan-100">
          {plan.highlight}
        </div>
      ) : null}

      <div className="mb-6 space-y-3">
        {plan.features.map((feature) => (
          <div
            key={feature.text}
            className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/15 px-4 py-3"
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <CheckIcon />
            </div>
            <p className="text-sm leading-7 text-slate-200">{feature.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <Link
          href={plan.href}
          className={[
            "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-extrabold transition",
            plan.featured
              ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              : "border border-white/10 bg-white/5 text-white hover:bg-white/10",
          ].join(" ")}
        >
          {plan.cta}
          <ArrowLeftIcon />
        </Link>
      </div>
    </div>
  );
}

function GameCard({ item }: { item: GameCard }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.22)] backdrop-blur">
      <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
        داخل المنصة
      </div>

      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.points.map((point) => (
          <span
            key={point}
            className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-200"
          >
            {point}
          </span>
        ))}
      </div>
    </div>
  );
}

function FaqCard({ item }: { item: FaqItem }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <h3 className="text-base font-extrabold text-white">{item.question}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{item.answer}</p>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_25%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#020617_100%)] text-white">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(2,6,23,0.55)] backdrop-blur">
          <div className="grid gap-10 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-extrabold text-cyan-100">
                الباقات والخطط
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                اختر الخطة المناسبة لتجربة <span className="text-cyan-300">لمّتنا</span>
                <br />
                واستفد من جميع ألعاب المنصة بشكل أوضح وأفضل
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                هذه الصفحة مصممة لتشرح الباقات بشكل منطقي ومهني، وتعرض قيمة المنصة
                الحقيقية للمستخدم سواء كان يريد تجربة سريعة، استخدامًا مستمرًا،
                أو تشغيل الألعاب داخل مدرسة أو فعالية أو مناسبة خاصة.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-base font-extrabold text-slate-950 transition hover:bg-cyan-300"
                >
                  ابدأ الآن
                  <ArrowLeftIcon />
                </Link>

                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-base font-bold text-white transition hover:bg-white/10"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                <div className="text-sm font-bold text-slate-400">يشمل</div>
                <div className="mt-2 text-xl font-black text-white">
                  أكثر من تجربة لعب داخل نفس المنصة
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  صفحة الباقات لا تتكلم عن لعبة واحدة فقط، بل عن قيمة الموقع كمنصة
                  ألعاب عربية تفاعلية.
                </p>
              </div>

              <div className="rounded-[28px] border border-cyan-300/15 bg-cyan-400/10 p-5">
                <div className="text-sm font-bold text-cyan-100">مناسبة لـ</div>
                <div className="mt-2 text-xl font-black text-white">
                  الأفراد والمجموعات والفعاليات
                </div>
                <p className="mt-3 text-sm leading-7 text-cyan-50/90">
                  سواء كنت تريد اللعب بشكل شخصي أو تقديم تجربة أمام جمهور، الصفحة
                  تشرح ذلك بوضوح وبدون مبالغة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-slate-200">
            الباقات المتاحة
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            خطط واضحة تناسب طريقة استخدامك
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
            بدلاً من عرض كلام عام، تم تنظيم الباقات هنا لتخدم المستخدم الحقيقي:
            تجربة أولى، استخدام أكبر، أو تشغيل احترافي للمنصة في الجهات والأنشطة.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-slate-200">
            ماذا تشمل المنصة؟
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            صفحة باقات تخدم كل أجزاء الموقع
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
            تم بناء المحتوى ليعكس طبيعة موقعك الفعلية: ألعاب، حساب مستخدم، متابعة
            الجولات، واستخدام مناسب للأفراد والفعاليات.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {games.map((item) => (
            <GameCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-r from-white/5 to-cyan-400/10 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.24)] lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-slate-200">
                لماذا هذه الصفحة أفضل؟
              </div>
              <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                لأنها تشرح الفائدة الفعلية للمستخدم بدل النصوص العامة
              </h2>
              <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">
                الصفحة الجديدة تبيع الفكرة بشكل محترف: ما الذي سيأخذه المستخدم،
                لمن تناسب كل خطة، وما قيمة المنصة له سواء كان زائرًا جديدًا أو
                مستخدمًا مستمرًا أو جهة تريد تجربة جماعية.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5">
                <div className="text-3xl font-black text-white">واجهة أوضح</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  تسلسل منطقي من التعريف إلى الباقات ثم قيمة المنصة.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5">
                <div className="text-3xl font-black text-white">كلام واقعي</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  بدون حشو أو وعود مبالغ فيها أو كلام لا يخص موقعك.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5">
                <div className="text-3xl font-black text-white">ستايل موحد</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  نفس الهوية البصرية الداكنة والبطاقات الحديثة الموجودة في الموقع.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5">
                <div className="text-3xl font-black text-white">جاهزة للتطوير</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  ويمكن لاحقًا ربطها بأسعار فعلية أو الدفع عند تجهيز النظام.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-slate-200">
            أسئلة شائعة
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            كل ما يحتاجه الزائر قبل اختيار الخطة
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <FaqCard key={item.question} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-cyan-300/15 bg-gradient-to-br from-cyan-400/10 via-slate-900/95 to-slate-950/95 p-8 text-center shadow-[0_20px_80px_rgba(8,47,73,0.35)]">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-extrabold text-cyan-100">
            ابدأ الآن
          </div>

          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">
            جاهز تبدأ تجربتك داخل المنصة؟
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
            اختر الخطة المناسبة وابدأ اللعب، أو أنشئ حسابك أولًا وجرّب المنصة بنفسك
            ثم انتقل للخيار الأنسب لك لاحقًا.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 text-base font-extrabold text-slate-950 transition hover:bg-cyan-300"
            >
              إنشاء حساب
              <ArrowLeftIcon />
            </Link>

            <Link
              href="/game/start"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-base font-bold text-white transition hover:bg-white/10"
            >
              الذهاب إلى اللعب
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}