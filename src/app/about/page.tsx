import Link from "next/link";

export const metadata = {
  title: "من نحن | لمّتنا",
  description: "تعرف على منصة لمّتنا ورسالتها.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold">من نحن</h1>
          <p className="mt-4 text-lg leading-8 text-white/75">
            لمّتنا هي منصة ألعاب أسئلة وتحديات صُممت لتجمع الأصدقاء والعائلة في تجربة ممتعة
            وسهلة ومرتبة، مع تركيز على البساطة وسرعة الاستخدام وروح المنافسة الخفيفة.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">رؤيتنا</h2>
            <p className="mt-3 leading-8 text-white/70">
              أن تكون لمّتنا خيارًا ممتعًا وسهلًا لجلسات اللعب الجماعي العربية، سواء داخل
              المنزل أو في المناسبات والفعاليات.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">مهمتنا</h2>
            <p className="mt-3 leading-8 text-white/70">
              تقديم تجربة أسئلة منظمة وحديثة تجعل اللعب أكثر حماسًا وأسهل في الإدارة والوصول.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">ما الذي يميزنا</h2>
            <p className="mt-3 leading-8 text-white/70">
              تصميم بسيط، تجربة مباشرة، تنظيم واضح للألعاب، وصفحات سهلة للمستخدم والإدارة.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">لمن صُممت المنصة؟</h2>
          <p className="mt-4 leading-8 text-white/75">
            صُممت لمّتنا للأصدقاء، العائلات، التجمعات، والمستخدمين الذين يريدون تجربة لعب
            أسئلة ممتعة وسريعة بدون تعقيد.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              ابدأ الآن
            </Link>
            <Link
              href="/pricing"
              className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold"
            >
              عرض الباقات
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}