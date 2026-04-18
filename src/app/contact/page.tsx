import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description:
    "تواصل مع منصة لمتكم بسهولة عبر الواتساب أو البريد الإلكتروني أو الهاتف، وأرسل استفسارك أو اقتراحك مباشرة.",
};

const heroLogo = "/logo.png";
const contactEmail = "adsshweter@gmail.com";
const displayEmail = "hello@lamtkom.com";
const displayPhone = "079 0000 000";
const whatsappNumber = "962790000000";

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

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 3.18 2 2 0 0 1 4.11 1h2a2 2 0 0 1 2 1.72c.12.9.34 1.79.65 2.64a2 2 0 0 1-.45 2.11L7.1 8.91a16 16 0 0 0 8 8l1.44-1.21a2 2 0 0 1 2.11-.45c.85.31 1.74.53 2.64.65A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MailIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M20 11.5a8.5 8.5 0 0 1-12.57 7.48L4 20l1.12-3.23A8.5 8.5 0 1 1 20 11.5Z" />
      <path d="M9.7 8.8c-.2-.45-.4-.46-.59-.47h-.5c-.17 0-.45.06-.68.31-.23.25-.88.86-.88 2.1s.9 2.44 1.02 2.6c.13.17 1.76 2.82 4.34 3.84 2.14.85 2.58.68 3.04.64.47-.04 1.5-.61 1.71-1.2.21-.58.21-1.08.15-1.19-.06-.1-.23-.17-.5-.31-.27-.15-1.6-.79-1.85-.88-.25-.08-.44-.12-.62.13-.19.25-.73.88-.9 1.06-.16.17-.33.19-.6.06-.27-.15-1.15-.42-2.18-1.33-.8-.71-1.34-1.58-1.5-1.85-.17-.29-.02-.44.12-.58.12-.12.27-.31.4-.46.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.45-.8-1.95Z" />
    </svg>
  );
}

type ContactMethod = {
  title: string;
  value: string;
  hint: string;
  href: string;
  tone: "cyan" | "violet" | "emerald";
  icon: ReactNode;
};

const contactMethods: ContactMethod[] = [
  {
    title: "البريد الإلكتروني",
    value: displayEmail,
    hint: "للاستفسارات العامة والدعم والتعاون",
    href: `mailto:${contactEmail}`,
    tone: "cyan",
    icon: <MailIcon className="h-5 w-5" />,
  },
  {
    title: "الهاتف",
    value: displayPhone,
    hint: "للتواصل السريع والرد المباشر",
    href: `tel:${displayPhone.replace(/\s+/g, "")}`,
    tone: "violet",
    icon: <PhoneIcon className="h-5 w-5" />,
  },
  {
    title: "واتساب",
    value: "تواصل مباشر عبر واتساب",
    hint: "مناسب للاستفسارات السريعة والتأكيدات",
    href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("مرحبًا، أريد التواصل معكم بخصوص منصة لمتكم.")}`,
    tone: "emerald",
    icon: <WhatsAppIcon className="h-5 w-5" />,
  },
];

function getMethodStyles(tone: ContactMethod["tone"]) {
  const map = {
    cyan: {
      card: "border-cyan-400/18 bg-[linear-gradient(160deg,rgba(8,28,56,0.96)_0%,rgba(6,12,28,0.98)_100%)] shadow-[0_20px_50px_rgba(34,211,238,0.08)]",
      badge: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
      icon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
      button: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15",
      glow: "bg-cyan-500/10",
    },
    violet: {
      card: "border-violet-400/18 bg-[linear-gradient(160deg,rgba(20,12,56,0.96)_0%,rgba(6,12,28,0.98)_100%)] shadow-[0_20px_50px_rgba(139,92,246,0.08)]",
      badge: "border-violet-400/20 bg-violet-400/10 text-violet-300",
      icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",
      button: "border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/15",
      glow: "bg-violet-500/10",
    },
    emerald: {
      card: "border-emerald-400/18 bg-[linear-gradient(160deg,rgba(8,30,24,0.96)_0%,rgba(6,12,28,0.98)_100%)] shadow-[0_20px_50px_rgba(52,211,153,0.08)]",
      badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      button: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15",
      glow: "bg-emerald-500/10",
    },
  };

  return map[tone];
}

function ContactMethodCard({ item }: { item: ContactMethod }) {
  const styles = getMethodStyles(item.tone);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border p-6 transition duration-300 hover:-translate-y-1",
        styles.card,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 h-28 w-28 rounded-full blur-3xl",
          styles.glow,
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border",
              styles.icon,
            )}
          >
            {item.icon}
          </div>

          <span
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-black",
              styles.badge,
            )}
          >
            وسيلة تواصل
          </span>
        </div>

        <h3 className="mt-5 text-2xl font-black text-white">{item.title}</h3>

        <div className="mt-3 text-lg font-black text-white">{item.value}</div>

        <p className="mt-3 text-sm leading-8 text-white/62">{item.hint}</p>

        <div className="mt-6">
          <a
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noreferrer" : undefined}
            className={cn(
              "inline-flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-black transition",
              styles.button,
            )}
          >
            <span>فتح وسيلة التواصل</span>
            <ArrowLeftIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

function InfoPoint({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
        <SparkIcon className="h-3.5 w-3.5" />
      </div>
      <div className="text-sm leading-7 text-white/70">{children}</div>
    </div>
  );
}

export default function ContactPage() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "مرحبًا، أريد التواصل معكم بخصوص منصة لمتكم.",
  )}`;

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
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/6 to-transparent" />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
            <div>
              <SectionBadge>اتصل بنا</SectionBadge>

              <h1 className="mt-6 text-3xl font-black leading-[1.15] text-white sm:text-5xl lg:text-6xl">
                تواصل مع لمتكم
                <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent">
                  بسهولة وبشكل مباشر
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-sm font-bold leading-8 text-white/72 sm:text-lg sm:leading-9">
                إذا كان لديك استفسار، اقتراح، رغبة في التعاون، أو تريد استخدام
                المنصة بشكل أوسع، يمكنك التواصل معنا مباشرة عبر البريد أو الهاتف
                أو الواتساب.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-7 py-4 text-sm font-black text-slate-950 shadow-[0_18px_50px_rgba(34,211,238,0.22)] transition hover:bg-cyan-300 active:scale-[0.98]"
                >
                  تواصل عبر واتساب
                  <ArrowLeftIcon className="h-4 w-4" />
                </a>

                <Link
                  href="/pricing"
                  className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-7 py-4 text-sm font-black text-white transition hover:bg-white/[0.10]"
                >
                  استعراض الباقات
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-7 py-4 text-sm font-bold text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                >
                  الرئيسية
                  <HomeIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.30)]">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-black text-cyan-300">
                  <SparkIcon className="h-4 w-4" />
                  رد واضح وسريع
                </div>

                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="mx-auto mt-6 h-28 w-auto object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.30)] sm:h-32"
                />

                <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-center">
                  <div className="text-sm font-bold text-white/45">
                    تواصل معنا حول
                  </div>
                  <div className="mt-2 text-xl font-black text-white">
                    الدعم، التعاون، الباقات، والتفعيل
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionBadge>وسائل التواصل</SectionBadge>
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                اختر وسيلة التواصل المناسبة
              </h2>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-white/55">
              تواصل سريع وواضح وبنفس هوية المنصة
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {contactMethods.map((item) => (
              <ContactMethodCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <SparkIcon className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  لماذا التواصل معنا؟
                </h3>
                <p className="mt-1 text-sm text-white/55">
                  استخدام واضح ودعم مناسب للحالات المختلفة
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <InfoPoint>
                الاستفسار عن المنصة أو طريقة الاستخدام أو البدء الصحيح.
              </InfoPoint>
              <InfoPoint>
                التواصل بخصوص الباقات، التفعيل، أو إضافة الألعاب إلى الحساب.
              </InfoPoint>
              <InfoPoint>
                مناقشة استخدام المنصة للمدارس، الجهات، الفعاليات، أو التجمعات.
              </InfoPoint>
              <InfoPoint>
                إرسال اقتراحات التطوير أو الملاحظات لتحسين التجربة.
              </InfoPoint>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                <MailIcon className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  أرسل رسالتك مباشرة
                </h3>
                <p className="mt-1 text-sm text-white/55">
                  نموذج بسيط بنفس هوية الصفحة للتواصل السريع
                </p>
              </div>
            </div>

            <form
              action={`mailto:${contactEmail}`}
              method="post"
              encType="text/plain"
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    الاسم
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="اكتب اسمك"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    الإيميل
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@email.com"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/75">
                  العنوان
                </label>
                <input
                  name="subject"
                  type="text"
                  placeholder="عنوان الرسالة"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/75">
                  نص الرسالة
                </label>
                <textarea
                  name="message"
                  rows={6}
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400"
                />
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white/60">
                عند الضغط على الإرسال سيتم فتح تطبيق البريد على جهازك لإرسال
                الرسالة مباشرة، أو يمكنك استخدام واتساب للتواصل السريع.
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  إرسال عبر البريد
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-400/15"
                >
                  تواصل عبر الواتساب
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}