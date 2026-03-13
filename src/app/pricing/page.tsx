import Link from "next/link";

const plans = [
  {
    name: "مجاني",
    badge: "للتجربة",
    price: "0",
    period: "مدى الحياة",
    description: "مناسب لتجربة المنصة والبدء بجلسات خفيفة مع العائلة أو الأصدقاء.",
    features: [
      "إنشاء عدد محدود من الألعاب",
      "الوصول إلى الفئات العامة المتاحة",
      "حفظ التقدم في الألعاب النشطة",
      "واجهة لعب كاملة بدون تكلفة",
    ],
    limitations: [
      "عدد ألعاب محفوظة أقل",
      "مميزات مخصصة أقل من الباقات الأعلى",
    ],
    cta: "ابدأ مجانًا",
    href: "/register",
    highlighted: false,
  },
  {
    name: "بريميوم",
    badge: "الأكثر طلبًا",
    price: "5",
    period: "مدى الحياة",
    description: "أفضل خيار للمستخدمين النشطين الذين يريدون مرونة أكبر وتجربة أقوى.",
    features: [
      "إنشاء ألعاب أكثر بشكل شهري",
      "حفظ عدد أكبر من الألعاب غير المكتملة",
      "وصول أسرع للمميزات الجديدة",
      "أولوية أفضل في الدعم",
      "تجربة لعب موسعة للعائلة والمجموعات",
    ],
    limitations: [],
    cta: "اشترك الآن",
    href: "/register",
    highlighted: true,
  },
  {
    name: "VIP",
    badge: "للمجموعات والفعاليات",
    price: "10",
    period: "مدى الحياة",
    description: "مناسب للجهات، المناسبات، والمستخدمين الذين يحتاجون أعلى سعة وتجربة مميزة.",
    features: [
      "عدد كبير من الألعاب شهريًا",
      "حفظ موسع جدًا للألعاب",
      "أولوية قصوى في الدعم",
      "مميزات متقدمة تُفعّل أولًا",
      "أفضل تجربة للاستخدام المستمر أو الفعاليات",
    ],
    limitations: [],
    cta: "ابدأ مع VIP",
    href: "/register",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "هل يمكنني تغيير الباقة لاحقًا؟",
    a: "نعم، يمكنك الترقية أو تغيير الباقة لاحقًا .",
  },
  {
    q: "هل الباقة المجانية كافية للتجربة؟",
    a: "نعم، الباقة المجانية مناسبة جدًا للتجربة الأولى واكتشاف طريقة اللعب والمنصة.",
  },
  {
    q: "هل الأسعار نهائية؟",
    a: "هذه الأسعار ثابتة ومدروسة من قبل ادارة المنصة وبعض الاحيان يتوفر عروض وخصومات.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1 text-sm">
            الباقات
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            اختر الباقة المناسبة لك
          </h1>
          <p className="mt-4 text-base leading-8 text-white/70 sm:text-lg">
            باقات واضحة وبسيطة بدون نصوص متناقضة، لتناسب الاستخدام الفردي أو العائلي أو الفعاليات.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={[
                "rounded-3xl border p-6 shadow-xl",
                plan.highlighted
                  ? "border-white/30 bg-white/10 ring-1 ring-white/20"
                  : "border-white/10 bg-white/5",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  <p className="mt-1 text-sm text-white/60">{plan.description}</p>
                </div>
                <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs">
                  {plan.badge}
                </span>
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="mb-1 text-white/70">JD</span>
              </div>
              <p className="mt-1 text-sm text-white/50">{plan.period}</p>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-white/80">تشمل الباقة:</h3>
                <ul className="mt-3 space-y-2 text-sm text-white/75">
                  {plan.features.map((feature) => (
                    <li key={feature} className="rounded-xl bg-black/20 px-3 py-2">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-white/80">ملاحظات:</h3>
                  <ul className="mt-3 space-y-2 text-sm text-white/55">
                    {plan.limitations.map((item) => (
                      <li key={item} className="rounded-xl border border-white/10 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Link
                href={plan.href}
                className={[
                  "mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  plan.highlighted
                    ? "bg-white text-black hover:opacity-90"
                    : "border border-white/15 bg-transparent hover:bg-white/10",
                ].join(" ")}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">الأسئلة الشائعة</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm leading-7 text-white/70">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}