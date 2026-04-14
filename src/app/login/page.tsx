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
      redirect("/login?error=" + encodeURIComponent("يرجى إدخال البريد الإلكتروني وكلمة المرور"));
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      redirect("/login?error=" + encodeURIComponent("بيانات الدخول غير صحيحة"));
    }

    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 md:px-6">
        <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="relative grid w-full gap-6 overflow-hidden rounded-[2.6rem] border border-white/8 bg-[linear-gradient(160deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_55%,rgba(6,12,30,1)_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.45)] lg:grid-cols-[1.05fr_480px]">
          <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-violet-500/8 blur-[60px]" />

          <div className="flex flex-col justify-center px-6 py-10 md:px-10 lg:px-12">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-1.5 text-xs font-bold text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              تسجيل الدخول
            </span>

            <h1 className="mt-5 text-3xl font-black leading-tight text-white md:text-5xl">
              دخول الحساب
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-8 text-white/50 md:text-base">
              ادخل إلى حسابك وارجع مباشرة إلى ألعابك وجلساتك بدون انتظار مزعج أو خطوات إضافية.
            </p>

            <div className="mt-8 hidden lg:block">
              <div className="relative flex h-[280px] w-[280px] items-center justify-center overflow-hidden rounded-[2.2rem] border border-cyan-400/16 bg-[linear-gradient(160deg,rgba(10,20,48,0.98)_0%,rgba(4,8,22,0.99)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.60)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.09),transparent_68%)]" />
                <div className="absolute inset-7 rounded-[2rem] border border-cyan-400/8" />
                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="relative h-[170px] w-[170px] object-contain drop-shadow-[0_0_40px_rgba(34,211,238,0.22)]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-8 md:px-10 lg:px-12 lg:py-12">
            <div className="w-full max-w-md rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,18,42,0.94)_0%,rgba(4,8,22,0.98)_100%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">أهلًا بعودتك</h2>
                  <p className="mt-2 text-sm text-white/45">سجّل دخولك للمتابعة</p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/18 bg-cyan-400/10">
                  <img
                    src={heroLogo}
                    alt="لمتكم"
                    className="h-10 w-10 object-contain"
                  />
                </div>
              </div>

              {params.error ? (
                <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                  {params.error}
                </div>
              ) : null}

              <form action={loginAction} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white/65">
                    البريد الإلكتروني :
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
                  <label className="mb-2 block text-sm font-bold text-white/65">
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

                <LoginSubmitButton />

                <div className="flex flex-col items-center gap-3 pt-2 text-sm md:flex-row md:justify-between">
                  <p className="text-white/45">
                    ليس لديك حساب؟{" "}
                    <Link href="/register" className="font-black text-cyan-300 transition hover:text-cyan-200">
                      إنشاء حساب جديد
                    </Link>
                  </p>

                  <Link
                    href="/reset-password"
                    className="font-bold text-white/45 transition hover:text-white/70"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </form>

              <div className="mt-6 border-t border-white/6 pt-5">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-bold text-white/45 transition hover:text-white/70"
                >
                  <ArrowLeftIcon />
                  العودة إلى الرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}