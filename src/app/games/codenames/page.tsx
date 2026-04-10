import Link from "next/link";

const BLUE_PANEL_BG =
  "https://t3.ftcdn.net/jpg/00/86/56/12/360_F_86561234_8HJdzg2iBlPap18K38mbyetKfdw1oNrm.jpg";

const ORANGE_PANEL_BG =
  "https://img.freepik.com/free-vector/grunge-diagonal-stripe-background_1409-1366.jpg";

function TopPill({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-full border px-4 py-2 text-sm font-black text-white shadow-lg ${
        active
          ? "border-white/25 bg-white/10"
          : "border-white/20 bg-black/15"
      }`}
    >
      {children}
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  tone,
  button,
}: {
  title: string;
  description: string;
  href: string;
  tone: "blue" | "orange";
  button: string;
}) {
  const isBlue = tone === "blue";

  return (
    <div
      className={`group relative overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1 ${
        isBlue
          ? "border-cyan-400/20 shadow-[0_20px_50px_rgba(34,211,238,0.08)]"
          : "border-orange-400/20 shadow-[0_20px_50px_rgba(249,115,22,0.08)]"
      }`}
      style={{
        backgroundImage: `linear-gradient(160deg, ${
          isBlue ? "rgba(8,18,40,0.97)" : "rgba(20,10,6,0.97)"
        } 0%, rgba(4,10,24,0.99) 100%)`,
      }}
    >
      {/* Top accent bar */}
      <div className={`h-[2px] w-full ${isBlue ? "bg-cyan-400" : "bg-orange-400"} opacity-65`} />

      <div className="relative z-10 p-6 md:p-7">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-widest ${isBlue ? "border-cyan-400/20 bg-cyan-400/8 text-cyan-300" : "border-orange-400/20 bg-orange-400/8 text-orange-300"}`}>
          Codenames
        </span>

        <div className="mt-4 text-3xl font-black text-white md:text-4xl">
          {title}
        </div>

        <p className="mt-3 text-sm leading-7 text-white/55 md:text-base">
          {description}
        </p>

        <Link
          href={href}
          className={`mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition active:scale-[0.98] ${
            isBlue
              ? "bg-cyan-500 shadow-[0_4px_20px_rgba(34,211,238,0.25)] hover:bg-cyan-400"
              : "bg-orange-500 shadow-[0_4px_20px_rgba(249,115,22,0.25)] hover:bg-orange-400"
          }`}
        >
          {button}
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </div>
  );
}

export default function CodenamesHomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_60%,#020814_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* ── Hero ── */}
        <section className="relative mb-6 overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,18,42,0.98)_0%,rgba(4,10,26,1)_55%,rgba(6,12,32,0.98)_100%)]">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-72 rounded-full bg-violet-500/7 blur-2xl" />

          <div className="relative px-6 py-12 text-center md:px-10 md:py-16">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center justify-center gap-2 text-xs font-bold text-white/30">
              <Link href="/" className="transition hover:text-white/55">الرئيسية</Link>
              <span>/</span>
              <Link href="/games" className="transition hover:text-white/55">الألعاب</Link>
              <span>/</span>
              <span className="text-white/50">Codenames</span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-400/8 px-3.5 py-1.5 text-xs font-bold text-violet-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
              Multiplayer · جماعي
            </span>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl xl:text-7xl">
              CODENAMES
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-white/55 md:text-base md:leading-9">
              لعبة جماعية تعتمد على الذكاء والربط بين الكلمات. قائد الفريق يعطي تلميحاً واحداً، وعلى الفريق اكتشاف الكلمات الصحيحة — لكن احذر، كلمة واحدة خاطئة قد تنهي اللعبة فوراً.
            </p>

            {/* Trust pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                { val: "2",      label: "فريق" },
                { val: "4+",     label: "لاعبين" },
                { val: "مفتوح", label: "للجميع" },
              ].map((p) => (
                <span key={p.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3.5 py-1.5 text-xs font-bold text-white/45">
                  <span className="font-black text-white/70">{p.val}</span>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Action Cards ── */}
        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <ActionCard
            title="إنشاء غرفة"
            description="ابدأ لعبة جديدة وكن أنت الـ Host. قم بدعوة أصدقائك وابدأ توزيع اللاعبين بين الفريقين ثم ابدأ الجولة."
            href="/games/codenames/create"
            tone="blue"
            button="إنشاء الآن"
          />
          <ActionCard
            title="دخول غرفة"
            description="لديك كود غرفة؟ أدخل الكود واسمك وانضم مباشرة إلى اللعبة وابدأ التحدي مع الفريق."
            href="/games/codenames/join"
            tone="orange"
            button="انضم الآن"
          />
        </section>

        {/* ── Stats strip ── */}
        <section>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { val: "2",       label: "فريق",        color: "border-cyan-400/15 bg-cyan-400/6",    num: "text-cyan-300",    lbl: "text-cyan-400/55" },
              { val: "جماعية", label: "نوع اللعبة",   color: "border-violet-400/15 bg-violet-400/6", num: "text-violet-300",  lbl: "text-violet-400/55" },
              { val: "مفتوح",  label: "عدد اللاعبين", color: "border-orange-400/15 bg-orange-400/6", num: "text-orange-300",  lbl: "text-orange-400/55" },
            ].map((s) => (
              <div key={s.label} className={`overflow-hidden rounded-2xl border ${s.color}`}>
                <div className={`h-[2px] w-full ${s.num.replace("text-", "bg-")} opacity-50`} />
                <div className="px-5 py-4 text-center">
                  <div className={`text-2xl font-black ${s.num}`}>{s.val}</div>
                  <div className={`mt-1 text-xs font-bold ${s.lbl}`}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}