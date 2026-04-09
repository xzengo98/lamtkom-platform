import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AdminEmptyState from "@/components/admin/admin-empty-state";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  email: string | null;
  username: string | null;
  phone: string | null;
  role: string | null;
  account_tier: string | null;
  games_remaining: number | null;
  games_played: number | null;
  created_at: string | null;
};

type PageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("ar", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

async function updateUserAction(formData: FormData) {
  "use server";

  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    redirect("/");
  }

  const userId = String(formData.get("user_id") ?? "");
  const roleRaw = String(formData.get("role") ?? "user");
  const tierRaw = String(formData.get("account_tier") ?? "free");
  const gamesRemainingRaw = Number(formData.get("games_remaining") ?? 0);

  const role = roleRaw === "admin" ? "admin" : "user";
  const accountTier = tierRaw === "premium" ? "premium" : "free";
  const gamesRemaining = Number.isFinite(gamesRemainingRaw)
    ? Math.max(0, Math.floor(gamesRemainingRaw))
    : 0;

  if (!userId) {
    redirect("/admin/users?error=invalid");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role,
      account_tier: accountTier,
      games_remaining: gamesRemaining,
    })
    .eq("id", userId);

  if (error) {
    redirect("/admin/users?error=save");
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/game/start");
  revalidatePath("/");

  redirect("/admin/users?saved=1");
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    redirect("/");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, username, phone, role, account_tier, games_remaining, games_played, created_at"
    )
    .order("created_at", { ascending: false });

  const users: UserRow[] = Array.isArray(data) ? (data as UserRow[]) : [];

  const selectClass = "w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60";
  const labelClass  = "mb-1.5 block text-xs font-bold text-white/45";

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="إدارة الأعضاء"
        description="من هنا يمكنك تعديل الدور الإداري، نوع الحساب، وعدد الألعاب المتبقية لكل مستخدم."
      />

      {params.saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/8 px-4 py-3.5 text-sm font-bold text-emerald-300">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
          تم حفظ التعديلات بنجاح.
        </div>
      )}

      {params.error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-400/25 bg-red-400/8 px-4 py-3.5 text-sm font-bold text-red-300">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/></svg>
          حدث خطأ أثناء الحفظ.
        </div>
      )}

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-400/25 bg-red-400/8 px-4 py-3.5 text-sm font-bold text-red-300">
          فشل تحميل المستخدمين: {error.message}
        </div>
      ) : users.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {users.map((item) => (
            <form
              key={item.id}
              action={updateUserAction}
              className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(14,22,48,0.94)_0%,rgba(6,12,28,0.98)_100%)]"
            >
              {/* Colored top bar by tier */}
              <div className={`h-[2px] w-full ${item.account_tier === "premium" ? "bg-orange-400" : "bg-cyan-400"} opacity-60`} />

              <input type="hidden" name="user_id" value={item.id} />

              <div className="flex flex-col gap-4 p-5">
                {/* User header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/8 text-base font-black text-cyan-300">
                      {(item.username || item.email || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black text-white sm:text-xl">
                        {item.username || "بدون اسم مستخدم"}
                      </h3>
                      <p className="truncate text-[11px] text-white/30">{item.id.slice(0, 16)}...</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${item.role === "admin" ? "border-red-400/25 bg-red-400/10 text-red-300" : "border-white/10 bg-white/5 text-white/50"}`}>
                      {item.role === "admin" ? "ADMIN" : "USER"}
                    </span>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${item.account_tier === "premium" ? "border-orange-400/25 bg-orange-400/10 text-orange-300" : "border-cyan-400/20 bg-cyan-400/8 text-cyan-300"}`}>
                      {item.account_tier === "premium" ? "Premium" : "Free"}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <MiniInfoCard label="البريد الإلكتروني" value={item.email || "-"} />
                  <MiniInfoCard label="رقم الهاتف" value={item.phone || "-"} />
                  <MiniInfoCard label="الألعاب المتبقية" value={String(item.games_remaining ?? 0)} accent="cyan" />
                  <MiniInfoCard label="الألعاب التي لُعبت" value={String(item.games_played ?? 0)} accent="orange" />
                </div>

                {/* Date */}
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[11px] font-bold text-white/35">تاريخ الإنشاء</p>
                  <p className="mt-1 text-sm font-bold text-white/70">{formatDate(item.created_at)}</p>
                </div>

                {/* Edit controls */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>الدور</label>
                    <select name="role" defaultValue={item.role ?? "user"} className={selectClass}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>نوع الحساب</label>
                    <select name="account_tier" defaultValue={item.account_tier ?? "free"} className={selectClass}>
                      <option value="free">free</option>
                      <option value="premium">premium</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>الألعاب المتبقية</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      name="games_remaining"
                      defaultValue={item.games_remaining ?? 0}
                      className={selectClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_3px_14px_rgba(34,211,238,0.20)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                  حفظ التعديلات
                </button>
              </div>
            </form>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="لا يوجد مستخدمون حاليًا"
          description="عند إنشاء حسابات جديدة ستظهر هنا لتتمكن من إدارتها."
        />
      )}
    </div>
  );
}

function MiniInfoCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "cyan" | "orange";
}) {
  const valColor = accent === "cyan" ? "text-cyan-300" : accent === "orange" ? "text-orange-300" : "text-white/80";
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] font-bold text-white/35">{label}</p>
      <p className={`mt-1 break-words text-sm font-black ${valColor}`}>{value}</p>
    </div>
  );
}