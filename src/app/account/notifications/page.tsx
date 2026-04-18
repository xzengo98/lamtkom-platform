import type { NotificationListItem } from "@/lib/notifications/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getMyNotifications,
  getMyUnreadNotificationsCount,
} from "@/lib/notifications/server";
import {
  deleteOneNotificationAction,
  markAllNotificationsReadAction,
  markOneNotificationReadAction,
} from "./actions";

type PageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

type FilterKey =
  | "all"
  | "unread"
  | "games"
  | "balance"
  | "announcements"
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

function typeStyles(type: string) {
  switch (type) {
    case "games_added":
      return {
        badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        dot: "bg-emerald-400",
        label: "إضافة ألعاب",
      };
    case "game_created":
      return {
        badge: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        dot: "bg-cyan-400",
        label: "إنشاء لعبة",
      };
    case "game_consumed":
      return {
        badge: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        dot: "bg-cyan-400",
        label: "خصم لعبة",
      };
    case "low_balance":
      return {
        badge: "border-orange-400/20 bg-orange-400/10 text-orange-300",
        dot: "bg-orange-400",
        label: "رصيد منخفض",
      };
    case "balance_empty":
      return {
        badge: "border-orange-400/20 bg-orange-400/10 text-orange-300",
        dot: "bg-orange-400",
        label: "نفاد الرصيد",
      };
    case "announcement":
      return {
        badge: "border-violet-400/20 bg-violet-400/10 text-violet-300",
        dot: "bg-violet-400",
        label: "إعلان",
      };
    case "role_changed":
      return {
        badge: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300",
        dot: "bg-fuchsia-400",
        label: "تغيير رتبة",
      };
    default:
      return {
        badge: "border-white/10 bg-white/[0.05] text-white/70",
        dot: "bg-white/60",
        label: "النظام",
      };
  }
}

function matchesFilter(item: NotificationListItem, filter: FilterKey) {
  if (filter === "all") return true;
  if (filter === "unread") return !item.is_read;

  if (filter === "games") {
    return ["games_added", "game_created", "game_consumed"].includes(item.type);
  }

  if (filter === "balance") {
    return ["low_balance", "balance_empty"].includes(item.type);
  }

  if (filter === "announcements") {
    return item.type === "announcement";
  }

  if (filter === "system") {
    return ["system", "role_changed"].includes(item.type);
  }

  return true;
}

function tabClass(active: boolean) {
  return active
    ? "rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-300"
    : "rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/65 transition hover:bg-white/[0.07] hover:text-white";
}

export default async function NotificationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = (params.filter ?? "all") as FilterKey;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [notifications, unreadCount]: [NotificationListItem[], number] =
  await Promise.all([
    getMyNotifications({ limit: 200 }),
    getMyUnreadNotificationsCount(),
  ]);

  const visibleNotifications = notifications.filter((item) =>
    matchesFilter(item, filter),
  );

  const counts = {
    all: notifications.length,
    unread: notifications.filter((item) => !item.is_read).length,
    games: notifications.filter((item) =>
      ["games_added", "game_created", "game_consumed"].includes(item.type),
    ).length,
    balance: notifications.filter((item) =>
      ["low_balance", "balance_empty"].includes(item.type),
    ).length,
    announcements: notifications.filter((item) => item.type === "announcement")
      .length,
    system: notifications.filter((item) =>
      ["system", "role_changed"].includes(item.type),
    ).length,
  };

  const filters: Array<{ key: FilterKey; label: string; count: number }> = [
    { key: "all", label: "الكل", count: counts.all },
    { key: "unread", label: "غير المقروء", count: counts.unread },
    { key: "games", label: "الألعاب", count: counts.games },
    { key: "balance", label: "الرصيد", count: counts.balance },
    { key: "announcements", label: "الإعلانات", count: counts.announcements },
    { key: "system", label: "النظام", count: counts.system },
  ];

  return (
    <main className="min-h-screen px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-black text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                مركز الإشعارات
              </span>

              <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                إشعاراتي
              </h1>

              <p className="mt-3 text-sm leading-8 text-white/60 sm:text-base">
                عندك الآن {unreadCount} إشعار غير مقروء.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <form action={markAllNotificationsReadAction}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/15"
                >
                  تحديد الكل كمقروء
                </button>
              </form>

              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                الرجوع إلى الحساب
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {filters.map((item) => (
              <Link
                key={item.key}
                href={`/account/notifications?filter=${item.key}`}
                className={tabClass(filter === item.key)}
              >
                {item.label} ({item.count})
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {visibleNotifications.length === 0 ? (
            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_16px_45px_rgba(0,0,0,0.14)]">
              <h2 className="text-xl font-black text-white">
                لا توجد إشعارات في هذا التصنيف
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/55">
                بدّل الفلتر أو انتظر إشعارات جديدة.
              </p>
            </div>
          ) : (
            visibleNotifications.map((item: NotificationListItem) => {
              const styles = typeStyles(item.type);

              return (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-[1.8rem] border p-5 shadow-[0_16px_45px_rgba(0,0,0,0.14)] transition ${
                    item.is_read
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-cyan-400/15 bg-cyan-400/[0.05]"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black ${styles.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                          {styles.label}
                        </span>

                        {!item.is_read && (
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black text-cyan-300">
                            جديد
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 text-xl font-black text-white">
                        {item.title}
                      </h2>

                      <p className="mt-3 text-sm leading-8 text-white/65 sm:text-base">
                        {item.body}
                      </p>

                      <div className="mt-4 text-xs font-bold text-white/35">
                        {formatDate(item.created_at)}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                      {item.action_url ? (
                        <Link
                          href={item.action_url}
                          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.1]"
                        >
                          فتح
                        </Link>
                      ) : null}

                      {!item.is_read ? (
                        <form action={markOneNotificationReadAction}>
                          <input type="hidden" name="notificationId" value={item.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/15"
                          >
                            تحديد كمقروء
                          </button>
                        </form>
                      ) : null}

                      <form action={deleteOneNotificationAction}>
                        <input type="hidden" name="notificationId" value={item.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/15"
                        >
                          حذف
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}