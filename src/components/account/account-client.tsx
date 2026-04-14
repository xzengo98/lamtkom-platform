"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { deleteIncompleteGame } from "@/app/account/actions";

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

export type Profile = {
  id?: string;
  email: string | null;
  username: string | null;
  phone: string | null;
  role: string;
  games_remaining: number;
  games_played: number;
  created_at: string | null;
};

export type ActiveSession = {
  id: string;
  game_name: string;
  team_one_name: string;
  team_two_name: string;
  team_one_score: number;
  team_two_score: number;
  created_at: string | null;
  status: string;
};

type AccountClientPageProps = {
  initialProfile: Profile | null;
  initialActiveSessions: ActiveSession[];
  initialUserId: string;
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

function getRoleBadgeClass(role: string | null | undefined) {
  const normalized = String(role ?? "user").toLowerCase();

  if (normalized === "admin") {
    return "border-red-400/30 bg-red-400/10 text-red-300";
  }

  if (normalized === "vip") {
    return "border-violet-400/30 bg-violet-400/10 text-violet-300";
  }

  if (normalized === "premium") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  }

  return "border-white/10 bg-white/5 text-white/45";
}

function getInitials(username: string | null | undefined, email: string | null | undefined) {
  const name = username || email || "؟";
  return name.slice(0, 2).toUpperCase();
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
    | "trash"
    | "spark"
    | "arrow";
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
          <path d="M4 7h16v10H4z" />
          <path d="m5 8 7 5 7-5" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.35 2.81a2 2 0 0 1-.57 1.73l-2.02 2.02a16 16 0 0 0 6 6l2.02-2.02a2 2 0 0 1 1.73-.57l2.81.35A2 2 0 0 1 22 16.92Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <path d="M8 2v4M16 2v4M3 10h18" />
          <rect x="3" y="4" width="18" height="17" rx="2" />
        </svg>
      );
    case "games":
      return (
        <svg {...common}>
          <rect x="4" y="8" width="16" height="8" rx="3" />
          <path d="M8 12h2M9 11v2M16.5 12h.01M18.5 12h.01" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="m8 5 11 7-11 7V5Z" />
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
          <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
          <rect x="3" y="3" width="18" height="18" rx="4" />
        </svg>
      );
    case "bara":
      return (
        <svg {...common}>
          <path d="M12 3c4.5 0 8 3.2 8 7.2 0 5.5-8 10.8-8 10.8S4 15.7 4 10.2C4 6.2 7.5 3 12 3Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      );
    case "stats":
      return (
        <svg {...common}>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20v-3" />
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
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "pricing":
      return (
        <svg {...common}>
          <path d="M12 1v22" />
          <path d="M17 5.5C17 3.6 14.8 2 12 2S7 3.6 7 5.5 9.2 9 12 9s5 1.6 5 3.5S14.8 16 12 16s-5 1.6-5 3.5" />
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
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.8 4.7L18 9.5l-4.2 1.7L12 16l-1.8-4.8L6 9.5l4.2-1.8L12 3Z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      );
    default:
      return null;
  }
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white/45">
      <span className="h-1 w-1 rounded-full bg-cyan-400" />
      {children}
    </span>
  );
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
  const styles = {
    slate: {
      bar: "bg-white/25",
      stat: "border-white/8 bg-white/4",
      num: "text-white/80",
      lbl: "text-white/40",
    },
    cyan: {
      bar: "bg-cyan-400",
      stat: "border-cyan-400/15 bg-cyan-400/6",
      num: "text-cyan-300",
      lbl: "text-cyan-400/60",
    },
    orange: {
      bar: "bg-orange-400",
      stat: "border-orange-400/15 bg-orange-400/6",
      num: "text-orange-300",
      lbl: "text-orange-400/60",
    },
    emerald: {
      bar: "bg-emerald-400",
      stat: "border-emerald-400/15 bg-emerald-400/6",
      num: "text-emerald-300",
      lbl: "text-emerald-400/60",
    },
  }[tone];

  return (
    <div className={`overflow-hidden rounded-2xl border ${styles.stat}`}>
      <div className={`h-[2px] w-full ${styles.bar} opacity-70`} />
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div>
          <div className={`text-xs font-bold ${styles.lbl}`}>{label}</div>
          <div className={`mt-1 text-2xl font-black ${styles.num}`}>{value}</div>
        </div>
        <div className={`rounded-2xl border p-3 ${styles.stat}`}>
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

const infoIconTones: Record<"user" | "email" | "phone" | "calendar" | "shield", string> = {
  user: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
  email: "border-violet-400/20 bg-violet-400/8 text-violet-300",
  phone: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
  calendar: "border-orange-400/20 bg-orange-400/8 text-orange-300",
  shield: "border-amber-400/20 bg-amber-400/8 text-amber-300",
};

const infoBarColors: Record<"user" | "email" | "phone" | "calendar" | "shield", string> = {
  user: "bg-cyan-400",
  email: "bg-violet-400",
  phone: "bg-emerald-400",
  calendar: "bg-orange-400",
  shield: "bg-amber-400",
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
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,42,0.96)_0%,rgba(4,8,22,0.99)_100%)]">
      <div className={`h-[2px] w-full ${barColor} opacity-70`} />
      <div className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className={`rounded-2xl border p-3 ${iconTone}`}>
            <Icon name={icon} className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-white/35">{label}</span>
        </div>

        {truncate ? (
          <div className="truncate text-base font-black text-white/80">{value}</div>
        ) : (
          <div className="text-base font-black text-white/80">{value}</div>
        )}
      </div>
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
  const total = (session.team_one_score ?? 0) + (session.team_two_score ?? 0);
  const teamOnePct = total > 0 ? Math.round(((session.team_one_score ?? 0) / total) * 100) : 50;
  const teamTwoPct = total > 0 ? 100 - teamOnePct : 50;
  const teamOneLeads = (session.team_one_score ?? 0) >= (session.team_two_score ?? 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,42,0.96)_0%,rgba(4,8,22,0.99)_100%)]">
      <div className="h-[2px] w-full bg-cyan-400 opacity-70" />

      <div className="p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-[11px] font-black text-cyan-300">
              <Icon name="quiz" className="h-3.5 w-3.5" />
              جولة غير مكتملة
            </span>
            <h3 className="mt-3 text-xl font-black text-white">{session.game_name}</h3>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/45">
            {formatDate(session.created_at)}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className={`rounded-2xl border px-4 py-4 ${teamOneLeads ? "border-cyan-400/20 bg-cyan-400/8" : "border-white/8 bg-white/4"}`}>
            <div className="text-sm font-bold text-white/45">{session.team_one_name}</div>
            <div className="mt-2 text-3xl font-black text-white">{session.team_one_score ?? 0}</div>
          </div>

          <div className="text-center">
            <div className="text-xs font-bold text-white/35">VS</div>
            <div className="mt-2 text-sm font-bold text-white/45">جولة نشطة</div>
          </div>

          <div className={`rounded-2xl border px-4 py-4 ${!teamOneLeads ? "border-orange-400/20 bg-orange-400/8" : "border-white/8 bg-white/4"}`}>
            <div className="text-sm font-bold text-white/45">{session.team_two_name}</div>
            <div className="mt-2 text-3xl font-black text-white">{session.team_two_score ?? 0}</div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-full bg-white/6">
          <div className="flex h-2 w-full">
            <div className="bg-cyan-400" style={{ width: `${teamOnePct}%` }} />
            <div className="bg-orange-400" style={{ width: `${teamTwoPct}%` }} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/game/board?sessionId=${session.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/18"
          >
            <Icon name="continue" className="h-4 w-4" />
            متابعة اللعبة
          </Link>

          <button
            type="button"
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

export default function AccountClientPage({
  initialProfile,
  initialActiveSessions,
  initialUserId,
}: AccountClientPageProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(initialActiveSessions);
  const [userId] = useState(initialUserId);
  const [deletingId, setDeletingId] = useState("");

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function handleDeleteSession(sessionId: string) {
  if (!userId || !sessionId) return;

  const confirmed = window.confirm("هل أنت متأكد من حذف هذه اللعبة غير المكتملة؟");
  if (!confirmed) return;

  setDeletingId(sessionId);

  try {
    const result = await deleteIncompleteGame(sessionId);

    if (!result.ok) {
      alert(result.error || "تعذر حذف اللعبة غير المكتملة.");
      return;
    }

    setActiveSessions((prev) =>
      prev.filter((session) => session.id !== sessionId)
    );

    router.refresh();
  } finally {
    setDeletingId("");
  }
}

  const roleLabel = getRoleLabel(profile?.role);
  const roleBadgeClass = getRoleBadgeClass(profile?.role);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="relative mb-8 overflow-hidden rounded-[2.6rem] border border-white/8 bg-[linear-gradient(160deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_55%,rgba(6,12,30,1)_100%)]">
          <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-violet-500/8 blur-[60px]" />

          <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1.2fr_320px] lg:px-10">
            <div>
              <SectionBadge>Dashboard الحساب</SectionBadge>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-cyan-400/18 bg-cyan-400/10 text-2xl font-black text-cyan-300">
                  {getInitials(profile?.username, profile?.email)}
                </div>

                <div>
                  <h1 className="text-3xl font-black text-white md:text-4xl">
                    أهلًا {profile?.username || "بك"}
                  </h1>

                  <div className="mt-3">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${roleBadgeClass}`}>
                      {roleLabel}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-white/50">
                مركز التحكم الخاص بك — راجع بياناتك، تابع ألعابك غير المكتملة، واحذف أي لعبة لا تريد إكمالها.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/10"
                >
                  <Icon name="home" className="h-4 w-4" />
                  الرئيسية
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/10"
                >
                  <Icon name="pricing" className="h-4 w-4" />
                  الخطط والباقات
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/8 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/14"
                >
                  <Icon name="logout" className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex h-[240px] w-[240px] items-center justify-center rounded-[2.4rem] border border-cyan-400/16 bg-[linear-gradient(160deg,rgba(10,20,48,0.98)_0%,rgba(4,8,22,0.99)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.60)]">
                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="h-[150px] w-[150px] object-contain opacity-90"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard label="الألعاب المتبقية" value={profile?.games_remaining ?? 0} icon="games" tone="cyan" />
          <StatCard label="الألعاب التي لُعبت" value={profile?.games_played ?? 0} icon="play" tone="orange" />
          <StatCard label="الجولات النشطة" value={activeSessions.length} icon="quiz" tone="emerald" />
          <StatCard label="نوع الحساب" value={roleLabel} icon="shield" tone="slate" />
        </section>

        <section className="mb-8">
          <SectionBadge>معلومات الحساب</SectionBadge>
          <h2 className="mt-3 text-2xl font-black text-white">بياناتك الأساسية</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <InfoCard
              label="اسم المستخدم"
              value={profile?.username || "غير محدد"}
              icon="user"
            />
            <InfoCard
              label="البريد الإلكتروني"
              value={profile?.email || "غير متوفر"}
              icon="email"
              truncate
            />
            <InfoCard
              label="رقم الهاتف"
              value={profile?.phone || "غير متوفر"}
              icon="phone"
            />
            <InfoCard
              label="تاريخ الإنشاء"
              value={formatDate(profile?.created_at)}
              icon="calendar"
            />
            <InfoCard label="صلاحية الحساب" value={roleLabel} icon="shield" />
          </div>
        </section>

        <section className="mb-8">
          <SectionBadge>وصول سريع</SectionBadge>
          <h2 className="mt-3 text-2xl font-black text-white">ابدأ لعبة جديدة</h2>
          <p className="mt-2 text-sm leading-7 text-white/45">
            اختر اللعبة التي تريد البدء بها مباشرة.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
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
              <div
                key={game.label}
                className="overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,42,0.96)_0%,rgba(4,8,22,0.99)_100%)]"
              >
                <div className={`h-[2px] w-full ${game.bar} opacity-70`} />
                <div className="p-5">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${game.badge}`}>
                    {game.label}
                  </span>

                  <p className="mt-4 text-sm leading-7 text-white/45">{game.desc}</p>

                  <Link
                    href={game.href}
                    className={`mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition ${game.btn}`}
                  >
                    <Icon name={game.icon} className="h-4 w-4" />
                    ابدأ الآن
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionBadge>لعبة لمتكم</SectionBadge>
          <h2 className="mt-3 text-2xl font-black text-white">الجولات غير المكتملة</h2>
          <p className="mt-2 text-sm leading-7 text-white/45">
            يمكنك الرجوع لأي لعبة لم تنتهِ بعد، أو حذفها إذا لم تعد تريد إكمالها.
          </p>

          {activeSessions.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-sm font-black text-cyan-300">
              <Icon name="games" className="h-4 w-4" />
              {activeSessions.length} جولة نشطة
            </div>
          )}

          {activeSessions.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {activeSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  deleting={deletingId === session.id}
                  onDelete={handleDeleteSession}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,42,0.96)_0%,rgba(4,8,22,0.99)_100%)] p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/35">
                <Icon name="quiz" className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-black text-white">
                لا توجد ألعاب غير مكتملة حاليًا
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/45">
                عندما تبدأ لعبة جديدة وتتوقف قبل إنهائها، ستظهر هنا لتتمكن من متابعتها لاحقًا.
              </p>
              <Link
                href="/game/start"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/18"
              >
                <Icon name="continue" className="h-4 w-4" />
                ابدأ لعبة جديدة
              </Link>
            </div>
          )}
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-white/6 py-6 text-xs text-white/25 md:flex-row">
          <span>لمتكم © {new Date().getFullYear()}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-white/45 transition hover:text-white/75"
          >
            <Icon name="logout" className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </footer>
      </div>
    </main>
  );
}
