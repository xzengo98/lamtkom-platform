export const metadata = {
  title: "الشروط والأحكام | لمتكم",
  description: "الشروط والأحكام الخاصة باستخدام منصة لمتكم.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold">الشروط والأحكام</h1>
        <p className="mt-4 text-white/70">
          باستخدامك منصة لمتكم، فإنك توافق على هذه الشروط والأحكام.
        </p>

        <div className="mt-10 space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-semibold">1. استخدام المنصة</h2>
            <p className="mt-3 leading-8">
              يلتزم المستخدم باستخدام المنصة بشكل قانوني ومسؤول، وعدم إساءة استخدام الخدمات أو
              محاولة تعطيلها أو الوصول غير المصرح به إلى أي جزء منها.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. الحسابات</h2>
            <p className="mt-3 leading-8">
              أنت مسؤول عن صحة المعلومات التي تقدمها عند التسجيل وعن الحفاظ على سرية بيانات
              الدخول الخاصة بك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. المحتوى والخدمات</h2>
            <p className="mt-3 leading-8">
              نحتفظ بحق تعديل أو تحديث أو إيقاف أي جزء من المنصة أو أي ميزة أو محتوى في أي وقت،
              دون التزام دائم بتوفير نفس الخصائص مستقبلًا.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. الاشتراكات والباقات</h2>
            <p className="mt-3 leading-8">
              في حال توفير باقات مدفوعة، فإن تفاصيل الأسعار والمزايا ومدد الاشتراك تخضع لما هو
              معلن داخل صفحة الباقات وقت الاشتراك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. الملكية الفكرية</h2>
            <p className="mt-3 leading-8">
              جميع الحقوق المتعلقة بالمنصة، تصميمها، علامتها التجارية، ومحتواها التنظيمي تعود
              إلى مالك المنصة أو الجهات المرخصة له، ما لم ينص على خلاف ذلك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. حدود المسؤولية</h2>
            <p className="mt-3 leading-8">
              يتم تقديم المنصة بحسب التوفر، ونسعى لتقديم خدمة مستقرة، لكن لا نضمن عدم حدوث
              انقطاعات أو أخطاء تقنية بشكل كامل.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. إنهاء الاستخدام</h2>
            <p className="mt-3 leading-8">
              يحق لنا تعليق أو إنهاء وصول أي مستخدم في حال مخالفة الشروط أو إساءة استخدام
              المنصة.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}