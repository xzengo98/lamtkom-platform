import Link from "next/link";

export const metadata = {
  title: "الدفع | لمتكم",
  description:
    "صفحة الدفع الخاصة بباقات لمتكم، مع خيارات الدفع عبر كليك أو التحويل البنكي.",
};

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

type SearchParams = Promise<{
  plan?: string;
}>;

type PlanCardItem = {
  key: string;
  name: string;
  price: string;
  description: string;
  features: string[];
};

const plans: PlanCardItem[] = [
  {
    key: "featured",
    name: "الخطة المميزة",
    price: "10 JD",
    description:
      "خيار مناسب للمستخدم الذي يريد استخدام المنصة بشكل أوسع وأكثر استمرارية.",
    features: [
      "استخدام أكبر من الخطة المجانية",
      "أنسب للتجربة المستمرة",
      "متابعة الجولات غير المكتملة",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: "20 JD",
    description:
      "خطة أعلى مخصصة لمن يريد تجربة أقوى وأكثر مرونة واستخدامًا متقدمًا.",
    features: [
      "مناسبة للاستخدام المتقدم",
      "مرونة أعلى في التفعيل",
      "أنسب للتوسع أو الاستخدام الاحترافي",
    ],
  },
];

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

function BankIcon() {
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
      <path d="M3 10h18" />
      <path d="M5 10v8" />
      <path d="M10 10v8" />
      <path d="M14 10v8" />
      <path d="M19 10v8" />
      <path d="M2 21h20" />
      <path d="m12 3 9 5H3l9-5Z" />
    </svg>
  );
}

function WalletIcon() {
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
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1H5.5A2.5 2.5 0 0 0 3 10.5v7A2.5 2.5 0 0 0 5.5 20H20a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H5.5" />
      <path d="M16.5 14h.01" />
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

function PlanCard({
  item,
  selected,
}: {
  item: PlanCardItem;
  selected?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.8rem] border p-5 shadow-[0_14px_34px_rgba(0,0,0,0.20)] ${
        selected
          ? "border-cyan-300/20 bg-[linear-gradient(180deg,rgba(14,165,233,0.12)_0%,rgba(6,12,28,0.98)_32%,rgba(6,12,28,0.98)_100%)]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)]"
      }`}
    >
      <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-white/75">
        {selected ? "الخطة المختارة" : "باقة متاحة"}
      </div>

      <h3 className="text-2xl font-black text-white">{item.name}</h3>

      <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-bold text-white/55">السعر</div>
        <div className="mt-1 text-3xl font-black text-cyan-300">
          {item.price}
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-white/70">{item.description}</p>

      <div className="mt-5 space-y-3">
        {item.features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3"
          >
            <div className="mt-0.5 text-cyan-300">
              <CheckIcon />
            </div>
            <div className="text-sm font-bold leading-7 text-white/75">
              {feature}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentMethodCard({
  title,
  subtitle,
  icon,
  content,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
        {icon}
      </div>

      <h3 className="text-2xl font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/65">{subtitle}</p>

      <div className="mt-5">{content}</div>
    </div>
  );
}

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedPlan = String(params.plan ?? "").trim();

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-8 xl:p-10">
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.20)_1px,transparent_1px)] [background-size:26px_26px]" />

          <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
                <SparkIcon />
                <span>صفحة الدفع</span>
              </div>

              <h1 className="text-3xl font-black text-white md:text-5xl">
                اختر باقتك وأكمل الدفع
                <span className="mt-2 block bg-[linear-gradient(90deg,#67e8f9_0%,#c084fc_50%,#fb923c_100%)] bg-clip-text text-transparent">
                  بالطريقة المناسبة لك
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
                هذه الصفحة مخصصة للدفع اليدوي حاليًا لشراء باقات لمتكم، أو شراء
                عدد ألعاب معين للعبة لمتكم، عبر التحويل إلى IBAN للمستخدمين من
                خارج الأردن، أو عبر كليك للمستخدمين داخل الأردن.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  الرجوع للباقات
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  تواصل معنا
                </Link>
              </div>
            </div>

            <div className="flex justify-center xl:justify-end">
              <div className="relative flex h-[260px] w-[260px] items-center justify-center overflow-hidden rounded-[2.2rem] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(15,26,55,0.96)_0%,rgba(8,16,36,0.96)_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:h-[320px] md:w-[320px]">
                <div className="absolute inset-0 rounded-[inherit] border border-white/5" />
                <img
                  src={heroLogo}
                  alt="شعار لمتكم"
                  className="h-[170px] w-[170px] object-contain md:h-[230px] md:w-[230px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="mb-10">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              الباقات المتاحة للدفع
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              اختر الخطة التي تريد تفعيلها
            </h2>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard
                key={plan.key}
                item={plan}
                selected={selectedPlan === plan.key}
              />
            ))}
          </div>
        </section>

        {/* Single game purchase */}
        <section className="mb-10 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
            شراء ألعاب لمتكم
          </div>

          <h2 className="text-2xl font-black text-white">
            شراء عدد ألعاب معين للعبة لمتكم
          </h2>

          <p className="mt-3 text-sm leading-8 text-white/72 md:text-base">
            إذا كنت لا تريد شراء باقة كاملة، يمكنك شراء عدد ألعاب معين خاص بلعبة
            لمتكم فقط.
          </p>

          <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-bold text-white/55">السعر</div>
            <div className="mt-1 text-3xl font-black text-cyan-300">
              1 JD لكل لعبة واحدة
            </div>
            <p className="mt-3 text-sm leading-7 text-white/70">
              عند الدفع اذكر في رسالتك عدد الألعاب التي تريد شراءها ليتم تفعيلها
              لك داخل النظام.
            </p>
          </div>
        </section>

        {/* Payment methods */}
        <section className="grid gap-6 xl:grid-cols-2">
          <PaymentMethodCard
            title="الدفع عبر كليك"
            subtitle="للمستخدمين داخل الأردن"
            icon={<WalletIcon />}
            content={
              <div className="space-y-4">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-bold text-white/55">
                    اسم المستفيد
                  </div>
                  <div className="mt-1 text-lg font-black text-white">
                    Lamtkom
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-bold text-white/55">
                    رقم كليك
                  </div>
                  <div className="mt-1 text-lg font-black text-cyan-300">
                    079 0000 000
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm leading-7 text-cyan-100">
                  بعد الدفع عبر كليك، أرسل لنا:
                  <div className="mt-3 space-y-2">
                    <div>• لقطة شاشة لعملية الدفع</div>
                    <div>• اسم المستخدم الخاص بك داخل الموقع</div>
                    <div>• الإيميل الخاص بك داخل الموقع</div>
                    <div>• اسم الخطة التي قمت بشرائها</div>
                    <div>• أو عدد الألعاب إذا كان الشراء لألعاب لمتكم</div>
                  </div>
                </div>
              </div>
            }
          />

          <PaymentMethodCard
            title="التحويل البنكي"
            subtitle="للمستخدمين من خارج الأردن"
            icon={<BankIcon />}
            content={
              <div className="space-y-4">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-bold text-white/55">
                    اسم المستفيد
                  </div>
                  <div className="mt-1 text-lg font-black text-white">
                    Lamtkom
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-bold text-white/55">IBAN</div>
                  <div className="mt-1 break-all text-lg font-black text-cyan-300">
                    JO00 0000 0000 0000 0000 0000 000
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm leading-7 text-cyan-100">
                  بعد التحويل البنكي، أرسل لنا:
                  <div className="mt-3 space-y-2">
                    <div>• لقطة شاشة / إثبات التحويل</div>
                    <div>• اسم المستخدم الخاص بك داخل الموقع</div>
                    <div>• الإيميل الخاص بك داخل الموقع</div>
                    <div>• اسم الخطة التي قمت بشرائها</div>
                    <div>• أو عدد الألعاب إذا كان الشراء لألعاب لمتكم</div>
                  </div>
                </div>
              </div>
            }
          />
        </section>

        {/* Confirmation note */}
        <section className="mt-8 rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <h3 className="text-xl font-black text-white">
            ملاحظة مهمة لتأكيد عملية الدفع
          </h3>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/70">
              بعد الدفع قم بإرسال <span className="font-black text-white">لقطة شاشة</span>{" "}
              أو إثبات العملية.
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/70">
              داخل الرسالة اذكر:
              <div className="mt-2 font-black text-white">
                اسم المستخدم + الإيميل داخل الموقع
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/70">
              اذكر أيضًا:
              <div className="mt-2 font-black text-white">
                الخطة المشتراة أو عدد الألعاب المطلوبة
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-cyan-300/20 bg-cyan-400/10 p-5 text-sm leading-8 text-cyan-100">
            لإتمام التفعيل بشكل صحيح، يجب أن ترسل هذه المعلومات إلى{" "}
            <span className="font-black">الواتساب</span> أو{" "}
            <span className="font-black">الإيميل</span>:
            <div className="mt-3 space-y-2">
              <div>• اسم المستخدم الخاص بك داخل الموقع</div>
              <div>• الإيميل الخاص بك داخل الموقع</div>
              <div>• اسم الخطة التي اشتريتها (الخطة المميزة أو Premium)</div>
              <div>• أو عدد الألعاب إذا كان الشراء لألعاب لمتكم</div>
              <div>• لقطة شاشة / سكرين شوت لعملية الدفع</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              التواصل لتأكيد الدفع
              <ArrowLeftIcon />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              الرجوع للباقات
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}