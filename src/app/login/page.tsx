import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import LoginSubmitButton from "./login-submit-button";

const heroLogo = "/logo.png";

type SearchParams = Promise<{ error?: string }>;

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
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
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
      redirect("/login?error=" + encodeURIComponent("بيانات الدخول غير صحيحة"));
    }

    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="pointer-events-none fixed -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[80px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/6 blur-[60px]" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-4 py-8 md:px-6">
        <div className="relative w-full overflow-hidden rounded-[2.6rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_50%,rgba(6,12,30,1)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[60px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

          <div className="flex items-center justify-center px-6 py-10 md:px-10 lg:py-14">
            <div className="w-full max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-300">
                تسجيل الدخول
              </div>

              <div className="mb-6 flex justify-center">
                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="h-24 w-auto object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.18)] sm:h-28"
                />
              </div>

              <h1 className="text-center text-3xl font-black text-white md:text-4xl">
                دخول الحساب
              </h1>

              <p className="mt-3 text-center text-sm leading-8 text-white/58 md:text-base">
                ادخل إلى حسابك للوصول إلى الألعاب، متابعة الجلسات، والاستفادة من جميع مزايا المنصة.
              </p>

              {params.error && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm font-bold text-red-300">
                  {params.error}
                </div>
              )}

              <form action={loginAction} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white/75">
                    البريد الإلكتروني
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@email.com"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-white/10 bg-[rgba(10,18,42,0.80)] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-400/60 focus:bg-[rgba(10,18,42,0.95)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)]"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-bold text-white/75">
                      كلمة المرور
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-black text-cyan-300 transition hover:text-cyan-200"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>

                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-white/10 bg-[rgba(10,18,42,0.80)] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-400/60 focus:bg-[rgba(10,18,42,0.95)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)]"
                  />
                </div>

                <LoginSubmitButton />
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="text-white/60">
                  لا تملك حسابًا؟{" "}
                  <Link
                    href="/register"
                    className="font-black text-cyan-300 transition hover:text-cyan-200"
                  >
                    إنشاء حساب جديد
                  </Link>
                </div>

                <Link
                  href="/"
                  className="text-white/55 transition hover:text-white"
                >
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