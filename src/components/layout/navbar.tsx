"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ViewerData } from "@/lib/auth/viewer";

type Profile = {
  role: string | null;
  username: string | null;
};

type AuthState = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string | null;
};

type NavbarProps = {
  initialAuth: ViewerData;
};

type NotificationPreview = {
  id: string;
  type: string;
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
};

const heroLogo = "/logo.png";

function navLinkClass(pathname: string, href: string) {
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));

  return [
    "relative rounded-xl px-4 py-2 text-sm font-bold transition duration-200",
    active
      ? "bg-cyan-400/10 text-cyan-300 after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-cyan-400"
      : "text-white/60 hover:bg-white/6 hover:text-white",
  ].join(" ");
}

function GamesIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="8" width="18" height="8" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12h2M9 11v2M15.5 12h.01M17.5 12h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 19a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PricingIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.4 2.4 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5H4.5L6 16.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function loggedOutState(): AuthState {
  return {
    isLoggedIn: false,
    isAdmin: false,
    username: null,
  };
}

function formatNotificationDate(value: string) {
  try {
    return new Date(value).toLocaleString("ar-EG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function getNotificationTypeLabel(type: string) {
  switch (type) {
    case "announcement":
      return "إعلان";
    case "games_added":
      return "إضافة ألعاب";
    case "game_created":
      return "إنشاء لعبة";
    case "game_consumed":
      return "خصم لعبة";
    case "low_balance":
      return "رصيد منخفض";
    case "balance_empty":
      return "نفاد الرصيد";
    case "role_changed":
      return "تغيير رتبة";
    case "system":
      return "النظام";
    default:
      return "إشعار";
  }
}

function getNotificationTypeClasses(type: string) {
  switch (type) {
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

type NotificationDropdownProps = {
  latestNotifications: NotificationPreview[];
  unreadCount: number;
  isMarkingAll: boolean;
  onMarkAllAsRead: () => void;
};

function NotificationDropdown({
  latestNotifications,
  unreadCount,
  isMarkingAll,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  return (
    <div className="w-[340px] sm:w-[380px] lg:w-[460px] xl:w-[500px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#07101fe8] shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="border-b border-white/8 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white">الإشعارات</h3>
            <p className="mt-1 text-xs text-white/45">آخر 5 إشعارات في حسابك</p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                disabled={isMarkingAll}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                title="تحديد الكل كمقروء"
                aria-label="تحديد الكل كمقروء"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
            )}

            {unreadCount > 0 ? (
              <span className="inline-flex min-h-[24px] min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-[11px] font-black text-white shadow-[0_10px_20px_rgba(239,68,68,0.35)]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-black text-white/55">
                لا جديد
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto p-3">
        {latestNotifications.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center text-sm text-white/50">
            لا توجد إشعارات حاليًا.
          </div>
        ) : (
          <div className="space-y-2">
            {latestNotifications.map((item) => (
              <Link
                key={item.id}
                href={item.action_url || "/account/notifications"}
                className={`block rounded-2xl border p-3 transition ${
                  item.is_read
                    ? "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
                    : "border-cyan-400/15 bg-cyan-400/[0.05] hover:bg-cyan-400/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${getNotificationTypeClasses(
                      item.type,
                    )}`}
                  >
                    {getNotificationTypeLabel(item.type)}
                  </span>

                  {!item.is_read && (
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                  )}
                </div>

                <h4 className="mt-3 text-sm font-black text-white">{item.title}</h4>

                <p className="mt-2 line-clamp-2 text-xs leading-6 text-white/58">
                  {item.body}
                </p>

                <div className="mt-2 text-[11px] font-bold text-white/32">
                  {formatNotificationDate(item.created_at)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/8 p-3">
        <Link
          href="/account/notifications"
          className="flex w-full items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/15"
        >
          عرض كل الإشعارات
        </Link>
      </div>
    </div>
  );
}

export default function Navbar({ initialAuth }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotifications, setLatestNotifications] = useState<NotificationPreview[]>([]);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const desktopBellContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileBellContainerRef = useRef<HTMLDivElement | null>(null);
  const gamesMenuRef = useRef<HTMLDivElement | null>(null);

  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: initialAuth.isLoggedIn,
    isAdmin: initialAuth.isAdmin,
    username: initialAuth.username,
  });

  async function loadNotificationSummary() {
    try {
      const response = await fetch("/api/notifications/summary", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setUnreadCount(0);
        setLatestNotifications([]);
        return;
      }

      const json = (await response.json()) as {
        unreadCount: number;
        latestNotifications: NotificationPreview[];
      };

      setUnreadCount(json.unreadCount ?? 0);
      setLatestNotifications(json.latestNotifications ?? []);
    } catch {
      setUnreadCount(0);
      setLatestNotifications([]);
    }
  }

  async function handleMarkAllAsRead() {
    if (isMarkingAll || unreadCount === 0) return;

    setIsMarkingAll(true);

    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (response.ok) {
        setUnreadCount(0);
        setLatestNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            is_read: true,
          })),
        );
        void loadNotificationSummary();
      }
    } finally {
      setIsMarkingAll(false);
    }
  }

  useEffect(() => {
    setAuthState({
      isLoggedIn: initialAuth.isLoggedIn,
      isAdmin: initialAuth.isAdmin,
      username: initialAuth.username,
    });
  }, [initialAuth]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: unknown, session: { user?: { id: string } } | null) => {
        if (!session?.user) {
          setAuthState(loggedOutState());
          setUnreadCount(0);
          setLatestNotifications([]);
          router.refresh();
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, username")
          .eq("id", session.user.id)
          .maybeSingle();

        const typedProfile = (profile as Profile | null) ?? null;

        setAuthState({
          isLoggedIn: true,
          isAdmin: typedProfile?.role === "admin",
          username: typedProfile?.username ?? null,
        });

        router.refresh();
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | null = null;
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;

    async function setupNotifications() {
      if (!authState.isLoggedIn) {
        if (!cancelled) {
          setUnreadCount(0);
          setLatestNotifications([]);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setUnreadCount(0);
          setLatestNotifications([]);
        }
        return;
      }

      if (!cancelled) {
        await loadNotificationSummary();
      }

      activeChannel = supabase
        .channel(`notifications-live-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            await loadNotificationSummary();
          },
        )
        .subscribe();
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void loadNotificationSummary();
      }
    }

    void setupNotifications();

    intervalId = window.setInterval(() => {
      void loadNotificationSummary();
    }, 15000);

    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;

      if (intervalId) {
        window.clearInterval(intervalId);
      }

      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);

      if (activeChannel) {
        void supabase.removeChannel(activeChannel);
      }
    };
  }, [authState.isLoggedIn, pathname, supabase]);

  useEffect(() => {
    setMenuOpen(false);
    setBellOpen(false);
    setGamesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!bellOpen && !gamesOpen) return;

    function handleDocumentClick(event: MouseEvent) {
      const target = event.target as Node;

      const insideDesktopBell =
        desktopBellContainerRef.current?.contains(target) ?? false;
      const insideMobileBell =
        mobileBellContainerRef.current?.contains(target) ?? false;
      const insideGames = gamesMenuRef.current?.contains(target) ?? false;

      if (!insideDesktopBell && !insideMobileBell) {
        setBellOpen(false);
      }

      if (!insideGames) {
        setGamesOpen(false);
      }
    }

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [bellOpen, gamesOpen]);

  useEffect(() => {
    if (bellOpen) {
      void loadNotificationSummary();
    }
  }, [bellOpen]);

  function handleLogout() {
    setMenuOpen(false);
    setBellOpen(false);
    setGamesOpen(false);
    setAuthState(loggedOutState());
    setUnreadCount(0);
    setLatestNotifications([]);
    window.location.assign("/logout");
  }

  const simpleLinks = [
    { label: "الرئيسية", href: "/", icon: null },
    { label: "الباقات", href: "/pricing", icon: <PricingIcon className="h-4 w-4" /> },
  ];

  const gameLinks = [
    { label: "لمتكم", href: "/game/start" },
    { label: "برا السالفة", href: "/game/bara-alsalfah" },
    { label: "Codenames", href: "/games/codenames" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#040816]/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="group relative flex items-center">
          <span className="pointer-events-none absolute inset-0 rounded-full bg-cyan-400/10 blur-2xl opacity-80 transition duration-300 group-hover:opacity-100" />
          <img
            src={heroLogo}
            alt="لمتكم"
            className="relative h-12 w-auto object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.18)] transition duration-300 group-hover:scale-[1.03] sm:h-14 lg:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {simpleLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass(pathname, link.href)}>
              <span className="inline-flex items-center gap-2">
                {link.icon}
                {link.label}
              </span>
            </Link>
          ))}

          <div className="relative" ref={gamesMenuRef}>
            <button
              type="button"
              onClick={() => setGamesOpen((prev) => !prev)}
              className={[
                "relative rounded-xl px-4 py-2 text-sm font-bold transition duration-200",
                pathname.startsWith("/game") || pathname.startsWith("/games")
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-white/60 hover:bg-white/6 hover:text-white",
              ].join(" ")}
            >
              <span className="inline-flex items-center gap-2">
                <GamesIcon className="h-4 w-4" />
                الألعاب
                <ChevronDownIcon
                  className={`h-4 w-4 transition ${gamesOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {gamesOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-[240px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#07101fe8] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.30)] backdrop-blur-xl">
                <div className="mb-2 px-2 text-xs font-bold text-white/35">
                  صفحات الألعاب
                </div>

                <div className="space-y-2">
                  {gameLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-black text-white/78 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      {item.label}
                      <ChevronDownIcon className="h-4 w-4 rotate-90" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {authState.isLoggedIn && (
            <Link href="/account" className={navLinkClass(pathname, "/account")}>
              <span className="inline-flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                حسابي
              </span>
            </Link>
          )}

          {authState.isAdmin && (
            <Link href="/admin" className={navLinkClass(pathname, "/admin")}>
              <span className="inline-flex items-center gap-2">
                <ShieldIcon className="h-4 w-4" />
                الإدارة
              </span>
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {authState.isLoggedIn ? (
            <>
              <div className="relative overflow-visible" ref={desktopBellContainerRef}>
                <button
                  type="button"
                  onClick={() => setBellOpen((prev) => !prev)}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                  aria-label="الإشعارات"
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 z-20 inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 border-[#040816] bg-red-500 px-1 text-[10px] font-black leading-none text-white shadow-[0_10px_20px_rgba(239,68,68,0.38)]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </button>

                {bellOpen && (
                  <div className="absolute left-0 top-full z-50 mt-3">
                    <NotificationDropdown
                      latestNotifications={latestNotifications}
                      unreadCount={unreadCount}
                      isMarkingAll={isMarkingAll}
                      onMarkAllAsRead={handleMarkAllAsRead}
                    />
                  </div>
                )}
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-black text-cyan-300">
                  {(authState.username || "م").slice(0, 1).toUpperCase()}
                </div>
                <div className="text-sm font-black text-white">
                  <span className="text-white/55">مرحبًا، </span>
                  <span>{authState.username || "مستخدم"}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-black text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                <LogoutIcon className="h-4 w-4" />
                خروج
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/[0.1]"
              >
                إنشاء حساب
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-bold text-white/65 transition hover:bg-white/[0.06] hover:text-white"
              >
                تسجيل الدخول
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {authState.isLoggedIn && (
            <div className="relative overflow-visible" ref={mobileBellContainerRef}>
              <button
                type="button"
                onClick={() => setBellOpen((prev) => !prev)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/8"
                aria-label="الإشعارات"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 z-20 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-[#040816] bg-red-500 px-1 text-[10px] font-black leading-none text-white shadow-[0_10px_20px_rgba(239,68,68,0.38)]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </button>

              {bellOpen && (
                <div className="fixed inset-x-4 top-20 z-50 mx-auto max-w-sm">
                  <NotificationDropdown
                    latestNotifications={latestNotifications}
                    unreadCount={unreadCount}
                    isMarkingAll={isMarkingAll}
                    onMarkAllAsRead={handleMarkAllAsRead}
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/8"
            aria-label="فتح القائمة"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/8 bg-[#040816]/95 px-4 py-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-[1320px] space-y-2">
            {simpleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.03]">
              <div className="flex items-center gap-3 px-4 py-3 text-sm font-black text-white/80">
                <GamesIcon className="h-4 w-4" />
                الألعاب
              </div>

              <div className="space-y-2 border-t border-white/8 p-3">
                {gameLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {item.label}
                    <ChevronDownIcon className="h-4 w-4 rotate-90" />
                  </Link>
                ))}
              </div>
            </div>

            {authState.isLoggedIn && (
              <Link
                href="/account"
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                <UserIcon className="h-4 w-4" />
                حسابي
              </Link>
            )}

            {authState.isLoggedIn && (
              <Link
                href="/account/notifications"
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                <span className="inline-flex items-center gap-3">
                  <BellIcon className="h-4 w-4" />
                  الإشعارات
                </span>

                {unreadCount > 0 ? (
                  <span className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-[0_10px_20px_rgba(239,68,68,0.35)]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            )}

            {authState.isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                <ShieldIcon className="h-4 w-4" />
                الإدارة
              </Link>
            )}

            {authState.isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                <LogoutIcon className="h-4 w-4" />
                تسجيل الخروج
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.1]"
                >
                  إنشاء حساب
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm font-bold text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                >
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}