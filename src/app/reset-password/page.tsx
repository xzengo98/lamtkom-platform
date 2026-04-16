"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

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

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (!cleanPassword || !cleanConfirmPassword) {
      setErrorMessage("يرجى تعبئة جميع الحقول.");
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setErrorMessage("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: cleanPassword,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("تعذر تحديث كلمة المرور. افتح الرابط من جديد ثم حاول مرة أخرى.");
      return;
    }

    setSuccessMessage("تم تحديث كلمة المرور بنجاح. سيتم تحويلك إلى تسجيل الدخول.");

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8 md:px-6">
        <div className="w-full max-w-[520px]">
          <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:p-8">
            <div className="mb-6 flex justify-center">
              <div className="relative flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(15,26,55,0.96)_0%,rgba(8,16,36,0.96)_100%)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.30)]">
                <div className="absolute inset-0 rounded-[inherit] border border-white/5" />
                <img
                  src={heroLogo}
                  alt="شعار لمتكم"
                  className="h-[100px] w-[100px] object-contain"
                />
              </div>
            </div>

            <div className="mb-6 text-center">
              <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
                تعيين كلمة مرور جديدة
              </div>
              <h1 className="text-3xl font-black text-white">
                إعادة تعيين كلمة المرور
              </h1>
            </div>

            {errorMessage ? (
              <div className="mb-4 rounded-[1.2rem] border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-100">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mb-4 rounded-[1.2rem] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100">
                {successMessage}
              </div>
            ) : null}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-black text-white/80">
                  كلمة المرور الجديدة
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="******"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 md:px-5 md:py-4 md:text-base"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-white/80">
                  تأكيد كلمة المرور
                </label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="******"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 md:px-5 md:py-4 md:text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 text-base font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
                {!loading ? <ArrowLeftIcon /> : null}
              </button>
            </form>

            <div className="mt-5 text-center text-sm font-bold text-white/65">
              العودة إلى{" "}
              <Link
                href="/login"
                className="text-cyan-300 transition hover:text-cyan-200"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}