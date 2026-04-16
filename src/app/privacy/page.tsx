import Link from "next/link";

export const metadata = {
  title: "سياسة الخصوصية | لمتكم",
  description: "سياسة الخصوصية الخاصة بمنصة لمتكم.",
};

type SectionItem = { title: string; text: string };

const sections: SectionItem[] = [
  { title: "1. المعلومات التي نجمعها",  text: "قد نجمع معلومات أساسية مثل الاسم، البريد الإلكتروني، وبيانات الاستخدام المرتبطة بإنشاء الحساب وتشغيل الألعاب وتحسين تجربة المستخدم داخل المنصة." },
  { title: "2. كيفية استخدام المعلومات", text: "نستخدم المعلومات لتشغيل الحسابات، حفظ تقدم الألعاب، تحسين الأداء، تقديم الدعم، وتطوير ميزات جديدة داخل المنصة." },
  { title: "3. حماية البيانات",           text: "نتخذ إجراءات تقنية وتنظيمية معقولة لحماية البيانات من الوصول غير المصرح به أو التعديل أو الفقدان." },
  { title: "4. مشاركة المعلومات",         text: "لا نقوم ببيع بياناتك الشخصية. وقد تتم مشاركة بعض البيانات مع مزودي خدمات تقنيين فقط عند الحاجة لتشغيل المنصة بشكل آمن وفعال." },
  { title: "5. ملفات تعريف الارتباط",     text: "قد تستخدم المنصة ملفات تعريف الارتباط أو تقنيات مشابهة لتحسين الأداء وتذكر الجلسات وتقديم تجربة أفضل للمستخدم." },
  { title: "6. حقوق المستخدم",            text: "يمكنك طلب تحديث أو حذف بعض بياناتك، وذلك وفقًا لما تسمح به الأنظمة المعمول بها والإمكانات التقنية داخل المنصة." },
  { title: "7. التحديثات",                text: "قد نقوم بتحديث هذه السياسة من وقت لآخر، ويعد استمرارك في استخدام المنصة بعد التحديث موافقة على النسخة الأحدث." },
  { title: "8. التواصل معنا",             text: "إذا كان لديك أي استفسار بخصوص الخصوصية أو البيانات، يمكنك التواصل معنا من خلال صفحة اتصل بنا داخل الموقع." },
];

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2.5"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
      <path d="M12 15v2"/>
    </svg>
  );
}

function PrivacyCard({ item, index }: { item: SectionItem; index: number }) {
  const colors = [
    "border-cyan-400/15 text-cyan-300/60",
    "border-violet-400/15 text-violet-300/60",
    "border-emerald-400/15 text-emerald-300/60",
    "border-orange-400/15 text-orange-300/60",
    "border-cyan-400/15 text-cyan-300/60",
    "border-violet-400/15 text-violet-300/60",
    "border-emerald-400/15 text-emerald-300/60",
    "border-orange-400/15 text-orange-300/60",
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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">

        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,18,42,0.98)_0%,rgba(4,10,26,1)_55%,rgba(6,12,32,0.98)_100%)]">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl" />

          <div className="relative px-7 py-10 md:px-10 md:py-12">
            {/* Breadcrumb */}
            <div className="mb-5 flex items-center gap-2 text-xs font-bold text-white/30">
              <Link href="/" className="transition hover:text-white/55">الرئيسية</Link>
              <span>/</span>
              <span className="text-white/50">سياسة الخصوصية</span>
            </div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-bold text-cyan-300">
              <LockIcon />
              سياسة الخصوصية
            </div>

            <h1 className="text-3xl font-black leading-tight text-white md:text-4xl xl:text-5xl">
              سياسة الخصوصية
              <span className="mt-2 block bg-gradient-to-l from-cyan-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
                الخاصة بمنصة لمتكم
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-white/55 md:text-base">
              نحن نحترم خصوصيتك ونعمل على حماية بياناتك الشخصية. توضح هذه الصفحة كيف نتعامل مع المعلومات المرتبطة باستخدامك للمنصة.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/terms"   className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-black text-white/70 transition hover:bg-white/8 hover:text-white">
                الشروط والأحكام
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_3px_16px_rgba(34,211,238,0.22)] transition hover:bg-cyan-400 active:scale-[0.98]">
                اتصل بنا
              </Link>
            </div>
          </div>
        </section>

        {/* Sections */}
        <section className="space-y-3">
          {sections.map((item, i) => (
            <PrivacyCard key={item.title} item={item} index={i} />
          ))}
        </section>

        {/* Footer strip */}
        <div className="mt-10 flex items-center justify-between border-t border-white/6 pt-6 text-xs font-bold text-white/20">
          <span>لمتكم © {new Date().getFullYear()}</span>
          <Link href="/terms" className="transition hover:text-white/45">الشروط والأحكام</Link>
        </div>
      </div>
    </main>
  );
}
