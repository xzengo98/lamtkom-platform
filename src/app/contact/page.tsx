import Link from "next/link";

export const metadata = {
  title: "اتصل بنا | لمتكم",
  description:
    "تواصل مع منصة لمتكم بسهولة عبر نموذج التواصل أو البريد أو الهاتف أو واتساب.",
};

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";
const contactEmail = "adsshweter@gmail.com";
const displayEmail = "hello@lamtkom.com";
const displayPhone = "079 0000 000";
const whatsappNumber = "962790000000";

function PhoneIcon() {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.45 19.45 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MailIcon() {
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
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function WhatsAppIcon() {
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
      <path d="M20 11.5a8.5 8.5 0 0 1-12.56 7.5L4 20l1.1-3.26A8.5 8.5 0 1 1 20 11.5Z" />
      <path d="M9.2 9.4c.2-.5.4-.5.7-.5h.6c.2 0 .5 0 .7.5.2.4.8 1.8.9 1.9.1.2.1.4 0 .6-.1.2-.2.4-.4.5-.2.2-.4.4-.2.7.2.4.8 1.3 1.7 2 .9.8 1.7 1 2 .9.3-.1.5-.5.7-.7.2-.2.4-.2.7-.1.3.1 1.9.9 2.2 1.1.3.1.5.2.5.4 0 .2-.1 1.1-.7 1.6-.6.5-1.3.7-1.7.7-.4 0-1 0-1.9-.4-.6-.2-1.4-.6-2.4-1.5-2-1.7-3.3-3.7-3.7-4.4-.4-.7-.4-1.4-.1-1.9.2-.4.5-.8.7-1.1Z" />
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

function ContactCard({
  title,
  value,
  href,
  icon,
}: {
  title: string;
  value: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-cyan-300/20"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
        {icon}
      </div>
      <div className="text-sm font-black text-cyan-300">{title}</div>
      <div className="mt-2 text-lg font-black text-white">{value}</div>
    </a>
  );
}

export default function ContactPage() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "مرحبًا، أريد التواصل معكم.",
  )}`;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <section className="relative mb-8 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-8 xl:p-10">
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.20)_1px,transparent_1px)] [background-size:26px_26px]" />

          <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
                اتصل بنا
              </div>

              <h1 className="text-3xl font-black text-white md:text-5xl">
                تواصل مع لمتكم
                <span className="mt-2 block bg-[linear-gradient(90deg,#67e8f9_0%,#c084fc_50%,#fb923c_100%)] bg-clip-text text-transparent">
                  بسهولة وبشكل احترافي
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
                إذا كان لديك استفسار، اقتراح، أو رغبة في استخدام المنصة بطريقة
                أوسع، يمكنك التواصل معنا مباشرة عبر النموذج أو عبر واتساب. تم
                تصميم الصفحة لتكون واضحة، خفيفة، وعملية.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  من نحن
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  استعراض الباقات
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

        <section className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <ContactCard
            title="رقم الهاتف"
            value={displayPhone}
            href={`tel:${displayPhone.replace(/\s+/g, "")}`}
            icon={<PhoneIcon />}
          />
          <ContactCard
            title="البريد الإلكتروني"
            value={displayEmail}
            href={`mailto:${displayEmail}`}
            icon={<MailIcon />}
          />
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="group rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-emerald-300/20"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-100">
              <WhatsAppIcon />
            </div>
            <div className="text-sm font-black text-emerald-300">واتساب</div>
            <div className="mt-2 text-lg font-black text-white">
              تواصل عبر واتساب
            </div>
          </a>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              لماذا التواصل معنا؟
            </div>

            <h2 className="text-2xl font-black text-white">
              مساحة واضحة للتواصل والاستفسارات
            </h2>

            <div className="mt-5 space-y-4">
              {[
                "الاستفسار عن المنصة أو طريقة الاستخدام",
                "التواصل بخصوص العروض أو التفعيل",
                "مناقشة استخدام المنصة للمدارس أو الفعاليات",
                "إرسال اقتراحات أو ملاحظات تطوير",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="mt-0.5 text-cyan-300">
                    <SparkIcon />
                  </div>
                  <div className="text-sm font-bold leading-7 text-white/75">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              نموذج التواصل
            </div>

            <h2 className="text-2xl font-black text-white">
              أرسل رسالتك مباشرة
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/70">
              عبّئ البيانات التالية وسيتم إرسالها إلى البريد المحدد.
            </p>

            <form
              action={`https://formsubmit.co/${contactEmail}`}
              method="POST"
              className="mt-6 space-y-4"
            >
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input
                type="hidden"
                name="_subject"
                value="رسالة جديدة من صفحة اتصل بنا - لمتكم"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-black text-white/80">
                    الاسم
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="اكتب اسمك"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-white/80">
                    الإيميل
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-white/80">
                  العنوان
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="عنوان الرسالة"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-white/80">
                  نص الرسالة
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                >
                  إرسال
                  <ArrowLeftIcon />
                </button>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-400/15"
                >
                  تواصل عبر الواتساب
                  <WhatsAppIcon />
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}