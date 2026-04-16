import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import LoginSubmitButton from "./login-submit-button";

const heroLogo = "https://j.top4top.io/p_3742tjd5a1.png";

type SearchParams = Promise<{
  error?: string;
}>;

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  async function loginAction(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") ?? "").trim();

    if (!email || !password) {
      redirect(
        "/login?error=" +
          encodeURIComponent("يرجى إدخال البريد الإلكتروني وكلمة المرور"),
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      redirect(
        "/login?error=" + encodeURIComponent("بيانات الدخول غير صحيحة"),
      );
    }

    redirect("/");
  }

  const linkClass =
    "font-bold text-cyan-300 transition hover:text-cyan-200";

  return (
    <main className="min-h-screen px-4 py-10 text-white md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-2xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.26)] backdrop-blur-sm sm:p-8 md:p-10">
          <div className="mx-auto flex max-w-lg flex-col items-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[1.8rem] border border-cyan-400/15 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_72%)] sm:h-28 sm:w-28">
              <img
                src={heroLogo}
                alt="لمتكم"
                className="h-14 w-14 object-contain sm:h-16 sm:w-16"
              />
            </div>

            <h1 className="text-3xl font-black text-white sm:text-4xl">
              تسجيل الدخول
            </h1>

            <p className="mt-3 max-w-md text-sm leading-8 text-white/65 sm:text-base">
              سجّل دخولك للوصول إلى حسابك والبدء مباشرة من نفس المكان.
            </p>
          </div>

          {params.error ? (
            <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-200">
              {params.error}
            </div>
          ) : null}

          <form action={loginAction} className="mx-auto mt-8 max-w-lg space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-white/80">
                البريد الإلكتروني
              </label>
              <input
                name="email"
                type="email"
                placeholder="name@email.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 md:px-5 md:py-4 md:text-base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white/80">
                كلمة المرور
              </label>
              <input
                name="password"
                type="password"
                placeholder="******"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 md:px-5 md:py-4 md:text-base"
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <Link href="/register" className={linkClass}>
                إنشاء حساب جديد
              </Link>

              <Link href="/forgot-password" className={linkClass}>
                نسيت كلمة المرور؟
              </Link>
            </div>

            <div className="pt-2">
              <LoginSubmitButton />
            </div>
          </form>

          <div className="mx-auto mt-6 flex max-w-lg justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-white"
            >
              العودة إلى الرئيسية
              <ArrowLeftIcon />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}