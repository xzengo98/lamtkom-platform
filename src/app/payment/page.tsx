import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الدفع | لمتكم",
  description:
    "صفحة الدفع الخاصة بباقات لمتكم، مع خيارات الدفع عبر كليك، التحويل البنكي، وUSDT.",
};

const heroLogo = "/logo.webp";

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

const usdtAddress = "0xd73d3f67a5b04e38c8518618ebcf40e723a5edcd";

const plans: PlanCardItem[] = [
  {
    key: "featured",
    name: "Premium",
    price: "10 JD",
    description:
      "الخيار الأنسب للمستخدم الذي يريد تجربة أقوى من المجانية مع استخدام أفضل داخل المنصة.",
    highlight: "تمنع تكرار الأسئلة وتناسب الاستخدام المستمر",
    features: [
      "تجربة أقوى من الخطة المجانية",
      "منع تكرار الأسئلة في لعبة لمتكم",
      "مناسبة للاستخدام المتكرر",
      "أفضل للجلسات المستمرة",
    ],
    tone: "cyan",
  },
  {
    key: "premium",
    name: "VIP",
    price: "20 JD",
    description:
      "الخطة الأعلى داخل المنصة، وتمنحك كل مزايا Premium مع ألعاب غير محدودة للعبة لمتكم.",
    highlight: "كل مزايا Premium + ألعاب غير محدودة",
    features: [
      "كل مزايا Premium",
      "منع تكرار الأسئلة",
      "ألعاب غير محدودة للعبة لمتكم",
      "مناسبة للاستخدام المكثف والاحترافي",
    ],
    tone: "violet",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/8 px-4 py-2 text-xs font-black text-cyan-300">
      {children}
    </div>
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
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
      <path d="M19 17l.7 1.8L21.5 19l-1.8.7L19 21.5l-.7-1.8L16.5 19l1.8-.2L19 17Z" />
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
      <path d="m5 13 4 4L19 7" />
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
      <path d="M4 10h16" />
      <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
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
      <path d="M4 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4V7Z" />
      <path d="M4 7V5a2 2 0 0 1 2-2h10" />
      <path d="M16 13h4" />
    </svg>
  );
}

function CryptoIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <circle cx="12" cy="12" r="8" />
      <path d="M10 9.5c0-1 1-1.8 2.2-1.8 1.2 0 2.3.6 2.3 1.8 0 2.7-4.5 1.1-4.5 4 0 1.1 1.1 1.9 2.5 1.9 1.3 0 2.5-.6 2.5-1.9" />
      <path d="M12 6.5v11" />
    </svg>
  );
}

function CardIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h3" />
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
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
      <path d="M3 12 12 4l9 8" />
      <path d="M5 10v10h14V10" />
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
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
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
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border p-5 transition-all duration-300 hover:-translate-y-1",
        styles.card,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", styles.bar)} />
      <div
        className={cn(
          "pointer-events-none absolute -top-10 right-0 h-28 w-28 rounded-full blur-3xl",
          styles.glow,
        )}
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-black",
              styles.badge,
            )}
          >
            {selected ? "الخطة المختارة" : "باقة متاحة"}
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-black text-white/50">
            دفع يدوي
          </div>
        </div>

        <h3 className="mt-5 text-center text-2xl font-black text-white">
          {item.name}
        </h3>

        <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-center">
          <div className="text-xs font-bold text-white/35">السعر</div>
          <div className={cn("mt-2 text-4xl font-black", styles.price)}>
            {item.price}
          </div>
        </div>

        <p className="mt-4 text-center text-sm leading-8 text-white/58">
          {item.description}
        </p>

        {item.highlight ? (
          <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-center text-sm font-bold text-white/70">
            {item.highlight}
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {item.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <div className={cn("mt-1", styles.bullet)}>
                <CheckIcon className="h-4 w-4" />
              </div>
              <div className="text-sm leading-7 text-white/70">{feature}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentMethodCard({
  title,
  subtitle,
  icon,
  content,
  active = true,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  content: ReactNode;
  active?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(8,16,40,0.96)_0%,rgba(4,8,22,0.99)_100%)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border",
              active
                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                : "border-white/10 bg-white/[0.05] text-white/40",
            )}
          >
            {icon}
          </div>

          <div>
            <h3 className="text-xl font-black text-white">{title}</h3>
            <div className="mt-1 text-sm text-white/50">{subtitle}</div>
          </div>
        </div>

        <div
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-black",
            active
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
              : "border-white/10 bg-white/[0.05] text-white/45",
          )}
        >
          {active ? "متاح الآن" : "قريبًا"}
        </div>
      </div>

      <div className="mt-5">{content}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="text-xs font-bold text-white/35">{label}</div>
      <div
        className={cn(
          "mt-2 break-all text-sm font-black text-white",
          mono ? "font-mono tracking-wide" : "",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm leading-7 text-white/70">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span>{item}</span>
        </div>
      ))}
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

  const selectedPlanLabel =
    selectedPlan === "featured"
      ? "Premium"
      : selectedPlan === "premium"
        ? "VIP"
        : selectedPlan === "games"
          ? "شراء ألعاب منفردة"
          : "اختر الخطة المناسبة";

  return (
    <main className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(34,211,238,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.35)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="overflow-hidden rounded-[2.6rem] border border-white/10 bg-[linear-gradient(160deg,rgba(7,14,34,0.98)_0%,rgba(3,8,22,0.99)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
          <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="text-sm font-bold text-white/35">صفحة الدفع</div>

              <div className="mt-4">
                <SectionBadge>الدفع اليدوي</SectionBadge>
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
                اختر باقتك وأكمل الدفع
                <span className="mt-2 block bg-gradient-to-l from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent">
                  بالطريقة المناسبة لك
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-white/58 md:text-base">
                هذه الصفحة مخصصة للدفع اليدوي حاليًا لشراء باقات لمتكم أو شراء عدد
                ألعاب معين للعبة لمتكم، عبر كليك، التحويل البنكي، أو USDT.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]"
                >
                  الرجوع للباقات
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/16"
                >
                  <MessageIcon className="h-4 w-4" />
                  تواصل معنا
                </Link>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-200">
                <SparkIcon className="h-4 w-4" />
                3 طرق دفع فعالة حاليًا
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
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <SectionBadge>الباقة المختارة</SectionBadge>
                <h2 className="mt-4 text-3xl font-black text-white">
                  {selectedPlanLabel}
                </h2>
                <p className="mt-3 text-sm leading-8 text-white/58 md:text-base">
                  اختر الباقة التي تريد تفعيلها، ثم أكمل الدفع بالطريقة الأنسب لك،
                  وبعدها أرسل بياناتك لتأكيد العملية بسرعة.
                </p>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.key}
                      item={plan}
                      selected={selectedPlan === plan.key}
                    />
                  ))}
                </div>

                <div className="mt-5 rounded-[2rem] border border-emerald-400/15 bg-[linear-gradient(160deg,rgba(8,32,26,0.94)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_20px_50px_rgba(52,211,153,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                        مرن
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-white">
                        شراء عدد ألعاب معين للعبة لمتكم
                      </h3>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-white/35">السعر</div>
                      <div className="mt-2 text-3xl font-black text-emerald-300">
                        1 JD / لعبة
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-8 text-white/58">
                    إذا لم تكن بحاجة إلى باقة كاملة، يمكنك شراء عدد ألعاب معين خاص
                    بلعبة لمتكم فقط. عند الدفع اذكر عدد الألعاب المطلوبة ليتم
                    تفعيلها لك.
                  </p>

                  <Link
                    href="/payment?plan=games"
                    className="mt-5 inline-flex items-center justify-center rounded-2xl border border-emerald-400/22 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-200 transition hover:bg-emerald-400/18"
                  >
                    اختيار هذا الخيار
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                <SectionBadge>ملخص سريع</SectionBadge>
                <h3 className="mt-4 text-2xl font-black text-white">
                  قبل الدفع
                </h3>

                <div className="mt-5 space-y-3">
                  <InfoRow label="الخطة المحددة" value={selectedPlanLabel} />
                  <InfoRow label="عدد طرق الدفع الفعالة" value="3" />
                  <InfoRow label="الطريقة القادمة" value="Visa / Mastercard" />
                </div>

                <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                  <div className="text-sm font-black text-white">بعد الدفع أرسل لنا:</div>
                  <div className="mt-3">
                    <BulletList
                      items={[
                        "لقطة شاشة أو إثبات عملية الدفع",
                        "اسم المستخدم الخاص بك داخل الموقع",
                        "الإيميل الخاص بك داخل الموقع",
                        "اسم الخطة التي قمت بشرائها",
                        "أو عدد الألعاب إذا كان الشراء لألعاب لمتكم",
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2.6rem] border border-white/10 bg-[linear-gradient(160deg,rgba(7,14,34,0.98)_0%,rgba(3,8,22,0.99)_100%)] px-6 py-8 shadow-[0_40px_120px_rgba(0,0,0,0.30)] md:px-8">
          <SectionBadge>طرق الدفع</SectionBadge>
          <h2 className="mt-4 text-3xl font-black text-white">
            اختر طريقة الدفع المناسبة لك
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-white/58 md:text-base">
            أصبح الدفع متاحًا الآن عبر كليك، التحويل البنكي، وUSDT، مع إضافة
            Visa / Mastercard قريبًا.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <PaymentMethodCard
              title="كليك"
              subtitle="مناسب للمستخدمين داخل الأردن"
              icon={<WalletIcon className="h-5 w-5" />}
              content={
                <div className="space-y-4">
                  <InfoRow label="اسم المستفيد" value="Lamtkom" />
                  <InfoRow label="رقم كليك" value="079 0000 000" />
                  <BulletList
                    items={[
                      "بعد الدفع عبر كليك، أرسل لقطة شاشة للعملية",
                      "أرسل اسم المستخدم والإيميل داخل الموقع",
                      "اذكر اسم الخطة أو عدد الألعاب المطلوبة",
                    ]}
                  />
                </div>
              }
            />

            <PaymentMethodCard
              title="التحويل البنكي"
              subtitle="مناسب للتحويل البنكي التقليدي"
              icon={<BankIcon className="h-5 w-5" />}
              content={
                <div className="space-y-4">
                  <InfoRow label="اسم المستفيد" value="Lamtkom" />
                  <InfoRow
                    label="IBAN"
                    value="JO00 0000 0000 0000 0000 0000 000"
                    mono
                  />
                  <BulletList
                    items={[
                      "بعد التحويل البنكي أرسل إثبات التحويل",
                      "أرسل اسم المستخدم والإيميل داخل الموقع",
                      "اذكر اسم الخطة أو عدد الألعاب المطلوبة",
                    ]}
                  />
                </div>
              }
            />

            <PaymentMethodCard
              title="USDT"
              subtitle="شبكة BNB (BEP20)"
              icon={<CryptoIcon className="h-5 w-5" />}
              content={
                <div className="space-y-4">
                  <InfoRow label="العملة" value="USDT" />
                  <InfoRow label="الشبكة" value="BNB (BEP20)" />
                  <InfoRow label="عنوان التحويل" value={usdtAddress} mono />
                  <BulletList
                    items={[
                      "تأكد من التحويل على شبكة BNB (BEP20) فقط",
                      "أرسل لقطة شاشة أو Tx Hash بعد الدفع",
                      "أرسل اسم المستخدم والإيميل داخل الموقع",
                      "اذكر اسم الخطة أو عدد الألعاب المطلوبة",
                    ]}
                  />
                </div>
              }
            />

            <PaymentMethodCard
              title="Visa / Mastercard"
              subtitle="بوابة دفع مباشرة"
              icon={<CardIcon className="h-5 w-5" />}
              active={false}
              content={
                <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4 text-sm leading-8 text-white/55">
                  هذه الطريقة قيد التجهيز حاليًا، وستتوفر قريبًا كخيار دفع مباشر
                  داخل المنصة.
                </div>
              }
            />
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.03] px-6 py-6 shadow-[0_30px_90px_rgba(0,0,0,0.20)] md:px-8">
          <h3 className="text-2xl font-black text-white">
            ملاحظة مهمة لتأكيد عملية الدفع
          </h3>

          <p className="mt-3 max-w-3xl text-sm leading-8 text-white/58">
            هذه المعلومات ضرورية لإتمام التفعيل بشكل صحيح بعد أي عملية دفع.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-sm font-black text-white">
                أرسل لنا بعد الدفع:
              </div>
              <div className="mt-3">
                <BulletList
                  items={[
                    "اسم المستخدم + الإيميل داخل الموقع",
                    "الخطة المشتراة أو عدد الألعاب المطلوبة",
                    "لقطة شاشة / سكرين شوت أو إثبات العملية",
                  ]}
                />
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-sm font-black text-white">
                طرق التواصل لتأكيد الدفع:
              </div>
              <div className="mt-3">
                <BulletList
                  items={[
                    "عبر الواتساب",
                    "أو عبر الإيميل",
                    "مع ذكر نوع الباقة أو عدد الألعاب المطلوبة",
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              التواصل لتأكيد الدفع
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]"
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