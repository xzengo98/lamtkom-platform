"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("بيانات الدخول غير صحيحة");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-xl">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.8)]">
          <div className="border-b border-white/10 bg-gradient-to-l from-cyan-400/10 to-transparent px-8 py-8">
            <h1 className="text-4xl font-black">تسجيل الدخول</h1>
            <p className="mt-3 text-slate-300">
              ادخل إلى حسابك للوصول إلى ألعابك ورصيدك ولوحة الاستخدام الخاصة بك.
            </p>
          </div>

          <div className="p-8">
            {errorMessage ? (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
                {errorMessage}
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  البريد الإلكتروني
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@email.com"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  كلمة المرور
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="******"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-400 px-6 py-4 text-lg font-black text-slate-950 disabled:opacity-60"
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </button>
            </form>

            <div className="mt-6 text-sm text-slate-300">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="font-bold text-cyan-300">
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}