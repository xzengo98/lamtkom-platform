import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProfileRow = {
  role: string | null;
};

export default async function AdminCodenamesPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as ProfileRow | null;

  if (!typedProfile || typedProfile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold text-white">لوحة تحكم Codenames</h1>
        <p className="mt-2 text-sm text-white/70">
          إدارة الكلمات والغرف الخاصة بلعبة Codenames
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/codenames/words"
          className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white hover:bg-black/30"
        >
          <div className="text-lg font-semibold">إدارة الكلمات</div>
          <div className="mt-2 text-sm text-white/60">
            إضافة وتعديل وحذف وتفعيل الكلمات
          </div>
        </Link>

        <Link
          href="/admin/codenames/upload"
          className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white hover:bg-black/30"
        >
          <div className="text-lg font-semibold">رفع جماعي</div>
          <div className="mt-2 text-sm text-white/60">
            رفع مجموعة كلمات دفعة واحدة
          </div>
        </Link>

        <Link
          href="/admin/codenames/rooms"
          className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white hover:bg-black/30"
        >
          <div className="text-lg font-semibold">إدارة الغرف</div>
          <div className="mt-2 text-sm text-white/60">
            متابعة الغرف والجلسات الخاصة باللعبة
          </div>
        </Link>
      </div>
    </div>
  );
}