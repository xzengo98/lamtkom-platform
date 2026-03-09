const categories = [
  { name: "تاريخ", questions: 120, status: "مفعلة" },
  { name: "رياضة", questions: 98, status: "مفعلة" },
  { name: "جغرافيا", questions: 76, status: "مفعلة" },
  { name: "أفلام", questions: 54, status: "معلقة" },
];

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black">إدارة الفئات</h2>
          <p className="mt-2 text-slate-300">
            من هنا ستضيف الفئات وتعدّلها وتحذفها لاحقًا.
          </p>
        </div>

        <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
          إضافة فئة جديدة
        </button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
        <div className="grid grid-cols-3 border-b border-white/10 bg-slate-900/60 px-6 py-4 font-bold text-slate-200">
          <div>اسم الفئة</div>
          <div>عدد الأسئلة</div>
          <div>الحالة</div>
        </div>

        {categories.map((category) => (
          <div
            key={category.name}
            className="grid grid-cols-3 border-b border-white/10 px-6 py-4 text-slate-300 last:border-b-0"
          >
            <div>{category.name}</div>
            <div>{category.questions}</div>
            <div>{category.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}