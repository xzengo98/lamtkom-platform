"use client";

import { useFormStatus } from "react-dom";

export default function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-[0_4px_24px_rgba(34,211,238,0.25)] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70 md:py-4 md:text-base"
    >
      {pending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
    </button>
  );
}