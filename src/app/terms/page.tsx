import Link from "next/link";

export const metadata = {
  title: "الشروط والأحكام | لمتكم",
  description: "الشروط والأحكام الخاصة باستخدام منصة لمتكم.",
};

type SectionItem = { title: string; text: string };

const sections: SectionItem[] = [
  { title: "1. استخدام المنصة",            text: "يلتزم المستخدم باستخدام منصة لمتكم بشكل قانوني ومسؤول، وعدم إساءة استخدام الخدمات أو محاولة تعطيلها أو الوصول غير المصرح به إلى أي جزء منها." },
  { title: "2. الحسابات",                  text: "أنت مسؤول عن صحة المعلومات التي تقدمها عند التسجيل وعن الحفاظ على سرية بيانات الدخول الخاصة بك، كما تتحمل مسؤولية أي نشاط يتم من خلال حسابك." },
  { title: "3. المحتوى والخدمات",          text: "نحتفظ بحق تعديل أو تحديث أو إيقاف أي جزء من المنصة أو أي ميزة أو محتوى في أي وقت، دون التزام دائم بتوفير نفس الخصائص مستقبلًا." },
  { title: "4. الاشتراكات والباقات",       text: "في حال توفير باقات مدفوعة، فإن تفاصيل الأسعار والمزايا ومدد الاشتراك تخضع لما هو معلن داخل صفحة الباقات وقت الاشتراك." },
  { title: "5. الملكية الفكرية",           text: "جميع الحقوق المتعلقة بالمنصة، تصميمها، علامتها التجارية، ومحتواها التنظيمي تعود إلى مالك المنصة أو الجهات المرخصة له، ما لم ينص على خلاف ذلك." },
  { title: "6. حدود المسؤولية",            text: "يتم تقديم المنصة بحسب التوفر، ونسعى لتقديم خدمة مستقرة، لكن لا نضمن عدم حدوث انقطاعات أو أخطاء تقنية بشكل كامل." },
  { title: "7. إنهاء الاستخدام",           text: "يحق لنا تعليق أو إنهاء وصول أي مستخدم في حال مخالفة الشروط أو إساءة استخدام المنصة." },
  { title: "8. التحديثات على الشروط",      text: "قد نقوم بتحديث هذه الشروط من وقت لآخر، ويعد استمرارك في استخدام المنصة بعد أي تحديث موافقة على النسخة الأحدث منها." },
];

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
      <path d="M14 2v6h6M8 13h8M8 17h5"/>
    </svg>
  );
}

function TermsCard({ item, index }: { item: SectionItem; index: number }) {
  const colors = [
    "border-orange-400/15 text-orange-300/60",
    "border-cyan-400/15 text-cyan-300/60",
    "border-violet-400/15 text-violet-300/60",
    "border-emerald-400/15 text-emerald-300/60",
    "border-orange-400/15 text-orange-300/60",
    "border-cyan-400/15 text-cyan-300/60",
    "border-violet-400/15 text-violet-300/60",
    "border-emerald-400/15 text-emerald-300/60",
  ];
  const numColor = colors[index] ?? colors[0];

  return (
    <div className="group flex gap-4 overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(160deg,rgba(12,20,44,0.90)_0%,rgba(5,10,24,0.96)_100%)] p-5 transition duration-200 hover:border-white/12 sm:gap-5 sm:p-6">
      {/* Number */}
      <div className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-black ${numColor}`} style={{ minWidth: 42, textAlign: "center" }}>
        {index + 1}
      </div>

      <div>
        <h3 className="text-base font-black text-white sm:text-lg">{item.title}</h3>
        <p className="mt-2.5 text-sm leading-8 text-white/60 md:text-base">{item.text}</p>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">

        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,18,42,0.98)_0%,rgba(4,10,26,1)_55%,rgba(6,12,32,0.98)_100%)]">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-orange-500/6 blur-3xl" />

          <div className="relative px-7 py-10 md:px-10 md:py-12">
            {/* Breadcrumb */}
            <div className="mb-5 flex items-center gap-2 text-xs font-bold text-white/30">
              <Link href="/" className="transition hover:text-white/55">الرئيسية</Link>
              <span>/</span>
              <span className="text-white/50">الشروط والأحكام</span>
            </div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/8 px-4 py-2 text-xs font-bold text-orange-300">
              <DocIcon />
              الشروط والأحكام
            </div>

            <h1 className="text-3xl font-black leading-tight text-white md:text-4xl xl:text-5xl">
              الشروط والأحكام
              <span className="mt-2 block bg-gradient-to-l from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                الخاصة بمنصة لمتكم
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-white/55 md:text-base">
              باستخدامك منصة لمتكم، فإنك توافق على هذه الشروط. تُوضّح هذه الصفحة القواعد العامة المنظمة لاستخدام المنصة والخدمات المرتبطة بها.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/privacy" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white">
                سياسة الخصوصية
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-black text-white shadow-[0_3px_16px_rgba(249,115,22,0.22)] transition hover:bg-orange-400 active:scale-[0.98]">
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </section>

        {/* Sections */}
        <section className="space-y-3">
          {sections.map((item, i) => (
            <TermsCard key={item.title} item={item} index={i} />
          ))}
        </section>

        {/* Footer strip */}
        <div className="mt-10 flex items-center justify-between border-t border-white/6 pt-6 text-xs font-bold text-white/20">
          <span>لمتكم © {new Date().getFullYear()}</span>
          <Link href="/privacy" className="transition hover:text-white/45">سياسة الخصوصية</Link>
        </div>
      </div>
    </main>
  );
}
