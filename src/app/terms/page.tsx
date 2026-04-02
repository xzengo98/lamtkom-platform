import Link from "next/link";

export const metadata = {
  title: "الشروط والأحكام | لمتكم",
  description: "الشروط والأحكام الخاصة باستخدام منصة لمتكم.",
};

type SectionItem = {
  title: string;
  text: string;
};

const sections: SectionItem[] = [
  {
    title: "1. استخدام المنصة",
    text: "يلتزم المستخدم باستخدام منصة لمتكم بشكل قانوني ومسؤول، وعدم إساءة استخدام الخدمات أو محاولة تعطيلها أو الوصول غير المصرح به إلى أي جزء منها.",
  },
  {
    title: "2. الحسابات",
    text: "أنت مسؤول عن صحة المعلومات التي تقدمها عند التسجيل وعن الحفاظ على سرية بيانات الدخول الخاصة بك، كما تتحمل مسؤولية أي نشاط يتم من خلال حسابك.",
  },
  {
    title: "3. المحتوى والخدمات",
    text: "نحتفظ بحق تعديل أو تحديث أو إيقاف أي جزء من المنصة أو أي ميزة أو محتوى في أي وقت، دون التزام دائم بتوفير نفس الخصائص مستقبلًا.",
  },
  {
    title: "4. الاشتراكات والباقات",
    text: "في حال توفير باقات مدفوعة، فإن تفاصيل الأسعار والمزايا ومدد الاشتراك تخضع لما هو معلن داخل صفحة الباقات وقت الاشتراك.",
  },
  {
    title: "5. الملكية الفكرية",
    text: "جميع الحقوق المتعلقة بالمنصة، تصميمها، علامتها التجارية، ومحتواها التنظيمي تعود إلى مالك المنصة أو الجهات المرخصة له، ما لم ينص على خلاف ذلك.",
  },
  {
    title: "6. حدود المسؤولية",
    text: "يتم تقديم المنصة بحسب التوفر، ونسعى لتقديم خدمة مستقرة، لكن لا نضمن عدم حدوث انقطاعات أو أخطاء تقنية بشكل كامل.",
  },
  {
    title: "7. إنهاء الاستخدام",
    text: "يحق لنا تعليق أو إنهاء وصول أي مستخدم في حال مخالفة الشروط أو إساءة استخدام المنصة.",
  },
  {
    title: "8. التحديثات على الشروط",
    text: "قد نقوم بتحديث هذه الشروط من وقت لآخر، ويعد استمرارك في استخدام المنصة بعد أي تحديث موافقة على النسخة الأحدث منها.",
  },
];

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
    </svg>
  );
}

function TermsCard({ item }: { item: SectionItem }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-8 text-white/72 md:text-base">
        {item.text}
      </p>
    </div>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <section className="mb-8 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
            <SparkIcon />
            <span>الشروط والأحكام</span>
          </div>

          <h1 className="text-3xl font-black text-white md:text-5xl">
            الشروط والأحكام الخاصة
            <span className="mt-2 block bg-[linear-gradient(90deg,#67e8f9_0%,#c084fc_50%,#fb923c_100%)] bg-clip-text text-transparent">
              بمنصة لمتكم
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
            باستخدامك منصة لمتكم، فإنك توافق على هذه الشروط والأحكام. هذه الصفحة
            توضّح القواعد العامة المنظمة لاستخدام المنصة والخدمات المرتبطة بها.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              سياسة الخصوصية
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              العودة للرئيسية
            </Link>
          </div>
        </section>

        <section className="grid gap-5">
          {sections.map((item) => (
            <TermsCard key={item.title} item={item} />
          ))}
        </section>
      </div>
    </main>
  );
}