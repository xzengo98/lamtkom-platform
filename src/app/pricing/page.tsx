import Link from "next/link";

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

const plans: Plan[] = [
  {
    name: "الخطة المجانية",
    badge: "للتجربة",
    price: "0 JD",
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
    price: "10 JD",
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
    name: "Premium",
    badge: "للاستخدام الاحترافي",
    price: "سيتم تحديده لاحقًا",
    description:
      "خيار احترافي مرن للجهات أو الاستخدام المتقدم، ويمكنك تعديل ميزاته وتسعيره لاحقًا حسب ما يناسبك.",
    cta: "تواصل معنا",
    href: "/signup",
    features: [
      { text: "مناسب للجهات أو الاستخدام المتقدم" },
      { text: "مرونة أكبر في طريقة التفعيل" },
      { text: "جاهز للتخصيص لاحقًا حسب احتياجك" },
      { text: "أنسب للتوسع أو التشغيل المنظم" },
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
    >
      <path d="m5 12 5 5L20 7" />
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
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)] ${
        plan.featured
          ? "border-cyan-300/20 bg-[linear-gradient(180deg,rgba(14,165,233,0.12)_0%,rgba(6,12,28,0.98)_32%,rgba(6,12,28,0.98)_100%)]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)]"
      }`}
    >
      {plan.featured ? (
        <div className="mb-4 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-100">
          الأكثر توازنًا
        </div>
      ) : null}

      <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-white/75">
        {plan.badge}
      </div>

      <h3 className="text-2xl font-black text-white">{plan.name}</h3>

      <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-bold text-white/55">السعر</div>
        <div className="mt-1 text-3xl font-black text-cyan-300">{plan.price}</div>
      </div>

      <p className="mt-4 text-sm leading-7 text-white/70">{plan.description}</p>

      {plan.highlight ? (
        <div className="mt-4 rounded-[1.2rem] border border-cyan-300/15 bg-cyan-400/10 p-3 text-sm font-bold text-cyan-100">
          {plan.highlight}
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {plan.features.map((feature) => (
          <div
            key={feature.text}
            className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3"
          >
            <div className="mt-0.5 text-cyan-300">
              <CheckIcon />
            </div>
            <div className="text-sm font-bold leading-7 text-white/75">
              {feature.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href={plan.href}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black transition ${
            plan.featured
              ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
          }`}
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
    <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.20)]">
      <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-100">
        داخل المنصة
      </div>

      <h3 className="text-xl font-black text-white">{item.title}</h3>

      <p className="mt-3 text-sm leading-7 text-white/70">{item.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.points.map((point) => (
          <span
            key={point}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-white/75"
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
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
      <h3 className="text-lg font-black text-white">{item.question}</h3>
      <p className="mt-3 text-sm leading-7 text-white/70">{item.answer}</p>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <section className="mb-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-8">
          <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
            الباقات والخطط
          </div>

          <h1 className="text-3xl font-black text-white md:text-5xl">
            اختر الخطة المناسبة لتجربة لمتكم
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-white/70 md:text-base">
            هذه الصفحة مصممة لتشرح الباقات بشكل منطقي ومهني، وتعرض قيمة المنصة
            الحقيقية للمستخدم سواء كان يريد تجربة سريعة، استخدامًا مستمرًا، أو
            تشغيل الألعاب بطريقة منظمة.
          </p>

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              العودة للرئيسية
            </Link>
          </div>
        </section>

        <section className="mb-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 inline-flex text-cyan-300">
                <SparkIcon />
              </div>
              <div className="text-sm font-black text-cyan-300">يشمل</div>
              <div className="mt-2 text-xl font-black text-white">
                أكثر من تجربة لعب داخل نفس المنصة
              </div>
              <p className="mt-3 text-sm leading-7 text-white/70">
                صفحة الباقات لا تتكلم عن لعبة واحدة فقط، بل عن قيمة الموقع كمنصة
                ألعاب عربية تفاعلية.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 inline-flex text-cyan-300">
                <SparkIcon />
              </div>
              <div className="text-sm font-black text-cyan-300">مناسبة لـ</div>
              <div className="mt-2 text-xl font-black text-white">
                الأفراد والمجموعات والفعاليات
              </div>
              <p className="mt-3 text-sm leading-7 text-white/70">
                سواء كنت تريد اللعب بشكل شخصي أو تقديم تجربة أمام جمهور، الصفحة
                تشرح ذلك بوضوح وبدون مبالغة.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
              <div className="mb-2 inline-flex text-cyan-300">
                <SparkIcon />
              </div>
              <div className="text-sm font-black text-cyan-300">تنظيم أوضح</div>
              <div className="mt-2 text-xl font-black text-white">
                خطط مرتبة وسهلة المقارنة
              </div>
              <p className="mt-3 text-sm leading-7 text-white/70">
                تم ترتيب الباقات بشكل يساعد الزائر على فهم الفرق بينها بسرعة ومن
                دون تشتيت.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              الباقات المتاحة
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              خطط واضحة تناسب طريقة استخدامك
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
              يمكنك تعديل الميزات لاحقًا بسهولة، لكن الهيكل الآن صار أوضح: خطة
              مجانية، خطة مميزة، وخطة Premium.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              ماذا تشمل المنصة؟
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              صفحة باقات تخدم كل أجزاء الموقع
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
              تم بناء المحتوى ليعكس طبيعة موقعك الفعلية: ألعاب، حساب مستخدم،
              متابعة الجولات، واستخدام مناسب للأفراد والفعاليات.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {games.map((item) => (
              <GameCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              أسئلة شائعة
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              كل ما يحتاجه الزائر قبل اختيار الخطة
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <FaqCard key={item.question} item={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}