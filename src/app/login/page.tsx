import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import LoginSubmitButton from "./login-submit-button";

const heroLogo = "/logo.png";

type SearchParams = Promise<{ error?: string }>;

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) { redirect("/"); }

  async function loginAction(formData: FormData) {
    "use server";
    const supabase = await getSupabaseServerClient();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "").trim();
    if (!email || !password) {
      redirect("/login?error=" + encodeURIComponent("يرجى إدخال البريد الإلكتروني وكلمة المرور"));
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect("/login?error=" + encodeURIComponent("بيانات الدخول غير صحيحة"));
    }
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      {/* Grid bg */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />
      {/* Glow blobs */}
      <div className="pointer-events-none fixed -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[80px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/6 blur-[60px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 md:px-6">
        <div className="relative grid w-full gap-0 overflow-hidden rounded-[2.6rem] border border-white/8 bg-[linear-gradient(150deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_50%,rgba(6,12,30,1)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.55)] lg:grid-cols-[480px_1fr]">

          {/* Decorative inner glow */}
          <div className="pointer-events-none absolute -top-28 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-violet-500/7 blur-[60px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

          {/* ── Left: Form ── */}
          <div className="flex items-center justify-center px-6 py-10 md:px-10 lg:py-14">
            <div className="w-full max-w-sm">

              {/* Logo + title */}
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-[linear-gradient(160deg,rgba(10,20,48,0.98),rgba(4,8,22,0.99))] shadow-[0_0_0_1px_rgba(34,211,238,0.08)]">
                  <img src={heroLogo} alt="لمتكم" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">أهلًا بعودتك</h2>
                  <p className="mt-0.5 text-sm text-white/40">سجّل دخولك للمتابعة</p>
                </div>
              </div>

              {/* Error */}
              {params.error && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm font-bold text-red-300">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
                  {params.error}
                </div>
              )}

              {/* Form */}
              <form action={loginAction} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-white/50">البريد الإلكتروني</label>
                  <input
                    name="email" type="email" placeholder="name@email.com" autoComplete="email"
                    className="w-full rounded-2xl border border-white/10 bg-[rgba(10,18,42,0.80)] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-400/60 focus:bg-[rgba(10,18,42,0.95)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)]"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold text-white/50">كلمة المرور</label>
                    <Link href="/reset-password" className="text-[11px] font-bold text-white/35 transition hover:text-cyan-300">نسيت كلمة المرور؟</Link>
                  </div>
                  <input
                    name="password" type="password" placeholder="••••••••" autoComplete="current-password"
                    className="w-full rounded-2xl border border-white/10 bg-[rgba(10,18,42,0.80)] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-cyan-400/60 focus:bg-[rgba(10,18,42,0.95)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)]"
                  />
                </div>

                <LoginSubmitButton />
              </form>

              {/* Register link */}
              <div className="mt-5 text-center text-sm text-white/40">
                ليس لديك حساب؟{" "}
                <Link href="/register" className="font-black text-cyan-300 transition hover:text-cyan-200">إنشاء حساب جديد</Link>
              </div>

              {/* Back home */}
              <div className="mt-6 border-t border-white/6 pt-5">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-white/30 transition hover:text-white/55">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  العودة إلى الرئيسية
                </Link>
              </div>
            </div>
          </div>

          {/* ── Right: Info panel ── */}
          <div className="hidden border-r border-r-white/6 bg-[linear-gradient(160deg,rgba(255,255,255,0.025)_0%,transparent_100%)] lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-14">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-1.5 text-xs font-bold text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              تسجيل الدخول
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white xl:text-5xl">
              دخول الحساب
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-8 text-white/48">
              ادخل إلى حسابك للوصول السريع إلى جلساتك، متابعة ألعابك غير المكتملة، والبدء مباشرة من نفس المكان.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "الوصول السريع إلى الألعاب والجولات غير المكتملة.",
                "متابعة الحساب والباقات من لوحة واحدة واضحة.",
                "تجربة دخول بسيطة ومباشرة بدون تعقيد.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10">
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-cyan-400" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6"/></svg>
                  </div>
                  <p className="text-sm leading-7 text-white/55">{item}</p>
                </div>
              ))}
            </div>

            {/* Logo card */}
            <div className="mt-10 flex justify-start">
              <div className="relative flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/14 bg-[linear-gradient(160deg,rgba(10,20,48,0.98)_0%,rgba(4,8,22,0.99)_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.50)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.09),transparent_68%)]" />
                <div className="absolute inset-5 rounded-[1.6rem] border border-cyan-400/8" />
                <div className="absolute left-4 top-4 h-1.5 w-1.5 rounded-full bg-cyan-400/35" />
                <div className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-violet-400/28" />
                <img src={heroLogo} alt="لمتكم" className="relative h-[128px] w-[128px] object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.20)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
