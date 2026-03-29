export default function AdminCodenamesRoomsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold text-white">غرف Codenames</h1>
        <p className="mt-2 text-sm text-white/70">
          هذه الصفحة مخصصة لإدارة الغرف والجلسات الخاصة باللعبة
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-white/70">
        لا توجد وظائف للغرف بعد سنقوم ببنائها في الخطوة التالية
      </div>
    </div>
  );
}