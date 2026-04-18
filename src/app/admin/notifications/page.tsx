import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  deleteCampaignAction,
  sendAdminNotificationAction,
} from "./actions";

import Link from "next/link";

type CampaignRow = {
  id: string;
  category: string;
  audience_type: string;
  audience_role: string | null;
  title: string;
  body: string;
  action_url: string | null;
  sent_at: string;
  created_at: string;
};

type CampaignNotificationRow = {
  campaign_id: string | null;
  is_read: boolean;
};

type PageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

type CampaignFilter =
  | "all"
  | "announcement"
  | "games"
  | "balance"
  | "system";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function badgeClass(category: string) {
  switch (category) {
    case "announcement":
      return "border-violet-400/20 bg-violet-400/10 text-violet-300";
    case "games_added":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "game_created":
    case "game_consumed":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
    case "low_balance":
    case "balance_empty":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";
    case "role_changed":
      return "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300";
    default:
      return "border-white/10 bg-white/[0.05] text-white/70";
  }
}

function audienceLabel(audienceType: string, audienceRole: string | null) {
  if (audienceType === "all") return "الجميع";
  if (audienceType === "role") return `رتبة: ${audienceRole ?? "-"}`;
  return "مخصص";
}

function matchesCampaignFilter(item: CampaignRow, filter: CampaignFilter) {
  if (filter === "all") return true;
  if (filter === "announcement") return item.category === "announcement";
  if (filter === "games") {
    return ["games_added", "game_created", "game_consumed"].includes(
      item.category,
    );
  }
  if (filter === "balance") {
    return ["low_balance", "balance_empty"].includes(item.category);
  }
  if (filter === "system") {
    return ["system", "role_changed"].includes(item.category);
  }
  return true;
}

function filterTabClass(active: boolean) {
  return active
    ? "rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-300"
    : "rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/65 transition hover:bg-white/[0.07] hover:text-white";
}

export default async function AdminNotificationsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const filter = (params.filter ?? "all") as CampaignFilter;

  const admin = getSupabaseAdminClient();

  const { data } = await admin
    .from("notification_campaigns")
    .select(
      "id, category, audience_type, audience_role, title, body, action_url, sent_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const campaigns = (data ?? []) as CampaignRow[];
  const campaignIds = campaigns.map((item) => item.id);

  const { data: campaignNotifications } =
    campaignIds.length > 0
      ? await admin
          .from("notifications")
          .select("campaign_id, is_read")
          .in("campaign_id", campaignIds)
      : { data: [] };

  const notificationsRows =
    (campaignNotifications ?? []) as CampaignNotificationRow[];

  const statsByCampaign = new Map<
    string,
    { total: number; read: number; unread: number }
  >();

  for (const row of notificationsRows) {
    if (!row.campaign_id) continue;

    const current = statsByCampaign.get(row.campaign_id) ?? {
      total: 0,
      read: 0,
      unread: 0,
    };

    current.total += 1;
    if (row.is_read) {
      current.read += 1;
    } else {
      current.unread += 1;
    }

    statsByCampaign.set(row.campaign_id, current);
  }

  const visibleCampaigns = campaigns.filter((item) =>
    matchesCampaignFilter(item, filter),
  );

  const counts = {
    all: campaigns.length,
    announcement: campaigns.filter((item) => item.category === "announcement")
      .length,
    games: campaigns.filter((item) =>
      ["games_added", "game_created", "game_consumed"].includes(item.category),
    ).length,
    balance: campaigns.filter((item) =>
      ["low_balance", "balance_empty"].includes(item.category),
    ).length,
    system: campaigns.filter((item) =>
      ["system", "role_changed"].includes(item.category),
    ).length,
  };

  const totalRecipients = notificationsRows.length;
  const totalRead = notificationsRows.filter((item) => item.is_read).length;
  const totalUnread = notificationsRows.filter((item) => !item.is_read).length;

  const filters: Array<{
    key: CampaignFilter;
    label: string;
    count: number;
  }> = [
    { key: "all", label: "الكل", count: counts.all },
    { key: "announcement", label: "الإعلانات", count: counts.announcement },
    { key: "games", label: "الألعاب", count: counts.games },
    { key: "balance", label: "الرصيد", count: counts.balance },
    { key: "system", label: "النظام", count: counts.system },
  ];

  return (
    <main className="space-y-6 text-white">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.20)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-black text-cyan-300">
              مركز الإشعارات
            </span>

            <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
              إرسال إشعارات
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-8 text-white/55">
              أرسل إشعارًا لجميع الأعضاء أو حسب الرتبة، مع حفظ سجل الإرسالات داخل لوحة الأدمن.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/6 px-4 py-3 text-center">
              <div className="text-lg font-black text-cyan-300">
                {campaigns.length}
              </div>
              <div className="mt-1 text-[11px] font-bold text-white/45">
                الحملات
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/6 px-4 py-3 text-center">
              <div className="text-lg font-black text-emerald-300">
                {totalRecipients}
              </div>
              <div className="mt-1 text-[11px] font-bold text-white/45">
                المستقبلون
              </div>
            </div>

            <div className="rounded-2xl border border-violet-400/15 bg-violet-400/6 px-4 py-3 text-center">
              <div className="text-lg font-black text-violet-300">
                {totalRead}
              </div>
              <div className="mt-1 text-[11px] font-bold text-white/45">
                المقروء
              </div>
            </div>

            <div className="rounded-2xl border border-orange-400/15 bg-orange-400/6 px-4 py-3 text-center">
              <div className="text-lg font-black text-orange-300">
                {totalUnread}
              </div>
              <div className="mt-1 text-[11px] font-bold text-white/45">
                غير المقروء
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((item) => (
            <Link
              key={item.key}
              href={`/admin/notifications?filter=${item.key}`}
              className={filterTabClass(filter === item.key)}
            >
              {item.label} ({item.count})
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-black text-white">إنشاء إشعار جديد</h2>
            <p className="mt-2 text-sm leading-7 text-white/55">
              استخدم هذا القسم للإعلانات العامة أو التنبيهات المرتبطة بالألعاب والرصيد.
            </p>
          </div>

          <form action={sendAdminNotificationAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-white/80">
                  نوع الإشعار
                </label>
                <select
                  name="category"
                  defaultValue="announcement"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="announcement">إعلان عام</option>
                  <option value="system">تنبيه نظام</option>
                  <option value="games_added">إضافة ألعاب</option>
                  <option value="game_created">إنشاء لعبة</option>
                  <option value="game_consumed">خصم لعبة</option>
                  <option value="low_balance">رصيد منخفض</option>
                  <option value="balance_empty">نفاد الرصيد</option>
                  <option value="role_changed">تغيير رتبة</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/80">
                  الجمهور
                </label>
                <select
                  name="audienceType"
                  defaultValue="all"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="all">جميع الأعضاء</option>
                  <option value="role">حسب الرتبة</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/80">
                الرتبة المستهدفة
              </label>
              <select
                name="audienceRole"
                defaultValue=""
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              >
                <option value="">بدون</option>
                <option value="user">user</option>
                <option value="premium">premium</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/80">
                العنوان
              </label>
              <input
                name="title"
                type="text"
                maxLength={140}
                placeholder="مثال: تم إطلاق ميزة جديدة"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/80">
                الوصف
              </label>
              <textarea
                name="body"
                rows={5}
                maxLength={1000}
                placeholder="اكتب نص الإشعار الذي سيصل للمستخدمين..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/80">
                رابط اختياري
              </label>
              <input
                name="actionUrl"
                type="text"
                placeholder="/pricing أو /games أو /account"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_18px_50px_rgba(34,211,238,0.18)] transition hover:bg-cyan-300"
            >
              إرسال الإشعار
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-black text-white">آخر الحملات</h2>
            <p className="mt-2 text-sm leading-7 text-white/55">
              آخر الحملات مع إحصائيات الوصول والقراءة.
            </p>
          </div>

          <div className="space-y-4">
            {visibleCampaigns.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/55">
                لا توجد حملات في هذا التصنيف.
              </div>
            ) : (
              visibleCampaigns.map((item) => {
                const campaignStats = statsByCampaign.get(item.id) ?? {
                  total: 0,
                  read: 0,
                  unread: 0,
                };

                return (
                  <article
                    key={item.id}
                    className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-black ${badgeClass(
                          item.category,
                        )}`}
                      >
                        {item.category}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-black text-white/60">
                        {audienceLabel(item.audience_type, item.audience_role)}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-black text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-white/58">
                      {item.body}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/6 px-3 py-2 text-center">
                        <div className="text-sm font-black text-cyan-300">
                          {campaignStats.total}
                        </div>
                        <div className="mt-1 text-[10px] font-bold text-white/45">
                          وصلهم
                        </div>
                      </div>

                      <div className="rounded-xl border border-violet-400/15 bg-violet-400/6 px-3 py-2 text-center">
                        <div className="text-sm font-black text-violet-300">
                          {campaignStats.read}
                        </div>
                        <div className="mt-1 text-[10px] font-bold text-white/45">
                          قرأوا
                        </div>
                      </div>

                      <div className="rounded-xl border border-orange-400/15 bg-orange-400/6 px-3 py-2 text-center">
                        <div className="text-sm font-black text-orange-300">
                          {campaignStats.unread}
                        </div>
                        <div className="mt-1 text-[10px] font-bold text-white/45">
                          لم يقرؤوا
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs font-bold text-white/35">
                      {formatDate(item.created_at)}
                    </div>

                    <div className="mt-4">
                      <form action={deleteCampaignAction}>
                        <input type="hidden" name="campaignId" value={item.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/15"
                        >
                          حذف من الجميع
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}