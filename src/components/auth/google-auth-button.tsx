"use client";

import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type GoogleAuthButtonProps = {
  mode?: "login" | "register";
  next?: string;
};

export default function GoogleAuthButton({
  mode = "login",
  next = "/",
}: GoogleAuthButtonProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const dividerText =
    mode === "register"
      ? "أو التسجيل باستخدام"
      : "أو التسجيل باستخدام";

  const buttonText =
    mode === "register" ? "حساب جوجل" : "حساب جوجل";

  async function handleGoogleAuth() {
    try {
      setLoading(true);
      setErrorMessage("");

      const redirectTo = `${
        window.location.origin
      }/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setErrorMessage("تعذر المتابعة عبر جوجل. حاول مرة أخرى.");
        setLoading(false);
      }
    } catch {
      setErrorMessage("حدث خطأ غير متوقع أثناء فتح تسجيل الدخول عبر جوجل.");
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>

        <div className="relative flex justify-center">
          <span className="bg-[rgb(2,6,23)] px-4 text-xs font-semibold text-white/60">
            {dividerText}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-transparent px-5 py-3.5 text-sm font-bold text-white transition hover:border-white/20 hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-70 md:py-4 md:text-base"
      >
        <span className="text-lg font-black leading-none text-white">G</span>
        {loading ? "جاري التحويل..." : buttonText}
      </button>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-200">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}