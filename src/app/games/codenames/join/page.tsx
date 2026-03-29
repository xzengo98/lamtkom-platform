import Link from "next/link";
import { joinCodenamesRoom } from "./actions";

export default function JoinCodenamesRoomPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0a1020] p-6 md:p-8">
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">
            انضم إلى غرفة
          </div>
          <h1 className="mt-4 text-3xl font-black text-white md:text-4xl">
            دخول غرفة Codenames
          </h1>
          <p className="mt-3 text-white/70">
            أدخل اسمك ورمز الغرفة، وسيتم إدخالك مباشرة إلى صفحة الانتظار.
          </p>
        </div>

        <form action={joinCodenamesRoom} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              اسمك
            </label>
            <input
              name="guest_name"
              placeholder="مثال: أحمد"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              رمز الغرفة
            </label>
            <input
              name="room_code"
              placeholder="مثال: AB7KQ2"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 uppercase text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-blue-500 px-6 py-3 font-bold text-white transition hover:bg-blue-400"
            >
              دخول الغرفة
            </button>

            <Link
              href="/games/codenames"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              رجوع
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}