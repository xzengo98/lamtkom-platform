"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = { role: string; username: string | null };

type AuthState = {
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string | null;
};

const NAVBAR_AUTH_CACHE_KEY = "lamtkom-navbar-auth-v1";

function navLinkClass(pathname: string, href: string) {
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return [
    "relative rounded-xl px-4 py-2 text-sm font-bold transition duration-200",
    active
      ? "bg-cyan-400/10 text-cyan-300 after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-cyan-400"
      : "text-white/60 hover:bg-white/6 hover:text-white",
  ].join(" ");
}

function readCachedAuthState(): AuthState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(NAVBAR_AUTH_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      loading: false,
      isLoggedIn: Boolean(parsed.isLoggedIn),
      isAdmin: Boolean(parsed.isAdmin),
      username: parsed.username ?? null,
    };
  } catch {
    return null;
  }
}

function writeCachedAuthState(state: AuthState) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      NAVBAR_AUTH_CACHE_KEY,
      JSON.stringify({
        isLoggedIn: state.isLoggedIn,
        isAdmin: state.isAdmin,
        username: state.username,
      }),
    );
  } catch {}
}

function clearCachedAuthState() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(NAVBAR_AUTH_CACHE_KEY);
  } catch {}
}

function loggedOutState(): AuthState {
  return {
    loading: false,
    isLoggedIn: false,
    isAdmin: false,
    username: null,
  };
}

function GamesIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="8" width="16" height="8" rx="3" />
      <path d="M8 12h2M9 11v2M16.5 12h.01M18.5 12h.01" />
    </svg>
  );
}

function UserIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  );
}

function LogoutIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
      <path d="M10 17 15 12 10 7" />
      <path d="M15 12H4" />
    </svg>
  );
}

function ShieldIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6l-7-3Z" />
    </svg>
  );
}

function PricingIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1v22M17 5.5c0-1.9-2.2-3.5-5-3.5S7 3.6 7 5.5 9.2 9 12 9s5 1.6 5 3.5S14.8 16 12 16s-5 1.6-5 3.5" />
    </svg>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(() => {
    const cached = readCachedAuthState();
    return (
      cached ?? {
        loading: true,
        isLoggedIn: false,
        isAdmin: false,
        username: null,
      }
    );
  });

  const applyLoggedOut = useCallback(() => {
    const state = loggedOutState();
    setAuthState(state);
    clearCachedAuthState();
  }, []);

  const applyProfile = useCallback((profile: Profile | null) => {
    const nextState: AuthState = {
      loading: false,
      isLoggedIn: true,
      isAdmin: profile?.role === "admin",
      username: profile?.username ?? null,
    };

    setAuthState(nextState);
    writeCachedAuthState(nextState);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        applyLoggedOut();
        return;
      }

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        isLoggedIn: true,
      }));

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, username")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        applyProfile(null);
        return;
      }

      applyProfile((profile as Profile | null) ?? null);
    } catch {
      applyLoggedOut();
    }
  }, [applyLoggedOut, applyProfile, supabase]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (!session?.user) {
          applyLoggedOut();
          return;
        }

        setAuthState((prev) => ({
          ...prev,
          loading: false,
          isLoggedIn: true,
        }));

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, username")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!isMounted) return;
        applyProfile((profile as Profile | null) ?? null);
      } catch {
        if (!isMounted) return;
        applyLoggedOut();
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        applyLoggedOut();
        router.refresh();
        return;
      }

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        isLoggedIn: true,
      }));

      void (async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, username")
          .eq("id", session.user.id)
          .maybeSingle();

        applyProfile((profile as Profile | null) ?? null);
        router.refresh();
      })();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [applyLoggedOut, applyProfile, router, supabase]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
  setMenuOpen(false);

  setAuthState({
    loading: false,
    isLoggedIn: false,
    isAdmin: false,
    username: null,
  });

  try {
    sessionStorage.removeItem("lamtkom-navbar-auth-v1");
  } catch {}

  await supabase.auth.signOut();

  window.location.href = "/";
}

  const navLinks = [
    { label: "الرئيسية", href: "/", icon: null },
    {
      label: "الألعاب",
      href: "/games",
      icon: <GamesIcon className="h-3.5 w-3.5" />,
    },
    {
      label: "الباقات",
      href: "/pricing",
      icon: <PricingIcon className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <header className="relative z-40 border-b border-white/8 bg-[#040c1e]/96 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex min-h-[72px] items-center justify-between gap-4 sm:min-h-[80px]">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-85"
          >
            <img
              src="https://j.top4top.io/p_3742tjd5a1.png"
              alt="لمتكم"
              className="h-auto w-[110px] object-contain sm:w-[130px] md:w-[140px]"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass(pathname, link.href)}
              >
                <span className="flex items-center gap-1.5">
                  {link.icon}
                  {link.label}
                </span>
              </Link>
            ))}

            {authState.isLoggedIn && (
              <Link href="/account" className={navLinkClass(pathname, "/account")}>
                <span className="flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5" />
                  حسابي
                </span>
              </Link>
            )}

            {authState.isAdmin && (
              <Link href="/admin" className={navLinkClass(pathname, "/admin")}>
                <span className="flex items-center gap-1.5">
                  <ShieldIcon className="h-3.5 w-3.5" />
                  الإدارة
                </span>
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {authState.loading ? (
              <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-sm font-bold text-white/30">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30" />
                  جارِ التحميل...
                </span>
              </div>
            ) : authState.isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-sm font-bold text-white/70">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/15 text-[11px] font-black text-cyan-300">
                    {(authState.username || "م").slice(0, 1).toUpperCase()}
                  </div>
                  {authState.username || "مستخدم"}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/18 bg-red-500/8 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/14"
                >
                  <LogoutIcon className="h-3.5 w-3.5" />
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  إنشاء حساب
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-black text-slate-950 shadow-[0_2px_12px_rgba(34,211,238,0.25)] transition hover:bg-cyan-400 active:scale-[0.98]"
                >
                  تسجيل الدخول
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/8 lg:hidden"
            aria-label="فتح القائمة"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <path d="m18 6-12 12" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h10" />
                </>
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/8 pb-4 pt-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLinkClass(pathname, link.href)}
                >
                  <span className="flex items-center gap-2">
                    {link.icon}
                    {link.label}
                  </span>
                </Link>
              ))}

              {authState.isLoggedIn && (
                <Link href="/account" className={navLinkClass(pathname, "/account")}>
                  <span className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    حسابي
                  </span>
                </Link>
              )}

              {authState.isAdmin && (
                <Link href="/admin" className={navLinkClass(pathname, "/admin")}>
                  <span className="flex items-center gap-2">
                    <ShieldIcon className="h-4 w-4" />
                    الإدارة
                  </span>
                </Link>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-2 border-t border-white/6 pt-3">
              {authState.loading ? (
                <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm font-bold text-white/30">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30" />
                    جارِ التحميل...
                  </span>
                </div>
              ) : authState.isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm font-bold text-white/70">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-black text-cyan-300">
                      {(authState.username || "م").slice(0, 1).toUpperCase()}
                    </div>
                    {authState.username || "مستخدم"}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-400/18 bg-red-500/8 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/14"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/70 transition hover:bg-white/8"
                  >
                    إنشاء حساب
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 shadow-[0_2px_12px_rgba(34,211,238,0.22)] transition hover:bg-cyan-400 active:scale-[0.98]"
                  >
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}