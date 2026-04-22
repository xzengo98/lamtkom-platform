import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  createCouponAction,
  deleteCouponAction,
  toggleCouponStatusAction,
  updateCouponAction,
} from "./actions";

type SearchParams = Promise<{
  success?: string;
  error?: string;
  q?: string;
  status?: string;
  reward?: string;
  page?: string;
  rpage?: string;
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
  created_by: string | null;
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

type ProfileRow = {
  id: string;
  username: string | null;
  email: string | null;
};

const PAGE_SIZE = 3;
const REDEMPTION_PAGE_SIZE = 3;

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

function userDisplay(profile: ProfileRow | null | undefined, fallback = "—") {
  if (!profile) return fallback;
  if (profile.username && profile.email) {
    return `${profile.username} — ${profile.email}`;
  }
  return profile.username || profile.email || fallback;
}

function isCouponMatch(
  coupon: CouponRow,
  q: string,
  assignedProfile: ProfileRow | null | undefined,
  creatorProfile: ProfileRow | null | undefined,
) {
  if (!q) return true;

  const haystack = [
    coupon.code,
    coupon.reward_type,
    coupon.target_game,
    coupon.target_tier,
    coupon.notes,
    assignedProfile?.username,
    assignedProfile?.email,
    creatorProfile?.username,
    creatorProfile?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q.toLowerCase());
}

function getPaginationItems(totalPages: number, currentPage: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | string> = [1];

  if (currentPage > 3) {
    items.push("start-ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (currentPage < totalPages - 2) {
    items.push("end-ellipsis");
  }

  items.push(totalPages);

  return items;
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

  const q = String(params.q ?? "").trim();
  const status = String(params.status ?? "all").trim();
  const reward = String(params.reward ?? "all").trim();

  const rawPage = Number(params.page ?? "1");
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawRedemptionPage = Number(params.rpage ?? "1");
  const requestedRedemptionPage =
    Number.isFinite(rawRedemptionPage) && rawRedemptionPage > 0
      ? rawRedemptionPage
      : 1;

  const [{ data: coupons }, { data: redemptions }, { data: profiles }] =
    await Promise.all([
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      supabase
        .from("coupon_redemptions")
        .select("*")
        .order("redeemed_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, username, email")
        .order("username", { ascending: true }),
    ]);

  const couponRows = (coupons ?? []) as CouponRow[];
  const redemptionRows = (redemptions ?? []) as RedemptionRow[];
  const profileRows = (profiles ?? []) as ProfileRow[];

  const profileMap = new Map(profileRows.map((item) => [item.id, item]));

  const filteredCoupons = couponRows.filter((coupon) => {
    const assignedProfile = coupon.assigned_user_id
      ? profileMap.get(coupon.assigned_user_id)
      : null;
    const creatorProfile = coupon.created_by
      ? profileMap.get(coupon.created_by)
      : null;

    const statusPass =
      status === "all"
        ? true
        : status === "active"
          ? coupon.is_active
          : !coupon.is_active;

    const rewardPass = reward === "all" ? true : coupon.reward_type === reward;
    const searchPass = isCouponMatch(coupon, q, assignedProfile, creatorProfile);

    return statusPass && rewardPass && searchPass;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedCoupons = filteredCoupons.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const totalRedemptionPages = Math.max(
    1,
    Math.ceil(redemptionRows.length / REDEMPTION_PAGE_SIZE),
  );
  const currentRedemptionPage = Math.min(
    requestedRedemptionPage,
    totalRedemptionPages,
  );
  const redemptionStartIndex =
    (currentRedemptionPage - 1) * REDEMPTION_PAGE_SIZE;
  const paginatedRedemptions = redemptionRows.slice(
    redemptionStartIndex,
    redemptionStartIndex + REDEMPTION_PAGE_SIZE,
  );

  const paginationItems = getPaginationItems(totalPages, currentPage);
  const redemptionPaginationItems = getPaginationItems(
    totalRedemptionPages,
    currentRedemptionPage,
  );

  function buildPageHref(page: number) {
    const query = new URLSearchParams();

    if (q) query.set("q", q);
    if (status !== "all") query.set("status", status);
    if (reward !== "all") query.set("reward", reward);
    if (page > 1) query.set("page", String(page));
    if (currentRedemptionPage > 1) {
      query.set("rpage", String(currentRedemptionPage));
    }

    const queryString = query.toString();
    return queryString ? `/admin/coupons?${queryString}` : "/admin/coupons";
  }

  function buildRedemptionPageHref(page: number) {
    const query = new URLSearchParams();

    if (q) query.set("q", q);
    if (status !== "all") query.set("status", status);
    if (reward !== "all") query.set("reward", reward);
    if (currentPage > 1) query.set("page", String(currentPage));
    if (page > 1) query.set("rpage", String(page));

    const queryString = query.toString();
    return queryString ? `/admin/coupons?${queryString}` : "/admin/coupons";
  }

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
              أنشئ كوبونات لإضافة ألعاب أو ترقية الحساب من هنا : 
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

          <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[430px_minmax(0,1fr)]">
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
                    <option value="bara_alsalfah">برا السالفة</option>
                    <option value="codenames">Codenames</option>
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
                    <option value="vip">vip</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    المستخدم المخصص له (اختياري)
                  </label>
                  <select
                    name="assignedUserId"
                    defaultValue=""
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="">عام — أي مستخدم</option>
                    {profileRows.map((item) => (
                      <option key={item.id} value={item.id}>
                        {userDisplay(item, item.id)}
                      </option>
                    ))}
                  </select>
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
                <div className="mb-4 flex flex-col gap-4">
                  <div>
                    <h2 className="text-xl font-black text-white">الكوبونات الحالية</h2>
                    <div className="mt-1 text-sm text-white/50">
                      {filteredCoupons.length} نتيجة من أصل {couponRows.length}
                    </div>
                  </div>

                  <form className="flex flex-col gap-3 xl:flex-row xl:flex-wrap">
                    <input
                      name="q"
                      defaultValue={q}
                      placeholder="ابحث بالكود أو المستخدم..."
                      className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                    />

                    <select
                      name="status"
                      defaultValue={status}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 xl:w-[170px]"
                    >
                      <option value="all">كل الحالات</option>
                      <option value="active">المفعّلة</option>
                      <option value="inactive">المتوقفة</option>
                    </select>

                    <select
                      name="reward"
                      defaultValue={reward}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 xl:w-[170px]"
                    >
                      <option value="all">كل الأنواع</option>
                      <option value="games_balance">إضافة ألعاب</option>
                      <option value="account_tier">ترقية الحساب</option>
                    </select>

                    <input type="hidden" name="page" value="1" />
                    <input type="hidden" name="rpage" value={String(currentRedemptionPage)} />

                    <div className="flex gap-3 xl:w-auto">
                      <button
                        type="submit"
                        className="inline-flex flex-1 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/16 xl:flex-none"
                      >
                        فلترة
                      </button>

                      <Link
                        href="/admin/coupons"
                        className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.08] xl:flex-none"
                      >
                        إعادة تعيين
                      </Link>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  {paginatedCoupons.length === 0 ? (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5 text-sm font-bold text-white/50">
                      لا توجد نتائج مطابقة.
                    </div>
                  ) : (
                    paginatedCoupons.map((coupon) => {
                      const assignedProfile = coupon.assigned_user_id
                        ? profileMap.get(coupon.assigned_user_id)
                        : null;
                      const creatorProfile = coupon.created_by
                        ? profileMap.get(coupon.created_by)
                        : null;

                      return (
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
                              {coupon.assigned_user_id
                                ? userDisplay(assignedProfile, coupon.assigned_user_id)
                                : "عام"}
                            </div>
                            <div>
                              أنشأه:{" "}
                              {coupon.created_by
                                ? userDisplay(creatorProfile, coupon.created_by)
                                : "—"}
                            </div>
                            <div>
                              لكل مستخدم مرة واحدة:{" "}
                              {coupon.single_use_per_user ? "نعم" : "لا"}
                            </div>
                            <div>البداية: {formatDate(coupon.starts_at)}</div>
                          </div>

                          {coupon.notes ? (
                            <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-white/60">
                              {coupon.notes}
                            </div>
                          ) : null}

                          <div className="mt-4 flex flex-wrap gap-3">
                            <form action={toggleCouponStatusAction}>
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

                            <form action={deleteCouponAction}>
                              <input type="hidden" name="couponId" value={coupon.id} />
                              <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 transition hover:bg-red-500/15"
                              >
                                حذف الكوبون
                              </button>
                            </form>
                          </div>

                          <details className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                            <summary className="cursor-pointer text-sm font-black text-cyan-300">
                              تعديل الكوبون
                            </summary>

                            <form action={updateCouponAction} className="mt-4 space-y-4">
                              <input type="hidden" name="couponId" value={coupon.id} />

                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-bold text-white/75">
                                    الكود
                                  </label>
                                  <input
                                    name="code"
                                    defaultValue={coupon.code}
                                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-bold text-white/75">
                                    الحالة
                                  </label>
                                  <select
                                    name="isActive"
                                    defaultValue={coupon.is_active ? "on" : "off"}
                                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                                  >
                                    <option value="on">مفعّل</option>
                                    <option value="off">متوقف</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-bold text-white/75">
                                    نوع الكوبون
                                  </label>
                                  <select
                                    name="rewardType"
                                    defaultValue={coupon.reward_type}
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
                                    defaultValue={coupon.target_game ?? "lamtkom"}
                                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                                  >
                                    <option value="lamtkom">لمتكم</option>
                                    <option value="bara_alsalfah">برا السالفة</option>
                                    <option value="codenames">Codenames</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-bold text-white/75">
                                    عدد الألعاب
                                  </label>
                                  <input
                                    name="gamesAmount"
                                    type="number"
                                    min="0"
                                    defaultValue={coupon.games_amount}
                                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-bold text-white/75">
                                    الرتبة المستهدفة
                                  </label>
                                  <select
                                    name="targetTier"
                                    defaultValue={coupon.target_tier ?? ""}
                                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                                  >
                                    <option value="">بدون</option>
                                    <option value="free">free</option>
                                    <option value="premium">premium</option>
                                    <option value="vip">vip</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-bold text-white/75">
                                  المستخدم المخصص له
                                </label>
                                <select
                                  name="assignedUserId"
                                  defaultValue={coupon.assigned_user_id ?? ""}
                                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                                >
                                  <option value="">عام — أي مستخدم</option>
                                  {profileRows.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {userDisplay(item, item.id)}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-bold text-white/75">
                                    الحد الأقصى للاستخدام
                                  </label>
                                  <input
                                    name="maxRedemptions"
                                    type="number"
                                    min="1"
                                    defaultValue={coupon.max_redemptions}
                                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                                  />
                                </div>

                                <div className="flex items-end">
                                  <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-bold text-white/80">
                                    <input
                                      name="singleUsePerUser"
                                      type="checkbox"
                                      defaultChecked={coupon.single_use_per_user}
                                      className="h-4 w-4"
                                    />
                                    استخدام مرة واحدة لكل مستخدم
                                  </label>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-bold text-white/75">
                                    يبدأ من
                                  </label>
                                  <input
                                    name="startsAt"
                                    type="datetime-local"
                                    defaultValue={
                                      coupon.starts_at
                                        ? new Date(coupon.starts_at).toISOString().slice(0, 16)
                                        : ""
                                    }
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
                                    defaultValue={
                                      coupon.expires_at
                                        ? new Date(coupon.expires_at).toISOString().slice(0, 16)
                                        : ""
                                    }
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
                                  defaultValue={coupon.notes ?? ""}
                                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                                />
                              </div>

                              <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                              >
                                حفظ التعديلات
                              </button>
                            </form>
                          </details>
                        </div>
                      );
                    })
                  )}
                </div>

                {totalPages > 1 ? (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <Link
                      href={buildPageHref(Math.max(1, currentPage - 1))}
                      className={`rounded-xl border px-3 py-2 text-sm font-black transition ${
                        currentPage === 1
                          ? "pointer-events-none border-white/6 bg-white/[0.03] text-white/25"
                          : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      السابق
                    </Link>

                    {paginationItems.map((item, index) =>
                      typeof item === "number" ? (
                        <Link
                          key={`${item}-${index}`}
                          href={buildPageHref(item)}
                          className={`rounded-xl border px-3 py-2 text-sm font-black transition ${
                            item === currentPage
                              ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                              : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                          }`}
                        >
                          {item}
                        </Link>
                      ) : (
                        <span
                          key={`${item}-${index}`}
                          className="px-2 text-sm font-black text-white/35"
                        >
                          ...
                        </span>
                      ),
                    )}

                    <Link
                      href={buildPageHref(Math.min(totalPages, currentPage + 1))}
                      className={`rounded-xl border px-3 py-2 text-sm font-black transition ${
                        currentPage === totalPages
                          ? "pointer-events-none border-white/6 bg-white/[0.03] text-white/25"
                          : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      التالي
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-white">آخر عمليات التفعيل</h2>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-white/60">
                    {redemptionRows.length} عملية
                  </div>
                </div>

                <div className="space-y-3">
                  {paginatedRedemptions.length === 0 ? (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5 text-sm font-bold text-white/50">
                      لا توجد عمليات تفعيل حتى الآن.
                    </div>
                  ) : (
                    paginatedRedemptions.map((item) => {
                      const userProfile = profileMap.get(item.user_id);

                      return (
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
                            المستخدم: {userDisplay(userProfile, item.user_id)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {totalRedemptionPages > 1 ? (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <Link
                      href={buildRedemptionPageHref(Math.max(1, currentRedemptionPage - 1))}
                      className={`rounded-xl border px-3 py-2 text-sm font-black transition ${
                        currentRedemptionPage === 1
                          ? "pointer-events-none border-white/6 bg-white/[0.03] text-white/25"
                          : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      السابق
                    </Link>

                    {redemptionPaginationItems.map((item, index) =>
                      typeof item === "number" ? (
                        <Link
                          key={`${item}-${index}`}
                          href={buildRedemptionPageHref(item)}
                          className={`rounded-xl border px-3 py-2 text-sm font-black transition ${
                            item === currentRedemptionPage
                              ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                              : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                          }`}
                        >
                          {item}
                        </Link>
                      ) : (
                        <span
                          key={`${item}-${index}`}
                          className="px-2 text-sm font-black text-white/35"
                        >
                          ...
                        </span>
                      ),
                    )}

                    <Link
                      href={buildRedemptionPageHref(
                        Math.min(totalRedemptionPages, currentRedemptionPage + 1),
                      )}
                      className={`rounded-xl border px-3 py-2 text-sm font-black transition ${
                        currentRedemptionPage === totalRedemptionPages
                          ? "pointer-events-none border-white/6 bg-white/[0.03] text-white/25"
                          : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      التالي
                    </Link>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}