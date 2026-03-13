export const metadata = {
  title: "سياسة الخصوصية | لمّتنا",
  description: "سياسة الخصوصية الخاصة بمنصة لمّتنا.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold">سياسة الخصوصية</h1>
        <p className="mt-4 text-white/70">
          نحن نحترم خصوصيتك ونعمل على حماية بياناتك الشخصية عند استخدام منصة لمّتنا.
        </p>

        <div className="mt-10 space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-semibold">1. المعلومات التي نجمعها</h2>
            <p className="mt-3 leading-8">
              قد نجمع معلومات أساسية مثل الاسم، البريد الإلكتروني، وبيانات الاستخدام المرتبطة
              بإنشاء الحساب وتشغيل الألعاب وتحسين تجربة المستخدم داخل المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. كيفية استخدام المعلومات</h2>
            <p className="mt-3 leading-8">
              نستخدم المعلومات لتشغيل الحسابات، حفظ تقدم الألعاب، تحسين الأداء، تقديم الدعم،
              وتطوير ميزات جديدة داخل المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. حماية البيانات</h2>
            <p className="mt-3 leading-8">
              نتخذ إجراءات تقنية وتنظيمية معقولة لحماية البيانات من الوصول غير المصرح به أو
              التعديل أو الفقدان.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. مشاركة المعلومات</h2>
            <p className="mt-3 leading-8">
              لا نقوم ببيع بياناتك الشخصية. وقد تتم مشاركة بعض البيانات مع مزودي خدمات تقنيين
              فقط عند الحاجة لتشغيل المنصة بشكل آمن وفعال.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. ملفات تعريف الارتباط</h2>
            <p className="mt-3 leading-8">
              قد تستخدم المنصة ملفات تعريف الارتباط أو تقنيات مشابهة لتحسين الأداء وتذكر
              الجلسات وتقديم تجربة أفضل للمستخدم.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. حقوق المستخدم</h2>
            <p className="mt-3 leading-8">
              يمكنك طلب تحديث أو حذف بعض بياناتك، وذلك وفقًا لما تسمح به الأنظمة المعمول بها
              والإمكانات التقنية داخل المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. التحديثات</h2>
            <p className="mt-3 leading-8">
              قد نقوم بتحديث هذه السياسة من وقت لآخر، ويعد استمرارك في استخدام المنصة بعد
              التحديث موافقة على النسخة الأحدث.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}