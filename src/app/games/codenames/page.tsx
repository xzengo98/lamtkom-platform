import Link from "next/link";

export default function CodenamesHomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-white">Codenames</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          لعبة جماعية أونلاين تعتمد على فرق وتلميحات وكلمات سرية. أنشئ غرفة
          جديدة أو انضم إلى غرفة موجودة باستخدام رمز الغرفة.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/games/codenames/create"
          className="rounded-3xl border border-white/10 bg-black/20 p-6 text-white transition hover:bg-black/30"
        >
          <div className="text-xl font-semibold">إنشاء غرفة</div>
          <div className="mt-2 text-sm text-white/60">
            ابدأ غرفة جديدة وشارك الرمز مع اللاعبين
          </div>
        </Link>

        <Link
          href="/games/codenames/join"
          className="rounded-3xl border border-white/10 bg-black/20 p-6 text-white transition hover:bg-black/30"
        >
          <div className="text-xl font-semibold">الانضمام لغرفة</div>
          <div className="mt-2 text-sm text-white/60">
            أدخل رمز الغرفة وانضم مباشرة إلى الجلسة
          </div>
        </Link>
      </div>
    </div>
  );
}