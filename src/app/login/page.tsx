"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("يرجى تعبئة جميع الحقول.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("تعذر تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.");
      return;
    }

    router.push("/");
    router.refresh();
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
                  تسجيل الدخول
                </div>

                <h1 className="text-3xl font-black text-white md:text-4xl">
                  دخول الحساب
                </h1>

                <p className="mt-3 text-sm leading-8 text-white/58 md:text-base">
                  ادخل إلى حسابك للوصول إلى الألعاب، متابعة الجلسات، والاستفادة من
                  الباقات والخدمات بشكل منظم وواضح.
                </p>

                {errorMessage ? (
                  <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                    {errorMessage}
                  </div>
                ) : null}

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
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

                  <div>
                    <label className="mb-2 block text-sm font-bold text-white/75">
                      كلمة المرور
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="******"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 md:px-5 md:py-4 md:text-base"
                    />
                  </div>

                  <div className="flex justify-start">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-black text-cyan-300 transition hover:text-cyan-200"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    {!loading ? <ArrowLeftIcon className="h-4 w-4" /> : null}
                  </button>
                </form>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="text-white/60">
                    لا تملك حسابًا؟{" "}
                    <Link
                      href="/register"
                      className="font-black text-cyan-300 transition hover:text-cyan-200"
                    >
                      إنشاء حساب جديد
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
                  أهلًا بعودتك
                </div>

                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="mb-6 h-24 w-auto object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.18)] sm:h-28"
                />

                <h2 className="text-3xl font-black text-white md:text-4xl">
                  أكمل رحلتك مع لمتكم
                </h2>

                <p className="mt-4 max-w-md text-sm leading-8 text-white/58 md:text-base">
                  سجل دخولك للوصول السريع إلى الألعاب، الباقات، الجولات، والمتابعة
                  من مكان واحد واضح ومنظم.
                </p>

                <div className="mt-7 w-full max-w-md space-y-3">
                  {[
                    "الوصول إلى الألعاب والجولات من نفس الحساب.",
                    "متابعة الباقات والرصيد والإشعارات بسهولة.",
                    "تجربة استخدام واضحة وسريعة بنفس هوية المنصة.",
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