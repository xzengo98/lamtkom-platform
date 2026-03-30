import Link from "next/link";
import { createCodenamesRoom } from "./actions";

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function CreateCodenamesRoomPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = resolvedSearchParams?.error?.trim() || "";

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0a1020] p-6 shadow-2xl md:p-8">
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            إنشاء غرفة جديدة
          </div>

          <h1 className="mt-4 text-3xl font-black text-white md:text-4xl">
            ابدأ غرفة Codenames
          </h1>

          <p className="mt-3 text-white/70">
            أدخل اسمك ليتم إنشاء غرفة جديدة، وستصبح أنت منشئ الغرفة والهوست.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
            {decodeURIComponent(errorMessage)}
          </div>
        )}

        <form action={createCodenamesRoom} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              اسمك
            </label>
            <input
              name="guest_name"
              placeholder="مثال: مصطفى"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-400"
            >
              إنشاء الغرفة
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