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
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19a7 7 0 0 1 14 0" />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.45 19.45 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2.5" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );
    case "games":
      return (
        <svg {...common}>
          <rect x="3.5" y="8" width="17" height="8.5" rx="4.25" />
          <path d="M8 10.5v4M6 12.5h4M15.5 11.25h.01M17.5 13.25h.01" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="m8 6 10 6-10 6V6Z" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
          <path d="M10 17 15 12 10 7" />
          <path d="M15 12H4" />
        </svg>
      );
    case "quiz":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.75 9.25a2.5 2.5 0 1 1 4.1 2c-.75.6-1.35 1.05-1.35 2" />
          <path d="M12 16.5h.01" />
        </svg>
      );
    case "bara":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M4 19a5 5 0 0 1 10 0" />
          <path d="M18 8h.01" />
          <path d="M16.5 15.5c1.5-.3 2.8-1.2 3.5-2.5" />
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
          <path d="M12 1v22" />
          <path d="M17 5.5c0-1.9-2.2-3.5-5-3.5S7 3.6 7 5.5 9.2 9 12 9s5 1.6 5 3.5S14.8 16 12 16s-5 1.6-5 3.5" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
          <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
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
    <div
      className={`rounded-[1.6rem] border p-4 shadow-[0_14px_34px_rgba(0,0,0,0.18)] ${tones[tone]}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-black">{label}</div>
        <div className="opacity-90">
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>

      <div className="text-3xl font-black text-white">{value}</div>
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
    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <div className="text-sm font-black text-white/75">{label}</div>
      </div>

      {truncate ? (
        <div className="truncate text-base font-black text-white">{value}</div>
      ) : (
        <div className="text-base font-black text-white">{value}</div>
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
    <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,52,0.95)_0%,rgba(6,12,28,0.98)_100%)] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.22)]">
      <div className="mb-3 inline-flex items-center rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1.5 text-xs font-black text-orange-100">
        لعبة غير مكتملة
      </div>

      <h3 className="text-2xl font-black text-white">{session.game_name}</h3>

      <div className="mt-3 text-sm font-bold text-white/55">
        {formatDate(session.created_at)}
      </div>

      <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm font-black text-white/80">
        {session.team_one_name} ({session.team_one_score ?? 0}) ×{" "}
        {session.team_two_name} ({session.team_two_score ?? 0})
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/game/board?sessionId=${session.id}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-400"
        >
          <Icon name="continue" className="h-4 w-4" />
          متابعة اللعبة
        </Link>

        <button
          onClick={() => onDelete(session.id)}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 font-black text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="trash" className="h-4 w-4" />
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
      setActiveSessions((prev) =>
        prev.filter((session) => session.id !== sessionId),
      );
    }

    setDeletingId("");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center text-lg font-black">
          جارٍ تحميل بيانات الحساب...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_22%),linear-gradient(180deg,rgba(16,27,52,0.96)_0%,rgba(6,12,28,0.98)_100%)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.30)] md:p-8 xl:p-10">
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.20)_1px,transparent_1px)] [background-size:26px_26px]" />

          <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
                Dashboard الحساب
              </div>

              <h1 className="text-3xl font-black text-white md:text-5xl">
                أهلاً {profile?.username || "بك"}
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
                هذا مركز التحكم الخاص بك داخل المنصة. راجع بياناتك، تابع ألعابك
                غير المكتملة، واحذف أي لعبة لا تريد إكمالها — وكل ذلك داخل صفحة
                منظمة وواضحة.
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
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/15"
                >
                  <Icon name="pricing" className="h-4 w-4" />
                  الخطط
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400"
                >
                  <Icon name="logout" className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            </div>

            <div className="flex justify-center xl:justify-end">
              <div className="relative flex h-[260px] w-[260px] items-center justify-center overflow-hidden rounded-[2.2rem] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(15,26,55,0.96)_0%,rgba(8,16,36,0.96)_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:h-[320px] md:w-[320px]">
                <div className="absolute inset-0 rounded-[inherit] border border-white/5" />
                <img
                  src={heroLogo}
                  alt="شعار لمتكم"
                  className="h-[170px] w-[170px] object-contain md:h-[230px] md:w-[230px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              إحصائيات الحساب
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              نظرة سريعة على حسابك
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="الألعاب المتبقية"
              value={profile?.games_remaining ?? 0}
              icon="games"
              tone="cyan"
            />
            <StatCard
              label="الألعاب التي تم لعبها"
              value={profile?.games_played ?? 0}
              icon="stats"
              tone="orange"
            />
            <StatCard
              label="العضوية"
              value={getRoleLabel(profile?.role)}
              icon="shield"
              tone="emerald"
            />
            <StatCard
              label="الجولات غير المكتملة"
              value={activeSessions.length}
              icon="play"
              tone="slate"
            />
          </div>
        </section>

        {/* Info */}
        <section className="mb-10">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-100">
              معلومات الحساب
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              بياناتك الأساسية
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              label="اسم المستخدم"
              value={profile?.username || "-"}
              icon="user"
            />
            <InfoCard
              label="الإيميل"
              value={profile?.email || "-"}
              icon="email"
              truncate
            />
            <InfoCard
              label="رقم الهاتف"
              value={profile?.phone || "-"}
              icon="phone"
            />
            <InfoCard
              label="تاريخ إنشاء الحساب"
              value={formatDate(profile?.created_at)}
              icon="calendar"
            />
          </div>
        </section>

        {/* Sessions */}
        <section>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-orange-300/20 bg-orange-400/10 px-4 py-2 text-xs font-black text-orange-100">
                لعبة لمتكم
              </div>
              <h2 className="text-2xl font-black text-white md:text-3xl">
                الجولات غير المكتملة
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
                يمكنك الرجوع لأي لعبة لم تنتهِ بعد، أو حذفها بالكامل إذا لم تعد
                تريد إكمالها.
              </p>
            </div>
          </div>

          {activeSessions.length > 0 ? (
            <div className="grid gap-5">
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
            <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center">
              <div className="mb-3 text-2xl font-black text-white">
                لا توجد ألعاب غير مكتملة حاليًا.
              </div>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-white/65">
                عندما تبدأ لعبة جديدة ثم تتوقف قبل إنهائها، ستظهر هنا لتتمكن من
                متابعتها أو حذفها لاحقًا.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}