"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  role: string;
  username: string | null;
};

type AuthState = {
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string | null;
};

function navLinkClass(pathname: string, href: string) {
  const active = pathname === href;
  return [
    "rounded-2xl px-4 py-2 text-sm font-bold transition",
    active
      ? "bg-cyan-400/15 text-cyan-300"
      : "text-slate-200 hover:bg-white/5 hover:text-white",
  ].join(" ");
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [menuOpen, setMenuOpen] = useState(false);

  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    isLoggedIn: false,
    isAdmin: false,
    username: null,
  });

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthState({
        loading: false,
        isLoggedIn: false,
        isAdmin: false,
        username: null,
      });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, username")
      .eq("id", user.id)
      .single();

    const typedProfile = profile as Profile | null;

    setAuthState({
      loading: false,
      isLoggedIn: true,
      isAdmin: typedProfile?.role === "admin",
      username: typedProfile?.username ?? null,
    });
  }

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
      router.refresh();
    });

    const onFocus = () => loadUser();
    window.addEventListener("focus", onFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [router, supabase]);

  useEffect(() => {
    loadUser();
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030b1e]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="text-2xl font-black text-white">لمّتنا</div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          <Link href="/" className={navLinkClass(pathname, "/")}>
            الرئيسية
          </Link>
          <Link href="/games" className={navLinkClass(pathname, "/games")}>
            الألعاب
          </Link>
          <Link href="/pricing" className={navLinkClass(pathname, "/pricing")}>
            الباقات
          </Link>
          {authState.isLoggedIn ? (
            <Link
              href="/account"
              className={navLinkClass(pathname, "/account")}
            >
              حسابي
            </Link>
          ) : null}
          {authState.isAdmin ? (
            <Link href="/admin" className={navLinkClass(pathname, "/admin")}>
              الإدارة
            </Link>
          ) : null}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {authState.loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70">
              جارٍ التحميل...
            </div>
          ) : authState.isLoggedIn ? (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white">
                {authState.username || "مستخدم"}
              </div>

              <button
                onClick={handleLogout}
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
              >
                إنشاء حساب
              </Link>
              <Link
                href="/login"
                className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                تسجيل الدخول
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-slate-200 lg:hidden"
          aria-label="فتح القائمة"
        >
          ☰
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-[#030b1e] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/" className={navLinkClass(pathname, "/")}>
              الرئيسية
            </Link>
            <Link href="/games" className={navLinkClass(pathname, "/games")}>
              الألعاب
            </Link>
            <Link href="/pricing" className={navLinkClass(pathname, "/pricing")}>
              الباقات
            </Link>

            {authState.isLoggedIn ? (
              <Link
                href="/account"
                className={navLinkClass(pathname, "/account")}
              >
                حسابي
              </Link>
            ) : null}

            {authState.isAdmin ? (
              <Link href="/admin" className={navLinkClass(pathname, "/admin")}>
                الإدارة
              </Link>
            ) : null}
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            {authState.loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/70">
                جارٍ التحميل...
              </div>
            ) : authState.isLoggedIn ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white">
                  {authState.username || "مستخدم"}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                <Link
                  href="/register"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
                >
                  إنشاء حساب
                </Link>
                <Link
                  href="/login"
                  className="rounded-2xl bg-cyan-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}