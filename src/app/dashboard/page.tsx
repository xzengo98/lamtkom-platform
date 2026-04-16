export default function DashboardPage() {
  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black">لوحة المستخدم</h1>
        <p className="mt-4 text-slate-300">
          هنا ستظهر بيانات المستخدم، الرصيد، وسجل الألعاب.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">الرصيد الحالي</div>
            <div className="mt-3 text-3xl font-black text-cyan-400">12</div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">عدد الألعاب</div>
            <div className="mt-3 text-3xl font-black text-cyan-400">5</div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">آخر نتيجة</div>
            <div className="mt-3 text-3xl font-black text-cyan-400">18</div>
          </div>
        </div>
      </div>
    </main>
  );
}