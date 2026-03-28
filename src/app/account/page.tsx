"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
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
    | "pricing";
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
          <circle cx="12" cy="8" r="3.2" />
          <path d="M6 19a6 6 0 0 1 12 0" />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M7 4h10" />
          <rect x="6" y="3" width="12" height="18" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
          <path d="M3 10h18" />
        </svg>
      );
    case "games":
      return (
        <svg {...common}>
          <rect x="4" y="8" width="16" height="8" rx="3" />
          <path d="M8 12h2" />
          <path d="M9 11v2" />
          <path d="M16 12h.01" />
          <path d="M18 12h.01" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="M8 6v12l10-6-10-6Z" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l-5-5 5-5" />
          <path d="M5 12h10" />
          <path d="M14 5h4v14h-4" />
        </svg>
      );
    case "quiz":
      return (
        <svg {...common}>
          <path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-.8.8-1.8 1.4-1.8 2.8" />
          <circle cx="12" cy="17.5" r="0.7" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "bara":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M7 20a5 5 0 0 1 10 0" />
          <path d="M18.5 5.5h.01" />
        </svg>
      );
    case "stats":
      return (
        <svg {...common}>
          <path d="M5 19V9" />
          <path d="M12 19V5" />
          <path d="M19 19v-7" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" />
        </svg>
      );
    case "continue":
      return (
        <svg {...common}>
          <path d="M8 6l8 6-8 6" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10.5V20h14v-9.5" />
        </svg>
      );
    case "pricing":
      return (
        <svg {...common}>
          <path d="M12 3v18" />
          <path d="M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 3 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3" />
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
      className={`rounded-[1.6rem] border p-5 shadow-[0_14px_40px_rgba(0,0,0,0.25)] ${tones[tone]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-white/65">{label}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white/85">
          <Icon name={icon} className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 text-3xl font-black md:text-4xl">{value}</div>
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
    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 shadow-[0_14px_35px_rgba(0,0,0,0.2)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white/85">
          <Icon name={icon} className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white/55">{label}</div>

          {truncate ? (
            <div className="mt-1 max-w-full overflow-hidden">
              <p className="truncate text-sm font-black text-white md:text-base">
                {value}
              </p>
            </div>
          ) : (
            <div className="mt-1 text-sm font-black text-white md:text-base">
              {value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: ActiveSession }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
          <Icon name="quiz" />
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-100">
          لعبة محفوظة
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-black text-white">{session.game_name}</h3>

      <p className="mt-3 text-sm leading-7 text-white/70">
        {session.team_one_name} ({session.team_one_score ?? 0}) ×{" "}
        {session.team_two_name} ({session.team_two_score ?? 0})
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          تاريخ الإنشاء: {formatDate(session.created_at)}
        </span>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100">
          الحالة: نشطة
        </span>
      </div>

      <div className="mt-5">
        <Link
          href={`/game/board?sessionId=${session.id}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
        >
          <Icon name="continue" className="h-4 w-4" />
          متابعة اللعبة
        </Link>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
  tone = "slate",
}: {
  title: string;
  description: string;
  href: string;
  icon: "quiz" | "bara" | "games" | "pricing" | "home";
  tone?: "slate" | "cyan" | "orange" | "emerald";
}) {
  const tones = {
    slate: "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
    cyan: "border-cyan-400/20 bg-cyan-400/10 hover:border-cyan-300/35 hover:bg-cyan-400/15",
    orange:
      "border-orange-400/20 bg-orange-400/10 hover:border-orange-300/35 hover:bg-orange-400/15",
    emerald:
      "border-emerald-400/20 bg-emerald-400/10 hover:border-emerald-300/35 hover:bg-emerald-400/15",
  };

  return (
    <Link
      href={href}
      className={`group rounded-[1.5rem] border p-5 transition ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white/85">
          <Icon name={icon} />
        </div>

        <div className="flex-1">
          <div className="text-xl font-black text-white">{title}</div>
          <p className="mt-3 text-sm leading-7 text-white/70">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      const [{ data: profileData }, { data: sessionsData }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "email, username, phone, role, games_remaining, games_played, created_at",
          )
          .eq("id", user.id)
          .single(),
        supabase
          .from("game_sessions")
          .select(
            "id, game_name, team_one_name, team_two_name, team_one_score, team_two_score, created_at, status",
          )
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;

      setProfile((profileData as Profile | null) ?? null);
      setActiveSessions(
        Array.isArray(sessionsData) ? (sessionsData as ActiveSession[]) : [],
      );
      setLoading(false);
    }

    loadAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!session) {
          router.replace("/login");
        } else {
          loadAccount();
        }
      },
    );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] px-4 py-8 text-white md:px-6">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-[#071126] p-8 text-center">
          جارٍ تحميل بيانات الحساب...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_35%),linear-gradient(180deg,#071126_0%,#061020_100%)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-cyan-300">Dashboard الحساب</div>
              <h1 className="mt-2 text-4xl font-black md:text-5xl">
                أهلاً {profile?.username || "بك"}
              </h1>
              <p className="mt-4 text-sm leading-8 text-white/75 md:text-base">
                هذا مركز التحكم الخاص بك داخل المنصة. راجع بياناتك، تابع ألعابك
                غير المكتملة، وابدأ أي لعبة مباشرة من مكان واحد.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                <Icon name="games" className="h-4 w-4" />
                صفحة الألعاب
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/20"
              >
                <Icon name="logout" className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="رتبة الحساب"
            value={getRoleLabel(profile?.role)}
            icon="shield"
            tone="orange"
          />
          <StatCard
            label="الألعاب المتبقية"
            value={profile?.games_remaining ?? 0}
            icon="games"
            tone="cyan"
          />
          <StatCard
            label="الألعاب التي لعبتها"
            value={profile?.games_played ?? 0}
            icon="stats"
            tone="emerald"
          />
          <StatCard
            label="الجولات النشطة"
            value={activeSessions.length}
            icon="play"
            tone="slate"
          />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="mb-5">
            <div className="text-cyan-300">بيانات الحساب</div>
            <h2 className="mt-2 text-3xl font-black text-white">
              معلوماتك الأساسية
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
              معلوماتك الأساسية وحالة الحساب الحالية.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
            <InfoCard
              label="نوع الحساب"
              value={getRoleLabel(profile?.role)}
              icon="shield"
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="mb-5">
            <div className="text-cyan-300">الوصول السريع</div>
            <h2 className="mt-2 text-3xl font-black text-white">
              ابدأ أو أكمل اللعب
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
              اختصارات مباشرة لأهم الصفحات التي تحتاجها داخل المنصة.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <QuickActionCard
              title="ابدأ لمّتنا"
              description="انتقل مباشرة لصفحة إعداد لعبة الأسئلة والأجوبة."
              href="/game/start"
              icon="quiz"
              tone="cyan"
            />
            <QuickActionCard
              title="لعب برا السالفة"
              description="ابدأ لعبة برا السالفة مباشرة من حسابك."
              href="/game/bara-alsalfah"
              icon="bara"
              tone="emerald"
            />
            <QuickActionCard
              title="العودة للرئيسية"
              description="ارجع إلى الصفحة الرئيسية للمنصة."
              href="/"
              icon="home"
              tone="slate"
            />
            <QuickActionCard
              title="استعراض الباقات"
              description="شاهد الباقات المتاحة والمزايا الخاصة بكل حساب."
              href="/pricing"
              icon="pricing"
              tone="orange"
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="mb-5">
            <div className="text-cyan-300">لعبة لمّتنا</div>
            <h2 className="mt-2 text-3xl font-black text-white">
              الجولات غير المكتملة
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
              يمكنك الرجوع لأي لعبة لم تنتهِ بعد وإكمالها من نفس المكان.
            </p>
          </div>

          {activeSessions.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {activeSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-center text-white/70">
              لا توجد ألعاب غير مكتملة حاليًا.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}