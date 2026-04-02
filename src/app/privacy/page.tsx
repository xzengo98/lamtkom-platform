import Link from "next/link";

export const metadata = {
  title: "سياسة الخصوصية | لمتكم",
  description: "سياسة الخصوصية الخاصة بمنصة لمتكم.",
};

type SectionItem = {
  title: string;
  text: string;
};

const sections: SectionItem[] = [
  {
    title: "1. المعلومات التي نجمعها",
    text: "قد نجمع معلومات أساسية مثل الاسم، البريد الإلكتروني، وبيانات الاستخدام المرتبطة بإنشاء الحساب وتشغيل الألعاب وتحسين تجربة المستخدم داخل المنصة.",
  },
  {
    title: "2. كيفية استخدام المعلومات",
    text: "نستخدم المعلومات لتشغيل الحسابات، حفظ تقدم الألعاب، تحسين الأداء، تقديم الدعم، وتطوير ميزات جديدة داخل المنصة.",
  },
  {
    title: "3. حماية البيانات",
    text: "نتخذ إجراءات تقنية وتنظيمية معقولة لحماية البيانات من الوصول غير المصرح به أو التعديل أو الفقدان.",
  },
  {
    title: "4. مشاركة المعلومات",
    text: "لا نقوم ببيع بياناتك الشخصية. وقد تتم مشاركة بعض البيانات مع مزودي خدمات تقنيين فقط عند الحاجة لتشغيل المنصة بشكل آمن وفعال.",
  },
  {
    title: "5. ملفات تعريف الارتباط",
    text: "قد تستخدم المنصة ملفات تعريف الارتباط أو تقنيات مشابهة لتحسين الأداء وتذكر الجلسات وتقديم تجربة أفضل للمستخدم.",
  },
  {
    title: "6. حقوق المستخدم",
    text: "يمكنك طلب تحديث أو حذف بعض بياناتك، وذلك وفقًا لما تسمح به الأنظمة المعمول بها والإمكانات التقنية داخل المنصة.",
  },
  {
    title: "7. التحديثات",
    text: "قد نقوم بتحديث هذه السياسة من وقت لآخر، ويعد استمرارك في استخدام المنصة بعد التحديث موافقة على النسخة الأحدث.",
  },
  {
    title: "8. التواصل معنا",
    text: "إذا كان لديك أي استفسار بخصوص الخصوصية أو البيانات، يمكنك التواصل معنا من خلال صفحة اتصل بنا داخل الموقع.",
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

function PrivacyCard({ item }: { item: SectionItem }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-8 text-white/72 md:text-base">
        {item.text}
      </p>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <section className="mb-8 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
            <SparkIcon />
            <span>سياسة الخصوصية</span>
          </div>

          <h1 className="text-3xl font-black text-white md:text-5xl">
            سياسة الخصوصية الخاصة
            <span className="mt-2 block bg-[linear-gradient(90deg,#67e8f9_0%,#c084fc_50%,#fb923c_100%)] bg-clip-text text-transparent">
              بمنصة لمتكم
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
            نحن نحترم خصوصيتك ونعمل على حماية بياناتك الشخصية عند استخدام منصة
            لمتكم. توضح هذه الصفحة كيف نتعامل مع المعلومات المرتبطة باستخدامك
            للمنصة.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/terms"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              الشروط والأحكام
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              اتصل بنا
            </Link>
          </div>
        </section>

        <section className="grid gap-5">
          {sections.map((item) => (
            <PrivacyCard key={item.title} item={item} />
          ))}
        </section>
      </div>
    </main>
  );
}