function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-2xl font-black tracking-tight text-cyan-400">
          SeenJeem
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#features" className="transition hover:text-white">
            المميزات
          </a>
          <a href="#how" className="transition hover:text-white">
            كيف تعمل
          </a>
          <a href="#plans" className="transition hover:text-white">
            الباقات
          </a>
          <a href="#admin" className="transition hover:text-white">
            لوحة التحكم
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/5">
            تسجيل الدخول
          </button>
          <button className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:opacity-90">
            ابدأ الآن
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_25%)]" />
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            منصة ألعاب أسئلة عربية احترافية
          </span>

          <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
            ابنِ تجربة لعب
            <span className="block text-cyan-400">أقوى، أسرع، وأذكى</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            منصة متكاملة للألعاب الجماعية والأسئلة التنافسية، تشمل واجهة مستخدم
            حديثة، نظام حسابات، خصم رصيد لكل لعبة، ولوحة تحكم كاملة لإدارة
            الفئات والأسئلة والمستخدمين.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:opacity-90">
              ابدأ المشروع
            </button>
            <button className="rounded-2xl border border-white/15 px-6 py-3 font-bold transition hover:bg-white/5">
              شاهد الخطة
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="text-3xl font-black text-cyan-400">36</div>
              <div className="mt-2 text-sm text-slate-300">سؤال لكل لعبة</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="text-3xl font-black text-cyan-400">6</div>
              <div className="mt-2 text-sm text-slate-300">فئات أساسية</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="text-3xl font-black text-cyan-400">3</div>
              <div className="mt-2 text-sm text-slate-300">وسائل مساعدة</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="text-3xl font-black text-cyan-400">∞</div>
              <div className="mt-2 text-sm text-slate-300">قابلية توسعة</div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">إعداد لعبة جديدة</div>
              <div className="text-2xl font-black">اختر الفئات</div>
            </div>
            <div className="rounded-full bg-cyan-400/15 px-3 py-1 text-sm text-cyan-300">
              الخطوة 1 من 3
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["تاريخ", "رياضة", "جغرافيا", "أفلام", "أغاني", "معلومات عامة"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-center text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                >
                  {item}
                </div>
              ),
            )}
          </div>

          <button className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 transition hover:opacity-90">
            ابدأ لعبة جديدة
          </button>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      title: "نظام لعب متكامل",
      text: "بدء جلسات، أسئلة، نتائج، وحساب النقاط بشكل منظم وقابل للتوسع.",
    },
    {
      title: "لوحة تحكم كاملة",
      text: "إدارة الفئات والأسئلة والمستخدمين والباقات والرصيد من مكان واحد.",
    },
    {
      title: "نظام رصيد وألعاب",
      text: "كل لعبة تخصم من رصيد المستخدم مع سجل واضح للحركات.",
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 text-center">
        <div className="text-sm font-bold text-cyan-300">المميزات</div>
        <h2 className="mt-3 text-4xl font-black">بنية قوية من البداية</h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-300">
          نبني المشروع كمنصة حقيقية جاهزة للإطلاق، وليس مجرد صفحات تجريبية.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
          >
            <h3 className="text-2xl font-black">{item.title}</h3>
            <p className="mt-4 leading-8 text-slate-300">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    "يسجل المستخدم ويمتلك رصيد ألعاب",
    "يبدأ لعبة جديدة ويتم خصم لعبة أو نقطة",
    "تُجلب الأسئلة حسب الفئات المحددة",
    "تنتهي اللعبة وتُحفظ النتيجة في السجل",
  ];

  return (
    <section id="how" className="bg-white/5 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <div className="text-sm font-bold text-cyan-300">كيف تعمل</div>
          <h2 className="mt-3 text-4xl font-black">تدفق لعب واضح</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-lg font-black text-cyan-300">
                {index + 1}
              </div>
              <p className="text-lg font-semibold leading-8 text-slate-200">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Plans() {
  return (
    <section id="plans" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 text-center">
        <div className="text-sm font-bold text-cyan-300">الباقات</div>
        <h2 className="mt-3 text-4xl font-black">هيكل جاهز للباقات والاشتراكات</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-black">تجريبية</h3>
          <p className="mt-3 text-slate-300">للبداية واختبار المنتج.</p>
          <div className="mt-6 text-4xl font-black text-cyan-400">0</div>
        </div>

        <div className="rounded-[2rem] border border-cyan-400/40 bg-cyan-400/10 p-6">
          <h3 className="text-2xl font-black">بريميوم</h3>
          <p className="mt-3 text-slate-200">عدد ألعاب أكبر ومزايا أوسع.</p>
          <div className="mt-6 text-4xl font-black text-cyan-300">9.9</div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-black">شركات</h3>
          <p className="mt-3 text-slate-300">حلول مخصصة للمناسبات والجهات.</p>
          <div className="mt-6 text-4xl font-black text-cyan-400">مخصص</div>
        </div>
      </div>
    </section>
  );
}

function AdminSection() {
  return (
    <section id="admin" className="pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-cyan-400/20 to-blue-500/10 p-8">
          <h2 className="text-4xl font-black">لوحة تحكم شاملة</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">
            إدارة الفئات، الأسئلة، المستخدمين، الأرصدة، والباقات من لوحة مركزية
            واحدة مبنية بطريقة احترافية وقابلة للتوسع.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:opacity-90">
              ابدأ التنفيذ
            </button>
            <button className="rounded-2xl border border-white/15 px-6 py-3 font-bold transition hover:bg-white/5">
              استعراض الهيكل
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Plans />
      <AdminSection />
    </main>
  );
}