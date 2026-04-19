export default function Loading() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(34,211,238,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.45)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="pointer-events-none fixed -top-32 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[80px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-64 w-64 rounded-full bg-violet-500/6 blur-[60px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 md:px-6">
        <section className="w-full max-w-3xl overflow-hidden rounded-[2.4rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,16,40,0.96)_0%,rgba(4,8,22,0.98)_50%,rgba(6,12,30,0.98)_100%)] px-6 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:px-8 sm:py-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 animate-pulse rounded-[1.8rem] border border-cyan-400/15 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),rgba(8,18,42,0.95)_68%)] sm:h-24 sm:w-24" />
            </div>

            <div className="mx-auto h-4 w-28 animate-pulse rounded-full bg-cyan-400/12" />
            <div className="mx-auto mt-4 h-10 w-56 animate-pulse rounded-2xl bg-white/8 sm:w-72" />
            <div className="mx-auto mt-4 h-4 w-72 max-w-full animate-pulse rounded-full bg-white/6 sm:w-[28rem]" />

            <div className="mt-10 space-y-4">
              <div className="h-14 animate-pulse rounded-2xl border border-white/8 bg-white/[0.04]" />
              <div className="h-14 animate-pulse rounded-2xl border border-white/8 bg-white/[0.04]" />
              <div className="h-14 animate-pulse rounded-2xl border border-white/8 bg-white/[0.04]" />
            </div>

            <div className="mt-8 h-12 animate-pulse rounded-2xl bg-cyan-400/20" />

            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/15 bg-cyan-400/8 px-4 py-2 text-sm font-bold text-cyan-200/85">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400" />
                جاري تحميل الصفحة...
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}