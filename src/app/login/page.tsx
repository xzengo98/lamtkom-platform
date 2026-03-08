export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-black">تسجيل الدخول</h1>
        <p className="mt-3 text-slate-300">
          صفحة تسجيل الدخول سيتم ربطها لاحقًا مع Supabase Auth.
        </p>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />
          <button className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-bold text-slate-950">
            دخول
          </button>
        </div>
      </div>
    </main>
  );
}