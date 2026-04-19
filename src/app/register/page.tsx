"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const heroLogo = "/logo.webp";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const cleanUsername = username.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPhone || !cleanEmail || !cleanPassword) {
      setErrorMessage("يرجى تعبئة جميع الحقول.");
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: { data: { username: cleanUsername, phone: cleanPhone } },
    });

    if (error) {
      setLoading(false);
      setErrorMessage("تعذر إنشاء الحساب. تأكد أن البريد الإلكتروني واسم المستخدم ورقم الهاتف غير مستخدمة مسبقًا.");
      return;
    }

    if (!data.user) {
      setLoading(false);
      setErrorMessage("تمت العملية بشكل غير مكتمل. حاول مرة أخرى.");
      return;
    }

    const loginResult = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword });
    setLoading(false);

    if (loginResult.error) {
      setErrorMessage("تم إنشاء الحساب لكن تعذر تسجيل الدخول مباشرة.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  const inputCls = "w-full rounded-2xl border border-white/10 bg-[rgba(10,18,42,0.80)] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-400/60 focus:bg-[rgba(10,18,42,0.95)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)]";
  const labelCls = "mb-1.5 block text-xs font-bold text-white/50";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="pointer-events-none fixed -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[80px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/6 blur-[60px]" />

      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-10 md:px-6">
        <div className="relative w-full overflow-hidden rounded-[2.4rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_55%,rgba(6,12,30,1)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.55)]">

          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[50px]" />

          <div className="px-7 py-9 md:px-9">
            {/* Header */}
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-[linear-gradient(160deg,rgba(10,20,48,0.98),rgba(4,8,22,0.99))]">
                <img src={heroLogo} alt="لمتكم" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/22 bg-cyan-400/8 px-3 py-1 text-[11px] font-bold text-cyan-300">
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  حساب جديد
                </span>
                <h1 className="mt-1 text-2xl font-black text-white">إنشاء الحساب</h1>
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm font-bold text-red-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>اسم المستخدم</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>رقم الهاتف</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="079xxxxxx او 00962xxxx" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>البريد الإلكتروني</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@email.com" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>كلمة المرور</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className={inputCls} />
                <p className="mt-1.5 text-[11px] text-white/25">6 أحرف على الأقل</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-[0_4px_24px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    جاري إنشاء الحساب...
                  </>
                ) : "إنشاء الحساب"}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-5 border-t border-white/6 pt-5 text-center text-sm text-white/40">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="font-black text-cyan-300 transition hover:text-cyan-200">تسجيل الدخول</Link>
            </div>

            <div className="mt-3 text-center">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/28 transition hover:text-white/50">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
