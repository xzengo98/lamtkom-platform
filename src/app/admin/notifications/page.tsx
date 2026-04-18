import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendAdminNotificationAction } from "./actions";

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
    default:
      return "border-white/10 bg-white/[0.05] text-white/70";
  }
}

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

export default async function AdminNotificationsPage() {
  const admin = getSupabaseAdminClient();

  const { data: campaignsData } = await admin
    .from("notification_campaigns")
    .select(
      "id, category, audience_type, audience_role, title, body, action_url, sent_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const campaigns = (campaignsData ?? []) as CampaignRow[];

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
              أرسل إشعارًا لجميع الأعضاء أو حسب الرتبة، مع حفظ سجل الحملات داخل لوحة الأدمن.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-300">
              الجميع أو حسب الرتبة
            </span>
            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-black text-violet-300">
              سجل آخر الإرسالات
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-black text-white">إنشاء إشعار جديد</h2>
            <p className="mt-2 text-sm leading-7 text-white/55">
              استخدم هذه الصفحة للإعلانات العامة أو التنبيهات المرتبطة بالألعاب والرصيد.
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
                الرتبة المستهدفة (إذا اخترت حسب الرتبة)
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
              آخر 20 رسالة تم إنشاؤها من لوحة الأدمن.
            </p>
          </div>

          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/55">
                لا توجد حملات إرسال حتى الآن.
              </div>
            ) : (
              campaigns.map((item) => (
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
                      {item.audience_type === "all"
                        ? "الجميع"
                        : item.audience_type === "role"
                          ? `رتبة: ${item.audience_role ?? "-"}`
                          : "مخصص"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-black text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-white/58">
                    {item.body}
                  </p>

                  <div className="mt-3 text-xs font-bold text-white/35">
                    {formatDate(item.created_at)}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}