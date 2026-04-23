"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  deleteIncompleteGame,
  redeemCouponAction,
  updatePasswordAction,
  updateProfileDetailsAction,
} from "@/app/account/actions";

const heroLogo = "/logo.webp";

export type Profile = {
  id?: string;
  email: string | null;
  username: string | null;
  phone: string | null;
  role: string;
  account_tier?: string | null;
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

export type CouponRedemption = {
  id: string;
  code_snapshot: string;
  reward_type_snapshot: string;
  target_game_snapshot: string | null;
  games_amount_snapshot: number;
  target_tier_snapshot: string | null;
  redeemed_at: string | null;
};

type AccountClientPageProps = {
  initialProfile: Profile | null;
  initialActiveSessions: ActiveSession[];
  initialCouponRedemptions: CouponRedemption[];
  initialUserId: string;
};

type EditModalSection = "profile" | "password";


function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return value;
  }
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("ar-EG");
  } catch {
    return value;
  }
}

function getRoleLabel(role: string | null | undefined) {
  const normalized = String(role ?? "user").toLowerCase();
  if (normalized === "admin") return "ADMIN";
  return "USER";
}

function getRoleBadgeClass(role: string | null | undefined) {
  const normalized = String(role ?? "user").toLowerCase();
  if (normalized === "admin") {
    return "border-red-400/30 bg-red-400/10 text-red-300";
  }
  return "border-white/10 bg-white/5 text-white/45";
}

function getTierLabel(tier: string | null | undefined) {
  const normalized = String(tier ?? "free").toLowerCase();
  if (normalized === "premium") return "Premium";
  if (normalized === "vip") return "VIP";
  return "FREE";
}

function getTierBadgeClass(tier: string | null | undefined) {
  const normalized = String(tier ?? "free").toLowerCase();
  if (normalized === "premium") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  }
  if (normalized === "vip") {
    return "border-violet-400/30 bg-violet-400/10 text-violet-300";
  }
  return "border-white/10 bg-white/5 text-white/45";
}

function isVipTier(tier: string | null | undefined) {
  return String(tier ?? "free").toLowerCase() === "vip";
}

function formatGamesRemaining(value: number | null | undefined, tier: string | null | undefined) {
  if (isVipTier(tier)) {
    return "∞";
  }

  return Number(value ?? 0);
}

function getInitials(
  username: string | null | undefined,
  email: string | null | undefined,
) {
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
    | "gift"
    | "ticket"
    | "edit"
    | "lock"
    | "close"
    | "check";
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
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.63 2.61a2 2 0 0 1-.45 2.11L8 10a16 16 0 0 0 6 6l1.56-1.24a2 2 0 0 1 2.11-.45c.84.3 1.71.51 2.61.63A2 2 0 0 1 22 16.92Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      );
    case "games":
      return (
        <svg {...common}>
          <path d="M3 12h18" />
          <path d="M12 3v18" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <polygon points="8 5 19 12 8 19 8 5" />
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
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 8h8M8 12h5M8 16h3" />
        </svg>
      );
    case "bara":
      return (
        <svg {...common}>
          <path d="M12 3 4 7v6c0 5 3.5 7.5 8 8 4.5-.5 8-3 8-8V7l-8-4Z" />
          <path d="M9 12h6" />
        </svg>
      );
    case "stats":
      return (
        <svg {...common}>
          <path d="M4 19V9" />
          <path d="M10 19V5" />
          <path d="M16 19v-7" />
          <path d="M22 19V3" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
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
          <path d="M3 12 12 4l9 8" />
          <path d="M5 10v10h14V10" />
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
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3l1.8 4.8L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-2.2L12 3Z" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <path d="M20 12v8H4v-8" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 7v13" />
          <path d="M12 7H8.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Z" />
          <path d="M12 7h3.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z" />
        </svg>
      );
    case "ticket":
      return (
        <svg {...common}>
          <path d="M3 9a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 2-2V9Z" />
          <path d="M12 7v10" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    default:
      return null;
  }
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/8 px-4 py-2 text-xs font-black text-cyan-300">
      {children}
    </div>
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
    <div
      className={`overflow-hidden rounded-[1.6rem] border shadow-[0_14px_34px_rgba(0,0,0,0.16)] ${styles.stat}`}
    >
      <div className={`h-1 w-full ${styles.bar}`} />
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <div className={`text-sm font-bold ${styles.lbl}`}>{label}</div>
          <div className={`mt-2 text-3xl font-black ${styles.num}`}>{value}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70">
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

const infoIconTones: Record<
  "user" | "email" | "phone" | "calendar" | "shield",
  string
> = {
  user: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
  email: "border-violet-400/20 bg-violet-400/8 text-violet-300",
  phone: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
  calendar: "border-orange-400/20 bg-orange-400/8 text-orange-300",
  shield: "border-amber-400/20 bg-amber-400/8 text-amber-300",
};

const infoBarColors: Record<
  "user" | "email" | "phone" | "calendar" | "shield",
  string
> = {
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
  actionLabel,
  onActionClick,
}: {
  label: string;
  value: string;
  icon: "user" | "email" | "phone" | "calendar" | "shield";
  truncate?: boolean;
  actionLabel?: string;
  onActionClick?: () => void;
}) {
  const iconTone = infoIconTones[icon];
  const barColor = infoBarColors[icon];

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.03] shadow-[0_14px_34px_rgba(0,0,0,0.16)]">
      <div className={`h-1 w-full ${barColor}`} />
      <div className="flex items-start gap-3 px-4 py-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${iconTone}`}
        >
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm font-bold text-white/45">{label}</div>

            {onActionClick ? (
              <button
                type="button"
                onClick={onActionClick}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300"
                aria-label={actionLabel || "تعديل"}
                title={actionLabel || "تعديل"}
              >
                <Icon name="edit" className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {truncate ? (
            <div className="mt-2 truncate text-base font-black text-white/85">
              {value}
            </div>
          ) : (
            <div className="mt-2 break-words text-base font-black text-white/85">
              {value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function EditAccountModal({
  open,
  profileUsername,
  profilePhone,
  onClose,
  onProfileSubmit,
  onPasswordSubmit,
  profileSaving,
  passwordSaving,
  profileError,
  profileMessage,
  passwordError,
  passwordMessage,
  initialSection = "profile",
}: {
  open: boolean;
  profileUsername: string;
  profilePhone: string;
  onClose: () => void;
  onProfileSubmit: (values: { username: string; phone: string }) => Promise<void>;
  onPasswordSubmit: (values: {
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  profileSaving: boolean;
  passwordSaving: boolean;
  profileError: string;
  profileMessage: string;
  passwordError: string;
  passwordMessage: string;
  initialSection?: EditModalSection;
}) {
  const [activeSection, setActiveSection] =
    useState<EditModalSection>(initialSection);
  const [username, setUsername] = useState(profileUsername);
  const [phone, setPhone] = useState(profilePhone);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(150deg,rgba(8,16,40,0.98)_0%,rgba(4,8,22,0.99)_50%,rgba(6,12,30,0.98)_100%)] shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-5 md:px-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-xs font-black text-cyan-300">
              <Icon name="edit" className="h-4 w-4" />
              تعديلات بياناتي
            </div>
            <h3 className="mt-3 text-2xl font-black text-white">
              تعديل معلومات الحساب
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/55">
              عدّل اسم المستخدم ورقم الهاتف وكلمة المرور من مكان واحد.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
            aria-label="إغلاق"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-white/8 px-5 py-4 md:px-7">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveSection("profile")}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition ${
                activeSection === "profile"
                  ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                  : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08]"
              }`}
            >
              <Icon name="user" className="h-4 w-4" />
              الاسم ورقم الهاتف
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("password")}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition ${
                activeSection === "password"
                  ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
                  : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08]"
              }`}
            >
              <Icon name="lock" className="h-4 w-4" />
              كلمة المرور
            </button>
          </div>
        </div>

        <div className="max-h-[calc(92vh-190px)] overflow-y-auto px-5 py-5 md:px-7">
          {activeSection === "profile" ? (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await onProfileSubmit({ username, phone });
              }}
              className="space-y-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-sm font-black text-white/70">
                    اسم المستخدم
                  </div>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm font-black text-white/70">
                    رقم الهاتف
                  </div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="أدخل رقم الهاتف"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                    dir="ltr"
                  />
                </label>
              </div>

              {profileMessage ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                  {profileMessage}
                </div>
              ) : null}

              {profileError ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                  {profileError}
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon name="check" className="h-4 w-4" />
                  {profileSaving ? "جارٍ حفظ البيانات..." : "حفظ البيانات"}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await onPasswordSubmit({
                  newPassword,
                  confirmPassword,
                });

                setNewPassword("");
                setConfirmPassword("");
              }}
              className="space-y-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-sm font-black text-white/70">
                    كلمة المرور الجديدة
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm font-black text-white/70">
                    تأكيد كلمة المرور الجديدة
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/8 px-4 py-4 text-sm leading-7 text-amber-100/90">
                اجعل كلمة المرور الجديدة مكونة من 8 أحرف على الأقل.
              </div>

              {passwordMessage ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                  {passwordMessage}
                </div>
              ) : null}

              {passwordError ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                  {passwordError}
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(251,191,36,0.22)] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon name="lock" className="h-4 w-4" />
                  {passwordSaving ? "جارٍ تحديث كلمة المرور..." : "تحديث كلمة المرور"}
                </button>
              </div>
            </form>
          )}
        </div>
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
  const teamOnePct =
    total > 0 ? Math.round(((session.team_one_score ?? 0) / total) * 100) : 50;
  const teamTwoPct = total > 0 ? 100 - teamOnePct : 50;
  const teamOneLeads =
    (session.team_one_score ?? 0) >= (session.team_two_score ?? 0);

  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-white/[0.03] shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/6 px-4 py-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/8 px-3 py-1 text-xs font-black text-orange-300">
          <Icon name="spark" className="h-4 w-4" />
          جولة غير مكتملة
        </div>
        <div className="text-xs font-bold text-white/35">
          {formatDate(session.created_at)}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-black text-white">{session.game_name}</h3>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/6 px-4 py-3 text-center">
            <div className="truncate text-sm font-bold text-cyan-300">
              {session.team_one_name}
            </div>
            <div className="mt-2 text-3xl font-black text-white">
              {session.team_one_score ?? 0}
            </div>
          </div>

          <div className="text-sm font-black text-white/35">VS</div>

          <div className="rounded-2xl border border-orange-400/15 bg-orange-400/6 px-4 py-3 text-center">
            <div className="truncate text-sm font-bold text-orange-300">
              {session.team_two_name}
            </div>
            <div className="mt-2 text-3xl font-black text-white">
              {session.team_two_score ?? 0}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white/40">
            <span>{teamOnePct}%</span>
            <span>{teamTwoPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/6">
            <div
              className={`h-full ${
                teamOneLeads ? "bg-cyan-400" : "bg-orange-400"
              }`}
              style={{ width: `${Math.max(teamOnePct, teamTwoPct)}%` }}
            />
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

function CouponHistoryCard({ item }: { item: CouponRedemption }) {
  const isGames = item.reward_type_snapshot === "games_balance";

  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black text-white">{item.code_snapshot}</div>
          <div className="mt-1 text-xs text-white/55">
            {isGames
              ? `إضافة ${item.games_amount_snapshot} ألعاب`
              : `ترقية إلى ${item.target_tier_snapshot ?? "premium"}`}
          </div>
        </div>

        <div className="text-xs font-bold text-white/40">
          {formatDateTime(item.redeemed_at)}
        </div>
      </div>
    </div>
  );
}

export default function AccountClientPage({
  initialProfile,
  initialActiveSessions,
  initialCouponRedemptions,
  initialUserId,
}: AccountClientPageProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [activeSessions, setActiveSessions] = useState(initialActiveSessions);
  const [couponRedemptions, setCouponRedemptions] = useState(
    initialCouponRedemptions,
  );
  const [userId] = useState(initialUserId);
  const [deletingId, setDeletingId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalSection, setEditModalSection] =
    useState<EditModalSection>("profile");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileEditMessage, setProfileEditMessage] = useState("");
  const [profileEditError, setProfileEditError] = useState("");
  const [passwordEditMessage, setPasswordEditMessage] = useState("");
  const [passwordEditError, setPasswordEditError] = useState("");

  function handleLogout() {
    window.location.assign("/logout");
  }

  function openEditModal(section: EditModalSection = "profile") {
    setEditModalSection(section);
    setProfileEditError("");
    setProfileEditMessage("");
    setPasswordEditError("");
    setPasswordEditMessage("");
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
  }

  async function handleProfileUpdate(values: {
    username: string;
    phone: string;
  }) {
    setProfileSaving(true);
    setProfileEditError("");
    setProfileEditMessage("");

    try {
      const result = await updateProfileDetailsAction(values);

if (!result.ok) {
  setProfileEditError(result.error ?? "تعذر تحديث البيانات.");
  return;
}

if (!result.profile) {
  setProfileEditError("تعذر تحديث البيانات.");
  return;
}

const updatedProfile = result.profile;

setProfile((prev) =>
  prev
    ? {
        ...prev,
        username: updatedProfile.username,
        phone: updatedProfile.phone,
      }
    : prev,
);

setProfileEditMessage("تم تحديث اسم المستخدم ورقم الهاتف بنجاح.");
router.refresh();
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordUpdate(values: {
    newPassword: string;
    confirmPassword: string;
  }) {
    setPasswordSaving(true);
    setPasswordEditError("");
    setPasswordEditMessage("");

    try {
      const result = await updatePasswordAction(values);

      if (!result.ok) {
        setPasswordEditError(result.error || "تعذر تحديث كلمة المرور.");
        return;
      }

      setPasswordEditMessage(result.message || "تم تحديث كلمة المرور بنجاح.");
      router.refresh();
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleDeleteSession(sessionId: string) {
    if (!userId || !sessionId) return;

    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذه اللعبة غير المكتملة؟",
    );
    if (!confirmed) return;

    setDeletingId(sessionId);

    try {
      const result = await deleteIncompleteGame(sessionId);

      if (!result.ok) {
        alert(result.error || "تعذر حذف اللعبة غير المكتملة.");
        return;
      }

      setActiveSessions((prev) =>
        prev.filter((session) => session.id !== sessionId),
      );
      router.refresh();
    } finally {
      setDeletingId("");
    }
  }

  async function handleRedeemCoupon() {
    const normalizedCode = couponCode.trim().replace(/\s+/g, "").toUpperCase();

    if (!normalizedCode) {
      setCouponError("يرجى إدخال كود الكوبون.");
      setCouponMessage("");
      return;
    }

    setRedeeming(true);
    setCouponError("");
    setCouponMessage("");

    try {
      const result = await redeemCouponAction(normalizedCode);

      if (!result.ok) {
        setCouponError(result.error || "تعذر تفعيل الكوبون.");
        return;
      }

      setCouponMessage(result.message || "تم تفعيل الكوبون بنجاح.");
      setCouponCode("");

      if (profile) {
        const nextProfile = { ...profile };

        if (result.rewardType === "games_balance") {
          nextProfile.games_remaining =
            Number(nextProfile.games_remaining ?? 0) +
            Number(result.gamesAmount ?? 0);
        }

        if (result.rewardType === "account_tier") {
          nextProfile.account_tier = result.targetTier ?? nextProfile.account_tier;
        }

        setProfile(nextProfile);
      }

      setCouponRedemptions((prev) => [
        {
          id: `local-${Date.now()}`,
          code_snapshot: normalizedCode,
          reward_type_snapshot: result.rewardType || "games_balance",
          target_game_snapshot: "lamtkom",
          games_amount_snapshot: Number(result.gamesAmount ?? 0),
          target_tier_snapshot: result.targetTier ?? null,
          redeemed_at: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 6));

      router.refresh();
    } finally {
      setRedeeming(false);
    }
  }

  const roleLabel = getRoleLabel(profile?.role);
  const roleBadgeClass = getRoleBadgeClass(profile?.role);
  const tierLabel = getTierLabel(profile?.account_tier);
  const tierBadgeClass = getTierBadgeClass(profile?.account_tier);
  const gamesRemainingLabel = formatGamesRemaining(
    profile?.games_remaining,
    profile?.account_tier,
  );

  const stats = useMemo(
    () => [
      {
        label: "الألعاب المتبقية",
        value: gamesRemainingLabel,
        icon: "games" as const,
        tone: "cyan" as const,
      },
      {
        label: "الألعاب المكتملة",
        value: profile?.games_played ?? 0,
        icon: "stats" as const,
        tone: "emerald" as const,
      },
      {
        label: "نوع الحساب",
        value: tierLabel,
        icon: "shield" as const,
        tone: "orange" as const,
      },
    ],
    [gamesRemainingLabel, profile?.games_played, tierLabel],
  );

  return (
    <main className="min-h-screen text-white">
      <EditAccountModal
        open={isEditModalOpen}
        initialSection={editModalSection}
        profileUsername={profile?.username || ""}
        profilePhone={profile?.phone || ""}
        onClose={closeEditModal}
        onProfileSubmit={handleProfileUpdate}
        onPasswordSubmit={handlePasswordUpdate}
        profileSaving={profileSaving}
        passwordSaving={passwordSaving}
        profileError={profileEditError}
        profileMessage={profileEditMessage}
        passwordError={passwordEditError}
        passwordMessage={passwordEditMessage}
      />

      <div className="pointer-events-none fixed inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(34,211,238,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.4)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="overflow-hidden rounded-[2.6rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_50%,rgba(6,12,30,1)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.40)]">
          <div className="border-b border-white/8 px-6 py-8 md:px-8">
            <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
              <div>
                <SectionBadge>Dashboard الحساب</SectionBadge>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-cyan-400/18 bg-cyan-400/8 text-2xl font-black text-cyan-300 shadow-[0_10px_28px_rgba(34,211,238,0.10)]">
                    {getInitials(profile?.username, profile?.email)}
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-3xl font-black text-white md:text-4xl">
                      أهلًا {profile?.username || "بك"}
                    </h1>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${roleBadgeClass}`}
                      >
                        {roleLabel}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${tierBadgeClass}`}
                      >
                        {tierLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-5 max-w-2xl text-sm leading-8 text-white/58 md:text-base">
                  مركز التحكم الخاص بك — راجع بياناتك، تابع ألعابك غير المكتملة،
                  فعّل كوبوناتك، وابدأ الألعاب بسرعة من مكان واحد.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]"
                  >
                    <Icon name="home" className="h-4 w-4" />
                    الرئيسية
                  </Link>
<button
                  type="button"
                  onClick={() => openEditModal("profile")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/16"
                >
                  <Icon name="edit" className="h-4 w-4" />
                  تعديل بياناتي
                </button>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/16"
                  >
                    <Icon name="pricing" className="h-4 w-4" />
                    الخطط والباقات
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/16"
                  >
                    <Icon name="logout" className="h-4 w-4" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>

              <div className="flex justify-center xl:justify-end">
                <div className="relative flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/14 bg-[linear-gradient(160deg,rgba(11,23,49,0.98)_0%,rgba(6,12,28,0.99)_100%)] shadow-[0_26px_70px_rgba(0,0,0,0.32)] sm:h-[250px] sm:w-[250px]">
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.11),transparent_68%)]" />
                  <img
                    src={heroLogo}
                    alt="لمتكم"
                    className="relative h-[155px] w-[155px] object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.18)] sm:h-[180px] sm:w-[180px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <SectionBadge>معلومات الحساب</SectionBadge>
                  <h2 className="mt-4 text-2xl font-black text-white">
                    بياناتك الأساسية
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  label="اسم المستخدم"
                  value={profile?.username || "-"}
                  icon="user"
                  actionLabel="تعديل اسم المستخدم"
                  onActionClick={() => openEditModal("profile")}
                />
                <InfoCard
                  label="البريد الإلكتروني"
                  value={profile?.email || "-"}
                  icon="email"
                  truncate
                />
                <InfoCard
                  label="رقم الهاتف"
                  value={profile?.phone || "-"}
                  icon="phone"
                  actionLabel="تعديل رقم الهاتف"
                  onActionClick={() => openEditModal("profile")}
                />
                <InfoCard
                  label="تاريخ الانضمام"
                  value={formatDate(profile?.created_at)}
                  icon="calendar"
                />
                <InfoCard
                  label="الدور"
                  value={roleLabel}
                  icon="shield"
                />
                <InfoCard
                  label="الباقة الحالية"
                  value={tierLabel}
                  icon="shield"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                  <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    tone={stat.tone}
                  />
                ))}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SectionBadge>الكوبونات</SectionBadge>
                    <h2 className="mt-4 text-2xl font-black text-white">
                      تفعيل كوبون جديد
                    </h2>
                    <p className="mt-2 text-sm leading-8 text-white/58">
                      أدخل كود الكوبون لإضافة ألعاب إلى رصيدك أو لترقية حسابك.
                    </p>
                  </div>

                  <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300 sm:flex">
                    <Icon name="gift" className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="أدخل كود الكوبون"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />

                  <button
                    type="button"
                    onClick={handleRedeemCoupon}
                    disabled={redeeming}
                    className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {redeeming ? "جارٍ التفعيل..." : "تفعيل الكوبون"}
                  </button>
                </div>

                {couponMessage ? (
                  <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                    {couponMessage}
                  </div>
                ) : null}

                {couponError ? (
                  <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                    {couponError}
                  </div>
                ) : null}

                <div className="mt-5 space-y-3">
                  <div className="text-sm font-black text-white/70">
                    آخر عمليات التفعيل
                  </div>

                  {couponRedemptions.length > 0 ? (
                    couponRedemptions.map((item) => (
                      <CouponHistoryCard key={item.id} item={item} />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5 text-sm font-bold text-white/45">
                      لا توجد كوبونات مفعلة حتى الآن.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              
              <div>
                <SectionBadge>لعبة لمتكم</SectionBadge>
                <h2 className="mt-4 text-2xl font-black text-white">
                  الجولات غير المكتملة
                </h2>
                <p className="mt-2 text-sm leading-8 text-white/58">
                  يمكنك الرجوع لأي لعبة لم تنتهِ بعد، أو حذفها إذا لم تعد تريد
                  إكمالها.
                </p>
              </div>

              {activeSessions.length > 0 ? (
                <div className="space-y-4">
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
                <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6 text-center shadow-[0_16px_36px_rgba(0,0,0,0.16)]">
                  <h3 className="text-xl font-black text-white">
                    لا توجد ألعاب غير مكتملة حاليًا
                  </h3>
                  <p className="mt-3 text-sm leading-8 text-white/52">
                    عندما تبدأ لعبة جديدة وتتوقف قبل إنهائها، ستظهر هنا لتتمكن
                    من متابعتها لاحقًا.
                  </p>
                  <Link
                    href="/game/start"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/18"
                  >
                    <Icon name="continue" className="h-4 w-4" />
                    ابدأ لعبة جديدة
                  </Link>
                </div>
              )}
            </section>
          </div>

          <div className="border-t border-white/8 px-6 py-5 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="font-bold text-white/35">
                لمتكم © {new Date().getFullYear()}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200 transition hover:bg-red-500/16"
              >
                <Icon name="logout" className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}