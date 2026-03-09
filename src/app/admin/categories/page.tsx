import AdminEmptyState from "@/components/admin/admin-empty-state";
import AdminPageHeader from "@/components/admin/admin-page-header";

const categories = [
  { name: "تاريخ", questions: 120, status: "مفعلة" },
  { name: "رياضة", questions: 98, status: "مفعلة" },
  { name: "جغرافيا", questions: 76, status: "مفعلة" },
  { name: "أفلام", questions: 54, status: "معلقة" },
];

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="إدارة الفئات"
        description="من هنا ستضيف الفئات وتعدّلها وتحذفها لاحقًا."
        action={
          <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
            إضافة فئة جديدة
          </button>
        }
      />

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <input
            type="text"
            placeholder="ابحث عن فئة..."
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />
          <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none">
            <option>كل الحالات</option>
            <option>مفعلة</option>
            <option>معلقة</option>
          </select>
        </div>
      </div>

      {categories.length > 0 ? (
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
      ) : (
        <AdminEmptyState
          title="لا توجد فئات بعد"
          description="ابدأ بإضافة أول فئة حتى يتمكن النظام من تنظيم الأسئلة وربطها باللعبة."
          buttonText="إضافة أول فئة"
        />
      )}
    </div>
  );
}