"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

type Profile = {
  id?: string;
  email: string | null;
  username: string | null;
  phone: string | null;
  role: string;
  games_remaining: number;
  games_played: number;
  created_at: string | null;
};

type ActiveSession = {
  id: string;
  game_name: string;
  team_one_name: string;
  team_two_name: string;
  team_one_score: number;
  team_two_score: number;
  created_at: string | null;
  status: string;
};

type IconName =
  | "user"
  | "email"
  | "phone"
  | "calendar"
  | "games"
  | "play"
  | "logout"
  | "stats"
  | "shield"
  | "continue"
  | "home"
  | "pricing"
  | "trash"
  | "sparkles"
  | "arrow"
  | "clock";

type Tone = "slate" | "cyan" | "orange" | "emerald" | "violet";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getRoleLabel(role: string | null | undefined) {
  const normalized = String(role ?? "user").toLowerCase();

  if (normalized === "admin") return "ADMIN";
  if (normalized === "vip") return "VIP";
  if (normalized === "premium") return "Premium";

  return "FREE";
}

function getRoleTone(role: string | null | undefined) {
  const normalized = String(role ?? "user").toLowerCase();

  if (normalized === "admin") {
    return "border-violet-400/20 bg-violet-500/15 text-violet-100";
  }

  if (normalized === "vip") {
    return "border-orange-400/20 bg-orange-500/15 text-orange-100";
  }

  if (normalized === "premium") {
    return "border-emerald-400/20 bg-emerald-500/15 text-emerald-100";
  }

  return "border-cyan-400/20 bg-cyan-500/15 text-cyan-100";
}

function toneClasses(tone: Tone) {
  switch (tone) {
    case "cyan":
      return {
        card: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
        iconWrap: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
        softText: "text-cyan-100/80",
      };
    case "orange":
      return {
        card: "border-orange-400/20 bg-orange-400/10 text-orange-100",
        iconWrap: "border-orange-300/20 bg-orange-400/10 text-orange-100",
        softText: "text-orange-100/80",
      };
    case "emerald":
      return {
        card: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
        iconWrap: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
        softText: "text-emerald-100/80",
      };
    case "violet":
      return {
        card: "border-violet-400/20 bg-violet-400/10 text-violet-100",
        iconWrap: "border-violet-300/20 bg-violet-400/10 text-violet-100",
        softText: "text-violet-100/80",
      };
    default:
      return {
        card: "border-white/10 bg-white/5 text-white",
        iconWrap: "border-white/10 bg-white/5 text-white",
        softText: "text-white/70",
      };
  }
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    className,
  };

  switch (name) {
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19a7 7 0 0 1 14 0" />
        </svg>
      );

    case "email":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4.5 7 7.5 6 7.5-6" />
        </svg>
      );

    case "phone":
      return (
        <svg {...common}>
          <path d="M6.9 4.5h2.2l1.2 3.2-1.6 1.4a14.8 14.8 0 0 0 6.2 6.2l1.4-1.6 3.2 1.2v2.2a1.7 1.7 0 0 1-1.9 1.7C10.4 18.4 5.6 13.6 5.2 6.4A1.7 1.7 0 0 1 6.9 4.5Z" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2.5" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
          <path d="M3 10h18" />
        </svg>
      );

    case "games":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="10" rx="5" />
          <path d="M8 12h4" />
          <path d="M10 10v4" />
          <circle cx="16.5" cy="10.5" r=".7" />
          <circle cx="18.5" cy="13.5" r=".7" />
        </svg>
      );

    case "play":
      return (
        <svg {...common}>
          <path d="M8 6.5v11l8.5-5.5L8 6.5Z" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10" />
          <path d="M14 8l5 4-5 4" />
          <path d="M9 12h10" />
        </svg>
      );

    case "stats":
      return (
        <svg {...common}>
          <path d="M5 20V10" />
          <path d="M12 20V4" />
          <path d="M19 20v-7" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6l-7-3Z" />
        </svg>
      );

    case "continue":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      );

    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V20h13V9.5" />
        </svg>
      );

    case "pricing":
      return (
        <svg {...common}>
          <path d="M12 3v18" />
          <path d="M16.5 7.5c0-1.9-1.8-3-4.5-3s-4.5 1.1-4.5 3 1.5 2.6 4.5 3 4.5 1.1 4.5 3-1.8 3-4.5 3-4.5-1.1-4.5-3" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M9 7V4h6v3" />
          <path d="M7 7l1 12h8l1-12" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>
      );

    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
          <path d="m18.5 14 .7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
          <path d="m5.5 13 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5l3.2 1.8" />
        </svg>
      );

    default:
      return null;
  }
}

function SectionHeading({
  badge,
  title,
  description,
  tone = "cyan",
}: {
  badge: string;
  title: string;
  description?: string;
  tone?: Tone;
}) {
  const toneStyle = toneClasses(tone);

  return (
    <div className="mb-5">
      <div
        className={cn(
          "mb-3 inline-flex items-center rounded-full border px-4 py-2 text-xs font-black",
          toneStyle.card,
        )}
      >
        {badge}
      </div>

      <h2 className="text-2xl font-black text-white sm:text-3xl">{title}</h2>

      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = "slate",
  helper,
}: {
  label: string;
  value: string | number;
  icon: "games" | "stats" | "shield" | "play";
  tone?: Tone;
  helper?: string;
}) {
  const toneStyle = toneClasses(tone);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.7rem] border p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
        toneStyle.card,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-black">{label}</div>
          {helper ? (
            <div className={cn("mt-2 text-xs leading-6", toneStyle.softText)}>
              {helper}
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
            toneStyle.iconWrap,
          )}
        >
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 text-3xl font-black text-white sm:text-4xl">{value}</div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
  tone = "cyan",
  valueClassName,
}: {
  label: string;
  value: string;
  icon: "user" | "email" | "phone" | "calendar";
  tone?: Tone;
  valueClassName?: string;
}) {
  const toneStyle = toneClasses(tone);

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_12px_26px_rgba(0,0,0,0.16)]">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
            toneStyle.iconWrap,
          )}
        >
          <Icon name={icon} className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
            {label}
          </div>
          <div
            className={cn(
              "mt-2 text-sm font-black leading-7 text-white sm:text-base",
              valueClassName,
            )}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: "home" | "games" | "pricing";
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/20 hover:bg-white/10"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
          <Icon name={icon} className="h-5 w-5" />
        </div>

        <div>
          <div className="text-sm font-black text-white">{title}</div>
          <div className="mt-1 text-xs leading-6 text-white/60">{description}</div>
        </div>
      </div>

      <Icon
        name="arrow"
        className="h-5 w-5 shrink-0 text-white/45 transition group-hover:translate-x-1 group-hover:text-white"
      />
    </Link>
  );
}

function SessionScorePanel({
  name,
  score,
  tone,
  align = "right",
}: {
  name: string;
  score: number;
  tone: "cyan" | "orange";
  align?: "right" | "left";
}) {
  const toneStyle = toneClasses(tone);

  return (
    <div
      className={cn(
        "rounded-[1.35rem] border p-4 shadow-[0_8px_20px_rgba(0,0,0,0.12)]",
        toneStyle.card,
        align === "left" ? "text-left" : "text-right",
      )}
    >
      <div className={cn("text-xs font-black uppercase tracking-[0.18em]", toneStyle.softText)}>
        الفريق
      </div>
      <div className="mt-2 text-base font-black text-white sm:text-lg">{name}</div>
      <div className="mt-3 text-3xl font-black text-white sm:text-4xl">{score}</div>
    </div>
  );
}

function SessionCard({
  session,
  onDelete,
  deleting,
}: {
  session: ActiveSession;
  onDelete: (id: string) => Promise<void>;
  deleting: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,23,44,0.96)_0%,rgba(6,12,28,0.99)_100%)] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:p-6">
      <div className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-28 w-28 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1.5 text-xs font-black text-orange-100">
              لعبة غير مكتملة
            </div>

            <h3 className="text-2xl font-black text-white sm:text-[1.75rem]">
              {session.game_name}
            </h3>

            <p className="mt-3 text-sm leading-7 text-white/65">
              يمكنك متابعة نفس الجلسة من حيث توقفت، أو حذفها نهائيًا إذا لم تعد
              ترغب بإكمالها.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/75">
            <Icon name="clock" className="h-4 w-4" />
            {formatDate(session.created_at)}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <SessionScorePanel
            name={session.team_one_name}
            score={session.team_one_score ?? 0}
            tone="cyan"
            align="right"
          />

          <div className="hidden justify-center sm:flex">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/60">
              VS
            </div>
          </div>

          <SessionScorePanel
            name={session.team_two_name}
            score={session.team_two_score ?? 0}
            tone="orange"
            align="left"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/game/board?sessionId=${session.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
          >
            <Icon name="continue" className="h-4 w-4" />
            متابعة اللعبة
          </Link>

          <button
            onClick={() => onDelete(session.id)}
            disabled={deleting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3.5 text-sm font-black text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Icon name="trash" className="h-4 w-4" />
            {deleting ? "جارٍ الحذف..." : "حذف اللعبة"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,1)_100%)] p-6 sm:p-8">
          <div className="h-7 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="mt-5 h-10 w-56 animate-pulse rounded-2xl bg-white/10 sm:w-72" />
          <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/10" />
          <div className="mt-2 h-4 w-full max-w-xl animate-pulse rounded-full bg-white/10" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-[1.7rem] border border-white/10 bg-white/5"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [userId, setUserId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function loadAccountData(authUserId?: string) {
    const currentUserId =
      authUserId || (await supabase.auth.getUser()).data.user?.id || "";

    if (!currentUserId) {
      router.replace("/login");
      return;
    }

    setUserId(currentUserId);

    const [{ data: profileData }, { data: sessionsData }] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, email, username, phone, role, games_remaining, games_played, created_at",
        )
        .eq("id", currentUserId)
        .single(),
      supabase
        .from("game_sessions")
        .select(
          "id, game_name, team_one_name, team_two_name, team_one_score, team_two_score, created_at, status",
        )
        .eq("user_id", currentUserId)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

    setProfile((profileData as Profile | null) ?? null);
    setActiveSessions(
      Array.isArray(sessionsData) ? (sessionsData as ActiveSession[]) : [],
    );
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      await loadAccountData(user.id);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      await loadAccountData(session.user.id);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleDeleteSession(sessionId: string) {
    if (!userId || !sessionId) return;

    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذه اللعبة غير المكتملة؟",
    );

    if (!confirmed) return;

    setDeletingId(sessionId);

    const { error } = await supabase
      .from("game_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId)
      .eq("status", "active");

    if (!error) {
      setActiveSessions((prev) =>
        prev.filter((session) => session.id !== sessionId),
      );
    }

    setDeletingId("");
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.30)] sm:p-7 xl:p-8">
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.20)_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
                Dashboard الحساب
              </div>

              <h1 className="text-3xl font-black text-white sm:text-4xl xl:text-5xl">
                أهلاً {profile?.username || "بك"}
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-white/72 sm:text-base">
                هذا مركز التحكم الخاص بك داخل المنصة. راجع بياناتك، تابع ألعابك
                غير المكتملة، واحذف أي لعبة لا تريد إكمالها، وكل ذلك داخل صفحة
                مرتبة وواضحة وسهلة الاستخدام على الهاتف والكمبيوتر.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <Icon name="home" className="h-4 w-4" />
                  الرئيسية
                </Link>

                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <Icon name="games" className="h-4 w-4" />
                  الألعاب
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  <Icon name="pricing" className="h-4 w-4" />
                  الخطط
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/20"
                >
                  <Icon name="logout" className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                    العضوية
                  </div>
                  <div
                    className={cn(
                      "mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-black",
                      getRoleTone(profile?.role),
                    )}
                  >
                    {getRoleLabel(profile?.role)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                    الألعاب المتاحة الآن
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {profile?.games_remaining ?? 0}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                    الجلسات النشطة
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {activeSessions.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="mx-auto flex h-[150px] w-[150px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.20)] sm:h-[180px] sm:w-[180px] xl:h-[210px] xl:w-[210px]">
                <img
                  src={heroLogo}
                  alt="شعار لمتكم"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/45">
                      <Icon name="sparkles" className="h-4 w-4" />
                      ملخص سريع
                    </div>

                    <div className="mt-3 text-xl font-black text-white">
                      حساب جاهز للعب
                    </div>

                    <p className="mt-2 text-sm leading-7 text-white/65">
                      راجع بياناتك بسرعة، ادخل لأي جلسة غير مكتملة، وتابع اللعب
                      من نفس المكان مباشرة.
                    </p>
                  </div>

                  <div
                    className={cn(
                      "inline-flex shrink-0 rounded-full border px-3 py-1.5 text-xs font-black",
                      getRoleTone(profile?.role),
                    )}
                  >
                    {getRoleLabel(profile?.role)}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-300/20 bg-orange-400/10 text-orange-100">
                        <Icon name="stats" className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white/45">
                          ألعاب تم لعبها
                        </div>
                        <div className="mt-1 text-xl font-black text-white">
                          {profile?.games_played ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                        <Icon name="play" className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white/45">
                          جلسات غير مكتملة
                        </div>
                        <div className="mt-1 text-xl font-black text-white">
                          {activeSessions.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading
            badge="إحصائيات الحساب"
            title="نظرة سريعة على حسابك"
            description="ملخص واضح لأهم مؤشرات الحساب الحالية بطريقة أسهل للقراءة على مختلف أحجام الشاشات."
            tone="cyan"
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="الألعاب المتبقية"
              value={profile?.games_remaining ?? 0}
              icon="games"
              tone="cyan"
              helper="عدد الجولات المتاحة لك حاليًا."
            />

            <StatCard
              label="الألعاب التي تم لعبها"
              value={profile?.games_played ?? 0}
              icon="stats"
              tone="orange"
              helper="إجمالي ما تم لعبه على الحساب."
            />

            <StatCard
              label="العضوية"
              value={getRoleLabel(profile?.role)}
              icon="shield"
              tone="emerald"
              helper="نوع الخطة الحالية المرتبطة بحسابك."
            />

            <StatCard
              label="الجلسات النشطة"
              value={activeSessions.length}
              icon="play"
              tone="violet"
              helper="عدد الألعاب غير المكتملة الجاهزة للمتابعة."
            />
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.9rem] border border-white/10 bg-white/5 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.18)] sm:p-6">
            <SectionHeading
              badge="معلومات الحساب"
              title="بياناتك الأساسية"
              description="تنسيق أوضح للمعلومات المهمة مع تحسين عرض النصوص الطويلة مثل البريد الإلكتروني."
              tone="cyan"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                label="اسم المستخدم"
                value={profile?.username || "-"}
                icon="user"
                tone="cyan"
              />

              <InfoCard
                label="الإيميل"
                value={profile?.email || "-"}
                icon="email"
                tone="cyan"
                valueClassName="break-all"
              />

              <InfoCard
                label="رقم الهاتف"
                value={profile?.phone || "-"}
                icon="phone"
                tone="orange"
              />

              <InfoCard
                label="تاريخ إنشاء الحساب"
                value={formatDate(profile?.created_at)}
                icon="calendar"
                tone="emerald"
              />
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,35,0.96)_0%,rgba(5,10,24,0.98)_100%)] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.22)] sm:p-6">
            <SectionHeading
              badge="الوصول السريع"
              title="روابط مفيدة داخل الحساب"
              description="اختصارات عملية للوصول للأماكن الأكثر استخدامًا داخل المنصة."
              tone="orange"
            />

            <div className="space-y-3">
              <QuickAction
                href="/games"
                icon="games"
                title="استعراض الألعاب"
                description="انتقل مباشرة إلى قائمة الألعاب المتاحة داخل المنصة."
              />

              <QuickAction
                href="/pricing"
                icon="pricing"
                title="الخطط والاشتراكات"
                description="راجع خيارات الاشتراك أو قم بالترقية عند الحاجة."
              />

              <QuickAction
                href="/"
                icon="home"
                title="العودة إلى الرئيسية"
                description="الرجوع للواجهة الرئيسية بسرعة من داخل لوحة الحساب."
              />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading
            badge="لعبة لمتكم"
            title="الجولات غير المكتملة"
            description="يمكنك الرجوع لأي لعبة لم تنتهِ بعد، أو حذفها بالكامل إذا لم تعد تريد إكمالها."
            tone="orange"
          />

          {activeSessions.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {activeSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={handleDeleteSession}
                  deleting={deletingId === session.id}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.9rem] border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center shadow-[0_16px_36px_rgba(0,0,0,0.14)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                <Icon name="play" className="h-7 w-7" />
              </div>

              <div className="mt-5 text-2xl font-black text-white">
                لا توجد ألعاب غير مكتملة حاليًا
              </div>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                عندما تبدأ لعبة جديدة ثم تتوقف قبل إنهائها، ستظهر هنا لتتمكن من
                متابعتها أو حذفها لاحقًا بسهولة.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                >
                  <Icon name="games" className="h-4 w-4" />
                  ابدأ لعبة جديدة
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <Icon name="home" className="h-4 w-4" />
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}