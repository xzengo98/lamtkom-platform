import Link from "next/link";
import { bulkUploadCodenamesWords } from "./actions";

export default function AdminCodenamesUploadPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">
              رفع كلمات Codenames
            </h1>
            <p className="mt-1 text-sm text-white/70">
              ألصق الكلمات سطر تحت سطر أو مفصولة بفواصل
            </p>
          </div>

          <Link
            href="/admin/codenames/words"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            العودة لإدارة الكلمات
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <form action={bulkUploadCodenamesWords} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select
              name="language"
              defaultValue="ar"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="ar">عربي</option>
              <option value="en">English</option>
            </select>

            <input
              name="category"
              placeholder="تصنيف اختياري"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/40"
            />

            <select
              name="is_active"
              defaultValue="true"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="true">نشطة</option>
              <option value="false">معطلة</option>
            </select>
          </div>

          <textarea
            name="words"
            rows={18}
            placeholder={`مثال:
تفاحة
سيارة
بحر
جبل
مدرسة`}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none placeholder:text-white/40"
          />

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            النظام سيقوم تلقائياً بحذف التكرار وتجاهل الكلمات الموجودة مسبقاً
          </div>

          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500"
          >
            رفع الكلمات
          </button>
        </form>
      </div>
    </div>
  );
}