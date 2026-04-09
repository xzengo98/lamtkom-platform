"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers (logic unchanged) ────────────────────────────────────────────────

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
  if (normalized === "admin")   return "ADMIN";
  if (normalized === "vip")     return "VIP";
  if (normalized === "premium") return "Premium";
  return "FREE";
}

function getRoleBadgeClass(role: string | null | undefined) {
  const normalized = String(role ?? "user").toLowerCase();
  if (normalized === "admin")   return "border-red-400/30 bg-red-400/10 text-red-300";
  if (normalized === "vip")     return "border-violet-400/30 bg-violet-400/10 text-violet-300";
  if (normalized === "premium") return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  return "border-white/10 bg-white/5 text-white/45";
}

function getInitials(username: string | null | undefined, email: string | null | undefined) {
  const name = username || email || "؟";
  return name.slice(0, 2).toUpperCase();
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "user" | "email" | "phone" | "calendar" | "games" | "play"
    | "logout" | "quiz" | "bara" | "stats" | "shield" | "continue"
    | "home" | "pricing" | "trash" | "spark" | "arrow";
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
      return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 19a7 7 0 0 1 14 0" /></svg>;
    case "email":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></svg>;
    case "phone":
      return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.45 19.45 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92Z" /></svg>;
    case "calendar":
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>;
    case "games":
      return <svg {...common}><rect x="3.5" y="8" width="17" height="8.5" rx="4.25" /><path d="M8 10.5v4M6 12.5h4M15.5 11.25h.01M17.5 13.25h.01" /></svg>;
    case "play":
      return <svg {...common}><path d="m8 6 10 6-10 6V6Z" /></svg>;
    case "logout":
      return <svg {...common}><path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" /><path d="M10 17 15 12 10 7" /><path d="M15 12H4" /></svg>;
    case "quiz":
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M9.75 9.25a2.5 2.5 0 1 1 4.1 2c-.75.6-1.35 1.05-1.35 2" /><path d="M12 16.5h.01" /></svg>;
    case "bara":
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M4 19a5 5 0 0 1 10 0" /><path d="M18 8h.01" /><path d="M16.5 15.5c1.5-.3 2.8-1.2 3.5-2.5" /></svg>;
    case "stats":
      return <svg {...common}><path d="M5 20V10" /><path d="M12 20V4" /><path d="M19 20v-7" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6l-7-3Z" /></svg>;
    case "continue":
      return <svg {...common}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
    case "home":
      return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V20h13V9.5" /></svg>;
    case "pricing":
      return <svg {...common}><path d="M12 1v22" /><path d="M17 5.5c0-1.9-2.2-3.5-5-3.5S7 3.6 7 5.5 9.2 9 12 9s5 1.6 5 3.5S14.8 16 12 16s-5 1.6-5 3.5" /></svg>;
    case "trash":
      return <svg {...common}><path d="M3 6h18" /><path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" /><path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" /><path d="M10 11v6M14 11v6" /></svg>;
    case "spark":
      return <svg {...common}><path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
    default:
      return null;
  }
}

// ─── SectionBadge ─────────────────────────────────────────────────────────────

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white/50">
      <span className="h-1 w-1 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  icon: "games" | "stats" | "shield" | "play" | "quiz";
  tone?: "slate" | "cyan" | "orange" | "emerald";
}) {
  const styles = {
    slate:   { bar: "bg-white/25",   stat: "border-white/8 bg-white/4",         num: "text-white/80",    lbl: "text-white/40" },
    cyan:    { bar: "bg-cyan-400",    stat: "border-cyan-400/15 bg-cyan-400/6",   num: "text-cyan-300",    lbl: "text-cyan-400/60" },
    orange:  { bar: "bg-orange-400",  stat: "border-orange-400/15 bg-orange-400/6", num: "text-orange-300", lbl: "text-orange-400/60" },
    emerald: { bar: "bg-emerald-400", stat: "border-emerald-400/15 bg-emerald-400/6", num: "text-emerald-300", lbl: "text-emerald-400/60" },
  }[tone];

  return (
    <div className={`overflow-hidden rounded-2xl border ${styles.stat}`}>
      <div className={`h-[2px] w-full ${styles.bar} opacity-70`} />
      <div className="px-4 py-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className={`text-xs font-bold ${styles.lbl}`}>{label}</span>
          <span className={`opacity-80 ${styles.num}`}>
            <Icon name={icon} className="h-4 w-4" />
          </span>
        </div>
        <div className={`text-2xl font-black ${styles.num}`}>{value}</div>
      </div>
    </div>
  );
}

// ─── InfoRow (vertical, divider style) ────────────────────────────────────────

function InfoRow({
  label,
  value,
  icon,
  truncate = false,
}: {
  label: string;
  value: string;
  icon: "user" | "email" | "phone" | "calendar" | "shield";
  truncate?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/8 text-cyan-300">
        <Icon name={icon} className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-white/35">{label}</div>
        {truncate ? (
          <div className="truncate text-sm font-black text-white">{value}</div>
        ) : (
          <div className="text-sm font-black text-white">{value}</div>
        )}
      </div>
    </div>
  );
}

// ─── InfoCard (grid card style) ───────────────────────────────────────────────

const infoIconTones: Record<"user" | "email" | "phone" | "calendar" | "shield", string> = {
  user:     "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
  email:    "border-violet-400/20 bg-violet-400/8 text-violet-300",
  phone:    "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
  calendar: "border-orange-400/20 bg-orange-400/8 text-orange-300",
  shield:   "border-amber-400/20 bg-amber-400/8 text-amber-300",
};

const infoBarColors: Record<"user" | "email" | "phone" | "calendar" | "shield", string> = {
  user:     "bg-cyan-400",
  email:    "bg-violet-400",
  phone:    "bg-emerald-400",
  calendar: "bg-orange-400",
  shield:   "bg-amber-400",
};

function InfoCard({
  label,
  value,
  icon,
  truncate = false,
}: {
  label: string;
  value: string;
  icon: "user" | "email" | "phone" | "calendar" | "shield";
  truncate?: boolean;
}) {
  const iconTone = infoIconTones[icon];
  const barColor = infoBarColors[icon];
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(160deg,rgba(16,26,52,0.85)_0%,rgba(6,12,28,0.95)_100%)]">
      <div className={`h-[2px] w-full ${barColor} opacity-55`} />
      <div className="p-4">
        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${iconTone}`}>
          <Icon name={icon} className="h-4 w-4" />
        </div>
        <div className="text-xs font-bold text-white/40">{label}</div>
        {truncate ? (
          <div className="mt-1 truncate text-sm font-black text-white">{value}</div>
        ) : (
          <div className="mt-1 text-sm font-black text-white">{value}</div>
        )}
      </div>
    </div>
  );
}

// ─── SessionCard ──────────────────────────────────────────────────────────────

function SessionCard({
  session,
  onDelete,
  deleting,
}: {
  session: ActiveSession;
  onDelete: (id: string) => Promise<void>;
  deleting: boolean;
}) {
  const total = (session.team_one_score ?? 0) + (session.team_two_score ?? 0);
  const teamOnePct = total > 0 ? Math.round(((session.team_one_score ?? 0) / total) * 100) : 50;
  const teamTwoPct = total > 0 ? 100 - teamOnePct : 50;
  const teamOneLeads = (session.team_one_score ?? 0) >= (session.team_two_score ?? 0);

  return (
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(18,28,55,0.95)_0%,rgba(8,14,32,0.98)_100%)] shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-0.5">
      {/* Top accent bar */}
      <div className="h-[2px] w-full bg-orange-400/60" />

      <div className="p-5">
        {/* Header row */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/8 px-3 py-1 text-[11px] font-bold text-orange-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
              جولة غير مكتملة
            </span>
            <h3 className="mt-2 text-xl font-black text-white">{session.game_name}</h3>
            <div className="mt-0.5 text-xs font-bold text-white/35">
              {formatDate(session.created_at)}
            </div>
          </div>
        </div>

        {/* Score display */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
          {/* Team names & scores */}
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${teamOneLeads ? "bg-cyan-400/20 text-cyan-300" : "bg-white/5 text-white/40"}`}>
                {teamOneLeads ? "🥇" : "2"}
              </div>
              <span className="max-w-[100px] truncate text-sm font-black text-white sm:max-w-none">
                {session.team_one_name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-black ${teamOneLeads ? "text-cyan-300" : "text-white/40"}`}>
                {session.team_one_score ?? 0}
              </span>
              <span className="text-xs font-bold text-white/20">VS</span>
              <span className={`text-2xl font-black ${!teamOneLeads ? "text-orange-300" : "text-white/40"}`}>
                {session.team_two_score ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="max-w-[100px] truncate text-sm font-black text-white sm:max-w-none">
                {session.team_two_name}
              </span>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${!teamOneLeads ? "bg-orange-400/20 text-orange-300" : "bg-white/5 text-white/40"}`}>
                {!teamOneLeads ? "🥇" : "2"}
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div className="h-1.5 w-full overflow-hidden bg-white/5">
            <div className="flex h-full">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${teamOnePct}%` }}
              />
              <div
                className="h-full bg-gradient-to-l from-orange-500 to-orange-400 transition-all duration-500"
                style={{ width: `${teamTwoPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/game/board?sessionId=${session.id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.22)] transition hover:bg-cyan-400 active:scale-[0.98]"
          >
            <Icon name="continue" className="h-4 w-4" />
            متابعة اللعبة
          </Link>

          <button
            onClick={() => onDelete(session.id)}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/8 px-4 py-2.5 text-sm font-black text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
          >
            <Icon name="trash" className="h-4 w-4" />
            {deleting ? "جارٍ الحذف..." : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-32 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/8">
          <span className="relative flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-cyan-400" />
          </span>
        </div>
        <div className="text-lg font-black text-white/70">جارٍ تحميل بيانات الحساب...</div>
        <div className="mt-2 text-sm text-white/30">لحظة واحدة</div>
      </div>
    </main>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router  = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading]             = useState(true);
  const [profile, setProfile]             = useState<Profile | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [userId, setUserId]               = useState("");
  const [deletingId, setDeletingId]       = useState("");

  // ── Data loading (logic unchanged) ──
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
        .select("id, email, username, phone, role, games_remaining, games_played, created_at")
        .eq("id", currentUserId)
        .single(),
      supabase
        .from("game_sessions")
        .select("id, game_name, team_one_name, team_two_name, team_one_score, team_two_score, created_at, status")
        .eq("user_id", currentUserId)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

    setProfile((profileData as Profile | null) ?? null);
    setActiveSessions(Array.isArray(sessionsData) ? (sessionsData as ActiveSession[]) : []);
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

  // ── Handlers (logic unchanged) ──
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleDeleteSession(sessionId: string) {
    if (!userId || !sessionId) return;

    const confirmed = window.confirm("هل أنت متأكد من حذف هذه اللعبة غير المكتملة؟");
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

  if (loading) return <LoadingScreen />;

  const roleLabel = getRoleLabel(profile?.role);
  const roleBadgeClass = getRoleBadgeClass(profile?.role);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative mb-6 overflow-hidden rounded-[2.5rem] border border-white/8 bg-[linear-gradient(150deg,rgba(15,25,50,1)_0%,rgba(7,13,30,1)_55%,rgba(10,18,40,1)_100%)]">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-64 rounded-full bg-violet-500/7 blur-2xl" />

          <div className="relative px-7 py-10 md:px-10 md:py-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:gap-12">

              {/* Left — content */}
              <div className="flex-1">
                <SectionBadge>Dashboard الحساب</SectionBadge>

                {/* Avatar + name row */}
                <div className="mt-5 flex items-center gap-4">
                  {/* Avatar circle with initials */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.15),rgba(34,211,238,0.05))] text-xl font-black text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.10)]">
                    {getInitials(profile?.username, profile?.email)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white md:text-4xl">
                      أهلاً {profile?.username || "بك"}
                    </h1>
                    {/* Role badge */}
                    <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black ${roleBadgeClass}`}>
                      <Icon name="shield" className="h-3 w-3" />
                      {roleLabel}
                    </span>
                  </div>
                </div>

                <p className="mt-5 max-w-xl text-sm leading-8 text-white/50 md:text-base">
                  مركز التحكم الخاص بك — راجع بياناتك، تابع ألعابك غير المكتملة، واحذف أي لعبة لا تريد إكمالها.
                </p>

                {/* CTA buttons */}
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/8 active:scale-[0.98]"
                  >
                    <Icon name="home" className="h-4 w-4" />
                    الرئيسية
                  </Link>

                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-2.5 text-sm font-black text-cyan-300 transition hover:bg-cyan-400/14 active:scale-[0.98]"
                  >
                    <Icon name="pricing" className="h-4 w-4" />
                    الخطط والباقات
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/8 px-4 py-2.5 text-sm font-black text-red-300 transition hover:bg-red-500/15 active:scale-[0.98]"
                  >
                    <Icon name="logout" className="h-4 w-4" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>

              {/* Right — logo card */}
              <div className="hidden xl:flex xl:justify-end">
                <div className="relative flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/12 bg-[linear-gradient(160deg,rgba(14,24,50,0.96)_0%,rgba(7,13,30,0.98)_100%)] shadow-[0_20px_50px_rgba(0,0,0,0.40)]">
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.07),transparent_70%)]" />
                  <img src={heroLogo} alt="شعار لمتكم" className="h-[140px] w-[140px] object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.12)]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ───────────────────────────────────────────────────── */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard label="الألعاب المتبقية"       value={profile?.games_remaining ?? 0} icon="games"  tone="cyan"    />
            <StatCard label="الألعاب التي تم لعبها"  value={profile?.games_played ?? 0}    icon="stats"  tone="orange"  />
            <StatCard label="العضوية"                 value={roleLabel}                      icon="shield" tone="emerald" />
            <StatCard label="الجولات غير المكتملة"   value={activeSessions.length}          icon="play"   tone="slate"   />
          </div>
        </section>

        {/* ── Info grid ─────────────────────────────────────────────────────── */}
        <section className="mb-8">
          <SectionBadge>معلومات الحساب</SectionBadge>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">بياناتك الأساسية</h2>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <InfoCard label="اسم المستخدم"       value={profile?.username || "-"}           icon="user"     />
            <InfoCard label="البريد الإلكتروني"  value={profile?.email    || "-"}           icon="email"    truncate />
            <InfoCard label="رقم الهاتف"          value={profile?.phone    || "-"}           icon="phone"    />
            <InfoCard label="تاريخ إنشاء الحساب" value={formatDate(profile?.created_at)}    icon="calendar" />
            <InfoCard label="نوع العضوية"         value={roleLabel}                          icon="shield"   />
          </div>
        </section>

        {/* ── Quick actions ──────────────────────────────────────────────────── */}
        <section className="mb-8">
          <SectionBadge>وصول سريع</SectionBadge>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">ابدأ لعبة جديدة</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/50">اختر اللعبة التي تريد البدء بها مباشرة.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "لمتكم",
                desc: "أسئلة وأجوبة بين فريقين",
                href: "/game/start",
                icon: "quiz" as const,
                bar: "bg-cyan-400",
                badge: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
                btn: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/18",
              },
              {
                label: "برا السالفة",
                desc: "اكشف الشخص المختلف",
                href: "/game/bara-alsalfah",
                icon: "bara" as const,
                bar: "bg-orange-400",
                badge: "border-orange-400/20 bg-orange-400/8 text-orange-300",
                btn: "border-orange-400/20 bg-orange-400/10 text-orange-200 hover:bg-orange-400/18",
              },
              {
                label: "Codenames",
                desc: "كلمات وتلميحات لفريقين",
                href: "/games/codenames",
                icon: "spark" as const,
                bar: "bg-violet-400",
                badge: "border-violet-400/20 bg-violet-400/8 text-violet-300",
                btn: "border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/18",
              },
            ].map((game) => (
              <div key={game.href} className="overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(160deg,rgba(18,28,55,0.95)_0%,rgba(8,14,32,0.98)_100%)] transition duration-300 hover:-translate-y-0.5">
                <div className={`h-[2px] w-full ${game.bar} opacity-60`} />
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-black ${game.badge}`}>
                      <Icon name={game.icon} className="mr-1.5 h-3.5 w-3.5" />
                      {game.label}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-white/40">{game.desc}</p>
                  <Link
                    href={game.href}
                    className={`inline-flex w-full items-center justify-between rounded-xl border px-4 py-2 text-sm font-black transition active:scale-[0.98] ${game.btn}`}
                  >
                    <span>ابدأ الآن</span>
                    <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Active sessions ────────────────────────────────────────────────── */}
        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionBadge>لعبة لمتكم</SectionBadge>
              <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">الجولات غير المكتملة</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/50">
                يمكنك الرجوع لأي لعبة لم تنتهِ بعد، أو حذفها إذا لم تعد تريد إكمالها.
              </p>
            </div>
            {activeSessions.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/8 px-3 py-1.5 text-xs font-bold text-orange-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                {activeSessions.length} جولة نشطة
              </span>
            )}
          </div>

          {activeSessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
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
            <div className="rounded-[2rem] border border-dashed border-white/8 bg-white/[0.02] px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-white/20">
                <Icon name="play" className="h-6 w-6" />
              </div>
              <div className="text-lg font-black text-white/50">
                لا توجد ألعاب غير مكتملة حاليًا
              </div>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-white/30">
                عندما تبدأ لعبة جديدة وتتوقف قبل إنهائها، ستظهر هنا لتتمكن من متابعتها لاحقًا.
              </p>
              <Link
                href="/game/start"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.20)] transition hover:bg-cyan-400 active:scale-[0.98]"
              >
                <Icon name="games" className="h-4 w-4" />
                ابدأ لعبة جديدة
              </Link>
            </div>
          )}
        </section>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="mt-10 flex items-center justify-between border-t border-white/6 pt-6 text-xs font-bold text-white/20">
          <span>لمتكم © {new Date().getFullYear()}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 transition hover:text-white/40">
            <Icon name="logout" className="h-3.5 w-3.5" />
            تسجيل الخروج
          </button>
        </div>

      </div>
    </main>
  );
}
