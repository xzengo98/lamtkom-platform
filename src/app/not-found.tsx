import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-[#071126] p-8 text-center">
        <h1 className="text-4xl font-black">404</h1>
        <p className="mt-4 text-white/65">الصفحة غير موجودة أو تم نقلها.</p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-400"
        >
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}