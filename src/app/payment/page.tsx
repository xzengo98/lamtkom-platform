import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الدفع | لمتكم",
  description:
    "صفحة الدفع الخاصة بباقات لمتكم، مع خيارات الدفع عبر كليك أو التحويل البنكي.",
};

const heroLogo = "/logo.png";

type SearchParams = Promise<{
  plan?: string;
}>;

type PlanCardItem = {
  key: string;
  name: string;
  price: string;
  description: string;
  highlight?: string;
  features: string[];
  tone: "cyan" | "violet" | "emerald";
};

const plans: PlanCardItem[] = [
  {
    key: "featured",
    name: "الخطة المميزة",
    price: "10 JD",
    description:
      "خيار مناسب للمستخدم الذي يريد استخدام المنصة بشكل أوسع وأكثر استمرارية.",
    highlight: "الخيار الأنسب لمعظم المستخدمين",
    features: [
      "استخدام أكبر من الخطة المجانية",
      "أنسب للتجربة المستمرة",
      "متابعة الجولات غير المكتملة",
      "تفعيل أفضل لتجربة المنصة",
    ],
    tone: "cyan",
  },
  {
    key: "premium",
    name: "Premium",
    price: "20 JD",
    description:
      "خطة أعلى مخصصة لمن يريد تجربة أقوى وأكثر مرونة واستخدامًا متقدمًا.",
    highlight: "خطة أعلى للاستخدام المكثف والاحترافي",
    features: [
      "مناسبة للاستخدام المتقدم",
      "مرونة أعلى في التفعيل",
      "أنسب للتوسع أو الاستخدام الاحترافي",
      "استفادة أكبر من كامل المنصة",
    ],
    tone: "violet",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-extrabold tracking-[0.2em] text-white/55">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
}

function SparkIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function BankIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M3 10 12 4l9 6" />
      <path d="M5 10v8" />
      <path d="M10 10v8" />
      <path d="M14 10v8" />
      <path d="M19 10v8" />
      <path d="M3 20h18" />
    </svg>
  );
}

function WalletIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M16 12h.01" />
      <path d="M3 9h18" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
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

function HomeIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  );
}

function MessageIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M6 18l-2 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6Z" />
    </svg>
  );
}

function getPlanStyles(tone: PlanCardItem["tone"], selected: boolean) {
  const map = {
    cyan: {
      bar: "bg-cyan-400",
      badge: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
      price: "text-cyan-300",
      bullet: "text-cyan-400",
      card: selected
        ? "border-cyan-400/30 bg-[linear-gradient(160deg,rgba(14,32,62,0.98)_0%,rgba(6,12,28,0.99)_100%)] shadow-[0_24px_64px_rgba(34,211,238,0.10)]"
        : "border-cyan-400/15 bg-[linear-gradient(160deg,rgba(14,28,56,0.94)_0%,rgba(6,12,28,0.98)_100%)] shadow-[0_20px_50px_rgba(34,211,238,0.08)]",
      glow: "bg-cyan-500/10",
    },
    violet: {
      bar: "bg-violet-400",
      badge: "border-violet-400/25 bg-violet-400/10 text-violet-300",
      price: "text-violet-300",
      bullet: "text-violet-400",
      card: selected
        ? "border-violet-400/30 bg-[linear-gradient(160deg,rgba(24,16,64,0.98)_0%,rgba(6,12,28,0.99)_100%)] shadow-[0_24px_64px_rgba(139,92,246,0.10)]"
        : "border-violet-400/15 bg-[linear-gradient(160deg,rgba(22,14,52,0.94)_0%,rgba(6,12,28,0.98)_100%)] shadow-[0_20px_50px_rgba(139,92,246,0.08)]",
      glow: "bg-violet-500/10",
    },
    emerald: {
      bar: "bg-emerald-400",
      badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
      price: "text-emerald-300",
      bullet: "text-emerald-400",
      card: selected
        ? "border-emerald-400/30 bg-[linear-gradient(160deg,rgba(8,32,26,0.98)_0%,rgba(6,12,28,0.99)_100%)] shadow-[0_24px_64px_rgba(52,211,153,0.10)]"
        : "border-emerald-400/15 bg-[linear-gradient(160deg,rgba(8,32,26,0.94)_0%,rgba(6,12,28,0.98)_100%)] shadow-[0_20px_50px_rgba(52,211,153,0.08)]",
      glow: "bg-emerald-500/10",
    },
  };

  return map[tone];
}

function PlanCard({
  item,
  selected,
}: {
  item: PlanCardItem;
  selected?: boolean;
}) {
  const styles = getPlanStyles(item.tone, Boolean(selected));

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1",
        styles.card,
      )}
    >
      <div className={cn("h-[2px] w-full", styles.bar)} />
      <div className={cn("pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-full blur-3xl", styles.glow)} />

      <div className="relative flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black",
              styles.badge,
            )}
          >
            {selected ? "الخطة المختارة" : "باقة متاحة"}
          </span>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/50">
            دفع يدوي
          </span>
        </div>

        <h3 className="mt-5 text-2xl font-black text-white">{item.name}</h3>

        <div className="mt-5">
          <div className="text-xs font-bold text-white/35">السعر</div>
          <div className={cn("mt-2 text-4xl font-black", styles.price)}>
            {item.price}
          </div>
        </div>

        <p className="mt-4 text-sm leading-8 text-white/62">
          {item.description}
        </p>

        {item.highlight ? (
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/75">
            {item.highlight}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {item.features.map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.03] px-4 py-3"
            >
              <CheckIcon className={cn("mt-0.5 h-4 w-4 shrink-0", styles.bullet)} />
              <span className="text-sm leading-7 text-white/72">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
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
  icon: ReactNode;
  content: ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-2xl font-black text-white">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-white/55">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6">{content}</div>
    </article>
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
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#030712_0%,#07101f_38%,#030712_100%)] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.09),transparent_24%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.10),transparent_22%),linear-gradient(180deg,#040816_0%,#07101f_40%,#030712_100%)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-4 pb-10 pt-6 md:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl overflow-hidden rounded-[2.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-6 py-12 shadow-[0_40px_120px_rgba(0,0,0,0.40)] sm:px-10 sm:py-14 lg:px-12">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/6 to-transparent" />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
            <div>
              <SectionBadge>صفحة الدفع</SectionBadge>

              <h1 className="mt-6 text-3xl font-black leading-[1.15] text-white sm:text-5xl lg:text-6xl">
                اختر باقتك وأكمل الدفع
                <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent">
                  بالطريقة المناسبة لك
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-sm font-bold leading-8 text-white/72 sm:text-lg sm:leading-9">
                هذه الصفحة مخصصة للدفع اليدوي حاليًا لشراء باقات لمتكم، أو شراء عدد
                ألعاب معين للعبة لمتكم، عبر التحويل إلى IBAN للمستخدمين من خارج
                الأردن، أو عبر كليك للمستخدمين داخل الأردن.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/[0.10]"
                >
                  الرجوع للباقات
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-3.5 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/15"
                >
                  تواصل معنا
                  <MessageIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.30)]">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-black text-cyan-300">
                  <SparkIcon className="h-4 w-4" />
                  دفع آمن وواضح
                </div>

                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="mx-auto mt-6 h-28 w-auto object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.30)] sm:h-32"
                />

                <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-center">
                  <div className="text-sm font-bold text-white/45">
                    الباقة المختارة
                  </div>
                  <div className="mt-2 text-xl font-black text-white">
                    {selectedPlan === "featured"
                      ? "الخطة المميزة"
                      : selectedPlan === "premium"
                        ? "Premium"
                        : selectedPlan === "games"
                          ? "شراء ألعاب منفردة"
                          : "اختر الخطة المناسبة"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionBadge>الباقات المتاحة للدفع</SectionBadge>
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                اختر الخطة التي تريد تفعيلها
              </h2>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-white/55">
              الباقات بجانب بعضها لسهولة المقارنة
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard
                key={plan.key}
                item={plan}
                selected={selectedPlan === plan.key}
              />
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-[linear-gradient(160deg,rgba(8,32,26,0.94)_0%,rgba(6,12,28,0.98)_100%)] shadow-[0_20px_50px_rgba(52,211,153,0.08)]">
            <div className="h-[2px] w-full bg-emerald-400" />

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-black text-emerald-300">
                  شراء ألعاب لمتكم
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/50">
                  مرن
                </span>
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h3 className="text-2xl font-black text-white">
                    شراء عدد ألعاب معين للعبة لمتكم
                  </h3>

                  <p className="mt-4 text-sm leading-8 text-white/65">
                    إذا كنت لا تريد شراء باقة كاملة، يمكنك شراء عدد ألعاب معين خاص
                    بلعبة لمتكم فقط.
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
                    <div className="text-xs font-bold text-white/35">السعر</div>
                    <div className="mt-2 text-3xl font-black text-emerald-300">
                      1 JD لكل لعبة واحدة
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-8 text-white/65">
                    عند الدفع اذكر في رسالتك عدد الألعاب التي تريد شراءها ليتم
                    تفعيلها لك داخل النظام.
                  </p>
                </div>

                <div>
                  <Link
                    href="/payment?plan=games"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-3.5 text-sm font-black text-emerald-200 transition hover:bg-emerald-400/15"
                  >
                    اختيار هذا الخيار
                    <ArrowLeftIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl">
          <div className="mb-7">
            <SectionBadge>طرق الدفع</SectionBadge>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
              اختر طريقة الدفع المناسبة لك
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <PaymentMethodCard
              title="الدفع عبر كليك"
              subtitle="مناسب للمستخدمين داخل الأردن"
              icon={<WalletIcon className="h-5 w-5" />}
              content={
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="text-xs font-bold text-white/35">
                      اسم المستفيد
                    </div>
                    <div className="mt-2 text-xl font-black text-white">
                      Lamtkom
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="text-xs font-bold text-white/35">
                      رقم كليك
                    </div>
                    <div className="mt-2 text-xl font-black text-cyan-300">
                      079 0000 000
                    </div>
                  </div>

                  <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
                    <div className="text-sm font-black text-white">
                      بعد الدفع عبر كليك، أرسل لنا:
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-white/68">
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
              subtitle="مناسب للمستخدمين من خارج الأردن"
              icon={<BankIcon className="h-5 w-5" />}
              content={
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="text-xs font-bold text-white/35">
                      اسم المستفيد
                    </div>
                    <div className="mt-2 text-xl font-black text-white">
                      Lamtkom
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="text-xs font-bold text-white/35">IBAN</div>
                    <div className="mt-2 break-all text-lg font-black text-violet-300">
                      JO00 0000 0000 0000 0000 0000 000
                    </div>
                  </div>

                  <div className="rounded-2xl border border-violet-400/10 bg-violet-400/[0.04] p-4">
                    <div className="text-sm font-black text-white">
                      بعد التحويل البنكي، أرسل لنا:
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-white/68">
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
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-400/10 text-orange-300">
              <SparkIcon className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                ملاحظة مهمة لتأكيد عملية الدفع
              </h3>
              <p className="mt-1 text-sm text-white/55">
                هذه المعلومات ضرورية لإتمام التفعيل بشكل صحيح.
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
              <div className="text-sm font-black text-white">
                بعد الدفع قم بإرسال لقطة شاشة أو إثبات العملية
              </div>

              <div className="mt-4 space-y-3 text-sm leading-7 text-white/68">
                <div>• اسم المستخدم + الإيميل داخل الموقع</div>
                <div>• الخطة المشتراة أو عدد الألعاب المطلوبة</div>
                <div>• لقطة شاشة / سكرين شوت لعملية الدفع</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
              <div className="text-sm font-black text-white">
                إرسال المعلومات لتأكيد الدفع
              </div>

              <div className="mt-4 space-y-3 text-sm leading-7 text-white/68">
                <div>• عبر الواتساب</div>
                <div>• أو عبر الإيميل</div>
                <div>• مع ذكر نوع الباقة أو عدد الألعاب المطلوبة</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_18px_50px_rgba(34,211,238,0.18)] transition hover:bg-cyan-300"
            >
              التواصل لتأكيد الدفع
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/[0.10]"
            >
              الرجوع للباقات
              <HomeIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}