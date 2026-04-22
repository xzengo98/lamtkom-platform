import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createCouponAction, toggleCouponStatusAction } from "./actions";

type SearchParams = Promise<{
  success?: string;
  error?: string;
}>;

type CouponRow = {
  id: string;
  code: string;
  is_active: boolean;
  reward_type: "games_balance" | "account_tier";
  target_game: string | null;
  games_amount: number;
  target_tier: string | null;
  assigned_user_id: string | null;
  max_redemptions: number;
  redeemed_count: number;
  single_use_per_user: boolean;
  starts_at: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
};

type RedemptionRow = {
  id: string;
  code_snapshot: string;
  reward_type_snapshot: string;
  target_game_snapshot: string | null;
  games_amount_snapshot: number;
  target_tier_snapshot: string | null;
  redeemed_at: string;
  user_id: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("ar-JO");
  } catch {
    return value;
  }
}

function rewardLabel(coupon: CouponRow) {
  if (coupon.reward_type === "games_balance") {
    return `إضافة ${coupon.games_amount} ألعاب (${coupon.target_game ?? "lamtkom"})`;
  }

  return `ترقية إلى ${coupon.target_tier ?? "premium"}`;
}

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const [{ data: coupons }, { data: redemptions }] = await Promise.all([
    supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("coupon_redemptions")
      .select("*")
      .order("redeemed_at", { ascending: false })
      .limit(20),
  ]);

  const couponRows = (coupons ?? []) as CouponRow[];
  const redemptionRows = (redemptions ?? []) as RedemptionRow[];

  return (
    <main className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(34,211,238,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.35)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(160deg,rgba(6,12,30,0.96)_0%,rgba(3,6,16,0.99)_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.30)]">
          <div className="border-b border-white/8 px-6 py-6 md:px-8">
            <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-300">
              إدارة الكوبونات
            </div>

            <h1 className="mt-4 text-3xl font-black text-white md:text-4xl">
              كوبونات الأعضاء
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-8 text-white/58 md:text-base">
              أنشئ كوبونات لإضافة ألعاب أو ترقية الحساب إلى Premium، ثم راقب
              استخدامها من نفس الصفحة.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/[0.08]"
              >
                العودة إلى لوحة الإدارة
              </Link>
            </div>

            {params.success ? (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                {params.success}
              </div>
            ) : null}

            {params.error ? (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                {params.error}
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[420px_minmax(0,1fr)]">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
              <h2 className="text-xl font-black text-white">إنشاء كوبون جديد</h2>
              <p className="mt-2 text-sm leading-7 text-white/55">
                اترك حقل الكود فارغًا إذا أردت توليده تلقائيًا.
              </p>

              <form action={createCouponAction} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    الكود
                  </label>
                  <input
                    name="code"
                    placeholder="مثال: LMTK-ABCD-1234"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    نوع الكوبون
                  </label>
                  <select
                    name="rewardType"
                    defaultValue="games_balance"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="games_balance">إضافة ألعاب</option>
                    <option value="account_tier">ترقية الحساب</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    اللعبة المستهدفة
                  </label>
                  <select
                    name="targetGame"
                    defaultValue="lamtkom"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="lamtkom">لمتكم</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    عدد الألعاب
                  </label>
                  <input
                    name="gamesAmount"
                    type="number"
                    min="0"
                    defaultValue="5"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    الرتبة المستهدفة
                  </label>
                  <select
                    name="targetTier"
                    defaultValue="premium"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="">بدون</option>
                    <option value="free">free</option>
                    <option value="premium">premium</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    يوزر المستخدم المخصص له (اختياري)
                  </label>
                  <input
                    name="assignedUserId"
                    placeholder="uuid"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white/75">
                      الحد الأقصى للاستخدام
                    </label>
                    <input
                      name="maxRedemptions"
                      type="number"
                      min="1"
                      defaultValue="1"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-bold text-white/80">
                      <input
                        name="singleUsePerUser"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      استخدام مرة واحدة لكل مستخدم
                    </label>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white/75">
                      يبدأ من
                    </label>
                    <input
                      name="startsAt"
                      type="datetime-local"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-white/75">
                      ينتهي في
                    </label>
                    <input
                      name="expiresAt"
                      type="datetime-local"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    ملاحظات
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="ملاحظات داخلية"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 py-4 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400"
                >
                  إنشاء الكوبون
                </button>
              </form>
            </section>

            <section className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-white">الكوبونات الحالية</h2>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-white/60">
                    {couponRows.length} كوبون
                  </div>
                </div>

                <div className="space-y-4">
                  {couponRows.length === 0 ? (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5 text-sm font-bold text-white/50">
                      لا توجد كوبونات حتى الآن.
                    </div>
                  ) : (
                    couponRows.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.015)_100%)] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-black text-white">
                              {coupon.code}
                            </div>
                            <div className="mt-1 text-sm text-white/55">
                              {rewardLabel(coupon)}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                coupon.is_active
                                  ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                                  : "border border-red-400/20 bg-red-500/10 text-red-200"
                              }`}
                            >
                              {coupon.is_active ? "مفعّل" : "متوقف"}
                            </span>

                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-black text-white/60">
                              {coupon.redeemed_count} / {coupon.max_redemptions}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm text-white/65 md:grid-cols-2">
                          <div>أنشئ في: {formatDate(coupon.created_at)}</div>
                          <div>ينتهي في: {formatDate(coupon.expires_at)}</div>
                          <div>
                            مخصص لمستخدم:{" "}
                            {coupon.assigned_user_id ? coupon.assigned_user_id : "عام"}
                          </div>
                          <div>
                            لكل مستخدم مرة واحدة:{" "}
                            {coupon.single_use_per_user ? "نعم" : "لا"}
                          </div>
                        </div>

                        {coupon.notes ? (
                          <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-white/60">
                            {coupon.notes}
                          </div>
                        ) : null}

                        <form action={toggleCouponStatusAction} className="mt-4">
                          <input type="hidden" name="couponId" value={coupon.id} />
                          <input
                            type="hidden"
                            name="nextActive"
                            value={coupon.is_active ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                              coupon.is_active
                                ? "border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/15"
                                : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                            }`}
                          >
                            {coupon.is_active ? "إيقاف الكوبون" : "تفعيل الكوبون"}
                          </button>
                        </form>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-white">آخر عمليات التفعيل</h2>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-white/60">
                    {redemptionRows.length} عملية
                  </div>
                </div>

                <div className="space-y-3">
                  {redemptionRows.length === 0 ? (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5 text-sm font-bold text-white/50">
                      لا توجد عمليات تفعيل حتى الآن.
                    </div>
                  ) : (
                    redemptionRows.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.015)_100%)] px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-black text-white">
                              {item.code_snapshot}
                            </div>
                            <div className="mt-1 text-xs text-white/55">
                              {item.reward_type_snapshot === "games_balance"
                                ? `إضافة ${item.games_amount_snapshot} ألعاب`
                                : `ترقية إلى ${item.target_tier_snapshot ?? "premium"}`}
                            </div>
                          </div>

                          <div className="text-xs font-bold text-white/45">
                            {formatDate(item.redeemed_at)}
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-white/40">
                          المستخدم: {item.user_id}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}