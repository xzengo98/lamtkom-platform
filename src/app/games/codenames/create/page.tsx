import Link from "next/link";
import { createCodenamesRoom } from "./actions";

export default function CreateCodenamesRoomPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold text-white">إنشاء غرفة Codenames</h1>
        <p className="mt-2 text-sm text-white/70">
          أدخل اسمك ليتم إنشاء غرفة جديدة تلقائيًا
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
        <form action={createCodenamesRoom} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/70">اسمك</label>
            <input
              name="guest_name"
              placeholder="مثال: مصطفى"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/40"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500"
            >
              إنشاء الغرفة
            </button>

            <Link
              href="/games/codenames"
              className="rounded-2xl border border-white/10 px-5 py-3 text-white/80 hover:bg-white/5"
            >
              رجوع
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}