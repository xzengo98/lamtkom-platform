"use client";

export default function SelectionToolbar() {
  function selectAll() {
    document
      .querySelectorAll<HTMLInputElement>(".game-checkbox")
      .forEach((checkbox) => {
        checkbox.checked = true;
      });
  }

  function clearAll() {
    document
      .querySelectorAll<HTMLInputElement>(".game-checkbox")
      .forEach((checkbox) => {
        checkbox.checked = false;
      });
  }

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="text-lg font-black">قائمة الألعاب المنتهية</div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={selectAll}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300"
        >
          تحديد الكل
        </button>

        <button
          type="button"
          onClick={clearAll}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300"
        >
          إلغاء التحديد
        </button>

        <button
          type="submit"
          className="rounded-xl bg-red-600 px-5 py-2 text-sm font-black text-white"
        >
          حذف المحدد
        </button>
      </div>
    </div>
  );
}