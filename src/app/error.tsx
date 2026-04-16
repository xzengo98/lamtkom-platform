"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-[#071126] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <h1 className="text-3xl font-black">حدث خطأ غير متوقع</h1>
        <p className="mt-4 text-white/65">
          حصلت مشكلة أثناء تحميل الصفحة. حاول مرة أخرى.
        </p>

        {error.digest ? (
          <p className="mt-3 text-xs text-white/35">Digest: {error.digest}</p>
        ) : null}

        <button
          onClick={reset}
          className="mt-6 rounded-2xl bg-cyan-500 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-400"
        >
          إعادة المحاولة
        </button>
      </div>
    </main>
  );
}