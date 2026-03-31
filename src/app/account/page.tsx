"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "user"
    | "email"
    | "phone"
    | "calendar"
    | "games"
    | "play"
    | "logout"
    | "quiz"
    | "bara"
    | "stats"
    | "shield"
    | "continue"
    | "home"
    | "pricing"
    | "trash";
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
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" />
          <path d="m4 8 8 6 8-6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72l.34 2.71a2 2 0 0 1-.57 1.71L7.1 9.91a16 16 0 0 0 7 7l1.77-1.73a2 2 0 0 1 1.71-.57l2.71.34A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "games":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="3" />
          <path d="M8 12h.01M16 12h.01M10 9v6M7 12h6" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <polygon points="9 7 19 12 9 17 9 7" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    case "quiz":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 4.6 1.4c-.6.8-1.6 1.2-2.1 2" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "bara":
      return (
        <svg {...common}>
          <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      );
    case "stats":
      return (
        <svg {...common}>
          <path d="M4 19V9M12 19V5M20 19v-8" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
        </svg>
      );
    case "continue":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      );
    case "pricing":
      return (
        <svg {...common}>
          <path d="M12 1v22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      );
    default:
      return null;
  }
}

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
  const tones = {
    slate: "border-white/10 bg-white/5 text-white",
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    orange: "border-orange-400/20 bg-orange-400/10 text-orange-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  };

  return (
    <div className={`rounded-[24px] border p-5 shadow-xl ${tones[tone]}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold text-white/60">{label}</span>
      </div>
      <div className="text-4xl font-black">{value}</div>
    </div>
  );
}

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
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-xl">
      <div className="mb-3 flex items-center gap-3 text-white/75">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold">{label}</span>
      </div>

      {truncate ? (
        <div className="truncate text-lg font-black text-white">{value}</div>
      ) : (
        <div className="text-lg font-black text-white">{value}</div>
      )}
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
    <div className="rounded-[26px] border border-white/10 bg-[#0b1324] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-100">
            لعبة غير مكتملة
          </div>
          <h3 className="mt-3 text-2xl font-black text-white">{session.game_name}</h3>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white/65">
          {formatDate(session.created_at)}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-lg font-bold text-white">
        {session.team_one_name} ({session.team_one_score ?? 0}) ×{" "}
        {session.team_two_name} ({session.team_two_score ?? 0})
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
  href={`/game/board?sessionId=${session.id}`}
  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-400"
>
  <Icon name="continue" className="h-5 w-5" />
  متابعة اللعبة
</Link>

        <button
          type="button"
          onClick={() => onDelete(session.id)}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 font-black text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="trash" className="h-5 w-5" />
          {deleting ? "جارٍ الحذف..." : "حذف اللعبة"}
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string>("");

  async function loadAccountData(authUserId?: string) {
    const currentUserId =
      authUserId ||
      (
        await supabase.auth.getUser()
      ).data.user?.id ||
      "";

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
        .select(
          "id, game_name, team_one_name, team_two_name, team_one_score, team_two_score, created_at, status"
        )
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
      setActiveSessions((prev) => prev.filter((session) => session.id !== sessionId));
    }

    setDeletingId("");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="rounded-[32px] border border-white/10 bg-[#0a1020] p-8 text-center text-white/70 shadow-2xl">
          جارٍ تحميل بيانات الحساب...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="space-y-8">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70">
            Dashboard الحساب
          </div>

          <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-4xl font-black text-white md:text-5xl">
                أهلاً {profile?.username || "بك"}
              </h1>
              <p className="mt-3 max-w-3xl text-white/65">
                هذا مركز التحكم الخاص بك داخل المنصة. راجع بياناتك، تابع ألعابك غير المكتملة،
                واحذف أي لعبة لا تريد إكمالها.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
              >
                <Icon name="home" className="h-5 w-5" />
                الرئيسية
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 font-bold text-emerald-100 hover:bg-emerald-400/15"
              >
                <Icon name="pricing" className="h-5 w-5" />
                الخطط
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 font-bold text-red-100 hover:bg-red-500/20"
              >
                <Icon name="logout" className="h-5 w-5" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="الألعاب المتبقية"
            value={profile?.games_remaining ?? 0}
            icon="games"
            tone="cyan"
          />
          <StatCard
            label="الألعاب التي لعبتها"
            value={profile?.games_played ?? 0}
            icon="play"
            tone="orange"
          />
          <StatCard
            label="حالة الحساب"
            value={getRoleLabel(profile?.role)}
            icon="shield"
            tone="emerald"
          />
          <StatCard
            label="الألعاب غير المكتملة"
            value={activeSessions.length}
            icon="quiz"
            tone="slate"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="اسم المستخدم" value={profile?.username || "-"} icon="user" />
          <InfoCard
            label="البريد الإلكتروني"
            value={profile?.email || "-"}
            icon="email"
            truncate
          />
          <InfoCard label="رقم الهاتف" value={profile?.phone || "-"} icon="phone" />
          <InfoCard
            label="تاريخ الانضمام"
            value={formatDate(profile?.created_at)}
            icon="calendar"
          />
        </div>

        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
          <div className="mb-6">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70">
              لعبة لمتكم
            </div>
            <h2 className="mt-4 text-3xl font-black text-white">الجولات غير المكتملة</h2>
            <p className="mt-2 text-white/65">
              يمكنك الرجوع لأي لعبة لم تنتهِ بعد، أو حذفها بالكامل إذا لم تعد تريد إكمالها.
            </p>
          </div>

          {activeSessions.length > 0 ? (
            <div className="grid gap-4">
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
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center text-white/55">
              لا توجد ألعاب غير مكتملة حاليًا.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}