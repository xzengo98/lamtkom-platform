"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
        <main className="min-h-screen px-4 py-10">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-[#071126] p-8 text-center">
            <h1 className="text-3xl font-black">تعذر تحميل الصفحة</h1>
            <p className="mt-4 text-white/65">
              حصل خطأ على مستوى التطبيق. حاول إعادة المحاولة.
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
      </body>
    </html>
  );
}