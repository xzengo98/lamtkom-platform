export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black">الباقات</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          هذه الصفحة ستكون مخصصة لعرض الباقات، عدد الألعاب، والأسعار.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black">تجريبية</h2>
            <p className="mt-3 text-slate-300">مناسبة للبداية.</p>
          </div>

          <div className="rounded-[2rem] border border-cyan-400/40 bg-cyan-400/10 p-6">
            <h2 className="text-2xl font-black">بريميوم</h2>
            <p className="mt-3 text-slate-200">عدد ألعاب أكثر ومزايا إضافية.</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black">شركات</h2>
            <p className="mt-3 text-slate-300">حلول مخصصة للجهات والمناسبات.</p>
          </div>
        </div>
      </div>
    </main>
  );
}