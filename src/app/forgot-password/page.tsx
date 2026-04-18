"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const heroLogo = "/logo.png";

function ArrowLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني.");
      return;
    }

    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("تعذر إرسال رابط استعادة كلمة المرور. حاول مرة أخرى.");
      return;
    }

    setSuccessMessage(
      "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني. افتح الرسالة واتبع الخطوات.",
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(160deg,rgba(6,12,30,0.97)_0%,rgba(3,6,16,0.99)_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.30)]">
          <div className="grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="order-2 p-6 md:p-8 xl:order-1 xl:p-10">
              <div className="mx-auto max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-300">
                  استعادة كلمة المرور
                </div>

                <h1 className="text-3xl font-black text-white md:text-4xl">
                  نسيت كلمة المرور؟
                </h1>

                <p className="mt-3 text-sm leading-8 text-white/58 md:text-base">
                  أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور
                  والعودة إلى حسابك بسهولة.
                </p>

                {errorMessage ? (
                  <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                    {errorMessage}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {successMessage}
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white/75">
                      البريد الإلكتروني
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="name@email.com"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 md:px-5 md:py-4 md:text-base"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
                    {!loading ? <ArrowLeftIcon className="h-4 w-4" /> : null}
                  </button>
                </form>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="text-white/60">
                    تذكرت كلمة المرور؟{" "}
                    <Link
                      href="/login"
                      className="font-black text-cyan-300 transition hover:text-cyan-200"
                    >
                      تسجيل الدخول
                    </Link>
                  </div>

                  <Link
                    href="/"
                    className="text-white/55 transition hover:text-white"
                  >
                    العودة إلى الرئيسية
                  </Link>
                </div>
              </div>
            </div>

            <div className="order-1 border-b border-white/8 bg-[linear-gradient(160deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_50%,rgba(6,12,30,1)_100%)] xl:order-2 xl:border-b-0 xl:border-r xl:border-white/8">
              <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center xl:px-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-5 py-2 text-xs font-black text-cyan-300">
                  حماية الحساب
                </div>

                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="mb-6 h-24 w-auto object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.18)] sm:h-28"
                />

                <h2 className="text-3xl font-black text-white md:text-4xl">
                  استعد الوصول إلى حسابك
                </h2>

                <p className="mt-4 max-w-md text-sm leading-8 text-white/58 md:text-base">
                  سنرسل لك رابطًا آمنًا لإعادة تعيين كلمة المرور والرجوع إلى
                  الجولات والألعاب والباقات من مكان واحد.
                </p>

                <div className="mt-7 w-full max-w-md space-y-3">
                  {[
                    "رابط آمن لإعادة تعيين كلمة المرور.",
                    "العودة السريعة إلى حسابك وجولاتك.",
                    "نفس هوية وتجربة صفحات الدخول في المنصة.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-right text-sm font-bold text-white/70"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}