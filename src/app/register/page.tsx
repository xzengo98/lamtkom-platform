import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import GoogleAuthButton from "@/app/auth/google-auth-button";

const heroLogo = "/logo.webp";

type SearchParams = Promise<{ error?: string }>;

function ArrowLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function RegisterPage({
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

  async function registerAction(formData: FormData) {
    "use server";

    const supabase = await getSupabaseServerClient();

    const cleanUsername = String(formData.get("username") ?? "")
      .trim()
      .toLowerCase();
    const cleanPhone = String(formData.get("phone") ?? "").trim();
    const cleanEmail = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const cleanPassword = String(formData.get("password") ?? "").trim();

    if (!cleanUsername || !cleanPhone || !cleanEmail || !cleanPassword) {
      redirect(
        "/register?error=" +
          encodeURIComponent("يرجى تعبئة جميع الحقول."),
      );
    }

    if (cleanPassword.length < 6) {
      redirect(
        "/register?error=" +
          encodeURIComponent("كلمة المرور يجب أن تكون 6 أحرف على الأقل."),
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          username: cleanUsername,
          phone: cleanPhone,
        },
      },
    });

    if (error) {
      redirect(
        "/register?error=" +
          encodeURIComponent(
            "تعذر إنشاء الحساب. تأكد أن البريد الإلكتروني واسم المستخدم ورقم الهاتف غير مستخدمة مسبقًا.",
          ),
      );
    }

    if (!data.user) {
      redirect(
        "/register?error=" +
          encodeURIComponent("تمت العملية بشكل غير مكتمل. حاول مرة أخرى."),
      );
    }

    const loginResult = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (loginResult.error) {
      redirect(
        "/register?error=" +
          encodeURIComponent("تم إنشاء الحساب لكن تعذر تسجيل الدخول مباشرة."),
      );
    }

    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.022] [background-image:linear-gradient(rgba(34,211,238,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(160deg,rgba(6,12,30,0.97)_0%,rgba(3,6,16,0.99)_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.30)]">
          <div className="grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="order-2 p-6 md:p-8 xl:order-1 xl:p-10">
              <div className="mx-auto max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-300">
                  إنشاء حساب جديد
                </div>

                <h1 className="text-3xl font-black text-white md:text-4xl">
                  إنشاء الحساب
                </h1>

                <p className="mt-3 text-sm leading-8 text-white/58 md:text-base">
                  أنشئ حسابك للوصول إلى الألعاب، متابعة الجلسات، والاستفادة من
                  الباقات والخدمات بشكل منظم وواضح.
                </p>

                {params.error ? (
                  <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                    {params.error}
                  </div>
                ) : null}


                <form action={registerAction} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white/75">
                      اسم المستخدم
                    </label>
                    <input
                      name="username"
                      placeholder="username"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 md:px-5 md:py-4 md:text-base"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-white/75">
                      رقم الهاتف
                    </label>
                    <input
                      name="phone"
                      placeholder="079xxxxxxxx او 00962xxxxxx"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 md:px-5 md:py-4 md:text-base"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-white/75">
                      البريد الإلكتروني
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="name@email.com"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 md:px-5 md:py-4 md:text-base"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-white/75">
                      كلمة المرور
                    </label>
                    <input
                      name="password"
                      type="password"
                      placeholder="******"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400 md:px-5 md:py-4 md:text-base"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 text-sm font-black text-slate-950 shadow-[0_4px_28px_rgba(34,211,238,0.28)] transition hover:bg-cyan-400"
                  >
                    إنشاء الحساب
                    <ArrowLeftIcon className="h-4 w-4" />
                  </button>
                </form>

                <GoogleAuthButton mode="register" next="/" />

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="text-white/60">
                    لديك حساب بالفعل؟{" "}
                    <Link
                      href="/login"
                      className="font-black text-cyan-300 transition hover:text-cyan-200"
                    >
                      تسجيل الدخول
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

            <div className="order-1 border-b border-white/8 bg-[linear-gradient(160deg,rgba(8,16,40,1)_0%,rgba(4,8,22,1)_50%,rgba(6,12,30,1)_100%)] xl:order-2 xl:border-b-0 xl:border-r xl:border-white/8">
              <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center xl:px-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-5 py-2 text-xs font-black text-cyan-300">
                  أهلًا بك
                </div>

                <img
                  src={heroLogo}
                  alt="لمتكم"
                  className="mb-6 h-24 w-auto object-contain drop-shadow-[0_0_24px_rgba(34,211,238,0.18)] sm:h-28"
                />

                <h2 className="text-3xl font-black text-white md:text-4xl">
                  ابدأ رحلتك مع لمتكم
                </h2>

                <p className="mt-4 max-w-md text-sm leading-8 text-white/58 md:text-base">
                  أنشئ حسابك للوصول السريع إلى الألعاب، الباقات، الجولات، والمتابعة
                  من مكان واحد واضح ومنظم.
                </p>

                <div className="mt-7 w-full max-w-md space-y-3">
                  {[
                    "الوصول إلى الألعاب والجولات من نفس الحساب.",
                    "متابعة الباقات والرصيد والإشعارات بسهولة.",
                    "تجربة استخدام كاملة للمنصة.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-right text-sm font-bold text-white/70"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}