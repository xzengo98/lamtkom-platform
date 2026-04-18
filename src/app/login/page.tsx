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
      setErrorMessage("بيانات تسجيل الدخول غير صحيحة. حاول مرة أخرى.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto max-w-3xl px-4 py-8 md:px-6">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(160deg,rgba(6,12,30,0.97)_0%,rgba(3,6,16,0.99)_100%)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.30)] md:p-8 xl:p-10">
          <div className="mx-auto max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-300">
              تسجيل الدخول
            </div>

            <div className="mb-6 flex justify-center">
              <img
                src={heroLogo}
                alt="لمتكم"
                className="h-24 w-auto object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.18)] sm:h-28"
              />
            </div>

            <h1 className="text-center text-3xl font-black text-white md:text-4xl">
              دخول الحساب
            </h1>

            <p className="mt-3 text-center text-sm leading-8 text-white/58 md:text-base">
              ادخل إلى حسابك للوصول إلى الألعاب، الباقات، الجولات، والمتابعة من
              مكان واحد واضح ومنظم.
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
        </section>
      </div>
    </main>
  );
}